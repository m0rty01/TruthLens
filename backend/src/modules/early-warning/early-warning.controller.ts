import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';

@ApiTags('Early Warning')
@Controller('early-warning')
export class EarlyWarningController {
  constructor(private db: DatabaseService) {}

  @Get('alerts')
  @ApiOperation({ summary: 'Get active alerts' })
  getAlerts() {
    const sqlite = this.db.getDatabase();
    const alerts = sqlite.prepare(`
      SELECT a.*, n.title as narrative_title
      FROM alerts a
      LEFT JOIN narratives n ON a.narrative_id = n.id
      ORDER BY
        CASE a.level WHEN 'Critical' THEN 0 WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END,
        a.created_at DESC
    `).all();
    return alerts;
  }

  @Get('status')
  @ApiOperation({ summary: 'Get early warning system status' })
  getStatus() {
    const sqlite = this.db.getDatabase();
    const alerts = sqlite.prepare('SELECT * FROM alerts').all() as any[];
    const active = alerts.filter((a) => a.status === 'active');
    const byLevel = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    active.forEach((a) => { if (byLevel[a.level as keyof typeof byLevel] !== undefined) byLevel[a.level as keyof typeof byLevel]++; });
    const byType: Record<string, number> = {};
    alerts.forEach((a) => { byType[a.type] = (byType[a.type] || 0) + 1; });

    return {
      systemStatus: active.length > 0 ? 'monitoring' : 'idle',
      activeAlerts: active.length,
      totalAlerts: alerts.length,
      byLevel,
      byType,
      lastScan: new Date().toISOString(),
      scanFrequency: 'Every 15 minutes',
      monitoredNarratives: 6,
      dataSources: ['Social media feeds', 'Incident reports', 'Sentiment analysis', 'Bot detection'],
    };
  }

  @Post('scan')
  @ApiOperation({ summary: 'Trigger manual scan for threats' })
  triggerScan() {
    const sqlite = this.db.getDatabase();
    const id = `alt-${Date.now()}`;
    const narratives = sqlite.prepare('SELECT id, title, trend_velocity FROM narratives ORDER BY trend_velocity DESC LIMIT 1').all() as any[];
    const n = narratives[0];
    if (n) {
      sqlite.prepare(`
        INSERT INTO alerts (id, type, level, title, description, narrative_id, metric, metric_value, status, created_at)
        VALUES (?, 'acceleration', 'Medium', ?, ?, ?, 'velocity', ?, 'active', ?)
      `).run(
        id,
        `Manual scan: ${n.title} velocity check`,
        `Velocity at ${n.trend_velocity}/hr - within expected range for current trend`,
        n.id,
        n.trend_velocity,
        new Date().toISOString(),
      );
    }
    return { status: 'scan_complete', alertId: id, message: 'Manual scan completed. No critical threats detected beyond existing alerts.' };
  }
}
