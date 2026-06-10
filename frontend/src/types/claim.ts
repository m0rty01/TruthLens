export type ClaimClassification =
  | "TRUE"
  | "FALSE"
  | "MISLEADING"
  | "MISSING_CONTEXT"
  | "EXAGGERATED"
  | "UNVERIFIED"
  | "SATIRE";

export interface Evidence {
  id: string;
  source: string;
  url?: string;
  snippet: string;
  credibility: number; // 0-100
  date: string;
}

export interface Claim {
  id: string;
  text: string;
  classification: ClaimClassification;
  confidenceScore: number; // 0-100
  evidence: Evidence[];
  counterEvidence: Evidence[];
  context: string;
  narrativeId: string;
  originPlatform: string;
  originUrl?: string;
  firstSeen: string;
  lastUpdated: string;
  timesChecked: number;
  exaggerationIndex?: number; // 0-100, percentage of exaggeration
}
