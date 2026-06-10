import { RawPost, AggregatedNarrative } from '../interfaces';
import { analyzeSentiment, calculateTrendDirection } from './content.transformer';

// Aggregate posts into narratives by keyword/topic
export function aggregateNarratives(posts: RawPost[], keyword: string): AggregatedNarrative {
  if (posts.length === 0) {
    return {
      keyword,
      posts: [],
      totalMentions: 0,
      platformDistribution: [],
      countryDistribution: [],
      trend: { score: 0, direction: 'stable', velocity: 0 },
      sentiment: 0,
      timeline: [],
    };
  }

  // Calculate platform distribution
  const platformCounts = new Map<string, number>();
  for (const post of posts) {
    platformCounts.set(post.platform, (platformCounts.get(post.platform) || 0) + 1);
  }
  
  const platformDistribution = Array.from(platformCounts.entries())
    .map(([platform, mentions]) => ({
      platform,
      mentions,
      percentage: Math.round((mentions / posts.length) * 100),
    }))
    .sort((a, b) => b.mentions - a.mentions);

  // Calculate country distribution
  const countryCounts = new Map<string, number>();
  for (const post of posts) {
    const country = post.location || 'Unknown';
    countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
  }
  
  const countryDistribution = Array.from(countryCounts.entries())
    .map(([country, mentions]) => ({
      country,
      mentions,
      percentage: Math.round((mentions / posts.length) * 100),
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10); // Top 10 countries

  // Calculate overall sentiment
  const sentiments = posts.map(p => analyzeSentiment(p.text).score);
  const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;

  // Calculate trend
  const direction = calculateTrendDirection(posts);
  const trendScore = Math.min(Math.round((posts.length / 100) * 100), 100);
  const velocity = Math.round(posts.length / 7); // Posts per day estimate

  // Generate timeline (group by day)
  const timelineMap = new Map<string, { mentions: number; sentiment: number }>();
  
  for (const post of posts) {
    const date = post.createdAt.split('T')[0];
    const existing = timelineMap.get(date) || { mentions: 0, sentiment: 0 };
    existing.mentions++;
    existing.sentiment += analyzeSentiment(post.text).score;
    timelineMap.set(date, existing);
  }

  const timeline = Array.from(timelineMap.entries())
    .map(([date, data]) => ({
      date,
      mentions: data.mentions,
      sentiment: parseFloat((data.sentiment / data.mentions).toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    keyword,
    posts,
    totalMentions: posts.length,
    platformDistribution,
    countryDistribution,
    trend: {
      score: trendScore,
      direction,
      velocity,
    },
    sentiment: parseFloat(avgSentiment.toFixed(2)),
    timeline,
  };
}

// Convert aggregated narrative to Narrative type for frontend
export function transformToNarrative(
  narrative: AggregatedNarrative,
  id: string
): {
  id: string;
  title: string;
  description: string;
  category: string;
  trend: { score: number; direction: string; velocity: number; peakDate?: string };
  platformDistribution: { platform: string; mentions: number; percentage: number }[];
  countryDistribution: { country: string; mentions: number; percentage: number }[];
  timeline: { date: string; mentions: number; sentiment: number }[];
  firstSeen: string;
  lastUpdated: string;
  totalMentions: number;
  relatedClaims: string[];
  tags: string[];
} {
  // Extract dates for first seen and last updated
  const dates = narrative.posts.map(p => new Date(p.createdAt));
  const firstSeen = dates.length > 0 
    ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  const lastUpdated = dates.length > 0
    ? new Date(Math.max(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // Get peak date from timeline
  const peakEntry = narrative.timeline.length > 0
    ? narrative.timeline.reduce((max, curr) => curr.mentions > max.mentions ? curr : max)
    : null;

  // Extract hashtags as tags
  const allHashtags = narrative.posts.flatMap(p => p.hashtags || []);
  const tagCounts = new Map<string, number>();
  for (const tag of allHashtags) {
    tagCounts.set(tag.toLowerCase(), (tagCounts.get(tag.toLowerCase()) || 0) + 1);
  }
  const tags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);

  // Determine category from keyword
  const categoryMap: Record<string, string> = {
    'housing': 'Housing',
    'student': 'International Students',
    'job': 'Jobs',
    'work': 'Jobs',
    'h1b': 'Jobs',
    'scam': 'Scams',
    'fraud': 'Scams',
    'crime': 'Crime',
    'khalistan': 'Khalistan',
    'immigration': 'Immigration',
  };

  const keywordLower = narrative.keyword.toLowerCase();
  let category = 'Other';
  for (const [key, value] of Object.entries(categoryMap)) {
    if (keywordLower.includes(key)) {
      category = value;
      break;
    }
  }

  return {
    id,
    title: narrative.keyword,
    description: `Live tracking of social media posts mentioning "${narrative.keyword}" across ${narrative.platformDistribution.length} platforms.`,
    category,
    trend: {
      score: narrative.trend.score,
      direction: narrative.trend.direction,
      velocity: narrative.trend.velocity,
      peakDate: peakEntry?.date,
    },
    platformDistribution: narrative.platformDistribution,
    countryDistribution: narrative.countryDistribution,
    timeline: narrative.timeline,
    firstSeen,
    lastUpdated,
    totalMentions: narrative.totalMentions,
    relatedClaims: [],
    tags,
  };
}

// Keywords to track for narrative monitoring
export const DEFAULT_KEYWORDS = [
  'indian students housing',
  'indian immigrants jobs',
  'indian scam call center',
  'h1b visa abuse',
  'indian crime canada',
  'khalistan support',
  'indian academic fraud',
  'indian diaspora',
];
