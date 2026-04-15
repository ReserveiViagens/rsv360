import { pgTable, pgEnum, uuid, text, varchar, integer, real, boolean, jsonb, timestamp, index, unique } from 'drizzle-orm/pg-core';

import { marketingCampaigns } from './core';

// Enums
export const mktBroadcastStatusEnum = pgEnum('mkt_broadcast_status', ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled']);
export const mktBroadcastChannelEnum = pgEnum('mkt_broadcast_channel', ['email', 'whatsapp', 'sms', 'push']);
export const mktWhatsappTemplateStatusEnum = pgEnum('mkt_whatsapp_template_status', ['pending', 'approved', 'rejected']);

// Tabelas
export const mktBroadcasts = pgTable('mkt_broadcasts', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(),
  campaignId: uuid('campaign_id').references(() => marketingCampaigns.id),
  segmentId: uuid('segment_id'), // FK → marketingSegments.id (nullable) - tabela não existe ainda
  name: varchar('name', { length: 200 }).notNull(),
  channel: mktBroadcastChannelEnum('channel').notNull(),
  status: mktBroadcastStatusEnum('status').default('draft'),
  subject: varchar('subject', { length: 300 }),
  content: text('content').notNull(),
  templateId: uuid('template_id'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  totalRecipients: integer('total_recipients').default(0),
  delivered: integer('delivered').default(0),
  opened: integer('opened').default(0),
  clicked: integer('clicked').default(0),
  bounced: integer('bounced').default(0),
  unsubscribed: integer('unsubscribed').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_broadcasts_enterprise_status').on(table.enterpriseId, table.status),
  index('idx_broadcasts_enterprise_channel').on(table.enterpriseId, table.channel),
]);

export const mktBroadcastRecipients = pgTable('mkt_broadcast_recipients', {
  id: uuid('id').defaultRandom().primaryKey(),
  broadcastId: uuid('broadcast_id').references(() => mktBroadcasts.id).notNull(),
  leadId: uuid('lead_id').notNull(),
  email: varchar('email', { length: 300 }),
  phone: varchar('phone', { length: 50 }),
  status: varchar('status', { length: 50 }).default('pending'),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_broadcast_recipients_broadcast_status').on(table.broadcastId, table.status),
]);

export const mktWhatsappTemplates = pgTable('mkt_whatsapp_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  language: varchar('language', { length: 10 }).default('pt_BR'),
  category: varchar('category', { length: 50 }),
  status: mktWhatsappTemplateStatusEnum('status').default('pending'),
  headerType: varchar('header_type', { length: 20 }),
  headerContent: text('header_content'),
  body: text('body').notNull(),
  footer: varchar('footer', { length: 200 }),
  buttons: jsonb('buttons'),
  externalId: varchar('external_id', { length: 200 }),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_whatsapp_templates_enterprise_status').on(table.enterpriseId, table.status),
  unique('unique_whatsapp_template').on(table.enterpriseId, table.name, table.language),
]);

export const mktWhatsappConversations = pgTable('mkt_whatsapp_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  enterpriseId: uuid('enterprise_id').notNull(),
  leadId: uuid('lead_id').notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  waId: varchar('wa_id', { length: 100 }),
  lastMessageAt: timestamp('last_message_at'),
  isActive: boolean('is_active').default(true),
  assignedTo: uuid('assigned_to'),
  tags: jsonb('tags'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_whatsapp_conversations_enterprise_phone').on(table.enterpriseId, table.phone),
  index('idx_whatsapp_conversations_enterprise_active').on(table.enterpriseId, table.isActive),
]);

export const mktWhatsappMessages = pgTable('mkt_whatsapp_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => mktWhatsappConversations.id).notNull(),
  direction: varchar('direction', { length: 10 }).notNull(),
  type: varchar('type', { length: 20 }),
  content: text('content'),
  mediaUrl: text('media_url'),
  templateId: uuid('template_id').references(() => mktWhatsappTemplates.id),
  externalMessageId: varchar('external_message_id', { length: 200 }),
  status: varchar('status', { length: 30 }).default('pending'),
  errorCode: varchar('error_code', { length: 50 }),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_whatsapp_messages_conversation_created').on(table.conversationId, table.createdAt),
]);