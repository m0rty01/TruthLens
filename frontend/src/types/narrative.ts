export type NarrativeCategory =
  | "Housing"
  | "Immigration"
  | "Jobs"
  | "Crime"
  | "Scams"
  | "International Students"
  | "Religion"
  | "Khalistan"
  | "India-Pakistan"
  | "Geopolitics"
  | "Culture"
  | "Economy";

export type TrendDirection = "rising" | "falling" | "stable" | "spiking";

export interface PlatformDistribution {
  platform: string;
  mentions: number;
  percentage: number;
}

export interface CountryDistribution {
  country: string;
  mentions: number;
  percentage: number;
}

export interface TrendScore {
  score: number; // 0-100
  direction: TrendDirection;
  velocity: number; // mentions per hour
  peakDate?: string;
}

export interface NarrativeTimelineEntry {
  date: string;
  mentions: number;
  sentiment: number; // -1 to 1
}

export interface Narrative {
  id: string;
  title: string;
  description: string;
  category: NarrativeCategory;
  trend: TrendScore;
  platformDistribution: PlatformDistribution[];
  countryDistribution: CountryDistribution[];
  timeline: NarrativeTimelineEntry[];
  firstSeen: string;
  lastUpdated: string;
  totalMentions: number;
  relatedClaims: string[];
  tags: string[];
}
