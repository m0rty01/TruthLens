import { apiClient } from "./api-client";

// ─── Narratives ───
export const narrativesApi = {
  list: (category?: string) =>
    apiClient.get("/api/narratives", { params: { category } }).then((r) => r.data),
  getById: (id: string) =>
    apiClient.get(`/api/narratives/${id}`).then((r) => r.data),
};

// ─── Viral Content ───
export const viralContentApi = {
  list: (platform?: string) =>
    apiClient.get("/api/viral-content", { params: { platform } }).then((r) => r.data),
  getById: (id: string) =>
    apiClient.get(`/api/viral-content/${id}`).then((r) => r.data),
};

// ─── Claims ───
export const claimsApi = {
  list: () =>
    apiClient.get("/api/claims").then((r) => r.data),
  getById: (id: string) =>
    apiClient.get(`/api/claims/${id}`).then((r) => r.data),
  verify: (text: string) =>
    apiClient.post("/api/claims/verify", { text }).then((r) => r.data),
};

// ─── Playbooks ───
export const playbooksApi = {
  list: () =>
    apiClient.get("/api/playbooks").then((r) => r.data),
  getById: (id: string) =>
    apiClient.get(`/api/playbooks/${id}`).then((r) => r.data),
  generate: (narrative: string, situation: string) =>
    apiClient.post("/api/playbooks/generate", { narrative, situation }).then((r) => r.data),
};

// ─── AI Copilot ───
export const copilotApi = {
  chat: (message: string) =>
    apiClient.post("/api/copilot/chat", { message }).then((r) => r.data),
};

// ─── Reports ───
export const reportsApi = {
  list: () =>
    apiClient.get("/api/reports").then((r) => r.data),
  getById: (id: string) =>
    apiClient.get(`/api/reports/${id}`).then((r) => r.data),
};

// ─── Exaggeration ───
export const exaggerationApi = {
  getByClaimId: (claimId: string) =>
    apiClient.get(`/api/exaggeration/${claimId}`).then((r) => r.data),
};

// ─── AI Detection ───
export const aiDetectionApi = {
  analyze: () =>
    apiClient.get("/api/ai-detection/analyze").then((r) => r.data),
};

// ─── Origin ───
export const originApi = {
  getByNarrativeId: (narrativeId: string) =>
    apiClient.get(`/api/origin/${narrativeId}`).then((r) => r.data),
};

// ─── Networks ───
export const networksApi = {
  getByNarrativeId: (narrativeId: string) =>
    apiClient.get(`/api/networks/${narrativeId}`).then((r) => r.data),
};

// ─── Attribution ───
export const attributionApi = {
  getByNarrativeId: (narrativeId: string) =>
    apiClient.get(`/api/attribution/${narrativeId}`).then((r) => r.data),
};

// ─── Bot Detection ───
export const botDetectionApi = {
  getByAccountId: (accountId: string) =>
    apiClient.get(`/api/bot-detection/${accountId}`).then((r) => r.data),
};

// ─── Community Reports ───
export const communityReportApi = {
  list: () =>
    apiClient.get("/api/report").then((r) => r.data),
  submit: (data: Record<string, unknown>) =>
    apiClient.post("/api/report", data).then((r) => r.data),
};

// ─── Incidents ───
export const incidentsApi = {
  list: () =>
    apiClient.get("/api/incidents").then((r) => r.data),
};

// ─── Advisor ───
export const advisorApi = {
  submit: (situation: string) =>
    apiClient.post("/api/advisor", { situation }).then((r) => r.data),
};

// ─── Forecast ───
export const forecastApi = {
  list: () =>
    apiClient.get("/api/forecast").then((r) => r.data),
};

// ─── Social Media ───
export const socialMediaApi = {
  getStatus: () =>
    apiClient.get("/api/social-media/status").then((r) => r.data),
  getFeed: (platform?: string, query?: string) =>
    apiClient.get("/api/social-media/feed", { params: { platform, query } }).then((r) => r.data),
  getPlatform: (name: string, query?: string) =>
    apiClient.get(`/api/social-media/platform/${name}`, { params: { query } }).then((r) => r.data),
  updateKeys: (keys: Record<string, string>) =>
    apiClient.post("/api/social-media/keys", keys).then((r) => r.data),
};

// ─── Auth ───
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/api/auth/login", { email, password }).then((r) => r.data),
  users: () =>
    apiClient.get("/api/auth/users").then((r) => r.data),
};

// ─── Harm Intelligence ───
export const harmIntelligenceApi = {
  list: () =>
    apiClient.get("/api/harm-intelligence").then((r) => r.data),
  getIndex: () =>
    apiClient.get("/api/harm-intelligence/index").then((r) => r.data),
  getByNarrative: (narrativeId: string) =>
    apiClient.get(`/api/harm-intelligence/${narrativeId}`).then((r) => r.data),
};

// ─── Early Warning ───
export const earlyWarningApi = {
  alerts: () =>
    apiClient.get("/api/early-warning/alerts").then((r) => r.data),
  status: () =>
    apiClient.get("/api/early-warning/status").then((r) => r.data),
  scan: () =>
    apiClient.post("/api/early-warning/scan", {}).then((r) => r.data),
};

// ─── Resilience ───
export const resilienceApi = {
  list: () =>
    apiClient.get("/api/resilience").then((r) => r.data),
  trends: () =>
    apiClient.get("/api/resilience/trends").then((r) => r.data),
  getByCountry: (country: string) =>
    apiClient.get(`/api/resilience/${country}`).then((r) => r.data),
};

// ─── Correlation ───
export const correlationApi = {
  list: () =>
    apiClient.get("/api/correlation").then((r) => r.data),
  getByNarrative: (narrativeId: string) =>
    apiClient.get(`/api/correlation/${narrativeId}`).then((r) => r.data),
};

// ─── Moderator ───
export const moderatorApi = {
  queue: () =>
    apiClient.get("/api/moderator/queue").then((r) => r.data),
  stats: () =>
    apiClient.get("/api/moderator/stats").then((r) => r.data),
  auditLog: () =>
    apiClient.get("/api/moderator/audit-log").then((r) => r.data),
  verify: (id: string, reason?: string) =>
    apiClient.post(`/api/moderator/${id}/verify`, { reason }).then((r) => r.data),
  dismiss: (id: string, reason?: string) =>
    apiClient.post(`/api/moderator/${id}/dismiss`, { reason }).then((r) => r.data),
};

// ─── Research ───
export const researchApi = {
  datasets: () =>
    apiClient.get("/api/research/datasets").then((r) => r.data),
  exportDataset: (dataset: string) =>
    apiClient.get(`/api/research/export/${dataset}`).then((r) => r.data),
  methodology: () =>
    apiClient.get("/api/research/methodology").then((r) => r.data),
  stats: () =>
    apiClient.get("/api/research/stats").then((r) => r.data),
};

// ─── Enhanced Community Reports ───
export const enhancedReportApi = {
  verify: (id: string, reason?: string) =>
    apiClient.post(`/api/report/${id}/verify`, { reason }).then((r) => r.data),
  dismiss: (id: string, reason?: string) =>
    apiClient.post(`/api/report/${id}/dismiss`, { reason }).then((r) => r.data),
  appeal: (id: string, reason: string) =>
    apiClient.post(`/api/report/${id}/appeal`, { reason }).then((r) => r.data),
  addEvidence: (id: string, evidence: { type: string; description: string }) =>
    apiClient.post(`/api/report/${id}/evidence`, evidence).then((r) => r.data),
};
