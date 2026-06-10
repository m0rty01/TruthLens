import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ─── Users & Auth ───
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'moderator', 'researcher', 'user'] }).notNull().default('user'),
  createdAt: text('created_at').notNull(),
});

// ─── Narratives ───
export const narratives = sqliteTable('narratives', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  trendScore: integer('trend_score').notNull(),
  trendDirection: text('trend_direction').notNull(),
  trendVelocity: integer('trend_velocity').notNull(),
  firstSeen: text('first_seen').notNull(),
  lastUpdated: text('last_updated').notNull(),
  totalMentions: integer('total_mentions').notNull(),
  tags: text('tags'), // JSON array
  lifecycleStage: text('lifecycle_stage', { enum: ['emergence', 'growth', 'amplification', 'mainstream', 'decline', 'resurgence'] }),
  harmScore: integer('harm_score').default(0),
});

// ─── Claims ───
export const claims = sqliteTable('claims', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  classification: text('classification').notNull(),
  confidenceScore: integer('confidence_score').notNull(),
  context: text('context'),
  narrativeId: text('narrative_id').references(() => narratives.id),
  originPlatform: text('origin_platform'),
  firstSeen: text('first_seen'),
  lastUpdated: text('last_updated'),
  timesChecked: integer('times_checked').default(0),
  exaggerationIndex: integer('exaggeration_index'),
});

// ─── Incidents ───
export const incidents = sqliteTable('incidents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  country: text('country').notNull(),
  city: text('city'),
  severity: text('severity', { enum: ['Low', 'Medium', 'High', 'Critical'] }).default('Medium'),
  reportedAt: text('reported_at').notNull(),
  reportedBy: text('reported_by').notNull(),
  status: text('status', { enum: ['pending', 'reviewed', 'verified', 'dismissed', 'appealed'] }).default('pending'),
  evidence: text('evidence'), // JSON array of base64/URL strings
  narrativeIds: text('narrative_ids'), // JSON array
  verificationNotes: text('verification_notes'),
  appealedAt: text('appealed_at'),
  appealReason: text('appeal_reason'),
});

// ─── Harm Scores ───
export const harmScores = sqliteTable('harm_scores', {
  id: text('id').primaryKey(),
  narrativeId: text('narrative_id').references(() => narratives.id),
  physical: integer('physical').notNull().default(0),
  economic: integer('economic').notNull().default(0),
  mentalHealth: integer('mental_health').notNull().default(0),
  reputation: integer('reputation').notNull().default(0),
  policy: integer('policy').notNull().default(0),
  community: integer('community').notNull().default(0),
  overallIndex: integer('overall_index').notNull().default(0),
  confidence: integer('confidence').notNull().default(0),
  methodology: text('methodology'),
  updatedAt: text('updated_at').notNull(),
});

// ─── Early Warning Alerts ───
export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['acceleration', 'sentiment_spike', 'amplification_anomaly', 'risk_forecast'] }).notNull(),
  level: text('level', { enum: ['Low', 'Medium', 'High', 'Critical'] }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  narrativeId: text('narrative_id'),
  metric: text('metric'),
  metricValue: real('metric_value'),
  status: text('status', { enum: ['active', 'acknowledged', 'resolved'] }).default('active'),
  createdAt: text('created_at').notNull(),
});

// ─── Correlations ───
export const correlations = sqliteTable('correlations', {
  id: text('id').primaryKey(),
  narrativeId: text('narrative_id').references(() => narratives.id),
  incidentCategory: text('incident_category'),
  correlationScore: real('correlation_score').notNull(),
  confidenceIntervalLow: real('ci_low').notNull(),
  confidenceIntervalHigh: real('ci_high').notNull(),
  pValue: real('p_value').notNull(),
  significant: integer('significant', { mode: 'boolean' }).notNull(),
  sampleSize: integer('sample_size').notNull(),
  methodology: text('methodology'),
  updatedAt: text('updated_at').notNull(),
});

// ─── Resilience Scores ───
export const resilienceScores = sqliteTable('resilience_scores', {
  id: text('id').primaryKey(),
  country: text('country').notNull(),
  city: text('city'),
  participation: integer('participation').notNull().default(0),
  positiveEngagement: integer('positive_engagement').notNull().default(0),
  supportNetworks: integer('support_networks').notNull().default(0),
  reportingBehavior: integer('reporting_behavior').notNull().default(0),
  sentimentStability: integer('sentiment_stability').notNull().default(0),
  overallScore: integer('overall_score').notNull().default(0),
  trend: text('trend', { enum: ['improving', 'stable', 'declining'] }).default('stable'),
  updatedAt: text('updated_at').notNull(),
});

// ─── Audit Logs ───
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  userId: text('user_id'),
  details: text('details'), // JSON
  createdAt: text('created_at').notNull(),
});
