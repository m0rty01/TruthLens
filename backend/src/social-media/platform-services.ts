import axios, { AxiosInstance } from 'axios';

export interface SocialPost {
  id: string;
  platform: 'X' | 'Reddit' | 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook';
  content: string;
  authorHandle: string;
  authorFollowers: number;
  url: string;
  postedAt: string;
  country: string;
  language: string;
  contentType: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  isVerified: boolean;
  engagement: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
  };
  viralityScore: number;
  narrativeIds: string[];
}

// ─── X (Twitter) Service ───
export class XService {
  private client: AxiosInstance;

  constructor(private bearerToken: string) {
    this.client = axios.create({
      baseURL: 'https://api.twitter.com/2',
      headers: { Authorization: `Bearer ${bearerToken}` },
      timeout: 15000,
    });
  }

  get isConfigured(): boolean {
    return !!this.bearerToken;
  }

  async searchTweets(query: string, maxResults = 20): Promise<SocialPost[]> {
    try {
      const { data } = await this.client.get('/tweets/search/recent', {
        params: {
          query: `${query} -is:retweet lang:en`,
          max_results: Math.min(maxResults, 100),
          'tweet.fields': 'created_at,public_metrics,author_id,lang,source',
          'user.fields': 'name,username,public_metrics,verified,location',
          expansions: 'author_id',
        },
      });

      const usersMap: Record<string, any> = {};
      (data.includes?.users || []).forEach((u: any) => { usersMap[u.id] = u; });

      return (data.data || []).map((tweet: any) => {
        const user = usersMap[tweet.author_id] || {};
        const metrics = tweet.public_metrics || {};
        const views = metrics.impression_count || 0;
        const likes = metrics.like_count || 0;
        const shares = (metrics.retweet_count || 0) + (metrics.quote_count || 0);
        const comments = metrics.reply_count || 0;
        const total = views + likes * 3 + shares * 5 + comments * 4;

        return {
          id: `x-${tweet.id}`,
          platform: 'X' as const,
          content: tweet.text,
          authorHandle: `@${user.username || 'unknown'}`,
          authorFollowers: user.public_metrics?.followers_count || 0,
          url: `https://x.com/${user.username}/status/${tweet.id}`,
          postedAt: tweet.created_at || new Date().toISOString(),
          country: this.guessCountry(user.location),
          language: tweet.lang || 'en',
          contentType: 'text',
          sentiment: this.guessSentiment(tweet.text),
          isVerified: !!user.verified,
          engagement: {
            views, likes, shares, comments,
            engagementRate: views > 0 ? +(((likes + shares + comments) / views) * 100).toFixed(2) : 0,
          },
          viralityScore: Math.min(99, Math.round(Math.log10(total + 1) * 15)),
          narrativeIds: [],
        } as SocialPost;
      });
    } catch (err) {
      console.error('[XService] Error:', err?.response?.data || err.message);
      return [];
    }
  }

  private guessCountry(location?: string): string {
    if (!location) return 'Unknown';
    const l = location.toLowerCase();
    if (l.includes('canada') || l.includes('🇨🇦')) return 'Canada';
    if (l.includes('india') || l.includes('🇮🇳')) return 'India';
    if (l.includes('uk') || l.includes('london') || l.includes('🇬🇧')) return 'United Kingdom';
    if (l.includes('us') || l.includes('usa') || l.includes('america') || l.includes('🇺🇸')) return 'United States';
    if (l.includes('australia') || l.includes('🇦🇺')) return 'Australia';
    return 'Unknown';
  }

  private guessSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const neg = ['hate', 'crisis', 'problem', 'scam', 'fake', 'lie', 'steal', 'crime', 'blame', 'overcrowd'];
    const pos = ['great', 'amazing', 'success', 'proud', 'love', 'support', 'contribute', 'achieve'];
    const lower = text.toLowerCase();
    if (neg.some(w => lower.includes(w))) return 'negative';
    if (pos.some(w => lower.includes(w))) return 'positive';
    return 'neutral';
  }
}

// ─── Reddit Service ───
export class RedditService {
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(private clientId: string, private clientSecret: string) {}

  get isConfigured(): boolean {
    return !!this.clientId && !!this.clientSecret;
  }

  private async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const { data } = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'TruthLens/1.0',
        },
        timeout: 10000,
      },
    );

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  async searchPosts(query: string, limit = 25): Promise<SocialPost[]> {
    try {
      const token = await this.getToken();
      const { data } = await axios.get('https://oauth.reddit.com/search', {
        params: { q: query, limit, sort: 'hot', type: 'link' },
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'TruthLens/1.0',
        },
        timeout: 15000,
      });

      return (data.data?.children || []).map((child: any) => {
        const post = child.data;
        const views = post.view_count || post.ups * 10;
        const likes = post.ups || 0;
        const comments = post.num_comments || 0;
        const shares = post.num_crossposts || 0;
        const total = views + likes * 3 + comments * 4 + shares * 5;

        return {
          id: `reddit-${post.id}`,
          platform: 'Reddit' as const,
          content: post.title + (post.selftext ? `\n${post.selftext.slice(0, 200)}` : ''),
          authorHandle: `u/${post.author}`,
          authorFollowers: post.author_fullname ? 1000 : 500,
          url: `https://reddit.com${post.permalink}`,
          postedAt: new Date(post.created_utc * 1000).toISOString(),
          country: post.subreddit?.includes('india') ? 'India' : post.subreddit?.includes('canada') ? 'Canada' : 'United States',
          language: 'en',
          contentType: post.is_video ? 'video' : post.url?.match(/\.(jpg|png|gif)/) ? 'image' : 'text',
          sentiment: post.score > 0 ? 'positive' : post.score < -10 ? 'negative' : 'neutral',
          isVerified: false,
          engagement: {
            views, likes, shares, comments,
            engagementRate: views > 0 ? +(((likes + shares + comments) / views) * 100).toFixed(2) : 0,
          },
          viralityScore: Math.min(99, Math.round(Math.log10(total + 1) * 15)),
          narrativeIds: [],
        } as SocialPost;
      });
    } catch (err) {
      console.error('[RedditService] Error:', err?.response?.data || err.message);
      return [];
    }
  }
}

// ─── YouTube Service ───
export class YouTubeService {
  private client: AxiosInstance;

  constructor(private apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://www.googleapis.com/youtube/v3',
      timeout: 15000,
    });
  }

  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  async searchVideos(query: string, maxResults = 20): Promise<SocialPost[]> {
    try {
      const { data: searchData } = await this.client.get('/search', {
        params: { part: 'snippet', q: query, type: 'video', maxResults, key: this.apiKey, order: 'viewCount' },
      });

      const videoIds = (searchData.items || []).map((i: any) => i.id.videoId).filter(Boolean);
      if (videoIds.length === 0) return [];

      const { data: statsData } = await this.client.get('/videos', {
        params: { part: 'statistics,snippet', id: videoIds.join(','), key: this.apiKey },
      });

      return (statsData.items || []).map((item: any) => {
        const stats = item.statistics || {};
        const snippet = item.snippet || {};
        const views = parseInt(stats.viewCount || '0', 10);
        const likes = parseInt(stats.likeCount || '0', 10);
        const comments = parseInt(stats.commentCount || '0', 10);
        const total = views + likes * 3 + comments * 4;

        return {
          id: `yt-${item.id}`,
          platform: 'YouTube' as const,
          content: snippet.title || '',
          authorHandle: `@${snippet.channelTitle || 'unknown'}`,
          authorFollowers: 0,
          url: `https://youtube.com/watch?v=${item.id}`,
          postedAt: snippet.publishedAt || new Date().toISOString(),
          country: 'Unknown',
          language: snippet.defaultLanguage || 'en',
          contentType: 'video',
          sentiment: likes > comments * 2 ? 'positive' : 'negative',
          isVerified: false,
          engagement: {
            views, likes, shares: 0, comments,
            engagementRate: views > 0 ? +(((likes + comments) / views) * 100).toFixed(2) : 0,
          },
          viralityScore: Math.min(99, Math.round(Math.log10(total + 1) * 14)),
          narrativeIds: [],
        } as SocialPost;
      });
    } catch (err) {
      console.error('[YouTubeService] Error:', err?.response?.data || err.message);
      return [];
    }
  }
}

// ─── TikTok Service ───
export class TikTokService {
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(private clientKey: string, private clientSecret: string) {}

  get isConfigured(): boolean {
    return !!this.clientKey && !!this.clientSecret;
  }

  private async getToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;
    try {
      const { data } = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', new URLSearchParams({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      });
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      return this.accessToken;
    } catch {
      return null;
    }
  }

  async searchVideos(query: string, maxResults = 20): Promise<SocialPost[]> {
    try {
      const token = await this.getToken();
      if (!token) return [];

      const { data } = await axios.post(
        'https://open.tiktokapis.com/v2/research/video/query/',
        {
          query: { and: [{ operation: 'EQ', field_name: 'keyword', field_values: [query] }] },
          max_count: Math.min(maxResults, 100),
          fields: 'id,video_description,create_time,region_code,voice_to_text,like_count,comment_count,share_count,view_count',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );

      const videos = data?.data?.videos || [];
      return videos.map((v: any) => {
        const views = v.view_count || 0;
        const likes = v.like_count || 0;
        const shares = v.share_count || 0;
        const comments = v.comment_count || 0;
        const total = views + likes * 3 + shares * 5 + comments * 4;

        return {
          id: `tiktok-${v.id}`,
          platform: 'TikTok' as const,
          content: v.video_description || v.voice_to_text || '',
          authorHandle: '@unknown',
          authorFollowers: 0,
          url: `https://tiktok.com/video/${v.id}`,
          postedAt: v.create_time ? new Date(v.create_time * 1000).toISOString() : new Date().toISOString(),
          country: this.regionCodeToCountry(v.region_code),
          language: 'en',
          contentType: 'video',
          sentiment: likes > comments * 3 ? 'positive' : 'negative',
          isVerified: false,
          engagement: {
            views, likes, shares, comments,
            engagementRate: views > 0 ? +(((likes + shares + comments) / views) * 100).toFixed(2) : 0,
          },
          viralityScore: Math.min(99, Math.round(Math.log10(total + 1) * 14)),
          narrativeIds: [],
        } as SocialPost;
      });
    } catch (err) {
      console.error('[TikTokService] Error:', err?.response?.data || err.message);
      return [];
    }
  }

  private regionCodeToCountry(code?: string): string {
    const map: Record<string, string> = {
      US: 'United States', CA: 'Canada', IN: 'India', GB: 'United Kingdom',
      AU: 'Australia', DE: 'Germany', FR: 'France', JP: 'Japan',
    };
    return map[code || ''] || 'Unknown';
  }
}

// ─── Instagram Service ───
export class InstagramService {
  private client: AxiosInstance;

  constructor(private accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://graph.facebook.com/v19.0',
      timeout: 15000,
    });
  }

  get isConfigured(): boolean {
    return !!this.accessToken;
  }

  async searchMedia(query: string): Promise<SocialPost[]> {
    try {
      // Instagram Graph API - search hashtags
      const { data } = await this.client.get('/ig_hashtag_search', {
        params: { user_id: 'me', q: query.replace('#', ''), access_token: this.accessToken },
      });

      const hashtagId = data?.data?.[0]?.id;
      if (!hashtagId) return [];

      const { data: mediaData } = await this.client.get(`/${hashtagId}/top_media`, {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,owner{username}',
          access_token: this.accessToken,
        },
      });

      return (mediaData.data || []).slice(0, 20).map((item: any) => {
        const likes = item.like_count || 0;
        const comments = item.comments_count || 0;
        const total = likes * 3 + comments * 4;

        return {
          id: `ig-${item.id}`,
          platform: 'Instagram' as const,
          content: item.caption || '',
          authorHandle: `@${item.owner?.username || 'unknown'}`,
          authorFollowers: 0,
          url: item.permalink || `https://instagram.com/p/${item.id}`,
          postedAt: item.timestamp || new Date().toISOString(),
          country: 'Unknown',
          language: 'en',
          contentType: item.media_type === 'VIDEO' ? 'video' : 'image',
          sentiment: likes > comments * 5 ? 'positive' : 'neutral',
          isVerified: false,
          engagement: { views: 0, likes, shares: 0, comments, engagementRate: 0 },
          viralityScore: Math.min(99, Math.round(Math.log10(total + 1) * 18)),
          narrativeIds: [],
        } as SocialPost;
      });
    } catch (err) {
      console.error('[InstagramService] Error:', err?.response?.data || err.message);
      return [];
    }
  }
}

// ─── Facebook Service ───
export class FacebookService {
  private client: AxiosInstance;

  constructor(private accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://graph.facebook.com/v19.0',
      timeout: 15000,
    });
  }

  get isConfigured(): boolean {
    return !!this.accessToken;
  }

  async searchPosts(query: string): Promise<SocialPost[]> {
    try {
      const { data } = await this.client.get('/search', {
        params: { q: query, type: 'post', limit: 20, access_token: this.accessToken },
      });

      return (data.data || []).map((post: any) => {
        const likes = post.reactions?.summary?.total_count || 0;
        const comments = post.comments?.summary?.total_count || 0;
        const shares = post.shares?.count || 0;
        const total = likes * 3 + shares * 5 + comments * 4;

        return {
          id: `fb-${post.id}`,
          platform: 'Facebook' as const,
          content: post.message || post.story || '',
          authorHandle: post.from?.name || 'Unknown',
          authorFollowers: 0,
          url: post.permalink_url || `https://facebook.com/${post.id}`,
          postedAt: post.created_time || new Date().toISOString(),
          country: 'Unknown',
          language: 'en',
          contentType: post.type || 'text',
          sentiment: likes > comments * 3 ? 'positive' : 'neutral',
          isVerified: false,
          engagement: { views: 0, likes, shares, comments, engagementRate: 0 },
          viralityScore: Math.min(99, Math.round(Math.log10(total + 1) * 18)),
          narrativeIds: [],
        } as SocialPost;
      });
    } catch (err) {
      console.error('[FacebookService] Error:', err?.response?.data || err.message);
      return [];
    }
  }
}
