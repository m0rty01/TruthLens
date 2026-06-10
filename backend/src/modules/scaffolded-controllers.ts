import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MockDataService } from '../mock-data/mock-data.service';
import { DatabaseService } from '../database/database.service';

@ApiTags('Exaggeration') @Controller('exaggeration')
export class ExaggerationController {
  constructor(private readonly mockData: MockDataService) {}
  @Get(':claimId') @ApiOperation({ summary: 'Get exaggeration index for claim' }) findOne(@Param('claimId') claimId: string) { return this.mockData.getExaggeration(claimId); }
}

@ApiTags('AI Detection') @Controller('ai-detection')
export class AIDetectionController {
  @Get('analyze') @ApiOperation({ summary: 'Analyze content for AI manipulation' }) analyze() { return { status: 'ready', message: 'Submit content URL or file for analysis' }; }
}

@ApiTags('Narrative Origin') @Controller('origin')
export class OriginController {
  constructor(private readonly mockData: MockDataService) {}
  @Get(':narrativeId') @ApiOperation({ summary: 'Get narrative origin timeline' }) findOne(@Param('narrativeId') narrativeId: string) { const n = this.mockData.getNarrativeById(narrativeId); return { narrativeId, firstSeen: n?.firstSeen, originPlatform: 'Reddit', timeline: [], evolution: [] }; }
}

@ApiTags('Amplification Networks') @Controller('networks')
export class NetworksController {
  @Get(':narrativeId') @ApiOperation({ summary: 'Get amplification network' }) findOne(@Param('narrativeId') narrativeId: string) { return { narrativeId, nodes: [], edges: [], clusters: [], message: 'Network graph data' }; }
}

@ApiTags('Actor Attribution') @Controller('attribution')
export class AttributionController {
  constructor(private readonly mockData: MockDataService) {}
  @Get(':narrativeId') @ApiOperation({ summary: 'Get actor attribution' }) findOne(@Param('narrativeId') narrativeId: string) { return this.mockData.getAttribution(narrativeId); }
}

@ApiTags('Bot Detection') @Controller('bot-detection')
export class BotDetectionController {
  constructor(private readonly mockData: MockDataService) {}
  @Get(':accountId') @ApiOperation({ summary: 'Detect bot for account' }) findOne(@Param('accountId') accountId: string) { return this.mockData.getBotDetection(accountId); }
}

@ApiTags('Community Reports') @Controller('report')
export class CommunityReportController {
  constructor(private readonly mockData: MockDataService, private db: DatabaseService) {}
  @Get() @ApiOperation({ summary: 'List community reports' })
  findAll() {
    const sqlite = this.db.getDatabase();
    return sqlite.prepare('SELECT * FROM incidents ORDER BY reported_at DESC').all();
  }
  @Post() @ApiOperation({ summary: 'Submit community report' })
  create(@Body() body: any) {
    const sqlite = this.db.getDatabase();
    const id = `inc-${Date.now()}`;
    sqlite.prepare('INSERT INTO incidents (id, title, category, country, city, severity, reported_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, body.title || 'Untitled', body.category || 'Other', body.country || '', body.city || '', 'low', new Date().toISOString().split('T')[0], 'pending'
    );
    return { status: 'submitted', id };
  }
  @Post(':id/verify') @ApiOperation({ summary: 'Verify a report' })
  verify(@Param('id') id: string, @Body() body: { reason?: string }) {
    const sqlite = this.db.getDatabase();
    sqlite.prepare("UPDATE incidents SET status = 'verified', verification_notes = ? WHERE id = ?").run(body.reason || 'Verified', id);
    return { status: 'verified', id };
  }
  @Post(':id/dismiss') @ApiOperation({ summary: 'Dismiss a report' })
  dismiss(@Param('id') id: string, @Body() body: { reason?: string }) {
    const sqlite = this.db.getDatabase();
    sqlite.prepare("UPDATE incidents SET status = 'dismissed', verification_notes = ? WHERE id = ?").run(body.reason || 'Dismissed', id);
    return { status: 'dismissed', id };
  }
  @Post(':id/appeal') @ApiOperation({ summary: 'Appeal a dismissed report' })
  appeal(@Param('id') id: string, @Body() body: { reason: string }) {
    const sqlite = this.db.getDatabase();
    sqlite.prepare("UPDATE incidents SET status = 'appealed', appealed_at = ?, appeal_reason = ? WHERE id = ?").run(new Date().toISOString(), body.reason, id);
    return { status: 'appealed', id };
  }
  @Post(':id/evidence') @ApiOperation({ summary: 'Add evidence to report' })
  addEvidence(@Param('id') id: string, @Body() body: { type: string; description: string }) {
    return { status: 'evidence_added', id, evidence: body };
  }
}

@ApiTags('Incidents') @Controller('incidents')
export class IncidentsController {
  constructor(private readonly mockData: MockDataService) {}
  @Get() @ApiOperation({ summary: 'Get incident heatmap data' }) findAll() { return this.mockData.getIncidents(); }
}

@ApiTags('Harassment Toolkit') @Controller('harassment-toolkit')
export class HarassmentToolkitController {
  @Get() @ApiOperation({ summary: 'Get harassment toolkit resources' }) findAll() { return { guides: [{ category: 'documentation', title: 'How to Document Incidents' }, { category: 'reporting', title: 'Reporting to Platforms' }, { category: 'privacy', title: 'Privacy Protection Guide' }, { category: 'doxxing_prevention', title: 'Anti-Doxxing Guide' }, { category: 'evidence_collection', title: 'Evidence for Legal Proceedings' }] }; }
}

@ApiTags('Community Toolkit') @Controller('community-toolkit')
export class CommunityToolkitController {
  @Get() @ApiOperation({ summary: 'Get community toolkit resources' }) findAll() { return { resources: [{ type: 'Student Groups', templates: 8 }, { type: 'Temples', templates: 5 }, { type: 'Cultural Organizations', templates: 6 }, { type: 'NGOs', templates: 4 }] }; }
}

@ApiTags('Educational KB') @Controller('learn')
export class LearnController {
  @Get() @ApiOperation({ summary: 'Get educational topics' }) findAll() { return { topics: [{ title: 'Immigration', articles: 12 }, { title: 'Housing Economics', articles: 8 }, { title: 'Media Literacy', articles: 9 }, { title: 'Misinformation Tactics', articles: 11 }] }; }
}

@ApiTags('Contributions') @Controller('contributions')
export class ContributionsController {
  @Get() @ApiOperation({ summary: 'Get positive contributions' }) findAll() { return { contributions: [{ name: 'Sundar Pichai', field: 'Technology' }, { name: 'Satya Nadella', field: 'Technology' }, { name: 'Dr. Soumya Swaminathan', field: 'Health' }] }; }
}

@ApiTags('Myths') @Controller('myths')
export class MythsController {
  @Get() @ApiOperation({ summary: 'Get myth vs reality entries' }) findAll() { return { myths: [{ myth: 'Indian students caused housing crisis', reality: 'Students represent ~4% of rental demand', sources: ['CMHC', 'Statistics Canada'] }] }; }
}

@ApiTags('Economic Impact') @Controller('economic-impact')
export class EconomicImpactController {
  @Get() @ApiOperation({ summary: 'Get economic impact data' }) findAll() { return { metrics: { businessesFounded: 45000, jobsCreated: 2100000, taxContributions: 89000000000, patents: 12400 } }; }
}

@ApiTags('Forecast') @Controller('forecast')
export class ForecastController {
  @Get() @ApiOperation({ summary: 'Get narrative forecasts' }) findAll() { return { forecasts: [{ title: 'Housing Crisis Narrative', predictedGrowth: 25, confidence: 78, timeframe: '30 days' }] }; }
}

@ApiTags('Personal Advisor') @Controller('advisor')
export class AdvisorController {
  constructor(private readonly mockData: MockDataService) {}
  @Post() @ApiOperation({ summary: 'Get personalized advice' }) advise(@Body() body: { situation: string }) { return this.mockData.advisorSubmit(body.situation); }
}
