import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedditService } from './platforms/reddit.service';
import { YouTubeService } from './platforms/youtube.service';
import { XService } from './platforms/x.service';
import { MetaService } from './platforms/meta.service';
import { TikTokService } from './platforms/tiktok.service';
import { RawPost, PlatformSearchOptions, PlatformService } from './interfaces';
import { transformToViralContent, analyzeSentiment } from './transformers/content.transformer';
import { aggregateNarratives, transformToNarrative, DEFAULT_KEYWORDS } from './transformers/narrative.transformer';

export interface PlatformStatus {
  name: string;
  configured: boolean;
}

export interface SearchResult {
  posts: ReturnType<typeof transformToViralContent>[];
  platforms: string[];
  totalFound: number;
  query: string;
  timestamp: string;
}

export interface TrendingResult {
  narratives: ReturnType<typeof transformToNarrative>[];
  totalPosts: number;
  keywords: string[];
  timestamp: string;
}

@Injectable()
export class SocialMediaService {
  private readonly logger = new Logger(SocialMediaService.name);
  private platforms: Map<string, PlatformService> = new Map();

  constructor(
    private config: ConfigService,
    private reddit: RedditService,
    private youtube: YouTubeService,
    private x: XService,
    private meta: MetaService,
    private tiktok: TikTokService,
  ) {
    // Register all platform services
    this.platforms.set('reddit', reddit);
    this.platforms.set('youtube', youtube);
    this.platforms.set('x', x);
    this.platforms.set('instagram', meta);
    this.platforms.set('facebook', meta);
    this.platforms.set('tiktok', tiktok);
  }

  // Get status of all configured platforms
  getPlatformStatus(): PlatformStatus[] {
    return [
      { name: 'Reddit', configured: this.reddit.isConfigured() },
      { name: 'YouTube', configured: this.youtube.isConfigured() },
      { name: 'X', configured: this.x.isConfigured() },
      { name: 'Meta', configured: this.meta.isConfigured() },
      { name: 'TikTok', configured: this.tiktok.isConfigured() },
    ];
  }

  // Get configured platforms
  private getConfiguredPlatforms(platformFilter?: string[]): PlatformService[] {
    const configured: PlatformService[] = [];
    
    for (const [name, service] of this.platforms) {
      if (service.isConfigured()) {
        if (!platformFilter || platformFilter.includes(name.toLowerCase())) {
          // Avoid duplicates (Meta serves both Instagram and Facebook)
          if (!configured.includes(service)) {
            configured.push(service);
          }
        }
      }
    }
    
    return configured;
  }

  // Search across all configured platforms
  async search(options: PlatformSearchOptions & { platforms?: string[] }): Promise<SearchResult> {
    const { query, platforms: platformFilter } = options;
    const configuredPlatforms = this.getConfiguredPlatforms(platformFilter);

    if (configuredPlatforms.length === 0) {
      this.logger.warn('No platforms configured for search');
      return {
        posts: [],
        platforms: [],
        totalFound: 0,
        query,
        timestamp: new Date().toISOString(),
      };
    }

    this.logger.log(`Searching "${query}" across ${configuredPlatforms.length} platforms`);

    // Search all platforms in parallel
    const searchPromises = configuredPlatforms.map(async (service) => {
      try {
        const posts = await service.search(options);
        return { platform: service.getPlatformName(), posts };
      } catch (error) {
        this.logger.error(`Search error for ${service.getPlatformName()}: ${error.message}`);
        return { platform: service.getPlatformName(), posts: [] };
      }
    });

    const results = await Promise.all(searchPromises);

    // Flatten and transform posts
    const allPosts: RawPost[] = [];
    const activePlatforms: string[] = [];

    for (const result of results) {
      if (result.posts.length > 0) {
        activePlatforms.push(result.platform);
        allPosts.push(...result.posts);
      }
    }

    // Sort by virality/engagement and transform
    const transformedPosts = allPosts
      .map(post => transformToViralContent(post))
      .sort((a, b) => b.viralityScore - a.viralityScore)
      .slice(0, options.maxResults || 100);

    return {
      posts: transformedPosts,
      platforms: activePlatforms,
      totalFound: allPosts.length,
      query,
      timestamp: new Date().toISOString(),
    };
  }

  // Get trending narratives based on keywords
  async getTrending(keywords?: string[]): Promise<TrendingResult> {
    const searchKeywords = keywords || DEFAULT_KEYWORDS;
    const allPosts: RawPost[] = [];
    const narrativeMap = new Map<string, RawPost[]>();

    // Search for each keyword
    for (const keyword of searchKeywords) {
      const result = await this.search({ query: keyword, maxResults: 50 });
      
      // Get raw posts for aggregation (we need to re-transform)
      const configuredPlatforms = this.getConfiguredPlatforms();
      const keywordPosts: RawPost[] = [];
      
      for (const service of configuredPlatforms) {
        try {
          const posts = await service.search({ query: keyword, maxResults: 50 });
          keywordPosts.push(...posts);
        } catch (error) {
          this.logger.error(`Trending search error: ${error.message}`);
        }
      }

      narrativeMap.set(keyword, keywordPosts);
      allPosts.push(...keywordPosts);
    }

    // Aggregate into narratives
    const narratives = Array.from(narrativeMap.entries())
      .map(([keyword, posts], index) => {
        const aggregated = aggregateNarratives(posts, keyword);
        return transformToNarrative(aggregated, `live-narr-${index + 1}`);
      })
      .filter(n => n.totalMentions > 0)
      .sort((a, b) => b.totalMentions - a.totalMentions);

    return {
      narratives,
      totalPosts: allPosts.length,
      keywords: searchKeywords,
      timestamp: new Date().toISOString(),
    };
  }

  // Get posts from a specific platform
  async getPlatformPosts(platform: string, options: PlatformSearchOptions): Promise<SearchResult> {
    const service = this.platforms.get(platform.toLowerCase());
    
    if (!service || !service.isConfigured()) {
      return {
        posts: [],
        platforms: [],
        totalFound: 0,
        query: options.query,
        timestamp: new Date().toISOString(),
      };
    }

    const posts = await service.search(options);
    const transformedPosts = posts
      .map(post => transformToViralContent(post))
      .sort((a, b) => b.viralityScore - a.viralityScore);

    return {
      posts: transformedPosts,
      platforms: [service.getPlatformName()],
      totalFound: posts.length,
      query: options.query,
      timestamp: new Date().toISOString(),
    };
  }

  // Get raw sentiment analysis for text
  analyzeText(text: string): { sentiment: ReturnType<typeof analyzeSentiment>; virality: number } {
    return {
      sentiment: analyzeSentiment(text),
      virality: 0, // Would need engagement metrics to calculate
    };
  }
}
