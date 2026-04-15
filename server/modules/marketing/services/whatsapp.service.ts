import { eq, and, desc, sql, count, ilike } from 'drizzle-orm';

import { db } from '../../../../backend/src/db/drizzle';

import {
  mktWhatsappTemplates,
  mktWhatsappConversations,
  mktWhatsappMessages,
} from '../db/schema';

export type WhatsappTemplate = typeof mktWhatsappTemplates.$inferSelect;
export type NewWhatsappTemplate = typeof mktWhatsappTemplates.$inferInsert;
export type WhatsappConversation = typeof mktWhatsappConversations.$inferSelect;
export type NewWhatsappConversation = typeof mktWhatsappConversations.$inferInsert;
export type WhatsappMessage = typeof mktWhatsappMessages.$inferSelect;
export type NewWhatsappMessage = typeof mktWhatsappMessages.$inferInsert;

// Templates
export async function listTemplates(opts?: { status?: string; category?: string; page?: number; limit?: number }) {
  const { status, category, page = 1, limit = 20 } = opts || {};

  const conditions = [];
  if (status) conditions.push(eq(mktWhatsappTemplates.status, status as any));
  if (category) conditions.push(eq(mktWhatsappTemplates.category, category));

  const offset = (page - 1) * limit;

  const [templates, totalResult] = await Promise.all([
    db
      .select()
      .from(mktWhatsappTemplates)
      .where(and(...conditions))
      .orderBy(desc(mktWhatsappTemplates.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(mktWhatsappTemplates)
      .where(and(...conditions)),
  ]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / limit);

  return { templates, total, page, limit, totalPages };
}

export async function getTemplateById(id: string) {
  const result = await db
    .select()
    .from(mktWhatsappTemplates)
    .where(eq(mktWhatsappTemplates.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createTemplate(data: NewWhatsappTemplate) {
  const result = await db
    .insert(mktWhatsappTemplates)
    .values({
      ...data,
      enterpriseId: data.enterpriseId || '00000000-0000-0000-0000-000000000000', // Placeholder
      status: data.status || 'pending',
      language: data.language || 'pt_BR',
    })
    .returning();

  return result[0];
}

export async function updateTemplate(id: string, data: Partial<WhatsappTemplate>) {
  const current = await getTemplateById(id);
  if (!current) return null;

  if (current.status && !['pending', 'rejected'].includes(current.status)) {
    throw new Error('Cannot update template that is not pending or rejected');
  }

  const result = await db
    .update(mktWhatsappTemplates)
    .set({
      ...data,
      status: data.body || data.headerContent || data.footer || data.buttons ? 'pending' : data.status,
      updatedAt: new Date(),
    })
    .where(eq(mktWhatsappTemplates.id, id))
    .returning();

  return result[0] || null;
}

export async function deleteTemplate(id: string) {
  const result = await db
    .delete(mktWhatsappTemplates)
    .where(eq(mktWhatsappTemplates.id, id))
    .returning();

  return { success: result.length > 0 };
}

// Conversations
export async function listConversations(opts?: { isActive?: boolean; search?: string; page?: number; limit?: number }) {
  const { isActive, search, page = 1, limit = 20 } = opts || {};

  const conditions = [];
  if (isActive !== undefined) conditions.push(eq(mktWhatsappConversations.isActive, isActive));
  if (search) conditions.push(ilike(mktWhatsappConversations.phone, `%${search}%`));

  const offset = (page - 1) * limit;

  const [conversations, totalResult] = await Promise.all([
    db
      .select()
      .from(mktWhatsappConversations)
      .where(and(...conditions))
      .orderBy(sql`${mktWhatsappConversations.lastMessageAt} DESC NULLS LAST`)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(mktWhatsappConversations)
      .where(and(...conditions)),
  ]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / limit);

  return { conversations, total, page, limit, totalPages };
}

export async function getConversationById(id: string) {
  const result = await db
    .select()
    .from(mktWhatsappConversations)
    .where(eq(mktWhatsappConversations.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getOrCreateConversation(leadId: string, phone: string) {
  // Try to find existing conversation
  const existing = await db
    .select()
    .from(mktWhatsappConversations)
    .where(eq(mktWhatsappConversations.phone, phone))
    .limit(1);

  if (existing[0]) return existing[0];

  // Create new conversation
  const result = await db
    .insert(mktWhatsappConversations)
    .values({
      enterpriseId: '00000000-0000-0000-0000-000000000000', // Placeholder - multi-tenant not implemented
      leadId,
      phone,
      isActive: true,
    })
    .returning();

  return result[0];
}

export async function closeConversation(id: string) {
  const result = await db
    .update(mktWhatsappConversations)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(mktWhatsappConversations.id, id))
    .returning();

  return result[0] || null;
}

// Messages
export async function getMessages(conversationId: string, opts?: { page?: number; limit?: number }) {
  const { page = 1, limit = 50 } = opts || {};

  const offset = (page - 1) * limit;

  const [messages, totalResult] = await Promise.all([
    db
      .select()
      .from(mktWhatsappMessages)
      .where(eq(mktWhatsappMessages.conversationId, conversationId))
      .orderBy(mktWhatsappMessages.createdAt)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(mktWhatsappMessages)
      .where(eq(mktWhatsappMessages.conversationId, conversationId)),
  ]);

  const total = totalResult[0].count;

  return { messages, total, page, limit };
}

export async function sendMessage(data: {
  conversationId: string;
  content: string;
  type?: string;
  templateId?: string;
  mediaUrl?: string;
}) {
  const result = await db
    .insert(mktWhatsappMessages)
    .values({
      ...data,
      direction: 'outbound',
      status: 'pending',
    })
    .returning();

  // Update conversation lastMessageAt
  await db
    .update(mktWhatsappConversations)
    .set({
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(mktWhatsappConversations.id, data.conversationId));

  return result[0];
}

export async function receiveMessage(data: {
  conversationId: string;
  content: string;
  type?: string;
  externalMessageId?: string;
  mediaUrl?: string;
}) {
  const result = await db
    .insert(mktWhatsappMessages)
    .values({
      ...data,
      direction: 'inbound',
      status: 'delivered',
    })
    .returning();

  // Update conversation and reactivate if needed
  await db
    .update(mktWhatsappConversations)
    .set({
      lastMessageAt: new Date(),
      isActive: true,
      updatedAt: new Date(),
    })
    .where(eq(mktWhatsappConversations.id, data.conversationId));

  return result[0];
}

export async function updateMessageStatus(
  messageId: string,
  status: string,
  timestamp?: Date,
  errorData?: { errorCode?: string; errorMessage?: string }
) {
  const timestampFields: Record<string, string> = {
    sent: 'sentAt',
    delivered: 'deliveredAt',
    read: 'readAt',
  };

  const updateData: any = { status };
  if (timestamp && timestampFields[status]) {
    updateData[timestampFields[status]] = timestamp;
  }
  if (errorData) {
    updateData.errorCode = errorData.errorCode;
    updateData.errorMessage = errorData.errorMessage;
  }

  const result = await db
    .update(mktWhatsappMessages)
    .set(updateData)
    .where(eq(mktWhatsappMessages.id, messageId))
    .returning();

  return result[0] || null;
}