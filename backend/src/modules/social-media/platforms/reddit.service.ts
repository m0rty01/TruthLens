import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawPost, PlatformSearchOptions, PlatformService } from '../interfaces';

interface RedditPost {
  data: {
    id: string;
    author: string;
    title: string;
    selftext: string;
    url: string;
    permalink: string;
    subreddit: string;
    score: number;
    ups: number;
    num_comments: number;
    upvote_ratio: number;
    created_utc: number;
    is_video: boolean;
    thumbnail: string;
    over_18: boolean;
    link_flair_text?: string;
  };
}

interface RedditSearchResponse {
  data: {
    children: RedditPost[];
    after: string | null;
  };
}

@Injectable()
export class RedditService implements PlatformService {
  private readonly logger = new Logger(RedditService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private config: ConfigService) {
    this.clientId = this.config.get<string>('REDDIT_CLIENT_ID', '');
    this.clientSecret = this.config.get<string>('REDDIT_CLIENT_SECRET', '');
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  getPlatformName(): string {
    return 'Reddit';
  }

  private async getAccessToken(): Promise<string | null> {
    if (!this.isConfigured()) return null;

    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'TruthLens/1.0 (Narrative Intelligence Platform)',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        this.logger.error(`Reddit auth failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer
      return this.accessToken;
    } catch (error) {
      this.logger.error(`Reddit auth error: ${error.message}`);
      return null;
    }
  }

  async search(options: PlatformSearchOptions): Promise<RawPost[]> {
    const token = await this.getAccessToken();
    if (!token) {
      this.logger.warn('Reddit not configured or auth failed');
      return [];
    }

    const { query, maxResults = 25, language = 'en' } = options;
    const posts: RawPost[] = [];

    try {
      const searchUrl = `https://oauth.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${maxResults}&sort=relevance&t=week`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'TruthLens/1.0 (Narrative Intelligence Platform)',
        },
      });

      if (!response.ok) {
        this.logger.error(`Reddit search failed: ${response.status}`);
        return [];
      }

      const data: RedditSearchResponse = await response.json();

      for (const child of data.data.children) {
        const post = child.data;
        posts.push(this.transformPost(post, query));
      }

      this.logger.log(`Reddit: Found ${posts.length} posts for "${query}"`);
      return posts;
    } catch (error) {
      this.logger.error(`Reddit search error: ${error.message}`);
      return [];
    }
  }

  private transformPost(post: RedditPost['data'], query: string): RawPost {
    const text = post.selftext || post.title;
    const createdAt = new Date(post.created_utc * 1000).toISOString();
    
    // Calculate engagement rate (upvote ratio * comment engagement)
    const totalEngagement = post.score + post.num_comments;
    const engagementRate = post.upvote_ratio * 100;

    return {
      id: post.id,
      platform: 'Reddit',
      authorName: post.author,
      authorHandle: `u/${post.author}`,
      authorHandleUrl: `https://reddit.com/user/${post.author}`,
      followerCount: 0, // Reddit doesn't expose follower counts in search
      authorVerified: false,
      text: text.substring(0, 500), // Limit text length
      url: `https://reddit.com${post.permalink}`,
      createdAt,
      language: 'en',
      location: post.subreddit,
      hasVideo: post.is_video,
      hasImage: post.thumbnail?.startsWith('http') || false,
      thumbnailUrl: post.thumbnail?.startsWith('http') ? post.thumbnail : undefined,
      likeCount: post.ups,
      shareCount: 0, // Reddit doesn't expose share count
      replyCount: post.num_comments,
      impressions: Math.floor(post.score / post.upvote_ratio) || post.score, // Estimate views
      hashtags: [],
      mentions: [],
      keywords: [query],
    };
  }

  // Search specific subreddits
  async searchSubreddits(subreddits: string[], query: string, maxResults = 10): Promise<RawPost[]> {
    const allPosts: RawPost[] = [];
    
    for (const subreddit of subreddits) {
      const token = await this.getAccessToken();
      if (!token) continue;

      try {
        const searchUrl = `https://oauth.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&limit=${maxResults}&restrict_sr=on&sort=relevance&t=week`;
        
        const response = await fetch(searchUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'TruthLens/1.0 (Narrative Intelligence Platform)',
          },
        });

        if (response.ok) {
          const data: RedditSearchResponse = await response.json();
          for (const child of data.data.children) {
            allPosts.push(this.transformPost(child.data, query));
          }
        }
        
        // Rate limit: ~60 requests per minute
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(`Reddit subreddit search error (${subreddit}): ${error.message}`);
      }
    }

    return allPosts;
  }
}
