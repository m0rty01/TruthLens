import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawPost, PlatformSearchOptions, PlatformService } from '../interfaces';

// TikTok Research API response types
interface TikTokVideo {
  id: string;
  create_time: number;
  username: string;
  region_code: string;
  share_count: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  voice_to_text?: string;
  video_description?: string;
  duration?: number;
  hashtag_names?: string[];
  music_id?: string;
  cover_image_url?: string;
}

interface TikTokSearchResponse {
  data: {
    videos: TikTokVideo[];
    has_more: boolean;
    cursor?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

@Injectable()
export class TikTokService implements PlatformService {
  private readonly logger = new Logger(TikTokService.name);
  private readonly accessToken: string;

  constructor(private config: ConfigService) {
    this.accessToken = this.config.get<string>('TIKTOK_ACCESS_TOKEN', '');
  }

  isConfigured(): boolean {
    return !!this.accessToken;
  }

  getPlatformName(): string {
    return 'TikTok';
  }

  async search(options: PlatformSearchOptions): Promise<RawPost[]> {
    if (!this.isConfigured()) {
      this.logger.warn('TikTok not configured');
      return [];
    }

    const { query, maxResults = 20, startTime, endTime } = options;
    const posts: RawPost[] = [];

    try {
      // TikTok Research API - Video Query
      const searchUrl = 'https://open.tiktokapis.com/v2/research/video/query/';
      
      const body: any = {
        max_count: Math.min(maxResults, 100),
        query: {
          and: [
            {
              field_name: 'video_description',
              field_values: [query],
            },
          ],
        },
      };

      // Add time range if specified
      if (startTime || endTime) {
        const timeCondition: any = {};
        if (startTime) {
          timeCondition.start_date = startTime.split('T')[0];
        }
        if (endTime) {
          timeCondition.end_date = endTime.split('T')[0];
        }
        body.query.and.push({
          field_name: 'create_time',
          ...timeCondition,
        });
      }

      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`TikTok search failed: ${response.status} - ${errorText}`);
        return [];
      }

      const data: TikTokSearchResponse = await response.json();

      if (data.error) {
        this.logger.error(`TikTok API error: ${data.error.code} - ${data.error.message}`);
        return [];
      }

      if (!data.data?.videos || data.data.videos.length === 0) {
        this.logger.log(`TikTok: No results for "${query}"`);
        return [];
      }

      for (const video of data.data.videos) {
        posts.push(this.transformVideo(video, query));
      }

      this.logger.log(`TikTok: Found ${posts.length} videos for "${query}"`);
      return posts;
    } catch (error) {
      this.logger.error(`TikTok search error: ${error.message}`);
      return [];
    }
  }

  private transformVideo(video: TikTokVideo, query?: string): RawPost {
    const createdAt = new Date(video.create_time * 1000).toISOString();
    
    // Extract text from description or voice-to-text
    const text = video.video_description || video.voice_to_text || '';

    return {
      id: video.id,
      platform: 'TikTok',
      authorName: video.username,
      authorHandle: `@${video.username}`,
      authorHandleUrl: `https://tiktok.com/@${video.username}`,
      followerCount: 0, // Not available in research API
      authorVerified: false,
      text: text.substring(0, 500),
      url: `https://tiktok.com/@${video.username}/video/${video.id}`,
      createdAt,
      language: 'en',
      location: video.region_code,
      hasVideo: true,
      hasImage: false,
      thumbnailUrl: video.cover_image_url,
      likeCount: video.like_count || 0,
      shareCount: video.share_count || 0,
      replyCount: video.comment_count || 0,
      impressions: video.view_count || 0,
      viewCount: video.view_count || 0,
      hashtags: video.hashtag_names || [],
      mentions: [],
      keywords: query ? [query] : [],
    };
  }

  // Search by hashtags
  async searchByHashtag(hashtag: string, maxResults = 20): Promise<RawPost[]> {
    if (!this.isConfigured()) return [];

    try {
      const searchUrl = 'https://open.tiktokapis.com/v2/research/video/query/';
      
      const body = {
        max_count: Math.min(maxResults, 100),
        query: {
          and: [
            {
              field_name: 'hashtag_name',
              field_values: [hashtag],
            },
          ],
        },
      };

      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) return [];

      const data: TikTokSearchResponse = await response.json();
      
      if (data.error || !data.data?.videos) return [];

      return data.data.videos.map(video => this.transformVideo(video, `#${hashtag}`));
    } catch (error) {
      this.logger.error(`TikTok hashtag search error: ${error.message}`);
      return [];
    }
  }

  // Get user's public videos
  async getUserVideos(username: string, maxResults = 20): Promise<RawPost[]> {
    if (!this.isConfigured()) return [];

    try {
      const searchUrl = 'https://open.tiktokapis.com/v2/research/video/query/';
      
      const body = {
        max_count: Math.min(maxResults, 100),
        query: {
          and: [
            {
              field_name: 'username',
              field_values: [username],
            },
          ],
        },
      };

      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) return [];

      const data: TikTokSearchResponse = await response.json();
      
      if (data.error || !data.data?.videos) return [];

      return data.data.videos.map(video => this.transformVideo(video));
    } catch (error) {
      this.logger.error(`TikTok user videos error: ${error.message}`);
      return [];
    }
  }
}
