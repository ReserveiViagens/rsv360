import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  smallint,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const ROTEIRO_ANALYTICS_EVENT_TYPES = [
  'hero_view',
  'section_view',
  'section_dwell',
  'scroll_depth',
  'carteira_open',
  'lazer_view',
] as const;

export const ROTEIRO_ANALYTICS_SECTIONS = ['hero', 'timeline', 'carteira', 'lazer'] as const;

export type RoteiroAnalyticsEventType = (typeof ROTEIRO_ANALYTICS_EVENT_TYPES)[number];
export type RoteiroAnalyticsSection = (typeof ROTEIRO_ANALYTICS_SECTIONS)[number];

export const roteiroAnalyticsEvents = pgTable(
  'roteiro_analytics_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    propostaToken: text('proposta_token').notNull(),
    sessionId: text('session_id').notNull(),
    eventType: varchar('event_type', { length: 50 }).notNull(),
    section: varchar('section', { length: 20 }),
    valueMs: integer('value_ms'),
    scrollPct: smallint('scroll_pct'),
    meta: jsonb('meta'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tokenCreatedIdx: index('idx_roteiro_analytics_token_created').on(t.propostaToken, t.createdAt),
    eventTypeIdx: index('idx_roteiro_analytics_event_type').on(t.eventType),
  }),
);

export type RoteiroAnalyticsEvent = typeof roteiroAnalyticsEvents.$inferSelect;
export type NewRoteiroAnalyticsEvent = typeof roteiroAnalyticsEvents.$inferInsert;
