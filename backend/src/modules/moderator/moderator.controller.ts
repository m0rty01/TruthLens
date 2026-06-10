import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';

@ApiTags('Moderator')
@Controller('moderator')
export class ModeratorController {
  constructor(private db: DatabaseService) {}

  @Get('queue')
  @ApiOperation({ summary: 'Get pending review queue' })
  getQueue() {
    const sqlite = this.db.getDatabase();
    const pending = sqlite.prepare("SELECT * FROM incidents WHERE status = 'pending' ORDER BY reported_at DESC").all();
    const appealed = sqlite.prepare("SELECT * FROM incidents WHERE status = 'appealed' ORDER BY appealed_at DESC").all();
    return { pending, appealed, totalPending: (pending as any[]).length, totalAppealed: (appealed as any[]).length };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get moderator statistics' })
  getStats() {
    const sqlite = this.db.getDatabase();
    const total = (sqlite.prepare('SELECT COUNT(*) as c FROM incidents').get() as any).c;
    const verified = (sqlite.prepare("SELECT COUNT(*) as c FROM incidents WHERE status = 'verified'").get() as any).c;
    const dismissed = (sqlite.prepare("SELECT COUNT(*) as c FROM incidents WHERE status = 'dismissed'").get() as any).c;
    const pending = (sqlite.prepare("SELECT COUNT(*) as c FROM incidents WHERE status = 'pending'").get() as any).c;
    const appealed = (sqlite.prepare("SELECT COUNT(*) as c FROM incidents WHERE status = 'appealed'").get() as any).c;
    const reviewed = (sqlite.prepare("SELECT COUNT(*) as c FROM incidents WHERE status = 'reviewed'").get() as any).c;
    const actions = (sqlite.prepare('SELECT COUNT(*) as c FROM audit_logs').get() as any).c;
    return { total, verified, dismissed, pending, appealed, reviewed, moderatorActions: actions };
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get audit trail' })
  getAuditLog() {
    const sqlite = this.db.getDatabase();
    return sqlite.prepare(`
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `).all();
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify an incident report' })
  verify(@Param('id') id: string, @Body() body: { reason?: string; userId?: string }) {
    const sqlite = this.db.getDatabase();
    sqlite.prepare("UPDATE incidents SET status = 'verified', verification_notes = ? WHERE id = ?").run(body.reason || 'Verified by moderator', id);
    const logId = `aud-${Date.now()}`;
    sqlite.prepare('INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(logId, 'verify', 'incident', id, body.userId || 'usr-mod1', JSON.stringify({ reason: body.reason }), new Date().toISOString());
    return { status: 'verified', id, logId };
  }

  @Post(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss an incident report' })
  dismiss(@Param('id') id: string, @Body() body: { reason?: string; userId?: string }) {
    const sqlite = this.db.getDatabase();
    sqlite.prepare("UPDATE incidents SET status = 'dismissed', verification_notes = ? WHERE id = ?").run(body.reason || 'Dismissed by moderator', id);
    const logId = `aud-${Date.now()}`;
    sqlite.prepare('INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(logId, 'dismiss', 'incident', id, body.userId || 'usr-mod1', JSON.stringify({ reason: body.reason }), new Date().toISOString());
    return { status: 'dismissed', id, logId };
  }
}
