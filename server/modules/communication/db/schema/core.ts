import { pgTable, pgEnum, uuid, text, varchar, integer, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

// Enums para comunicação
export const commChannelEnum = pgEnum('comm_channel', ['email', 'whatsapp', 'sms', 'push']);
export const commStatusEnum = pgEnum('comm_status', ['pending', 'sent', 'delivered', 'read', 'failed', 'cancelled']);
export const commPriorityEnum = pgEnum('comm_priority', ['low', 'normal', 'high', 'urgent']);
export const commTemplateTypeEnum = pgEnum('comm_template_type', ['email', 'whatsapp', 'sms', 'push']);
export const commProviderEnum = pgEnum('comm_provider', ['sendgrid', 'twilio', 'firebase', 'nodemailer', 'whatsapp_business', 'evolution_api']);

// Tabela principal de mensagens
export const commMessages = pgTable('comm_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(),
  leadId: uuid('lead_id'),
  channel: commChannelEnum('channel').notNull(),
  provider: commProviderEnum('provider').notNull(),
  direction: varchar('direction', { length: 20 }).notNull(), // 'inbound' | 'outbound'
  status: commStatusEnum('status').default('pending'),
  priority: commPriorityEnum('priority').default('normal'),
  subject: varchar('subject', { length: 300 }),
  content: text('content').notNull(),
  templateId: uuid('template_id'),
  metadata: jsonb('metadata'), // { attachments, variables, etc }
  externalId: varchar('external_id', { length: 200 }), // ID do provider
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  enterpriseStatusIdx: index('comm_messages_enterprise_status_idx').on(table.enterpriseId, table.status),
  enterpriseChannelIdx: index('comm_messages_enterprise_channel_idx').on(table.enterpriseId, table.channel),
  leadIdx: index('comm_messages_lead_idx').on(table.leadId),
}));

// Templates de mensagens
export const commTemplates = pgTable('comm_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  type: commTemplateTypeEnum('type').notNull(),
  channel: commChannelEnum('channel').notNull(),
  subject: varchar('subject', { length: 300 }),
  content: text('content').notNull(),
  variables: jsonb('variables'), // { name: type, ... }
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  enterpriseTypeIdx: index('comm_templates_enterprise_type_idx').on(table.enterpriseId, table.type),
  enterpriseActiveIdx: index('comm_templates_enterprise_active_idx').on(table.enterpriseId, table.isActive),
}));

// Conversas unificadas (inbox)
export const commConversations = pgTable('comm_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(),
  leadId: uuid('lead_id').notNull(),
  channel: commChannelEnum('channel').notNull(),
  externalId: varchar('external_id', { length: 200 }), // WhatsApp ID, email thread, etc
  lastMessageAt: timestamp('last_message_at'),
  isActive: boolean('is_active').default(true),
  assignedTo: uuid('assigned_to'), // user ID
  tags: jsonb('tags'), // array of strings
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  enterpriseLeadIdx: index('comm_conversations_enterprise_lead_idx').on(table.enterpriseId, table.leadId),
  enterpriseActiveIdx: index('comm_conversations_enterprise_active_idx').on(table.enterpriseId, table.isActive),
  assignedIdx: index('comm_conversations_assigned_idx').on(table.assignedTo),
}));

// Configurações de providers
export const commProviderConfigs = pgTable('comm_provider_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(),
  provider: commProviderEnum('provider').notNull(),
  channel: commChannelEnum('channel').notNull(),
  config: jsonb('config').notNull(), // { apiKey, accountSid, etc }
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(1), // para fallback
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  enterpriseProviderIdx: index('comm_provider_configs_enterprise_provider_idx').on(table.enterpriseId, table.provider),
  enterpriseActiveIdx: index('comm_provider_configs_enterprise_active_idx').on(table.enterpriseId, table.isActive),
}));

// Campanhas de comunicação
export const commCampaigns = pgTable('comm_campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  channel: commChannelEnum('channel').notNull(),
  templateId: uuid('template_id'),
  segment: jsonb('segment'), // filtros para leads
  status: varchar('status', { length: 50 }).default('draft'), // 'draft', 'scheduled', 'running', 'completed', 'cancelled'
  scheduledAt: timestamp('scheduled_at'),
  sentCount: integer('sent_count').default(0),
  deliveredCount: integer('delivered_count').default(0),
  readCount: integer('read_count').default(0),
  failedCount: integer('failed_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  enterpriseStatusIdx: index('comm_campaigns_enterprise_status_idx').on(table.enterpriseId, table.status),
}));

// Logs de webhooks
export const commWebhooks = pgTable('comm_webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(),
  provider: commProviderEnum('provider').notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  processed: boolean('processed').default(false),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  enterpriseProcessedIdx: index('comm_webhooks_enterprise_processed_idx').on(table.enterpriseId, table.processed),
  providerEventIdx: index('comm_webhooks_provider_event_idx').on(table.provider, table.eventType),
}));