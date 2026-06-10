export type ActorType =
  | "Organic User"
  | "Media"
  | "Political Group"
  | "Activist"
  | "Bot"
  | "Engagement Farmer"
  | "Influencer"
  | "Unknown";

export type BotClassification = "Human" | "Bot-Like" | "Likely Automated" | "Unknown";

export type AttributionConfidence = "Low" | "Medium" | "High";

export interface BotScore {
  overallScore: number; // 0-100
  postingFrequency: number;
  languageConsistency: number;
  followerPattern: number;
  retweetRatio: number;
  temporalActivity: number;
  classification: BotClassification;
}

export interface AmplificationNode {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: number;
  actorType: ActorType;
  botScore?: BotScore;
  amplificationCount: number;
  firstAmplified: string;
  lastAmplified: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: "shares" | "mentions" | "replies" | "amplifies";
  weight: number;
  timestamp: string;
}

export interface AmplificationNetwork {
  narrativeId: string;
  nodes: AmplificationNode[];
  edges: NetworkEdge[];
  clusters: { id: string; name: string; nodeIds: string[] }[];
}

export interface ActorAttribution {
  narrativeId: string;
  actors: {
    type: ActorType;
    count: number;
    percentage: number;
    confidence: AttributionConfidence;
  }[];
}
