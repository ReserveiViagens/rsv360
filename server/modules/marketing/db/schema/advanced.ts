import { pgTable, pgEnum, uuid, text, varchar, integer, real, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

import { marketingCampaigns } from './core';

// Enum
export const mktAbTestStatusEnum = pgEnum('mkt_ab_test_status', ['draft', 'running', 'paused', 'completed', 'cancelled']);

// Tabelas
export const mktAbTests = pgTable('mkt_ab_tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(), // FK → enterprises.id (text por enquanto)
  campaignId: uuid('campaign_id').references(() => marketingCampaigns.id),
  name: varchar('name', { length: 200 }).notNull(),
  status: mktAbTestStatusEnum('status').default('draft'),
  variantA: jsonb('variant_a').notNull(),
  variantB: jsonb('variant_b').notNull(),
  splitPercentage: integer('split_percentage').default(50),
  winnerMetric: varchar('winner_metric', { length: 50 }),
  winnerVariant: varchar('winner_variant', { length: 1 }),
  results: jsonb('results'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_ab_tests_enterprise_status').on(table.enterpriseId, table.status),
]);

export const mktFunnels = pgTable('mkt_funnels', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  stages: jsonb('stages').notNull(),
  conversionRules: jsonb('conversion_rules'),
  isActive: boolean('is_active').default(true),
  totalLeads: integer('total_leads').default(0),
  conversionRate: real('conversion_rate').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_funnels_enterprise_active').on(table.enterpriseId, table.isActive),
]);

export const mktFunnelEntries = pgTable('mkt_funnel_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  funnelId: uuid('funnel_id').references(() => mktFunnels.id).notNull(),
  leadId: uuid('lead_id').notNull(),
  currentStageId: varchar('current_stage_id', { length: 100 }).notNull(),
  enteredAt: timestamp('entered_at').defaultNow().notNull(),
  convertedAt: timestamp('converted_at'),
  metadata: jsonb('metadata'),
}, (table) => [
  index('idx_funnel_entries_funnel_stage').on(table.funnelId, table.currentStageId),
]);

export const mktAttribution = pgTable('mkt_attribution', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(),
  leadId: uuid('lead_id').notNull(),
  campaignId: uuid('campaign_id').references(() => marketingCampaigns.id),
  channel: varchar('channel', { length: 100 }).notNull(),
  touchpoint: varchar('touchpoint', { length: 200 }),
  touchOrder: integer('touch_order').notNull(),
  attributionModel: varchar('attribution_model', { length: 50 }),
  attributionWeight: real('attribution_weight').default(1.0),
  revenue: real('revenue').default(0),
  occurredAt: timestamp('occurred_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_attribution_enterprise_lead').on(table.enterpriseId, table.leadId),
  index('idx_attribution_campaign').on(table.campaignId),
]);