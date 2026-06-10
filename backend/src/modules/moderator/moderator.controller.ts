import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';

@ApiTags('Moderator')
@Controller('moderator')
export class ModeratorController {
  constructor(private db: DatabaseService) {}

  @Get('queue')
  @ApiOperation({ summary: 'Get pending review queue' })
  async getQueue() {
    const pending = await this.db.query("SELECT * FROM incidents WHERE status = 'pending' ORDER BY reported_at DESC");
    const appealed = await this.db.query("SELECT * FROM incidents WHERE status = 'appealed' ORDER BY appealed_at DESC");
    return { pending, appealed, totalPending: pending.length, totalAppealed: appealed.length };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get moderator statistics' })
  async getStats() {
    const total = (await this.db.queryOne('SELECT COUNT(*) as c FROM incidents'))?.c || 0;
    const verified = (await this.db.queryOne("SELECT COUNT(*) as c FROM incidents WHERE status = 'verified'"))?.c || 0;
    const dismissed = (await this.db.queryOne("SELECT COUNT(*) as c FROM incidents WHERE status = 'dismissed'"))?.c || 0;
    const pending = (await this.db.queryOne("SELECT COUNT(*) as c FROM incidents WHERE status = 'pending'"))?.c || 0;
    const appealed = (await this.db.queryOne("SELECT COUNT(*) as c FROM incidents WHERE status = 'appealed'"))?.c || 0;
    const reviewed = (await this.db.queryOne("SELECT COUNT(*) as c FROM incidents WHERE status = 'reviewed'"))?.c || 0;
    const actions = (await this.db.queryOne('SELECT COUNT(*) as c FROM audit_logs'))?.c || 0;
    return { total, verified, dismissed, pending, appealed, reviewed, moderatorActions: actions };
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get audit trail' })
  async getAuditLog() {
    return this.db.query(`
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify an incident report' })
  async verify(@Param('id') id: string, @Body() body: { reason?: string; userId?: string }) {
    await this.db.execute("UPDATE incidents SET status = 'verified', verification_notes = ? WHERE id = ?", [body.reason || 'Verified by moderator', id]);
    const logId = `aud-${Date.now()}`;
    await this.db.execute(
      'INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [logId, 'verify', 'incident', id, body.userId || 'usr-mod1', JSON.stringify({ reason: body.reason }), new Date().toISOString()]
    );
    return { status: 'verified', id, logId };
  }

  @Post(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss an incident report' })
  async dismiss(@Param('id') id: string, @Body() body: { reason?: string; userId?: string }) {
    await this.db.execute("UPDATE incidents SET status = 'dismissed', verification_notes = ? WHERE id = ?", [body.reason || 'Dismissed by moderator', id]);
    const logId = `aud-${Date.now()}`;
    await this.db.execute(
      'INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [logId, 'dismiss', 'incident', id, body.userId || 'usr-mod1', JSON.stringify({ reason: body.reason }), new Date().toISOString()]
    );
    return { status: 'dismissed', id, logId };
  }
}
