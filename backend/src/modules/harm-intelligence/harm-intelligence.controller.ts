import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';

@ApiTags('Harm Intelligence')
@Controller('harm-intelligence')
export class HarmIntelligenceController {
  constructor(private db: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'List all harm scores' })
  findAll() {
    const sqlite = this.db.getDatabase();
    const scores = sqlite.prepare(`
      SELECT hs.*, n.title as narrative_title, n.category as narrative_category, n.total_mentions
      FROM harm_scores hs
      LEFT JOIN narratives n ON hs.narrative_id = n.id
      ORDER BY hs.overall_index DESC
    `).all();
    return scores;
  }

  @Get('index')
  @ApiOperation({ summary: 'Get aggregate Narrative Harm Index' })
  getIndex() {
    const sqlite = this.db.getDatabase();
    const scores = sqlite.prepare('SELECT * FROM harm_scores').all() as any[];
    const avg = scores.reduce((s, h) => s + h.overall_index, 0) / (scores.length || 1);
    const avgConfidence = scores.reduce((s, h) => s + h.confidence, 0) / (scores.length || 1);
    return {
      narrativeHarmIndex: Math.round(avg),
      confidence: Math.round(avgConfidence),
      totalNarrativesAssessed: scores.length,
      disclaimer: 'Harm scores represent observed correlations, not causal relationships. Scores are derived from incident reports, sentiment analysis, and media reach data.',
      methodology: 'Composite index from incident report volume, sentiment shift analysis, and media reach correlation using 30-day rolling windows.',
      categories: {
        physical: Math.round(scores.reduce((s, h) => s + h.physical, 0) / (scores.length || 1)),
        economic: Math.round(scores.reduce((s, h) => s + h.economic, 0) / (scores.length || 1)),
        mentalHealth: Math.round(scores.reduce((s, h) => s + h.mental_health, 0) / (scores.length || 1)),
        reputation: Math.round(scores.reduce((s, h) => s + h.reputation, 0) / (scores.length || 1)),
        policy: Math.round(scores.reduce((s, h) => s + h.policy, 0) / (scores.length || 1)),
        community: Math.round(scores.reduce((s, h) => s + h.community, 0) / (scores.length || 1)),
      },
    };
  }

  @Get(':narrativeId')
  @ApiOperation({ summary: 'Get harm score for a specific narrative' })
  findByNarrative(@Param('narrativeId') narrativeId: string) {
    const sqlite = this.db.getDatabase();
    const score = sqlite.prepare(`
      SELECT hs.*, n.title as narrative_title, n.category as narrative_category, n.total_mentions
      FROM harm_scores hs
      LEFT JOIN narratives n ON hs.narrative_id = n.id
      WHERE hs.narrative_id = ?
    `).get(narrativeId);
    if (!score) return { message: 'No harm data available for this narrative', narrativeId };
    return {
      ...score,
      disclaimer: 'This score reflects observed associations between narrative spread and reported incidents. It does not establish causation.',
      categories: {
        physical: { score: (score as any).physical, label: 'Physical Harm', description: 'Observed association with physical incidents or threats' },
        economic: { score: (score as any).economic, label: 'Economic Harm', description: 'Observed association with economic discrimination reports' },
        mentalHealth: { score: (score as any).mental_health, label: 'Mental Health Harm', description: 'Observed association with reported psychological impact' },
        reputation: { score: (score as any).reputation, label: 'Reputation Harm', description: 'Observed association with reputational damage reports' },
        policy: { score: (score as any).policy, label: 'Policy Harm', description: 'Observed association with discriminatory policy discussions' },
        community: { score: (score as any).community, label: 'Community Harm', description: 'Observed association with community cohesion impact' },
      },
    };
  }
}
