import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';

@ApiTags('Harm Correlation')
@Controller('correlation')
export class CorrelationController {
  constructor(private db: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all correlations' })
  findAll() {
    const sqlite = this.db.getDatabase();
    const correlations = sqlite.prepare(`
      SELECT c.id, c.narrative_id, c.correlation_score, c.p_value, c.significant, c.sample_size, c.methodology,
        c.ci_low as confidence_lower, c.ci_high as confidence_upper, c.incident_category as incident_type,
        n.title as narrative_title, n.category as narrative_category
      FROM correlations c
      LEFT JOIN narratives n ON c.narrative_id = n.id
      ORDER BY c.correlation_score DESC
    `).all();
    return {
      correlations,
      disclaimer: 'Correlation does not imply causation. These scores represent statistical associations between narrative volume and incident reports, not causal relationships.',
      methodology: 'Pearson correlation coefficients computed between 30-day rolling windows of narrative mention volume and categorized incident report counts.',
    };
  }

  @Get(':narrativeId')
  @ApiOperation({ summary: 'Get correlations for a specific narrative' })
  findByNarrative(@Param('narrativeId') narrativeId: string) {
    const sqlite = this.db.getDatabase();
    const correlations = sqlite.prepare(`
      SELECT c.id, c.narrative_id, c.correlation_score, c.p_value, c.significant, c.sample_size, c.methodology,
        c.ci_low as confidence_lower, c.ci_high as confidence_upper, c.incident_category as incident_type,
        n.title as narrative_title
      FROM correlations c
      LEFT JOIN narratives n ON c.narrative_id = n.id
      WHERE c.narrative_id = ?
      ORDER BY c.correlation_score DESC
    `).all(narrativeId);
    return {
      narrativeId,
      correlations,
      disclaimer: 'These correlations represent observed statistical associations. They do not establish that narrative volume causes incidents or vice versa.',
      interpretation: {
        strong: '|r| >= 0.7 — Strong association observed',
        moderate: '0.4 <= |r| < 0.7 — Moderate association observed',
        weak: '|r| < 0.4 — Weak or no significant association',
      },
    };
  }
}
