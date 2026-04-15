import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const jobStatus = pgEnum('job_status', [
  'pending', 'active', 'completed', 'failed', 'delayed', 'paused', 'cancelled'
]);

export const jobPriority = pgEnum('job_priority', [
  'low', 'normal', 'high', 'critical'
]);

export const cloudJobs = pgTable('cloud_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  queueName: varchar('queue_name', { length: 255 }).notNull(),
  jobName: varchar('job_name', { length: 255 }).notNull(),
  status: jobStatus('status').notNull().default('pending'),
  priority: jobPriority('priority').notNull().default('normal'),
  payload: jsonb('payload'),
  result: jsonb('result'),
  error: text('error'),
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  progress: integer('progress').notNull().default(0), // 0-100
  scheduledAt: timestamp('scheduled_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  failedAt: timestamp('failed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const cloudCacheConfig = pgTable('cloud_cache_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 500 }).notNull().unique(),
  pattern: varchar('pattern', { length: 500 }), // 'pricing:*', 'ota:rates:*'
  ttl: integer('ttl').notNull().default(3600), // seconds
  maxSize: integer('max_size'), // max entries
  strategy: varchar('strategy', { length: 50 }).notNull().default('lru'), // 'lru', 'lfu', 'ttl'
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});