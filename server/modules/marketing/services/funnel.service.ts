import { eq, and, desc, sql, count } from 'drizzle-orm';

import { db } from '../../../../backend/src/db/drizzle';

import { mktFunnels, mktFunnelEntries } from '../db/schema';

export type Funnel = typeof mktFunnels.$inferSelect;
export type NewFunnel = typeof mktFunnels.$inferInsert;
export type FunnelEntry = typeof mktFunnelEntries.$inferSelect;
export type NewFunnelEntry = typeof mktFunnelEntries.$inferInsert;
export type FunnelStageReport = { stageId: string; name: string; count: number; conversionFromPrevious: number | null };

export async function listFunnels(opts?: { isActive?: boolean; page?: number; limit?: number }) {
  const { isActive, page = 1, limit = 20 } = opts || {};

  const conditions = [];
  if (isActive !== undefined) conditions.push(eq(mktFunnels.isActive, isActive));

  const offset = (page - 1) * limit;

  const [funnels, totalResult] = await Promise.all([
    db
      .select()
      .from(mktFunnels)
      .where(and(...conditions))
      .orderBy(desc(mktFunnels.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(mktFunnels)
      .where(and(...conditions)),
  ]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / limit);

  return { funnels, total, page, limit, totalPages };
}

export async function getFunnelById(id: string) {
  const result = await db
    .select()
    .from(mktFunnels)
    .where(eq(mktFunnels.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createFunnel(data: NewFunnel) {
  // Validate stages
  const stages = Array.isArray(data.stages) ? data.stages : JSON.parse(data.stages as any);
  if (!stages || stages.length < 2) {
    throw new Error('Funnel must have at least 2 stages');
  }

  const result = await db
    .insert(mktFunnels)
    .values(data)
    .returning();

  return result[0];
}

export async function updateFunnel(id: string, data: Partial<Funnel>) {
  // Validate stages if being updated
  if (data.stages) {
    const stages = Array.isArray(data.stages) ? data.stages : JSON.parse(data.stages as any);
    if (!stages || stages.length < 2) {
      throw new Error('Funnel must have at least 2 stages');
    }
  }

  const result = await db
    .update(mktFunnels)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(mktFunnels.id, id))
    .returning();

  return result[0] || null;
}

export async function deleteFunnel(id: string) {
  const result = await db
    .update(mktFunnels)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(mktFunnels.id, id))
    .returning();

  return { success: result.length > 0 };
}

export async function addLeadToFunnel(funnelId: string, leadId: string, initialStageId?: string) {
  const funnel = await getFunnelById(funnelId);
  if (!funnel) throw new Error('Funnel not found');

  const stages = Array.isArray(funnel.stages) ? funnel.stages : JSON.parse(funnel.stages as any);
  const initialStage = initialStageId || stages.sort((a: any, b: any) => a.order - b.order)[0]?.id;

  if (!initialStage) throw new Error('No valid initial stage found');

  const result = await db
    .insert(mktFunnelEntries)
    .values({
      funnelId,
      leadId,
      currentStageId: initialStage,
    })
    .returning();

  // Update total leads
  await db
    .update(mktFunnels)
    .set({
      totalLeads: sql`${mktFunnels.totalLeads} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(mktFunnels.id, funnelId));

  return result[0];
}

export async function moveLeadToStage(entryId: string, newStageId: string) {
  const entry = await db
    .select()
    .from(mktFunnelEntries)
    .where(eq(mktFunnelEntries.id, entryId))
    .limit(1);

  if (!entry[0]) throw new Error('Funnel entry not found');

  const funnel = await getFunnelById(entry[0].funnelId);
  if (!funnel) throw new Error('Funnel not found');

  const stages = Array.isArray(funnel.stages) ? funnel.stages : JSON.parse(funnel.stages as any);
  const stageExists = stages.some((stage: any) => stage.id === newStageId);
  if (!stageExists) throw new Error('Invalid stage ID');

  const isLastStage = stages[stages.length - 1]?.id === newStageId;

  const updateData: any = { currentStageId: newStageId };
  if (isLastStage) {
    updateData.convertedAt = new Date();
  }

  const result = await db
    .update(mktFunnelEntries)
    .set(updateData)
    .where(eq(mktFunnelEntries.id, entryId))
    .returning();

  if (isLastStage) {
    // Update conversion rate
    await db
      .update(mktFunnels)
      .set({
        conversionRate: sql`${mktFunnels.conversionRate} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(mktFunnels.id, funnel.id));
  }

  return result[0];
}

export async function removeLeadFromFunnel(entryId: string) {
  const entry = await db
    .select()
    .from(mktFunnelEntries)
    .where(eq(mktFunnelEntries.id, entryId))
    .limit(1);

  if (!entry[0]) return { success: false };

  // Delete entry
  await db
    .delete(mktFunnelEntries)
    .where(eq(mktFunnelEntries.id, entryId));

  // Update total leads
  await db
    .update(mktFunnels)
    .set({
      totalLeads: sql`${mktFunnels.totalLeads} - 1`,
      updatedAt: new Date(),
    })
    .where(eq(mktFunnels.id, entry[0].funnelId));

  return { success: true };
}

export async function getFunnelReport(funnelId: string) {
  const funnel = await getFunnelById(funnelId);
  if (!funnel) throw new Error('Funnel not found');

  const stages = Array.isArray(funnel.stages) ? funnel.stages : JSON.parse(funnel.stages as any);

  const entries = await db
    .select({
      currentStageId: mktFunnelEntries.currentStageId,
      count: count(),
    })
    .from(mktFunnelEntries)
    .where(eq(mktFunnelEntries.funnelId, funnelId))
    .groupBy(mktFunnelEntries.currentStageId);

  const stageCounts = entries.reduce((acc, entry) => {
    acc[entry.currentStageId] = entry.count;
    return acc;
  }, {} as Record<string, number>);

  const stagesReport: FunnelStageReport[] = stages
    .sort((a: any, b: any) => a.order - b.order)
    .map((stage: any, index: number) => {
      const count = stageCounts[stage.id] || 0;
      const previousCount = index > 0 ? stageCounts[stages[index - 1].id] || 0 : count;
      const conversionFromPrevious = previousCount > 0 ? (count / previousCount) * 100 : null;

      return {
        stageId: stage.id,
        name: stage.name,
        count,
        conversionFromPrevious,
      };
    });

  const totalLeads = funnel.totalLeads || 0;
  const overallConversionRate = totalLeads > 0 ? ((funnel.conversionRate || 0) / totalLeads) * 100 : 0;

  return { funnel, stages: stagesReport, totalLeads, overallConversionRate };
}