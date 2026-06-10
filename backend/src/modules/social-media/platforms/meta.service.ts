import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawPost, PlatformSearchOptions, PlatformService } from '../interfaces';

// Meta Graph API response types
interface MetaPost {
  id: string;
  message?: string;
  created_time: string;
  from?: { name: string; id: string };
  permalink_url?: string;
  full_picture?: string;
  type?: string;
  shares?: { count: number };
  comments?: { data: any[]; summary?: { total_count: number } };
  reactions?: { data: any[]; summary?: { total_count: number } };
}

interface InstagramMedia {
  id: string;
  caption?: string;
  timestamp: string;
  permalink: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  like_count?: number;
  comments_count?: number;
  username?: string;
}

interface MetaSearchResponse {
  data: MetaPost[];
  paging?: { cursors: { before: string; after: string } };
}

@Injectable()
export class MetaService implements PlatformService {
  private readonly logger = new Logger(MetaService.name);
  private readonly accessToken: string;

  constructor(private config: ConfigService) {
    this.accessToken = this.config.get<string>('META_ACCESS_TOKEN', '');
  }

  isConfigured(): boolean {
    return !!this.accessToken;
  }

  getPlatformName(): string {
    return 'Meta';
  }

  // Search is limited on Meta platforms - we can search public pages/posts
  async search(options: PlatformSearchOptions): Promise<RawPost[]> {
    if (!this.isConfigured()) {
      this.logger.warn('Meta not configured');
      return [];
    }

    const { query, maxResults = 25 } = options;
    const posts: RawPost[] = [];

    try {
      // Facebook Public Pages search (requires Page Public Content Access)
      const fbPosts = await this.searchFacebookPages(query, maxResults);
      posts.push(...fbPosts);

      // Instagram hashtag search (requires Instagram Basic Display API)
      const igPosts = await this.searchInstagramHashtags(query, maxResults);
      posts.push(...igPosts);

      this.logger.log(`Meta: Found ${posts.length} posts for "${query}"`);
      return posts;
    } catch (error) {
      this.logger.error(`Meta search error: ${error.message}`);
      return [];
    }
  }

  private async searchFacebookPages(query: string, maxResults: number): Promise<RawPost[]> {
    const posts: RawPost[] = [];

    try {
      // Search public pages/posts
      const searchUrl = `https://graph.facebook.com/v18.0/search?type=page&q=${encodeURIComponent(query)}&limit=${maxResults}&access_token=${this.accessToken}`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        this.logger.warn(`Facebook search failed: ${response.status}`);
        return [];
      }

      const data: { data: { id: string; name: string; category?: string }[] } = await response.json();

      // Get posts from found pages
      for (const page of data.data.slice(0, 5)) {
        const postsUrl = `https://graph.facebook.com/v18.0/${page.id}/posts?fields=message,created_time,permalink_url,full_picture,shares,comments.summary(true),reactions.summary(true)&limit=5&access_token=${this.accessToken}`;
        
        const postsResponse = await fetch(postsUrl);
        if (!postsResponse.ok) continue;

        const postsData: MetaSearchResponse = await postsResponse.json();
        
        for (const post of postsData.data) {
          posts.push(this.transformFacebookPost(post, page.name));
        }
      }

      return posts;
    } catch (error) {
      this.logger.error(`Facebook search error: ${error.message}`);
      return [];
    }
  }

  private transformFacebookPost(post: MetaPost, pageName: string): RawPost {
    return {
      id: post.id,
      platform: 'Facebook',
      authorName: pageName || post.from?.name || 'Unknown',
      authorHandle: post.from?.name || 'Unknown',
      authorHandleUrl: post.from ? `https://facebook.com/${post.from.id}` : undefined,
      followerCount: 0,
      authorVerified: false,
      text: (post.message || '').substring(0, 500),
      url: post.permalink_url || `https://facebook.com/${post.id}`,
      createdAt: post.created_time,
      language: 'en',
      hasVideo: post.type === 'video',
      hasImage: !!post.full_picture,
      thumbnailUrl: post.full_picture,
      likeCount: post.reactions?.summary?.total_count || 0,
      shareCount: post.shares?.count || 0,
      replyCount: post.comments?.summary?.total_count || 0,
      hashtags: [],
      mentions: [],
      keywords: [],
    };
  }

  private async searchInstagramHashtags(query: string, maxResults: number): Promise<RawPost[]> {
    const posts: RawPost[] = [];

    try {
      // Search hashtags
      const hashtagUrl = `https://graph.facebook.com/v18.0/ig_hashtag_search?user_id=17841400000000000&q=${encodeURIComponent(query)}&access_token=${this.accessToken}`;
      
      const response = await fetch(hashtagUrl);
      if (!response.ok) {
        return [];
      }

      const data: { data: { id: string; name: string }[] } = await response.json();

      // Get recent media for each hashtag
      for (const hashtag of data.data.slice(0, 3)) {
        const mediaUrl = `https://graph.facebook.com/v18.0/${hashtag.id}/recent_media?user_id=17841400000000000&fields=caption,timestamp,permalink,media_type,media_url,thumbnail_url,like_count,comments_count,username&limit=${Math.min(maxResults / 3, 10)}&access_token=${this.accessToken}`;
        
        const mediaResponse = await fetch(mediaUrl);
        if (!mediaResponse.ok) continue;

        const mediaData: { data: InstagramMedia[] } = await mediaResponse.json();
        
        for (const media of mediaData.data) {
          posts.push(this.transformInstagramMedia(media));
        }
      }

      return posts;
    } catch (error) {
      this.logger.error(`Instagram search error: ${error.message}`);
      return [];
    }
  }

  private transformInstagramMedia(media: InstagramMedia): RawPost {
    return {
      id: media.id,
      platform: 'Instagram',
      authorName: media.username || 'Unknown',
      authorHandle: media.username ? `@${media.username}` : 'Unknown',
      authorHandleUrl: media.username ? `https://instagram.com/${media.username}` : undefined,
      followerCount: 0,
      authorVerified: false,
      text: (media.caption || '').substring(0, 500),
      url: media.permalink,
      createdAt: media.timestamp,
      language: 'en',
      hasVideo: media.media_type === 'VIDEO',
      hasImage: media.media_type === 'IMAGE' || media.media_type === 'CAROUSEL_ALBUM',
      thumbnailUrl: media.thumbnail_url || media.media_url,
      likeCount: media.like_count || 0,
      shareCount: 0, // Instagram doesn't expose share count
      replyCount: media.comments_count || 0,
      hashtags: [],
      mentions: [],
      keywords: [],
    };
  }

  // Get posts from a specific Facebook page
  async getPagePosts(pageId: string, maxResults = 10): Promise<RawPost[]> {
    if (!this.isConfigured()) return [];

    try {
      const url = `https://graph.facebook.com/v18.0/${pageId}/posts?fields=message,created_time,from,permalink_url,full_picture,shares,comments.summary(true),reactions.summary(true)&limit=${maxResults}&access_token=${this.accessToken}`;
      
      const response = await fetch(url);
      if (!response.ok) return [];

      const data: MetaSearchResponse = await response.json();
      return data.data.map(post => this.transformFacebookPost(post, post.from?.name || 'Unknown'));
    } catch (error) {
      this.logger.error(`Facebook page posts error: ${error.message}`);
      return [];
    }
  }
}
