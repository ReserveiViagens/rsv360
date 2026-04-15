import { pgTable, pgEnum, uuid, text, varchar, integer, real, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { pricingAlertSeverityEnum, pricingAlertStatusEnum } from './core';

// Enums
export const otaPlatformEnum = pgEnum('ota_platform', [
  'booking',
  'expedia',
  'airbnb',
  'decolar',
  'hotels_com',
  'trivago',
  'kayak',
  'google_hotels',
  'direct'
]);

export const scrapeStatusEnum = pgEnum('scrape_status', [
  'pending',
  'running',
  'completed',
  'failed',
  'rate_limited'
]);

// Tables
export const pricingCompetitors = pgTable('pricing_competitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  accommodationId: uuid('accommodation_id').notNull(),
  competitorName: varchar('competitor_name', { length: 300 }).notNull(),
  platform: otaPlatformEnum('platform').notNull(),
  externalUrl: text('external_url'),
  externalId: varchar('external_id', { length: 200 }),
  location: varchar('location', { length: 300 }),
  starRating: real('star_rating'),
  isActive: boolean('is_active').default(true),
  lastScrapedAt: timestamp('last_scraped_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  accommodationPlatformIdx: index('pricing_competitors_accommodation_platform_idx').on(table.accommodationId, table.platform),
}));

export const pricingOtaRates = pgTable('pricing_ota_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  competitorId: uuid('competitor_id').references(() => pricingCompetitors.id).notNull(),
  platform: otaPlatformEnum('platform').notNull(),
  checkInDate: timestamp('check_in_date').notNull(),
  checkOutDate: timestamp('check_out_date').notNull(),
  roomType: varchar('room_type', { length: 200 }),
  price: real('price').notNull(),
  originalPrice: real('original_price'),
  currency: varchar('currency', { length: 10 }).default('BRL'),
  availability: boolean('availability').default(true),
  occupancyEstimate: real('occupancy_estimate'),
  scrapeStatus: scrapeStatusEnum('scrape_status').default('completed'),
  scrapedAt: timestamp('scraped_at').notNull().defaultNow(),
  source: varchar('source', { length: 100 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  competitorDateIdx: index('pricing_ota_rates_competitor_date_idx').on(table.competitorId, table.checkInDate),
  platformScrapedIdx: index('pricing_ota_rates_platform_scraped_idx').on(table.platform, table.scrapedAt),
}));

export const pricingAlerts = pgTable('pricing_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  accommodationId: uuid('accommodation_id').notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  severity: pricingAlertSeverityEnum('severity').notNull().default('info'),
  status: pricingAlertStatusEnum('status').notNull().default('active'),
  title: varchar('title', { length: 300 }).notNull(),
  message: text('message').notNull(),
  data: jsonb('data'),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: varchar('resolved_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  accommodationStatusIdx: index('pricing_alerts_accommodation_status_idx').on(table.accommodationId, table.status),
  severityStatusIdx: index('pricing_alerts_severity_status_idx').on(table.severity, table.status),
}));