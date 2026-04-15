import { eq, and, desc, sql, count, inArray } from 'drizzle-orm';

import { db } from '../../../../backend/src/db/drizzle';

import {
  mktBroadcasts,
  mktBroadcastRecipients,
  marketingCampaigns,
} from '../db/schema';

export type Broadcast = typeof mktBroadcasts.$inferSelect;
export type NewBroadcast = typeof mktBroadcasts.$inferInsert;
export type BroadcastRecipient = typeof mktBroadcastRecipients.$inferSelect;

export async function listBroadcasts(opts?: {
  status?: string;
  channel?: string;
  campaignId?: string;
  page?: number;
  limit?: number;
}) {
  const { status, channel, campaignId, page = 1, limit = 20 } = opts || {};

  const conditions = [];
  if (status) conditions.push(eq(mktBroadcasts.status, status as any));
  if (channel) conditions.push(eq(mktBroadcasts.channel, channel as any));
  if (campaignId) conditions.push(eq(mktBroadcasts.campaignId, campaignId));

  const offset = (page - 1) * limit;

  const [broadcasts, totalResult] = await Promise.all([
    db
      .select()
      .from(mktBroadcasts)
      .where(and(...conditions))
      .orderBy(desc(mktBroadcasts.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(mktBroadcasts)
      .where(and(...conditions)),
  ]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / limit);

  return { broadcasts, total, page, limit, totalPages };
}

export async function getBroadcastById(id: string) {
  const result = await db
    .select()
    .from(mktBroadcasts)
    .where(eq(mktBroadcasts.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createBroadcast(data: NewBroadcast) {
  const result = await db
    .insert(mktBroadcasts)
    .values({
      ...data,
      status: data.status || 'draft',
    })
    .returning();

  return result[0];
}

export async function updateBroadcast(id: string, data: Partial<Broadcast>) {
  // Check current status
  const current = await getBroadcastById(id);
  if (!current) return null;

  if (current.status && !['draft', 'scheduled'].includes(current.status)) {
    throw new Error('Cannot update broadcast that is already sent');
  }

  const result = await db
    .update(mktBroadcasts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(mktBroadcasts.id, id))
    .returning();

  return result[0] || null;
}

export async function scheduleBroadcast(id: string, scheduledAt: Date) {
  const current = await getBroadcastById(id);
  if (!current) throw new Error('Broadcast not found');
  if (current.status !== 'draft') throw new Error('Can only schedule draft broadcasts');

  const result = await db
    .update(mktBroadcasts)
    .set({
      status: 'scheduled',
      scheduledAt,
      updatedAt: new Date(),
    })
    .where(eq(mktBroadcasts.id, id))
    .returning();

  return result[0];
}

export async function executeBroadcast(id: string, recipientIds: string[]) {
  const current = await getBroadcastById(id);
  if (!current) throw new Error('Broadcast not found');

  // Mark as sending
  await db
    .update(mktBroadcasts)
    .set({ status: 'sending', updatedAt: new Date() })
    .where(eq(mktBroadcasts.id, id));

  // Create recipients
  const recipients = recipientIds.map(recipientId => ({
    broadcastId: id,
    leadId: recipientId,
  }));

  await db.insert(mktBroadcastRecipients).values(recipients);

  // Update totals and mark as sent
  const result = await db
    .update(mktBroadcasts)
    .set({
      status: 'sent',
      sentAt: new Date(),
      totalRecipients: recipientIds.length,
      updatedAt: new Date(),
    })
    .where(eq(mktBroadcasts.id, id))
    .returning();

  return { broadcast: result[0], recipientsCreated: recipientIds.length };
}

export async function getBroadcastRecipients(
  broadcastId: string,
  opts?: { status?: string; page?: number; limit?: number }
) {
  const { status, page = 1, limit = 20 } = opts || {};

  const conditions = [eq(mktBroadcastRecipients.broadcastId, broadcastId)];
  if (status) conditions.push(eq(mktBroadcastRecipients.status, status));

  const offset = (page - 1) * limit;

  const [recipients, totalResult] = await Promise.all([
    db
      .select()
      .from(mktBroadcastRecipients)
      .where(and(...conditions))
      .orderBy(desc(mktBroadcastRecipients.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(mktBroadcastRecipients)
      .where(and(...conditions)),
  ]);

  const total = totalResult[0].count;

  return { recipients, total, page, limit };
}

export async function updateRecipientStatus(
  recipientId: string,
  status: string,
  timestamp?: Date
) {
  const timestampFields: Record<string, string> = {
    sent: 'sentAt',
    delivered: 'deliveredAt',
    opened: 'openedAt',
    clicked: 'clickedAt',
  };

  const updateData: any = { status };
  if (timestamp && timestampFields[status]) {
    updateData[timestampFields[status]] = timestamp;
  }

  const result = await db
    .update(mktBroadcastRecipients)
    .set(updateData)
    .where(eq(mktBroadcastRecipients.id, recipientId))
    .returning();

  if (result[0]) {
    // Update broadcast counters
    const updateFields: any = { updatedAt: new Date() };

    switch (status) {
      case 'delivered':
        updateFields.delivered = sql`${mktBroadcasts.delivered} + 1`;
        break;
      case 'opened':
        updateFields.opened = sql`${mktBroadcasts.opened} + 1`;
        break;
      case 'clicked':
        updateFields.clicked = sql`${mktBroadcasts.clicked} + 1`;
        break;
      case 'bounced':
        updateFields.bounced = sql`${mktBroadcasts.bounced} + 1`;
        break;
    }

    if (Object.keys(updateFields).length > 1) {
      await db
        .update(mktBroadcasts)
        .set(updateFields)
        .where(eq(mktBroadcasts.id, result[0].broadcastId));
    }
  }

  return result[0] || null;
}

export async function getBroadcastStats(opts?: { startDate?: Date; endDate?: Date }) {
  const { startDate, endDate } = opts || {};

  const conditions = [];
  if (startDate && endDate) {
    conditions.push(sql`${mktBroadcasts.createdAt} between ${startDate} and ${endDate}`);
  }

  const [totalResult, statusStats, channelStats, deliveryStats] = await Promise.all([
    db
      .select({ count: count() })
      .from(mktBroadcasts)
      .where(and(...conditions)),
    db
      .select({
        status: mktBroadcasts.status,
        count: count(),
      })
      .from(mktBroadcasts)
      .where(and(...conditions))
      .groupBy(mktBroadcasts.status),
    db
      .select({
        channel: mktBroadcasts.channel,
        count: count(),
      })
      .from(mktBroadcasts)
      .where(and(...conditions))
      .groupBy(mktBroadcasts.channel),
    db
      .select({
        totalRecipients: sql<number>`sum(${mktBroadcasts.totalRecipients})`,
        delivered: sql<number>`sum(${mktBroadcasts.delivered})`,
        opened: sql<number>`sum(${mktBroadcasts.opened})`,
        clicked: sql<number>`sum(${mktBroadcasts.clicked})`,
      })
      .from(mktBroadcasts)
      .where(and(...conditions)),
  ]);

  const total = totalResult[0].count;
  const byStatus = statusStats.reduce((acc, stat) => {
    if (stat.status) {
      acc[stat.status] = stat.count;
    }
    return acc;
  }, {} as Record<string, number>);

  const byChannel = channelStats.reduce((acc, stat) => {
    if (stat.channel) {
      acc[stat.channel] = stat.count;
    }
    return acc;
  }, {} as Record<string, number>);

  const { totalRecipients, delivered, opened, clicked } = deliveryStats[0];
  const openRate = totalRecipients ? (opened / totalRecipients) * 100 : 0;
  const clickRate = totalRecipients ? (clicked / totalRecipients) * 100 : 0;

  return {
    total,
    byStatus,
    byChannel,
    deliveryStats: {
      sent: totalRecipients || 0,
      delivered: delivered || 0,
      opened: opened || 0,
      clicked: clicked || 0,
      openRate,
      clickRate,
    },
  };
}