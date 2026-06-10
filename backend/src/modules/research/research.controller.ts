import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';

@ApiTags('Research')
@Controller('research')
export class ResearchController {
  constructor(private db: DatabaseService) {}

  @Get('datasets')
  @ApiOperation({ summary: 'List available research datasets' })
  async getDatasets() {
    const narrativeCount = (await this.db.queryOne('SELECT COUNT(*) as c FROM narratives'))?.c || 0;
    const claimCount = (await this.db.queryOne('SELECT COUNT(*) as c FROM claims'))?.c || 0;
    const incidentCount = (await this.db.queryOne('SELECT COUNT(*) as c FROM incidents'))?.c || 0;
    const harmCount = (await this.db.queryOne('SELECT COUNT(*) as c FROM harm_scores'))?.c || 0;
    const correlationCount = (await this.db.queryOne('SELECT COUNT(*) as c FROM correlations'))?.c || 0;
    const resilienceCount = (await this.db.queryOne('SELECT COUNT(*) as c FROM resilience_scores'))?.c || 0;
    const alertCount = (await this.db.queryOne('SELECT COUNT(*) as c FROM alerts'))?.c || 0;

    return [
      { id: 'narratives', name: 'Narrative Tracking Data', description: 'All tracked narratives with trend scores, platform distribution, and lifecycle stages', records: narrativeCount, format: 'JSON', lastUpdated: '2026-06-10', accessLevel: 'public' },
      { id: 'claims', name: 'Claim Verification Data', description: 'Verified claims with evidence, counter-evidence, and classification scores', records: claimCount, format: 'JSON', lastUpdated: '2026-06-10', accessLevel: 'public' },
      { id: 'incidents', name: 'Community Incident Reports', description: 'Anonymized incident reports with geographic data and verification status', records: incidentCount, format: 'JSON', lastUpdated: '2026-06-10', accessLevel: 'restricted' },
      { id: 'harm_scores', name: 'Narrative Harm Scores', description: 'Harm impact assessments across 6 categories with confidence levels', records: harmCount, format: 'JSON', lastUpdated: '2026-06-10', accessLevel: 'public' },
      { id: 'correlations', name: 'Harm Correlation Data', description: 'Statistical correlations between narrative volume and incident reports', records: correlationCount, format: 'JSON', lastUpdated: '2026-06-10', accessLevel: 'public' },
      { id: 'resilience', name: 'Community Resilience Scores', description: 'Geographic resilience assessments across 5 metrics', records: resilienceCount, format: 'JSON', lastUpdated: '2026-06-10', accessLevel: 'public' },
      { id: 'alerts', name: 'Early Warning Alerts', description: 'Alert history with severity levels and detection types', records: alertCount, format: 'JSON', lastUpdated: '2026-06-10', accessLevel: 'public' },
    ];
  }

  @Get('export/:dataset')
  @ApiOperation({ summary: 'Export a dataset as JSON' })
  async exportDataset(@Param('dataset') dataset: string) {
    const tableMap: Record<string, string> = {
      narratives: 'SELECT id, title, description, category, trend_score, trend_direction, trend_velocity, first_seen, last_updated, total_mentions, tags, lifecycle_stage, harm_score FROM narratives',
      claims: 'SELECT id, text, classification, confidence_score, context, narrative_id, origin_platform, first_seen, times_checked, exaggeration_index FROM claims',
      incidents: 'SELECT id, title, category, country, city, severity, reported_at, status FROM incidents',
      harm_scores: 'SELECT * FROM harm_scores',
      correlations: 'SELECT * FROM correlations',
      resilience: 'SELECT * FROM resilience_scores',
      alerts: 'SELECT * FROM alerts',
    };
    const query = tableMap[dataset];
    if (!query) return { error: `Unknown dataset: ${dataset}`, available: Object.keys(tableMap) };
    const data = await this.db.query(query);
    return { dataset, records: data.length, exportedAt: new Date().toISOString(), data };
  }

  @Get('methodology')
  @ApiOperation({ summary: 'Get methodology documentation' })
  getMethodology() {
    return {
      narrativeDetection: { method: 'Cross-platform keyword clustering with temporal analysis', sources: ['X API', 'Reddit API', 'YouTube API', 'TikTok API'], updateFrequency: 'Every 15 minutes', confidence: 'Based on volume threshold and cross-platform presence' },
      claimVerification: { method: 'Multi-source evidence matching with credibility scoring', sources: ['Government statistics', 'Academic research', 'NGO reports', 'Fact-checking organizations'], confidence: 'Weighted average of source credibility scores' },
      harmScoring: { method: 'Composite index from incident reports, sentiment analysis, and media reach correlation', factors: ['Incident report volume', 'Sentiment shift magnitude', 'Media reach estimation', 'Community impact indicators'], confidence: 'Based on sample size and data quality metrics', disclaimer: 'Scores represent observed correlations, not causal relationships' },
      correlationAnalysis: { method: 'Pearson correlation between 30-day rolling windows of narrative volume and categorized incident counts', significance: 'p < 0.05 threshold for statistical significance', limitations: ['Temporal correlation only', 'No causal inference', 'Sample size dependent', 'Reporting bias possible'] },
      resilienceScoring: { method: 'Composite metric from 5 community health indicators', factors: ['Community participation', 'Positive engagement', 'Support networks', 'Reporting behavior', 'Sentiment stability'], updateFrequency: 'Weekly' },
      earlyWarning: { method: 'Anomaly detection on narrative velocity, sentiment, and amplification patterns', alertLevels: ['Low (monitoring)', 'Medium (elevated)', 'High (concerning)', 'Critical (immediate action)'], scanFrequency: 'Every 15 minutes' },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get research statistics overview' })
  async getStats() {
    const tables = ['narratives', 'claims', 'incidents', 'harm_scores', 'correlations', 'resilience_scores', 'alerts', 'audit_logs', 'users'];
    const stats: Record<string, number> = {};
    for (const t of tables) {
      const result = await this.db.queryOne(`SELECT COUNT(*) as c FROM ${t}`);
      stats[t] = result?.c || 0;
    }
    return {
      totalRecords: Object.values(stats).reduce((a, b) => a + b, 0),
      byTable: stats,
      dataQuality: { coverage: '6 countries, 8 cities', timeRange: '2024-01 to 2026-06', platforms: 6, narrativeCategories: 6 },
      lastExport: new Date().toISOString(),
    };
  }
}
