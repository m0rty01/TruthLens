// Shared interfaces for social media platform data

export interface RawPost {
  id: string;
  platform: 'X' | 'Reddit' | 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook';
  authorName: string;
  authorHandle: string;
  authorHandleUrl?: string;
  followerCount: number;
  authorVerified: boolean;
  text: string;
  url: string;
  createdAt: string;
  language: string;
  location?: string;
  hasVideo: boolean;
  hasImage: boolean;
  mediaUrl?: string;
  thumbnailUrl?: string;
  // Engagement metrics
  likeCount: number;
  shareCount: number;
  retweetCount?: number;
  replyCount: number;
  quoteCount?: number;
  impressions?: number;
  viewCount?: number;
  // Additional metadata
  hashtags?: string[];
  mentions?: string[];
  keywords?: string[];
}

export interface EngagementMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
}

export interface PlatformSearchOptions {
  query: string;
  maxResults?: number;
  startTime?: string;
  endTime?: string;
  language?: string;
}

export interface PlatformService {
  search(options: PlatformSearchOptions): Promise<RawPost[]>;
  isConfigured(): boolean;
  getPlatformName(): string;
}

export interface AggregatedNarrative {
  keyword: string;
  posts: RawPost[];
  totalMentions: number;
  platformDistribution: { platform: string; mentions: number; percentage: number }[];
  countryDistribution: { country: string; mentions: number; percentage: number }[];
  trend: { score: number; direction: 'spiking' | 'rising' | 'stable' | 'falling'; velocity: number };
  sentiment: number;
  timeline: { date: string; mentions: number; sentiment: number }[];
}

// Sentiment analysis result
export interface SentimentResult {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
}
