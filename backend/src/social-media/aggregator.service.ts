import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  XService,
  RedditService,
  YouTubeService,
  TikTokService,
  InstagramService,
  FacebookService,
  SocialPost,
} from './platform-services';

export interface PlatformStatus {
  platform: string;
  configured: boolean;
  lastFetch?: string;
  postCount: number;
  error?: string;
}

@Injectable()
export class SocialMediaAggregator {
  private readonly logger = new Logger(SocialMediaAggregator.name);

  private xService: XService;
  private redditService: RedditService;
  private youtubeService: YouTubeService;
  private tiktokService: TikTokService;
  private instagramService: InstagramService;
  private facebookService: FacebookService;

  // Simple in-memory cache (TTL: 5 minutes)
  private cache: Map<string, { data: SocialPost[]; ts: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor(private config: ConfigService) {
    this.xService = new XService(config.get<string>('X_BEARER_TOKEN', ''));
    this.redditService = new RedditService(
      config.get<string>('REDDIT_CLIENT_ID', ''),
      config.get<string>('REDDIT_CLIENT_SECRET', ''),
    );
    this.youtubeService = new YouTubeService(config.get<string>('YOUTUBE_API_KEY', ''));
    this.tiktokService = new TikTokService(
      config.get<string>('TIKTOK_CLIENT_KEY', ''),
      config.get<string>('TIKTOK_CLIENT_SECRET', ''),
    );
    this.instagramService = new InstagramService(config.get<string>('INSTAGRAM_ACCESS_TOKEN', ''));
    this.facebookService = new FacebookService(config.get<string>('FACEBOOK_ACCESS_TOKEN', ''));
  }

  getPlatformStatus(): PlatformStatus[] {
    return [
      { platform: 'X', configured: this.xService.isConfigured, postCount: this.getCachedCount('X') },
      { platform: 'Reddit', configured: this.redditService.isConfigured, postCount: this.getCachedCount('Reddit') },
      { platform: 'YouTube', configured: this.youtubeService.isConfigured, postCount: this.getCachedCount('YouTube') },
      { platform: 'TikTok', configured: this.tiktokService.isConfigured, postCount: this.getCachedCount('TikTok') },
      { platform: 'Instagram', configured: this.instagramService.isConfigured, postCount: this.getCachedCount('Instagram') },
      { platform: 'Facebook', configured: this.facebookService.isConfigured, postCount: this.getCachedCount('Facebook') },
    ];
  }

  private getCachedCount(platform: string): number {
    for (const [key, val] of this.cache) {
      if (key.startsWith(platform) && Date.now() - val.ts < this.CACHE_TTL) {
        return val.data.length;
      }
    }
    return 0;
  }

  private getCached(key: string): SocialPost[] | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.ts < this.CACHE_TTL) return entry.data;
    return null;
  }

  private setCache(key: string, data: SocialPost[]) {
    this.cache.set(key, { data, ts: Date.now() });
  }

  async fetchAll(query = 'Indian immigrants'): Promise<SocialPost[]> {
    const queries = [query, 'Indian students', 'anti-Indian'];
    const allPosts: SocialPost[] = [];

    const results = await Promise.allSettled(
      queries.map((q) => this.fetchFromAllPlatforms(q)),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allPosts.push(...result.value);
      }
    }

    // Deduplicate by content similarity
    const seen = new Set<string>();
    const unique = allPosts.filter((p) => {
      const key = p.content.slice(0, 80).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by virality score
    return unique.sort((a, b) => b.viralityScore - a.viralityScore);
  }

  private async fetchFromAllPlatforms(query: string): Promise<SocialPost[]> {
    const cacheKey = `all-${query}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const results = await Promise.allSettled([
      this.xService.isConfigured ? this.xService.searchTweets(query) : Promise.resolve([]),
      this.redditService.isConfigured ? this.redditService.searchPosts(query) : Promise.resolve([]),
      this.youtubeService.isConfigured ? this.youtubeService.searchVideos(query) : Promise.resolve([]),
      this.tiktokService.isConfigured ? this.tiktokService.searchVideos(query) : Promise.resolve([]),
      this.instagramService.isConfigured ? this.instagramService.searchMedia(query) : Promise.resolve([]),
      this.facebookService.isConfigured ? this.facebookService.searchPosts(query) : Promise.resolve([]),
    ]);

    const posts: SocialPost[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') posts.push(...result.value);
    }

    this.setCache(cacheKey, posts);
    return posts;
  }

  async fetchByPlatform(platform: string, query = 'Indian immigrants'): Promise<SocialPost[]> {
    const cacheKey = `${platform}-${query}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    let posts: SocialPost[] = [];

    try {
      switch (platform.toLowerCase()) {
        case 'x':
        case 'twitter':
          if (this.xService.isConfigured) posts = await this.xService.searchTweets(query);
          break;
        case 'reddit':
          if (this.redditService.isConfigured) posts = await this.redditService.searchPosts(query);
          break;
        case 'youtube':
          if (this.youtubeService.isConfigured) posts = await this.youtubeService.searchVideos(query);
          break;
        case 'tiktok':
          if (this.tiktokService.isConfigured) posts = await this.tiktokService.searchVideos(query);
          break;
        case 'instagram':
          if (this.instagramService.isConfigured) posts = await this.instagramService.searchMedia(query);
          break;
        case 'facebook':
          if (this.facebookService.isConfigured) posts = await this.facebookService.searchPosts(query);
          break;
      }
    } catch (err) {
      this.logger.error(`Error fetching from ${platform}: ${err.message}`);
    }

    this.setCache(cacheKey, posts);
    return posts;
  }

  async updateApiKeys(keys: Record<string, string>): Promise<PlatformStatus[]> {
    // Update keys at runtime (also updates .env via ConfigService)
    if (keys.X_BEARER_TOKEN !== undefined) {
      this.xService = new XService(keys.X_BEARER_TOKEN);
    }
    if (keys.REDDIT_CLIENT_ID !== undefined || keys.REDDIT_CLIENT_SECRET !== undefined) {
      this.redditService = new RedditService(
        keys.REDDIT_CLIENT_ID || this.config.get('REDDIT_CLIENT_ID', ''),
        keys.REDDIT_CLIENT_SECRET || this.config.get('REDDIT_CLIENT_SECRET', ''),
      );
    }
    if (keys.YOUTUBE_API_KEY !== undefined) {
      this.youtubeService = new YouTubeService(keys.YOUTUBE_API_KEY);
    }
    if (keys.TIKTOK_CLIENT_KEY !== undefined || keys.TIKTOK_CLIENT_SECRET !== undefined) {
      this.tiktokService = new TikTokService(
        keys.TIKTOK_CLIENT_KEY || this.config.get('TIKTOK_CLIENT_KEY', ''),
        keys.TIKTOK_CLIENT_SECRET || this.config.get('TIKTOK_CLIENT_SECRET', ''),
      );
    }
    if (keys.INSTAGRAM_ACCESS_TOKEN !== undefined) {
      this.instagramService = new InstagramService(keys.INSTAGRAM_ACCESS_TOKEN);
    }
    if (keys.FACEBOOK_ACCESS_TOKEN !== undefined) {
      this.facebookService = new FacebookService(keys.FACEBOOK_ACCESS_TOKEN);
    }

    // Clear cache when keys change
    this.cache.clear();

    return this.getPlatformStatus();
  }
}
