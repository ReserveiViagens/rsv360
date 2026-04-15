import { pgTable, pgEnum, uuid, text, varchar, integer, real, boolean, jsonb, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Enums
export const pricingStrategyEnum = pgEnum('pricing_strategy', [
  'manual',
  'dynamic',
  'competitor_based',
  'seasonal',
  'demand_based',
  'ai_optimized'
]);

export const pricingSeasonTypeEnum = pgEnum('pricing_season_type', [
  'high',
  'medium',
  'low',
  'blackout',
  'promotional'
]);

export const pricingAdjustmentTypeEnum = pgEnum('pricing_adjustment_type', [
  'percentage',
  'fixed',
  'override'
]);

export const pricingAlertSeverityEnum = pgEnum('pricing_alert_severity', [
  'info',
  'warning',
  'critical'
]);

export const pricingAlertStatusEnum = pgEnum('pricing_alert_status', [
  'active',
  'acknowledged',
  'resolved',
  'dismissed'
]);

// Tables
export const pricingRules = pgTable('pricing_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  accommodationId: uuid('accommodation_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  strategy: pricingStrategyEnum('strategy').notNull().default('manual'),
  basePrice: real('base_price').notNull(),
  minPrice: real('min_price').notNull(),
  maxPrice: real('max_price').notNull(),
  currency: varchar('currency', { length: 10 }).default('BRL'),
  occupancyThresholds: jsonb('occupancy_thresholds'),
  demandMultipliers: jsonb('demand_multipliers'),
  leadTimeRules: jsonb('lead_time_rules'),
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  accommodationActiveIdx: index('pricing_rules_accommodation_active_idx').on(table.accommodationId, table.isActive),
}));

export const pricingSeasons = pgTable('pricing_seasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  type: pricingSeasonTypeEnum('type').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  priceMultiplier: real('price_multiplier').notNull().default(1.0),
  fixedAdjustment: real('fixed_adjustment').default(0),
  appliesToAccommodations: jsonb('applies_to_accommodations'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  dateRangeIdx: index('pricing_seasons_date_range_idx').on(table.startDate, table.endDate),
  typeActiveIdx: index('pricing_seasons_type_active_idx').on(table.type, table.isActive),
}));

export const pricingAdjustments = pgTable('pricing_adjustments', {
  id: uuid('id').primaryKey().defaultRandom(),
  ruleId: uuid('rule_id').references(() => pricingRules.id),
  accommodationId: uuid('accommodation_id').notNull(),
  type: pricingAdjustmentTypeEnum('type').notNull(),
  reason: varchar('reason', { length: 300 }).notNull(),
  originalPrice: real('original_price').notNull(),
  adjustedPrice: real('adjusted_price').notNull(),
  adjustmentValue: real('adjustment_value').notNull(),
  appliedAt: timestamp('applied_at').notNull().defaultNow(),
  appliedBy: varchar('applied_by', { length: 100 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  accommodationAppliedIdx: index('pricing_adjustments_accommodation_applied_idx').on(table.accommodationId, table.appliedAt),
}));

export const pricingHistory = pgTable('pricing_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  accommodationId: uuid('accommodation_id').notNull(),
  date: timestamp('date').notNull(),
  price: real('price').notNull(),
  basePrice: real('base_price').notNull(),
  strategy: varchar('strategy', { length: 50 }),
  occupancyRate: real('occupancy_rate'),
  demandScore: real('demand_score'),
  competitorAvgPrice: real('competitor_avg_price'),
  seasonId: uuid('season_id').references(() => pricingSeasons.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  accommodationDateIdx: index('pricing_history_accommodation_date_idx').on(table.accommodationId, table.date),
  uniqueAccommodationDate: uniqueIndex('pricing_history_accommodation_date_unique').on(table.accommodationId, table.date),
}));