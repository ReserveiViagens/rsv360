import { eq, and, desc, asc, sql, count, ilike, between, inArray } from 'drizzle-orm';

import { db } from '../../../../backend/src/db/drizzle';

import {
  marketingCampaigns,
  campaignStatusEnum,
  campaignTypeEnum,
} from '../db/schema';

export type Campaign = typeof marketingCampaigns.$inferSelect;
export type NewCampaign = typeof marketingCampaigns.$inferInsert;

export async function listCampaigns(
  opts?: {
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  const { status, type, search, page = 1, limit = 20 } = opts || {};

  const conditions = [];

  if (status) conditions.push(eq(marketingCampaigns.status, status as any));
  if (type) conditions.push(eq(marketingCampaigns.type, type as any));
  if (search) conditions.push(ilike(marketingCampaigns.name, `%${search}%`));

  const offset = (page - 1) * limit;

  const [campaigns, totalResult] = await Promise.all([
    db
      .select()
      .from(marketingCampaigns)
      .where(and(...conditions))
      .orderBy(desc(marketingCampaigns.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(marketingCampaigns)
      .where(and(...conditions)),
  ]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / limit);

  return { campaigns, total, page, limit, totalPages };
}

export async function getCampaignById(id: string) {
  const result = await db
    .select()
    .from(marketingCampaigns)
    .where(eq(marketingCampaigns.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createCampaign(data: NewCampaign) {
  const result = await db
    .insert(marketingCampaigns)
    .values({
      ...data,
      status: data.status || 'draft',
      budget: data.budget || 0,
    })
    .returning();

  return result[0];
}

export async function updateCampaign(
  id: string,
  data: Partial<Campaign>
) {
  const result = await db
    .update(marketingCampaigns)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(marketingCampaigns.id, id))
    .returning();

  return result[0] || null;
}

export async function deleteCampaign(id: string) {
  // Soft delete
  const result = await db
    .update(marketingCampaigns)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(marketingCampaigns.id, id))
    .returning();

  return { success: result.length > 0 };
}

export async function getCampaignStats(
  opts?: { startDate?: Date; endDate?: Date }
) {
  const { startDate, endDate } = opts || {};

  const conditions = [];
  if (startDate && endDate) {
    conditions.push(between(marketingCampaigns.createdAt, startDate, endDate));
  }

  const [totalResult, statusStats, budgetStats] = await Promise.all([
    db
      .select({ count: count() })
      .from(marketingCampaigns)
      .where(and(...conditions)),
    db
      .select({
        status: marketingCampaigns.status,
        count: count(),
      })
      .from(marketingCampaigns)
      .where(and(...conditions))
      .groupBy(marketingCampaigns.status),
    db
      .select({
        totalBudget: sql<number>`sum(${marketingCampaigns.budget})`,
      })
      .from(marketingCampaigns)
      .where(and(...conditions)),
  ]);

  const total = totalResult[0].count;
  const byStatus = statusStats.reduce((acc, stat) => {
    acc[stat.status] = stat.count;
    return acc;
  }, {} as Record<string, number>);

  const { totalBudget } = budgetStats[0];

  return { total, byStatus, totalBudget: totalBudget || 0, totalSpent: 0 };
}

export async function duplicateCampaign(id: string) {
  const original = await getCampaignById(id);
  if (!original) throw new Error('Campaign not found');

  const { id: _, createdAt, updatedAt, ...campaignData } = original;

  const result = await db
    .insert(marketingCampaigns)
    .values({
      ...campaignData,
      name: `Copy of ${original.name}`,
      status: 'draft',
    })
    .returning();

  return result[0];
}