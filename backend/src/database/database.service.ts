import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, Client as LibsqlClient } from '@libsql/client';

export interface QueryResult {
  rows: any[];
  rowsAffected: number;
  lastInsertRowid?: bigint;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private client: LibsqlClient;
  private isRemote: boolean;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('DATABASE_URL', 'file:local.db');
    const authToken = this.config.get<string>('DATABASE_AUTH_TOKEN');

    this.isRemote = url.startsWith('libsql://') || url.startsWith('https://');

    this.client = createClient({
      url,
      authToken: authToken || undefined,
    });

    this.logger.log(`Database connected: ${this.isRemote ? 'remote (Turso)' : 'local (file)'}`);
  }

  async onModuleInit() {
    await this.createTables();
    await this.seedIfEmpty();
  }

  async execute(sql: string, args: any[] = []): Promise<QueryResult> {
    const result = await this.client.execute({ sql, args });
    return {
      rows: result.rows.map((row) => ({ ...row })),
      rowsAffected: result.rowsAffected,
      lastInsertRowid: result.lastInsertRowid,
    };
  }

  async query(sql: string, args: any[] = []): Promise<any[]> {
    const result = await this.client.execute({ sql, args });
    return result.rows.map((row) => ({ ...row }));
  }

  async queryOne(sql: string, args: any[] = []): Promise<any | null> {
    const rows = await this.query(sql, args);
    return rows.length > 0 ? rows[0] : null;
  }

  async batch(statements: { sql: string; args?: any[] }[]): Promise<void> {
    await this.client.batch(statements.map((s) => ({ sql: s.sql, args: s.args || [] })));
  }

  getClient(): LibsqlClient {
    return this.client;
  }

  private async createTables() {
    await this.client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
        password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user', created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS narratives (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
        trend_score INTEGER NOT NULL, trend_direction TEXT NOT NULL, trend_velocity INTEGER NOT NULL,
        first_seen TEXT NOT NULL, last_updated TEXT NOT NULL, total_mentions INTEGER NOT NULL,
        tags TEXT, lifecycle_stage TEXT, harm_score INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY, text TEXT NOT NULL, classification TEXT NOT NULL, confidence_score INTEGER NOT NULL,
        context TEXT, narrative_id TEXT, origin_platform TEXT, first_seen TEXT, last_updated TEXT,
        times_checked INTEGER DEFAULT 0, exaggeration_index INTEGER
      );
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, category TEXT NOT NULL,
        country TEXT NOT NULL, city TEXT, severity TEXT DEFAULT 'Medium', reported_at TEXT NOT NULL,
        reported_by TEXT NOT NULL, status TEXT DEFAULT 'pending', evidence TEXT, narrative_ids TEXT,
        verification_notes TEXT, appealed_at TEXT, appeal_reason TEXT
      );
      CREATE TABLE IF NOT EXISTS harm_scores (
        id TEXT PRIMARY KEY, narrative_id TEXT, physical INTEGER DEFAULT 0, economic INTEGER DEFAULT 0,
        mental_health INTEGER DEFAULT 0, reputation INTEGER DEFAULT 0, policy INTEGER DEFAULT 0,
        community INTEGER DEFAULT 0, overall_index INTEGER DEFAULT 0, confidence INTEGER DEFAULT 0,
        methodology TEXT, updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY, type TEXT NOT NULL, level TEXT NOT NULL, title TEXT NOT NULL,
        description TEXT NOT NULL, narrative_id TEXT, metric TEXT, metric_value REAL,
        status TEXT DEFAULT 'active', created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS correlations (
        id TEXT PRIMARY KEY, narrative_id TEXT, incident_category TEXT, correlation_score REAL NOT NULL,
        ci_low REAL NOT NULL, ci_high REAL NOT NULL, p_value REAL NOT NULL, significant INTEGER NOT NULL,
        sample_size INTEGER NOT NULL, methodology TEXT, updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS resilience_scores (
        id TEXT PRIMARY KEY, country TEXT NOT NULL, city TEXT, participation INTEGER DEFAULT 0,
        positive_engagement INTEGER DEFAULT 0, support_networks INTEGER DEFAULT 0,
        reporting_behavior INTEGER DEFAULT 0, sentiment_stability INTEGER DEFAULT 0,
        overall_score INTEGER DEFAULT 0, trend TEXT DEFAULT 'stable', updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
        user_id TEXT, details TEXT, created_at TEXT NOT NULL
      );
    `);
    this.logger.log('Database tables ensured');
  }

  private async seedIfEmpty() {
    const result = await this.queryOne('SELECT COUNT(*) as c FROM users');
    if (result && result.c > 0) return;
    this.logger.log('Seeding database from mock data...');

    // Seed users
    await this.batch([
      { sql: 'INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)', args: ['usr-admin', 'admin@truthlens.org', 'Admin User', '$2b$10$hash', 'admin', '2026-01-01'] },
      { sql: 'INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)', args: ['usr-mod1', 'mod@truthlens.org', 'Moderator One', '$2b$10$hash', 'moderator', '2026-01-15'] },
      { sql: 'INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)', args: ['usr-res1', 'researcher@university.edu', 'Dr. Researcher', '$2b$10$hash', 'researcher', '2026-02-01'] },
      { sql: 'INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)', args: ['usr-user1', 'user@example.com', 'Community User', '$2b$10$hash', 'user', '2026-03-01'] },
    ]);

    // Seed narratives
    await this.batch([
      { sql: 'INSERT INTO narratives (id, title, description, category, trend_score, trend_direction, trend_velocity, first_seen, last_updated, total_mentions, tags, lifecycle_stage, harm_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['narr-001', 'Indian Students Causing Housing Crisis', 'Narrative claiming Indian international students are the primary driver of housing affordability issues.', 'Housing', 87, 'spiking', 342, '2025-08-15', '2026-06-10', 120000, '["housing","students","canada"]', 'amplification', 78] },
      { sql: 'INSERT INTO narratives (id, title, description, category, trend_score, trend_direction, trend_velocity, first_seen, last_updated, total_mentions, tags, lifecycle_stage, harm_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['narr-002', 'Indian Immigrants Taking Jobs', 'Claims that Indian immigrants are systematically displacing local workers.', 'Jobs', 74, 'rising', 198, '2025-06-20', '2026-06-10', 95000, '["jobs","tech"]', 'growth', 65] },
      { sql: 'INSERT INTO narratives (id, title, description, category, trend_score, trend_direction, trend_velocity, first_seen, last_updated, total_mentions, tags, lifecycle_stage, harm_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['narr-003', 'Indian Scam Call Centers', 'Narrative associating Indian communities with scam operations.', 'Scams', 65, 'stable', 120, '2024-01-10', '2026-06-09', 93000, '["scams","fraud"]', 'mainstream', 72] },
      { sql: 'INSERT INTO narratives (id, title, description, category, trend_score, trend_direction, trend_velocity, first_seen, last_updated, total_mentions, tags, lifecycle_stage, harm_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['narr-004', 'Khalistan Separatism Support', 'Narratives around alleged diaspora support for Khalistan.', 'Khalistan', 58, 'falling', 85, '2024-03-15', '2026-06-08', 83000, '["khalistan"]', 'decline', 55] },
      { sql: 'INSERT INTO narratives (id, title, description, category, trend_score, trend_direction, trend_velocity, first_seen, last_updated, total_mentions, tags, lifecycle_stage, harm_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['narr-005', 'Indian Students Academic Fraud', 'Claims of widespread academic fraud by Indian students.', 'International Students', 71, 'rising', 156, '2025-09-01', '2026-06-10', 85000, '["students","fraud"]', 'growth', 62] },
      { sql: 'INSERT INTO narratives (id, title, description, category, trend_score, trend_direction, trend_velocity, first_seen, last_updated, total_mentions, tags, lifecycle_stage, harm_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['narr-006', 'Crime Rate Attributed to Indians', 'Exaggerated claims linking immigration to crime.', 'Crime', 62, 'rising', 134, '2025-04-12', '2026-06-10', 86000, '["crime"]', 'growth', 70] },
    ]);

    // Seed harm scores
    await this.batch([
      { sql: 'INSERT INTO harm_scores (id, narrative_id, physical, economic, mental_health, reputation, policy, community, overall_index, confidence, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['hs-001', 'narr-001', 35, 72, 68, 85, 62, 78, 78, 74, 'Composite index from incident reports, sentiment analysis, and media reach correlation', '2026-06-10'] },
      { sql: 'INSERT INTO harm_scores (id, narrative_id, physical, economic, mental_health, reputation, policy, community, overall_index, confidence, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['hs-002', 'narr-002', 20, 65, 55, 70, 45, 60, 65, 68, 'Composite index from incident reports, sentiment analysis, and media reach correlation', '2026-06-10'] },
      { sql: 'INSERT INTO harm_scores (id, narrative_id, physical, economic, mental_health, reputation, policy, community, overall_index, confidence, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['hs-003', 'narr-003', 15, 40, 45, 82, 30, 55, 72, 71, 'Composite index from incident reports, sentiment analysis, and media reach correlation', '2026-06-09'] },
      { sql: 'INSERT INTO harm_scores (id, narrative_id, physical, economic, mental_health, reputation, policy, community, overall_index, confidence, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['hs-004', 'narr-004', 25, 30, 35, 48, 55, 42, 55, 65, 'Composite index from incident reports, sentiment analysis, and media reach correlation', '2026-06-08'] },
      { sql: 'INSERT INTO harm_scores (id, narrative_id, physical, economic, mental_health, reputation, policy, community, overall_index, confidence, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['hs-005', 'narr-005', 10, 45, 60, 65, 38, 52, 62, 62, 'Composite index from incident reports, sentiment analysis, and media reach correlation', '2026-06-10'] },
      { sql: 'INSERT INTO harm_scores (id, narrative_id, physical, economic, mental_health, reputation, policy, community, overall_index, confidence, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['hs-006', 'narr-006', 42, 28, 52, 58, 35, 65, 70, 60, 'Composite index from incident reports, sentiment analysis, and media reach correlation', '2026-06-10'] },
    ]);

    // Seed alerts
    await this.batch([
      { sql: 'INSERT INTO alerts (id, type, level, title, description, narrative_id, metric, metric_value, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['alt-001', 'acceleration', 'Critical', 'Housing Narrative Accelerating', 'Narrative velocity increased 340% in 48 hours across X and Reddit', 'narr-001', 'velocity', 342, 'active', '2026-06-10T08:00:00Z'] },
      { sql: 'INSERT INTO alerts (id, type, level, title, description, narrative_id, metric, metric_value, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['alt-002', 'sentiment_spike', 'High', 'Negative Sentiment Spike Detected', 'Anti-immigrant sentiment on Reddit increased 85% in 24 hours', 'narr-002', 'sentiment_delta', 0.85, 'active', '2026-06-10T06:30:00Z'] },
      { sql: 'INSERT INTO alerts (id, type, level, title, description, narrative_id, metric, metric_value, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['alt-003', 'amplification_anomaly', 'Medium', 'Unusual Amplification Pattern', 'Coordinated bot-like activity detected amplifying scam narrative on X', 'narr-003', 'bot_percentage', 28.5, 'active', '2026-06-09T22:00:00Z'] },
      { sql: 'INSERT INTO alerts (id, type, level, title, description, narrative_id, metric, metric_value, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['alt-004', 'risk_forecast', 'High', 'Crime Narrative Predicted to Spike', 'ML model predicts 45% growth in crime narrative over next 7 days', 'narr-006', 'predicted_growth', 45, 'active', '2026-06-10T10:00:00Z'] },
      { sql: 'INSERT INTO alerts (id, type, level, title, description, narrative_id, metric, metric_value, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['alt-005', 'acceleration', 'Low', 'Academic Fraud Narrative Slow Rise', 'Steady 12% weekly growth detected across Reddit forums', 'narr-005', 'weekly_growth', 12, 'acknowledged', '2026-06-09T14:00:00Z'] },
    ]);

    // Seed correlations
    await this.batch([
      { sql: 'INSERT INTO correlations (id, narrative_id, incident_category, correlation_score, ci_low, ci_high, p_value, significant, sample_size, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['cor-001', 'narr-001', 'Housing', 0.73, 0.58, 0.84, 0.003, 1, 245, 'Pearson correlation between narrative mention volume and housing discrimination reports (30-day rolling window)', '2026-06-10'] },
      { sql: 'INSERT INTO correlations (id, narrative_id, incident_category, correlation_score, ci_low, ci_high, p_value, significant, sample_size, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['cor-002', 'narr-001', 'Public Harassment', 0.61, 0.42, 0.75, 0.012, 1, 189, 'Pearson correlation between narrative mention volume and harassment incident reports (30-day rolling window)', '2026-06-10'] },
      { sql: 'INSERT INTO correlations (id, narrative_id, incident_category, correlation_score, ci_low, ci_high, p_value, significant, sample_size, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['cor-003', 'narr-002', 'Workplace', 0.58, 0.38, 0.72, 0.021, 1, 156, 'Pearson correlation between job displacement narrative and workplace discrimination reports (30-day rolling window)', '2026-06-10'] },
      { sql: 'INSERT INTO correlations (id, narrative_id, incident_category, correlation_score, ci_low, ci_high, p_value, significant, sample_size, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['cor-004', 'narr-003', 'Online', 0.45, 0.22, 0.63, 0.078, 0, 134, 'Pearson correlation between scam narrative volume and online abuse reports (30-day rolling window)', '2026-06-09'] },
      { sql: 'INSERT INTO correlations (id, narrative_id, incident_category, correlation_score, ci_low, ci_high, p_value, significant, sample_size, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['cor-005', 'narr-006', 'Public Harassment', 0.68, 0.51, 0.80, 0.005, 1, 201, 'Pearson correlation between crime narrative and hate incident reports (30-day rolling window)', '2026-06-10'] },
      { sql: 'INSERT INTO correlations (id, narrative_id, incident_category, correlation_score, ci_low, ci_high, p_value, significant, sample_size, methodology, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['cor-006', 'narr-004', 'Online', 0.32, 0.08, 0.52, 0.145, 0, 98, 'Pearson correlation between Khalistan narrative and online harassment reports (30-day rolling window)', '2026-06-08'] },
    ]);

    // Seed resilience scores
    await this.batch([
      { sql: 'INSERT INTO resilience_scores (id, country, city, participation, positive_engagement, support_networks, reporting_behavior, sentiment_stability, overall_score, trend, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['res-001', 'Canada', null, 72, 68, 81, 65, 58, 69, 'improving', '2026-06-10'] },
      { sql: 'INSERT INTO resilience_scores (id, country, city, participation, positive_engagement, support_networks, reporting_behavior, sentiment_stability, overall_score, trend, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['res-002', 'Canada', 'Toronto', 78, 72, 85, 70, 62, 73, 'improving', '2026-06-10'] },
      { sql: 'INSERT INTO resilience_scores (id, country, city, participation, positive_engagement, support_networks, reporting_behavior, sentiment_stability, overall_score, trend, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['res-003', 'Canada', 'Brampton', 82, 75, 88, 72, 55, 74, 'stable', '2026-06-10'] },
      { sql: 'INSERT INTO resilience_scores (id, country, city, participation, positive_engagement, support_networks, reporting_behavior, sentiment_stability, overall_score, trend, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['res-004', 'Canada', 'Vancouver', 68, 65, 75, 60, 60, 66, 'stable', '2026-06-10'] },
      { sql: 'INSERT INTO resilience_scores (id, country, city, participation, positive_engagement, support_networks, reporting_behavior, sentiment_stability, overall_score, trend, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['res-005', 'United States', null, 65, 62, 70, 58, 52, 61, 'declining', '2026-06-10'] },
      { sql: 'INSERT INTO resilience_scores (id, country, city, participation, positive_engagement, support_networks, reporting_behavior, sentiment_stability, overall_score, trend, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['res-006', 'United States', 'San Jose', 70, 68, 72, 62, 55, 65, 'stable', '2026-06-10'] },
      { sql: 'INSERT INTO resilience_scores (id, country, city, participation, positive_engagement, support_networks, reporting_behavior, sentiment_stability, overall_score, trend, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['res-007', 'United Kingdom', null, 60, 55, 65, 52, 48, 56, 'declining', '2026-06-10'] },
      { sql: 'INSERT INTO resilience_scores (id, country, city, participation, positive_engagement, support_networks, reporting_behavior, sentiment_stability, overall_score, trend, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['res-008', 'United Kingdom', 'London', 65, 60, 70, 55, 50, 60, 'stable', '2026-06-10'] },
      { sql: 'INSERT INTO resilience_scores (id, country, city, participation, positive_engagement, support_networks, reporting_behavior, sentiment_stability, overall_score, trend, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['res-009', 'Australia', null, 58, 52, 62, 50, 45, 53, 'stable', '2026-06-10'] },
      { sql: 'INSERT INTO resilience_scores (id, country, city, participation, positive_engagement, support_networks, reporting_behavior, sentiment_stability, overall_score, trend, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['res-010', 'Australia', 'Melbourne', 62, 58, 68, 55, 48, 58, 'improving', '2026-06-10'] },
    ]);

    // Seed audit logs
    await this.batch([
      { sql: 'INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['aud-001', 'verify', 'incident', 'inc-002', 'usr-mod1', '{"reason":"Evidence verified with landlord communication records"}', '2026-06-07T14:30:00Z'] },
      { sql: 'INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['aud-002', 'review', 'incident', 'inc-001', 'usr-mod1', '{"reason":"Report reviewed, awaiting additional evidence"}', '2026-06-08T10:15:00Z'] },
      { sql: 'INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['aud-003', 'verify', 'incident', 'inc-004', 'usr-mod1', '{"reason":"Screenshots and platform reports confirmed"}', '2026-06-09T16:45:00Z'] },
      { sql: 'INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['aud-004', 'dismiss', 'incident', 'inc-old-001', 'usr-mod1', '{"reason":"Duplicate report, already tracked"}', '2026-06-06T09:00:00Z'] },
    ]);

    this.logger.log('Database seeded successfully');
  }
}
