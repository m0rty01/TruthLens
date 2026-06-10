export type Platform = "X" | "Reddit" | "YouTube" | "TikTok" | "Instagram" | "Facebook";

export type Sentiment = "positive" | "negative" | "neutral" | "mixed";

export interface EngagementMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
}

export interface ViralContent {
  id: string;
  platform: Platform;
  author: string;
  authorHandle: string;
  authorFollowers: number;
  content: string;
  contentType: "text" | "image" | "video" | "link";
  url: string;
  postedAt: string;
  engagement: EngagementMetrics;
  viralityScore: number; // 0-100
  sentiment: Sentiment;
  narrativeIds: string[];
  claimIds: string[];
  country: string;
  language: string;
  isVerified: boolean;
}
