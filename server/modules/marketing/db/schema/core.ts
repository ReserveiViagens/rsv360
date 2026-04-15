import {
  pgTable,
  pgEnum,
  uuid,
  text,
  real,
  integer,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

export const campaignTypeEnum = pgEnum('campaign_type', [
  'paid_ads',
  'social',
  'email',
  'whatsapp',
  'organic',
  'referral',
]);

export const campaignPlatformEnum = pgEnum('campaign_platform', [
  'meta',
  'google',
  'tiktok',
  'email',
  'whatsapp',
  'organic',
]);

export const campaignStatusEnum = pgEnum('campaign_status', [
  'draft',
  'active',
  'paused',
  'completed',
  'archived',
]);

export const leadStageEnum = pgEnum('lead_stage', [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost',
]);

export const creativeTypeEnum = pgEnum('creative_type', [
  'image',
  'video',
  'text',
  'html',
]);

export const marketingCampaigns = pgTable(
  'marketing_campaigns',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    type: campaignTypeEnum('type').notNull(),
    platform: campaignPlatformEnum('platform').notNull(),
    status: campaignStatusEnum('status').default('draft').notNull(),
    budget: real('budget').default(0),
    description: text('description'),
    targetAudience: text('target_audience'),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('idx_campaigns_status').on(table.status)]
);

export const marketingLeads = pgTable(
  'marketing_leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    source: text('source'),
    stage: leadStageEnum('stage').default('new').notNull(),
    score: integer('score').default(0),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_leads_stage').on(table.stage),
    index('idx_leads_email').on(table.email),
  ]
);

export const marketingCreatives = pgTable('marketing_creatives', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => marketingCampaigns.id),
  name: text('name').notNull(),
  type: creativeTypeEnum('type').notNull(),
  content: text('content'),
  fileUrl: text('file_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const marketingPixelEvents = pgTable(
  'marketing_pixel_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: text('session_id').notNull(),
    visitorId: text('visitor_id'),
    event: text('event').notNull(),
    page: text('page'),
    referrer: text('referrer'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmContent: text('utm_content'),
    utmTerm: text('utm_term'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_pixel_session').on(table.sessionId),
    index('idx_pixel_visitor').on(table.visitorId),
    index('idx_pixel_created').on(table.createdAt),
  ]
);
