export type ResponseType =
  | "professional"
  | "educational"
  | "short_social_reply"
  | "long_explanation"
  | "ignore"
  | "legal_escalation";

export interface ResponsePlaybook {
  id: string;
  narrativeId: string;
  claimId?: string;
  title: string;
  situation: string;
  responses: {
    type: ResponseType;
    title: string;
    content: string;
    recommended: boolean;
  }[];
  dos: string[];
  donts: string[];
  legalConsiderations?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HarassmentGuide {
  id: string;
  title: string;
  category: "documentation" | "reporting" | "privacy" | "doxxing_prevention" | "evidence_collection";
  content: string;
  steps: string[];
  resources: { name: string; url: string }[];
}
