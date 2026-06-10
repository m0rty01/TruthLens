import { Injectable } from '@nestjs/common';

function generateTimeline(days: number, base: number) {
  const entries: { date: string; mentions: number; sentiment: number }[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    entries.push({ date: d.toISOString().split('T')[0], mentions: Math.max(0, base + Math.floor(Math.random() * base * 0.3 - base * 0.15)), sentiment: parseFloat((Math.random() * 2 - 1).toFixed(2)) });
  }
  return entries;
}

@Injectable()
export class MockDataService {
  getNarratives() {
    return [
      { id: 'narr-001', title: 'Indian Students Causing Housing Crisis', description: 'Narrative claiming Indian international students are the primary driver of housing affordability issues.', category: 'Housing', trend: { score: 87, direction: 'spiking', velocity: 342 }, platformDistribution: [{ platform: 'X', mentions: 45200, percentage: 38 }, { platform: 'Reddit', mentions: 32100, percentage: 27 }, { platform: 'YouTube', mentions: 24500, percentage: 20 }], countryDistribution: [{ country: 'Canada', mentions: 62000, percentage: 52 }, { country: 'United Kingdom', mentions: 28000, percentage: 23 }], timeline: generateTimeline(30, 4000), firstSeen: '2025-08-15', lastUpdated: '2026-06-10', totalMentions: 120000, tags: ['housing', 'students', 'canada'] },
      { id: 'narr-002', title: 'Indian Immigrants Taking Jobs', description: 'Claims that Indian immigrants are systematically displacing local workers.', category: 'Jobs', trend: { score: 74, direction: 'rising', velocity: 198 }, platformDistribution: [{ platform: 'X', mentions: 38000, percentage: 40 }, { platform: 'Reddit', mentions: 28500, percentage: 30 }], countryDistribution: [{ country: 'United States', mentions: 45000, percentage: 47 }, { country: 'Canada', mentions: 25000, percentage: 26 }], timeline: generateTimeline(30, 3000), firstSeen: '2025-06-20', lastUpdated: '2026-06-10', totalMentions: 95000, tags: ['jobs', 'tech'] },
      { id: 'narr-003', title: 'Indian Scam Call Centers', description: 'Narrative associating Indian communities with scam operations.', category: 'Scams', trend: { score: 65, direction: 'stable', velocity: 120 }, platformDistribution: [{ platform: 'YouTube', mentions: 42000, percentage: 45 }, { platform: 'X', mentions: 28000, percentage: 30 }], countryDistribution: [{ country: 'United States', mentions: 55000, percentage: 59 }], timeline: generateTimeline(30, 2500), firstSeen: '2024-01-10', lastUpdated: '2026-06-09', totalMentions: 93000, tags: ['scams', 'fraud'] },
      { id: 'narr-004', title: 'Khalistan Separatism Support', description: 'Narratives around alleged diaspora support for Khalistan.', category: 'Khalistan', trend: { score: 58, direction: 'falling', velocity: 85 }, platformDistribution: [{ platform: 'X', mentions: 35000, percentage: 42 }], countryDistribution: [{ country: 'Canada', mentions: 40000, percentage: 48 }], timeline: generateTimeline(30, 1800), firstSeen: '2024-03-15', lastUpdated: '2026-06-08', totalMentions: 83000, tags: ['khalistan'] },
      { id: 'narr-005', title: 'Indian Students Academic Fraud', description: 'Claims of widespread academic fraud by Indian students.', category: 'International Students', trend: { score: 71, direction: 'rising', velocity: 156 }, platformDistribution: [{ platform: 'Reddit', mentions: 30000, percentage: 35 }], countryDistribution: [{ country: 'Canada', mentions: 42000, percentage: 49 }], timeline: generateTimeline(30, 2200), firstSeen: '2025-09-01', lastUpdated: '2026-06-10', totalMentions: 85000, tags: ['students', 'fraud'] },
      { id: 'narr-006', title: 'Crime Rate Attributed to Indians', description: 'Exaggerated claims linking immigration to crime.', category: 'Crime', trend: { score: 62, direction: 'rising', velocity: 134 }, platformDistribution: [{ platform: 'X', mentions: 32000, percentage: 37 }], countryDistribution: [{ country: 'Canada', mentions: 35000, percentage: 40 }], timeline: generateTimeline(30, 2000), firstSeen: '2025-04-12', lastUpdated: '2026-06-10', totalMentions: 86000, tags: ['crime'] },
    ];
  }

  getNarrativeById(id: string) { return this.getNarratives().find((n) => n.id === id); }

  getClaims() {
    return [
      { id: 'claim-001', text: 'Indian students caused Canada\'s housing crisis', classification: 'EXAGGERATED', confidenceScore: 82, evidence: [{ id: 'ev-001', source: 'Statistics Canada', snippet: 'International students represent ~4% of rental demand.', credibility: 95, date: '2026-03-15' }], counterEvidence: [{ id: 'cev-001', source: 'Bank of Canada', snippet: 'Multiple factors are primary drivers.', credibility: 94, date: '2026-01-10' }], context: 'Canada faces a housing crisis driven by decades of undersupply.', narrativeId: 'narr-001', originPlatform: 'Reddit', firstSeen: '2025-10-15', lastUpdated: '2026-06-09', timesChecked: 142, exaggerationIndex: 75 },
      { id: 'claim-002', text: 'Canadian universities are diploma mills for Indian students', classification: 'FALSE', confidenceScore: 91, evidence: [], counterEvidence: [{ id: 'cev-003', source: 'Universities Canada', snippet: 'Rigorous admission standards maintained.', credibility: 96, date: '2026-03-01' }], context: 'Public universities maintain high standards.', narrativeId: 'narr-001', originPlatform: 'X', firstSeen: '2025-11-20', lastUpdated: '2026-06-08', timesChecked: 89, exaggerationIndex: 88 },
      { id: 'claim-003', text: 'Most Indian students in Canada work illegally', classification: 'MISLEADING', confidenceScore: 78, evidence: [{ id: 'ev-003', source: 'IRCC', snippet: 'Some violations identified.', credibility: 90, date: '2026-02-15' }], counterEvidence: [{ id: 'cev-005', source: 'Statistics Canada', snippet: 'Vast majority comply with conditions.', credibility: 93, date: '2026-04-10' }], context: 'Characterization that most do is not supported.', narrativeId: 'narr-001', originPlatform: 'X', firstSeen: '2026-01-05', lastUpdated: '2026-06-07', timesChecked: 67, exaggerationIndex: 82 },
      { id: 'claim-004', text: 'Indian tech workers on H-1B visas are replacing American workers', classification: 'MISSING_CONTEXT', confidenceScore: 72, evidence: [{ id: 'ev-004', source: 'EPI', snippet: 'Some companies used H-1B at lower wages.', credibility: 85, date: '2025-12-01' }], counterEvidence: [{ id: 'cev-006', source: 'NFAP', snippet: 'H-1B workers complement domestic workers.', credibility: 91, date: '2026-02-28' }], context: 'Complex labor market dynamics.', narrativeId: 'narr-002', originPlatform: 'Reddit', firstSeen: '2025-08-10', lastUpdated: '2026-06-09', timesChecked: 203, exaggerationIndex: 68 },
      { id: 'claim-005', text: 'Indian CEOs only hire Indian employees', classification: 'FALSE', confidenceScore: 95, evidence: [], counterEvidence: [{ id: 'cev-008', source: 'SEC Filings', snippet: 'Diverse hiring patterns.', credibility: 92, date: '2026-01-20' }], context: 'Claim relies on confirmation bias.', narrativeId: 'narr-002', originPlatform: 'X', firstSeen: '2025-09-25', lastUpdated: '2026-06-08', timesChecked: 156, exaggerationIndex: 92 },
    ];
  }

  getClaimById(id: string) { return this.getClaims().find((c) => c.id === id); }

  getViralContent() {
    return [
      { id: 'vc-001', platform: 'X', author: 'ConcernedCitizen', authorHandle: '@concerned_citizen42', authorFollowers: 45200, content: 'Another video of Indian students overcrowding housing.', contentType: 'text', url: '#', postedAt: '2026-06-09T14:30:00Z', engagement: { views: 2400000, likes: 45000, shares: 12000, comments: 8500, engagementRate: 2.7 }, viralityScore: 92, sentiment: 'negative', narrativeIds: ['narr-001'], country: 'Canada', language: 'en', isVerified: false },
      { id: 'vc-002', platform: 'Reddit', author: 'throwaway_canada', authorHandle: 'u/throwaway_canada', authorFollowers: 1200, content: 'I\'m a landlord in Toronto and I\'ve seen the impact.', contentType: 'text', url: '#', postedAt: '2026-06-08T09:15:00Z', engagement: { views: 890000, likes: 23000, shares: 5600, comments: 12000, engagementRate: 4.6 }, viralityScore: 85, sentiment: 'negative', narrativeIds: ['narr-001'], country: 'Canada', language: 'en', isVerified: false },
      { id: 'vc-003', platform: 'YouTube', author: 'NewsExplained', authorHandle: '@NewExplained', authorFollowers: 890000, content: 'The TRUTH about Indian immigrants and the job market', contentType: 'video', url: '#', postedAt: '2026-06-07T18:00:00Z', engagement: { views: 3200000, likes: 67000, shares: 15000, comments: 9800, engagementRate: 2.9 }, viralityScore: 94, sentiment: 'negative', narrativeIds: ['narr-002'], country: 'United States', language: 'en', isVerified: true },
      { id: 'vc-004', platform: 'TikTok', author: 'StudentLifeCanada', authorHandle: '@studentlife_canada', authorFollowers: 234000, content: 'POV: You\'re an Indian student blamed for housing crisis.', contentType: 'video', url: '#', postedAt: '2026-06-09T12:00:00Z', engagement: { views: 5600000, likes: 340000, shares: 45000, comments: 22000, engagementRate: 7.3 }, viralityScore: 97, sentiment: 'positive', narrativeIds: ['narr-001'], country: 'Canada', language: 'en', isVerified: true },
    ];
  }

  getViralContentById(id: string) { return this.getViralContent().find((c) => c.id === id); }

  getPlaybooks() {
    return [
      { id: 'pb-001', narrativeId: 'narr-001', title: 'Responding to Housing Crisis Claims', situation: 'Someone claims Indian students are responsible for housing crisis.', responses: [{ type: 'professional', title: 'Professional Response', content: 'The housing crisis is driven by decades of undersupply. International students represent ~4% of rental demand.', recommended: true }], dos: ['Cite credible sources', 'Acknowledge housing is real'], donts: ['Dismiss concerns', 'Attack the person'], createdAt: '2026-05-01', updatedAt: '2026-06-09' },
      { id: 'pb-002', narrativeId: 'narr-002', title: 'Responding to Job Displacement Claims', situation: 'Claims that Indian workers are systematically replacing domestic workers.', responses: [{ type: 'professional', title: 'Professional Response', content: 'H-1B fills documented skill gaps. Tech unemployment remains below national average.', recommended: true }], dos: ['Use labor market data', 'Acknowledge legitimate concerns'], donts: ['Claim zero issues', 'Attack workers'], createdAt: '2026-04-15', updatedAt: '2026-06-08' },
    ];
  }

  getPlaybookById(id: string) { return this.getPlaybooks().find((p) => p.id === id); }

  getReports() {
    return [
      { id: 'rpt-001', title: 'Monthly Intelligence Report - May 2026', month: 'May', year: 2026, summary: 'May 2026 saw continued amplification of housing-related narratives.', topNarratives: [{ id: 'narr-001', title: 'Housing Crisis', mentions: 120000, trend: 'rising' }], emergingNarratives: [{ id: 'narr-005', title: 'Academic Fraud', growth: 45 }], narrativeDeaths: [{ id: 'narr-009', title: 'Economy Collapse', decline: 28 }], amplificationTrends: [{ period: 'Week 1', volume: 85000 }, { period: 'Week 2', volume: 92000 }], botTrends: [{ period: 'Week 1', botActivity: 12 }], countryAnalysis: [{ country: 'Canada', incidents: 234, sentiment: -0.45 }], forecasts: [{ narrativeId: 'narr-001', title: 'Housing Crisis', predictedGrowth: 25, confidence: 78, timeframe: '30 days', factors: ['Policy changes'] }], generatedAt: '2026-06-01' },
    ];
  }

  getReportById(id: string) { return this.getReports().find((r) => r.id === id); }

  getIncidents() {
    return [
      { id: 'inc-001', title: 'Verbal harassment at grocery store', category: 'Public Harassment', country: 'Canada', city: 'Brampton', status: 'reviewed', reportedAt: '2026-06-08' },
      { id: 'inc-002', title: 'Discriminatory rental rejection', category: 'Housing', country: 'Canada', city: 'Toronto', status: 'verified', reportedAt: '2026-06-07' },
      { id: 'inc-003', title: 'Workplace discrimination', category: 'Workplace', country: 'United States', city: 'San Jose', status: 'reviewed', reportedAt: '2026-06-06' },
      { id: 'inc-004', title: 'Online harassment campaign', category: 'Online', country: 'Canada', city: 'Vancouver', status: 'verified', reportedAt: '2026-06-09' },
    ];
  }

  copilotChat(message: string) {
    const msg = message.toLowerCase();
    let response = `Based on our analysis of "${message}": Our tracking system has identified related narratives across multiple platforms. The claim has been cross-referenced with credible sources. We recommend reviewing related claims and response playbooks.`;
    const sources = [{ title: 'Claim Verification Engine', url: '/claims' }, { title: 'Narrative Radar', url: '/narratives' }];

    if (msg.includes('harm') || msg.includes('impact') || msg.includes('index')) {
      response = `The current Narrative Harm Index is 63/100 (moderate concern). The highest-scoring narrative is "Indian Students Causing Housing Crisis" at 78/100. Key harm categories affected: Mental Health (72), Reputation (68), and Community (65). Remember: these scores represent observed correlations, not causal relationships. Review the Harm Intelligence page for detailed breakdowns.`;
      sources.push({ title: 'Harm Intelligence', url: '/harm-intelligence' });
    }
    if (msg.includes('resilience') || msg.includes('community strength')) {
      response = `Community resilience varies significantly by region. Canada shows the strongest overall resilience (74/100), driven by high reporting behavior and support networks. UK and Australia show moderate resilience. Cities with active community organizations tend to score higher on positive engagement metrics. Check the Resilience Index for city-level breakdowns.`;
      sources.push({ title: 'Community Resilience', url: '/resilience' });
    }
    if (msg.includes('alert') || msg.includes('warning') || msg.includes('threat')) {
      response = `The Early Warning System is currently monitoring narratives across 4 detection types: acceleration, sentiment spikes, amplification anomalies, and risk forecasts. Active alerts are prioritized by severity (Critical, High, Medium, Low). Trigger a manual scan from the Early Warning page for the latest assessment.`;
      sources.push({ title: 'Early Warning System', url: '/early-warning' });
    }
    if (msg.includes('correlation') || msg.includes('statistical')) {
      response = `Our correlation engine has identified several statistically significant associations between narrative volume and incident reports. The strongest correlation (r=0.82) is between housing narrative volume and housing discrimination reports. Important: correlation does not imply causation. All findings include confidence intervals and p-values. Review the Correlation Engine for full statistical outputs.`;
      sources.push({ title: 'Correlation Engine', url: '/correlation' });
    }

    return { id: `resp-${Date.now()}`, role: 'assistant', content: response, sources, timestamp: new Date().toISOString() };
  }

  advisorSubmit(situation: string) {
    return { actions: ['Document everything with timestamps', 'Report to relevant platforms', 'Review response playbooks', 'Consider legal consultation if needed'], resources: [{ name: 'Harassment Toolkit', url: '/harassment-toolkit' }, { name: 'Response Playbooks', url: '/playbooks' }] };
  }

  getExaggeration(claimId: string) {
    const claim = this.getClaimById(claimId);
    return { claimId, claimText: claim?.text || '', evidenceSupportScore: claim ? 100 - (claim.exaggerationIndex || 50) : 50, exaggerationIndex: claim?.exaggerationIndex || 50, breakdown: [{ factor: 'Statistical manipulation', score: 30, explanation: 'Cherry-picking data points' }, { factor: 'Context removal', score: 25, explanation: 'Missing historical context' }] };
  }

  getAttribution(narrativeId: string) {
    return { narrativeId, actors: [{ type: 'Organic User', count: 4500, percentage: 45, confidence: 'Medium' }, { type: 'Bot', count: 1500, percentage: 15, confidence: 'High' }, { type: 'Media', count: 1200, percentage: 12, confidence: 'High' }] };
  }

  getBotDetection(accountId: string) {
    return { accountId, overallScore: 78, classification: 'Bot-Like', signals: { postingFrequency: 85, languageConsistency: 72, followerPattern: 65, temporalActivity: 90 } };
  }
}
