import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';

@ApiTags('Community Resilience')
@Controller('resilience')
export class ResilienceController {
  constructor(private db: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all resilience scores' })
  async findAll() {
    return this.db.query('SELECT * FROM resilience_scores ORDER BY overall_score DESC');
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get resilience trend analysis' })
  async getTrends() {
    const scores = await this.db.query('SELECT * FROM resilience_scores WHERE city IS NULL');
    const improving = scores.filter((s) => s.trend === 'improving').length;
    const declining = scores.filter((s) => s.trend === 'declining').length;
    const stable = scores.filter((s) => s.trend === 'stable').length;
    const avgScore = Math.round(scores.reduce((s, r) => s + r.overall_score, 0) / (scores.length || 1));
    return {
      averageScore: avgScore,
      trendDistribution: { improving, stable, declining },
      totalRegions: scores.length,
      methodology: 'Resilience scores are composite metrics derived from community participation rates, positive engagement metrics, support network strength, reporting behavior, and sentiment stability analysis.',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  }

  @Get(':country')
  @ApiOperation({ summary: 'Get resilience scores for a specific country' })
  async findByCountry(@Param('country') country: string) {
    const countryScore = await this.db.queryOne('SELECT * FROM resilience_scores WHERE country = ? AND city IS NULL', [country]);
    const cityScores = await this.db.query('SELECT * FROM resilience_scores WHERE country = ? AND city IS NOT NULL ORDER BY overall_score DESC', [country]);
    return {
      country: countryScore,
      cities: cityScores,
      methodology: 'Resilience Index measures community capacity to respond to harmful narratives through participation, engagement, support networks, reporting behavior, and sentiment stability.',
    };
  }
}
