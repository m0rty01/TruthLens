export interface NarrativeForecast {
  narrativeId: string;
  title: string;
  predictedGrowth: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

export interface IntelligenceReport {
  id: string;
  title: string;
  month: string;
  year: number;
  summary: string;
  topNarratives: { id: string; title: string; mentions: number; trend: string }[];
  emergingNarratives: { id: string; title: string; growth: number }[];
  narrativeDeaths: { id: string; title: string; decline: number }[];
  amplificationTrends: { period: string; volume: number }[];
  botTrends: { period: string; botActivity: number }[];
  countryAnalysis: { country: string; incidents: number; sentiment: number }[];
  forecasts: NarrativeForecast[];
  generatedAt: string;
}

export interface ExaggerationResult {
  claimId: string;
  claimText: string;
  evidenceSupportScore: number; // 0-100
  exaggerationIndex: number; // 0-100
  breakdown: {
    factor: string;
    score: number;
    explanation: string;
  }[];
}

export interface AIMDetectionResult {
  contentId: string;
  contentType: "image" | "video" | "audio" | "text";
  classification: "Likely Authentic" | "Possibly Manipulated" | "Likely AI Generated" | "Unknown";
  confidence: number;
  signals: { type: string; score: number; description: string }[];
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; url: string; snippet: string }[];
  timestamp: string;
}
