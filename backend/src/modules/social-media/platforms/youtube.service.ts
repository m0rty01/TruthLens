import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawPost, PlatformSearchOptions, PlatformService } from '../interfaces';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    channelTitle: string;
    tags?: string[];
    liveBroadcastContent: string;
  };
}

interface YouTubeStatistics {
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  pageInfo: { totalResults: number; resultsPerPage: number };
}

interface YouTubeVideoDetailsResponse {
  items: { 
    id: string; 
    statistics: YouTubeStatistics; 
    snippet: { 
      tags?: string[]; 
      defaultLanguage?: string;
      title?: string;
      description?: string;
      channelTitle?: string;
      channelId?: string;
      publishedAt?: string;
      thumbnails?: {
        default?: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
    } 
  }[];
}

@Injectable()
export class YouTubeService implements PlatformService {
  private readonly logger = new Logger(YouTubeService.name);
  private readonly apiKey: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('YOUTUBE_API_KEY', '');
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getPlatformName(): string {
    return 'YouTube';
  }

  async search(options: PlatformSearchOptions): Promise<RawPost[]> {
    if (!this.isConfigured()) {
      this.logger.warn('YouTube not configured');
      return [];
    }

    const { query, maxResults = 25 } = options;
    const posts: RawPost[] = [];

    try {
      // Search for videos
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${this.apiKey}&order=relevance`;
      
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        this.logger.error(`YouTube search failed: ${searchResponse.status}`);
        return [];
      }

      const searchData: YouTubeSearchResponse = await searchResponse.json();
      
      if (searchData.items.length === 0) {
        return [];
      }

      // Get video statistics for all found videos
      const videoIds = searchData.items.map(item => item.id.videoId).join(',');
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${this.apiKey}`;
      
      const statsResponse = await fetch(statsUrl);
      const statsData: YouTubeVideoDetailsResponse = statsResponse.ok ? await statsResponse.json() : { items: [] };

      // Merge search results with statistics
      for (const video of searchData.items) {
        const stats = statsData.items.find(s => s.id === video.id.videoId);
        posts.push(this.transformVideo(video, stats, query));
      }

      this.logger.log(`YouTube: Found ${posts.length} videos for "${query}"`);
      return posts;
    } catch (error) {
      this.logger.error(`YouTube search error: ${error.message}`);
      return [];
    }
  }

  private transformVideo(video: YouTubeVideo, stats?: { statistics: YouTubeStatistics; snippet?: { tags?: string[]; defaultLanguage?: string } }, query?: string): RawPost {
    const videoId = video.id.videoId;
    const snippet = video.snippet;
    const statistics = stats?.statistics;
    
    const viewCount = parseInt(statistics?.viewCount || '0', 10);
    const likeCount = parseInt(statistics?.likeCount || '0', 10);
    const commentCount = parseInt(statistics?.commentCount || '0', 10);
    
    // Calculate engagement rate
    const totalEngagement = likeCount + commentCount;
    const engagementRate = viewCount > 0 ? (totalEngagement / viewCount) * 100 : 0;

    const thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;

    return {
      id: videoId,
      platform: 'YouTube',
      authorName: snippet.channelTitle,
      authorHandle: snippet.channelTitle,
      authorHandleUrl: `https://youtube.com/channel/${snippet.channelId}`,
      followerCount: 0, // Requires additional API call to channels endpoint
      authorVerified: false, // Requires additional API call
      text: `${snippet.title}\n\n${snippet.description}`.substring(0, 500),
      url: `https://youtube.com/watch?v=${videoId}`,
      createdAt: snippet.publishedAt,
      language: stats?.snippet?.defaultLanguage || 'en',
      hasVideo: true,
      hasImage: false,
      thumbnailUrl: thumbnail,
      likeCount,
      shareCount: 0, // YouTube doesn't expose share count
      replyCount: commentCount,
      impressions: viewCount,
      viewCount,
      hashtags: stats?.snippet?.tags || [],
      mentions: [],
      keywords: query ? [query] : [],
    };
  }

  // Get a single video by ID
  async getVideoById(videoId: string): Promise<RawPost | null> {
    if (!this.isConfigured()) return null;

    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${this.apiKey}`;
      const response = await fetch(url);
      if (!response.ok) return null;

      const data: YouTubeVideoDetailsResponse = await response.json();
      if (!data.items || data.items.length === 0) return null;

      const video = data.items[0];
      const statistics = video.statistics;
      const snippet = video.snippet;

      const viewCount = parseInt(statistics?.viewCount || '0', 10);
      const likeCount = parseInt(statistics?.likeCount || '0', 10);
      const commentCount = parseInt(statistics?.commentCount || '0', 10);

      return {
        id: videoId,
        platform: 'YouTube',
        authorName: snippet.channelTitle || 'Unknown',
        authorHandle: snippet.channelTitle || 'Unknown',
        authorHandleUrl: `https://youtube.com/channel/${snippet.channelId || 'UC'}`,
        followerCount: 0,
        authorVerified: false,
        text: `${snippet.title || ''}\n\n${snippet.description || ''}`.substring(0, 500),
        url: `https://youtube.com/watch?v=${videoId}`,
        createdAt: snippet.publishedAt || new Date().toISOString(),
        language: snippet.defaultLanguage || 'en',
        hasVideo: true,
        hasImage: false,
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
        likeCount,
        shareCount: 0,
        replyCount: commentCount,
        impressions: viewCount,
        viewCount,
        hashtags: snippet.tags || [],
        mentions: [],
        keywords: [],
      };
    } catch (error) {
      this.logger.error(`YouTube getVideoById error: ${error.message}`);
      return null;
    }
  }

  // Get trending videos for a specific topic
  async getTrending(query: string, regionCode = 'CA', maxResults = 10): Promise<RawPost[]> {
    if (!this.isConfigured()) return [];

    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${this.apiKey}&regionCode=${regionCode}&order=viewCount`;
      
      const response = await fetch(url);
      if (!response.ok) return [];

      const data: YouTubeSearchResponse = await response.json();
      return data.items.map(video => this.transformVideo(video, undefined, query));
    } catch (error) {
      this.logger.error(`YouTube trending error: ${error.message}`);
      return [];
    }
  }
}
