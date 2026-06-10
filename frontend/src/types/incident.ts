export type IncidentCategory =
  | "Online"
  | "Offline"
  | "Workplace"
  | "School"
  | "Housing"
  | "Public Harassment";

export type ReportStatus = "pending" | "reviewed" | "verified" | "dismissed";

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  category: IncidentCategory;
  country: string;
  city?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  country: string;
  city?: string;
  lat?: number;
  lng?: number;
  reportedAt: string;
  reportedBy: string;
  status: ReportStatus;
  evidence: string[];
  narrativeIds: string[];
}

export interface CommunityReport {
  id: string;
  type: "harassment" | "discrimination" | "narrative" | "threat" | "fake_video" | "coordinated_campaign";
  title: string;
  description: string;
  platform?: string;
  url?: string;
  submittedAt: string;
  submittedBy: string;
  status: ReportStatus;
  country: string;
}
