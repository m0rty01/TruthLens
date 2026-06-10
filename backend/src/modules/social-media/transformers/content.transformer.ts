import { RawPost, SentimentResult } from '../interfaces';

// Simple sentiment analysis based on keywords
const positiveWords = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'support', 
  'help', 'helpful', 'thanks', 'thank', 'appreciate', 'contribute', 'contributed',
  'success', 'achieve', 'achieved', 'proud', 'celebrate', 'positive', 'progress',
  'improve', 'improved', 'better', 'best', 'benefit', 'benefits', 'valuable',
];

const negativeWords = [
  'bad', 'terrible', 'awful', 'horrible', 'hate', 'disgusting', 'scam', 'fraud',
  'fake', 'lie', 'lies', 'lying', 'stupid', 'dumb', 'idiot', 'criminal', 'crime',
  'steal', 'stealing', 'abuse', 'abusive', 'racist', 'racism', 'discrimination',
  'problem', 'problems', 'issue', 'issues', 'crisis', 'collapse', 'destroy',
  'take', 'taking', 'took', 'invade', 'invading', 'invaded', 'threat', 'threaten',
  'danger', 'dangerous', 'fear', 'afraid', 'worry', 'worried', 'blame', 'blaming',
  'fault', 'faulty', 'wrong', 'wrongly', 'illegally', 'illegal', 'illegals',
];

export function analyzeSentiment(text: string): SentimentResult {
  if (!text) {
    return { score: 0, label: 'neutral' };
  }

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (positiveWords.includes(cleanWord)) {
      positiveCount++;
    }
    if (negativeWords.includes(cleanWord)) {
      negativeCount++;
    }
  }

  const total = positiveCount + negativeCount;
  if (total === 0) {
    return { score: 0, label: 'neutral' };
  }

  const score = (positiveCount - negativeCount) / total;
  
  let label: 'positive' | 'negative' | 'neutral';
  if (score > 0.2) {
    label = 'positive';
  } else if (score < -0.2) {
    label = 'negative';
  } else {
    label = 'neutral';
  }

  return { score: parseFloat(score.toFixed(2)), label };
}

// Calculate virality score (0-100) based on engagement metrics
export function calculateViralityScore(post: RawPost): number {
  const { likeCount, shareCount, replyCount, impressions, followerCount } = post;

  // Base engagement score
  const totalEngagement = likeCount + shareCount * 2 + replyCount;
  
  // Normalize by follower count (engagement relative to audience)
  const relativeEngagement = followerCount > 0 
    ? (totalEngagement / followerCount) * 100 
    : totalEngagement * 0.1;

  // Views/impressions bonus
  const viewBonus = Math.min(Math.log10(Math.max(impressions || 1, 1)) * 5, 25);
  
  // Absolute engagement bonus
  const engagementBonus = Math.min(Math.log10(Math.max(totalEngagement, 1)) * 10, 50);
  
  // Share multiplier (shares indicate viral potential)
  const shareBonus = Math.min(Math.log10(Math.max(shareCount, 1)) * 8, 25);

  const score = viewBonus + engagementBonus + shareBonus;
  
  return Math.min(Math.round(score), 100);
}

// Calculate engagement rate
export function calculateEngagementRate(post: RawPost): number {
  const { likeCount, shareCount, replyCount, impressions, followerCount } = post;
  
  const totalEngagement = likeCount + shareCount + replyCount;
  const base = impressions || followerCount || 1;
  
  return parseFloat(((totalEngagement / base) * 100).toFixed(2));
}

// Transform RawPost to ViralContent type
export function transformToViralContent(post: RawPost): {
  id: string;
  platform: string;
  author: string;
  authorHandle: string;
  authorFollowers: number;
  content: string;
  contentType: 'text' | 'image' | 'video' | 'link';
  url: string;
  postedAt: string;
  engagement: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
  };
  viralityScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  narrativeIds: string[];
  claimIds: string[];
  country: string;
  language: string;
  isVerified: boolean;
} {
  const sentiment = analyzeSentiment(post.text);
  const viralityScore = calculateViralityScore(post);
  const engagementRate = calculateEngagementRate(post);

  return {
    id: `live-${post.platform.toLowerCase()}-${post.id}`,
    platform: post.platform,
    author: post.authorName,
    authorHandle: post.authorHandle,
    authorFollowers: post.followerCount,
    content: post.text,
    contentType: post.hasVideo ? 'video' : post.hasImage ? 'image' : 'text',
    url: post.url,
    postedAt: post.createdAt,
    engagement: {
      views: post.impressions || post.viewCount || 0,
      likes: post.likeCount,
      shares: post.shareCount + (post.retweetCount || 0),
      comments: post.replyCount,
      engagementRate,
    },
    viralityScore,
    sentiment: sentiment.label,
    narrativeIds: [],
    claimIds: [],
    country: post.location || 'Unknown',
    language: post.language,
    isVerified: post.authorVerified,
  };
}

// Determine trend direction based on time-series data
export function calculateTrendDirection(
  posts: RawPost[],
  timeWindowHours: number = 24
): 'spiking' | 'rising' | 'stable' | 'falling' {
  if (posts.length < 2) {
    return 'stable';
  }

  const now = Date.now();
  const windowMs = timeWindowHours * 60 * 60 * 1000;
  
  const recentPosts = posts.filter(p => 
    now - new Date(p.createdAt).getTime() < windowMs
  );
  
  const olderPosts = posts.filter(p => {
    const age = now - new Date(p.createdAt).getTime();
    return age >= windowMs && age < windowMs * 2;
  });

  if (olderPosts.length === 0) {
    return recentPosts.length > 5 ? 'spiking' : recentPosts.length > 0 ? 'rising' : 'stable';
  }

  const ratio = recentPosts.length / olderPosts.length;
  
  if (ratio > 2) return 'spiking';
  if (ratio > 1.3) return 'rising';
  if (ratio < 0.7) return 'falling';
  return 'stable';
}
