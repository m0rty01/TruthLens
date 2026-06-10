import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawPost, PlatformSearchOptions, PlatformService } from '../interfaces';

interface XTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  lang?: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count?: number;
  };
  entities?: {
    hashtags?: { tag: string }[];
    mentions?: { username: string }[];
    urls?: { expanded_url: string }[];
  };
  attachments?: {
    media_keys?: string[];
  };
}

interface XUser {
  id: string;
  name: string;
  username: string;
  verified?: boolean;
  verified_type?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

interface XSearchResponse {
  data?: XTweet[];
  includes?: {
    users?: XUser[];
    media?: { media_key: string; type: string; url?: string; preview_image_url?: string }[];
  };
  meta?: {
    result_count: number;
    newest_id: string;
    oldest_id: string;
  };
}

@Injectable()
export class XService implements PlatformService {
  private readonly logger = new Logger(XService.name);
  private readonly bearerToken: string;

  constructor(private config: ConfigService) {
    this.bearerToken = this.config.get<string>('X_API_BEARER_TOKEN', '');
  }

  isConfigured(): boolean {
    return !!this.bearerToken;
  }

  getPlatformName(): string {
    return 'X';
  }

  async search(options: PlatformSearchOptions): Promise<RawPost[]> {
    if (!this.isConfigured()) {
      this.logger.warn('X/Twitter not configured');
      return [];
    }

    const { query, maxResults = 100, startTime, endTime, language = 'en' } = options;
    const posts: RawPost[] = [];

    try {
      // Build query parameters
      let queryParams = `query=${encodeURIComponent(query)}&max_results=${Math.min(maxResults, 100)}&tweet.fields=created_at,public_metrics,entities,lang,author_id&expansions=author_id,attachments.media_keys&user.fields=name,username,verified,verified_type,public_metrics`;
      
      if (startTime) {
        queryParams += `&start_time=${startTime}`;
      }
      if (endTime) {
        queryParams += `&end_time=${endTime}`;
      }

      const searchUrl = `https://api.twitter.com/2/tweets/search/recent?${queryParams}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`X search failed: ${response.status} - ${errorText}`);
        return [];
      }

      const data: XSearchResponse = await response.json();

      if (!data.data || data.data.length === 0) {
        this.logger.log(`X: No results for "${query}"`);
        return [];
      }

      // Create lookup maps for users and media
      const userMap = new Map<string, XUser>();
      const mediaMap = new Map<string, { type: string; url?: string; preview_image_url?: string }>();
      
      if (data.includes?.users) {
        for (const user of data.includes.users) {
          userMap.set(user.id, user);
        }
      }
      
      if (data.includes?.media) {
        for (const media of data.includes.media) {
          mediaMap.set(media.media_key, media);
        }
      }

      // Transform tweets
      for (const tweet of data.data) {
        // Filter by language if specified
        if (language && tweet.lang && !tweet.lang.startsWith(language)) {
          continue;
        }

        const user = userMap.get(tweet.author_id);
        const mediaItems = tweet.attachments?.media_keys?.map(key => mediaMap.get(key)).filter(Boolean) || [];
        
        posts.push(this.transformTweet(tweet, user, mediaItems, query));
      }

      this.logger.log(`X: Found ${posts.length} tweets for "${query}"`);
      return posts;
    } catch (error) {
      this.logger.error(`X search error: ${error.message}`);
      return [];
    }
  }

  private transformTweet(
    tweet: XTweet, 
    user?: XUser, 
    media?: ({ type: string; url?: string; preview_image_url?: string } | undefined)[],
    query?: string
  ): RawPost {
    const metrics = tweet.public_metrics;
    const hasVideo = media?.some(m => m?.type === 'video') || false;
    const hasImage = media?.some(m => m?.type === 'photo') || false;
    const thumbnailUrl = media?.find(m => m?.preview_image_url || m?.url)?.preview_image_url || media?.find(m => m?.url)?.url;

    return {
      id: tweet.id,
      platform: 'X',
      authorName: user?.name || 'Unknown',
      authorHandle: user ? `@${user.username}` : 'Unknown',
      authorHandleUrl: user ? `https://x.com/${user.username}` : undefined,
      followerCount: user?.public_metrics?.followers_count || 0,
      authorVerified: user?.verified || user?.verified_type === 'blue' || false,
      text: tweet.text.substring(0, 500),
      url: user ? `https://x.com/${user.username}/status/${tweet.id}` : `https://x.com/i/status/${tweet.id}`,
      createdAt: tweet.created_at,
      language: tweet.lang || 'en',
      hasVideo,
      hasImage,
      thumbnailUrl,
      likeCount: metrics?.like_count || 0,
      shareCount: (metrics?.retweet_count || 0) + (metrics?.quote_count || 0),
      retweetCount: metrics?.retweet_count || 0,
      replyCount: metrics?.reply_count || 0,
      quoteCount: metrics?.quote_count || 0,
      impressions: metrics?.impression_count || 0,
      hashtags: tweet.entities?.hashtags?.map(h => h.tag) || [],
      mentions: tweet.entities?.mentions?.map(m => m.username) || [],
      keywords: query ? [query] : [],
    };
  }

  // Get user timeline
  async getUserTimeline(username: string, maxResults = 10): Promise<RawPost[]> {
    if (!this.isConfigured()) return [];

    try {
      // First get user ID from username
      const userUrl = `https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics,verified,verified_type`;
      const userResponse = await fetch(userUrl, {
        headers: { 'Authorization': `Bearer ${this.bearerToken}` },
      });

      if (!userResponse.ok) return [];
      const userData = await userResponse.json();
      const userId = userData.data?.id;
      
      if (!userId) return [];

      // Then get user's tweets
      const timelineUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=${Math.min(maxResults, 100)}&tweet.fields=created_at,public_metrics,entities,lang&expansions=attachments.media_keys&media.fields=type,url,preview_image_url`;
      
      const timelineResponse = await fetch(timelineUrl, {
        headers: { 'Authorization': `Bearer ${this.bearerToken}` },
      });

      if (!timelineResponse.ok) return [];
      const timelineData = await timelineResponse.json();

      // Transform with user info
      return (timelineData.data || []).map((tweet: XTweet) => 
        this.transformTweet(tweet, userData.data, timelineData.includes?.media || [], undefined)
      );
    } catch (error) {
      this.logger.error(`X user timeline error: ${error.message}`);
      return [];
    }
  }
}
