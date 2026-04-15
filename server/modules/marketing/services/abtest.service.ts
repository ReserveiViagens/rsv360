import { eq, and, desc, sql, count } from 'drizzle-orm';
import { db } from '../../../../backend/src/db/drizzle';
import { mktAbTests, marketingCampaigns } from '../db/schema';

export type AbTest = typeof mktAbTests.$inferSelect;
export type NewAbTest = typeof mktAbTests.$inferInsert;
export type AbTestVariant = { subject?: string; content: string; sendTime?: string };
export type AbTestResults = {
  variantA: { sent: number; opened: number; clicked: number; converted: number };
  variantB: { sent: number; opened: number; clicked: number; converted: number };
};

export async function listAbTests(opts?: { status?: "draft" | "paused" | "completed" | "running" | "cancelled"; campaignId?: string; page?: number; limit?: number }) {
  const { status, campaignId, page = 1, limit = 20 } = opts || {};
  const offset = (page - 1) * limit;

  let whereClause = [];
  if (status) whereClause.push(eq(mktAbTests.status, status));
  if (campaignId) whereClause.push(eq(mktAbTests.campaignId, campaignId));

  const where = whereClause.length > 0 ? and(...whereClause) : undefined;

  const [tests, [{ total }]] = await Promise.all([
    db.select().from(mktAbTests).where(where).orderBy(desc(mktAbTests.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(mktAbTests).where(where)
  ]);

  const totalPages = Math.ceil(total / limit);

  return { tests, total, page, limit, totalPages };
}

export async function getAbTestById(id: string): Promise<AbTest | null> {
  const result = await db.select().from(mktAbTests).where(eq(mktAbTests.id, id)).limit(1);
  return result[0] || null;
}

export async function createAbTest(data: { name: string; campaignId?: string; variantA: AbTestVariant; variantB: AbTestVariant; splitPercentage?: number; winnerMetric?: string }): Promise<AbTest> {
  const { name, campaignId, variantA, variantB, splitPercentage = 50, winnerMetric = 'open_rate' } = data;

  if (splitPercentage < 10 || splitPercentage > 90) {
    throw new Error('splitPercentage must be between 10 and 90');
  }

  const newTest: NewAbTest = {
    name,
    enterpriseId: '00000000-0000-0000-0000-000000000000', // placeholder
    campaignId,
    variantA: JSON.stringify(variantA),
    variantB: JSON.stringify(variantB),
    splitPercentage,
    winnerMetric,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.insert(mktAbTests).values(newTest).returning();
  return result[0];
}

export async function updateAbTest(id: string, data: Partial<AbTest>): Promise<AbTest | null> {
  const test = await getAbTestById(id);
  if (!test || test.status !== 'draft') {
    return null;
  }

  const updateData = { ...data, updatedAt: new Date() };
  const result = await db.update(mktAbTests).set(updateData).where(eq(mktAbTests.id, id)).returning();
  return result[0] || null;
}

export async function startTest(id: string): Promise<AbTest> {
  const test = await getAbTestById(id);
  if (!test || test.status !== 'draft') {
    throw new Error('Test must be in draft status to start');
  }

  const variantA = JSON.parse(test.variantA as string);
  const variantB = JSON.parse(test.variantB as string);
  if (!variantA.content || !variantB.content) {
    throw new Error('Both variants must have content');
  }

  const result = await db.update(mktAbTests).set({
    status: 'running',
    startedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(mktAbTests.id, id)).returning();
  return result[0];
}

export async function pauseTest(id: string): Promise<AbTest> {
  const test = await getAbTestById(id);
  if (!test || test.status !== 'running') {
    throw new Error('Test must be running to pause');
  }

  const result = await db.update(mktAbTests).set({
    status: 'paused',
    updatedAt: new Date(),
  }).where(eq(mktAbTests.id, id)).returning();
  return result[0];
}

export async function resumeTest(id: string): Promise<AbTest> {
  const test = await getAbTestById(id);
  if (!test || test.status !== 'paused') {
    throw new Error('Test must be paused to resume');
  }

  const result = await db.update(mktAbTests).set({
    status: 'running',
    updatedAt: new Date(),
  }).where(eq(mktAbTests.id, id)).returning();
  return result[0];
}

export async function completeTest(id: string, results: AbTestResults): Promise<AbTest> {
  const test = await getAbTestById(id);
  if (!test || (test.status !== 'running' && test.status !== 'paused')) {
    throw new Error('Test must be running or paused to complete');
  }

  const winner = determineWinner(results, test.winnerMetric || 'open_rate');

  const result = await db.update(mktAbTests).set({
    status: 'completed',
    completedAt: new Date(),
    results: JSON.stringify(results),
    winnerVariant: winner,
    updatedAt: new Date(),
  }).where(eq(mktAbTests.id, id)).returning();
  return result[0];
}

export async function cancelTest(id: string): Promise<AbTest> {
  const test = await getAbTestById(id);
  if (!test || test.status === 'completed') {
    throw new Error('Cannot cancel a completed test');
  }

  const result = await db.update(mktAbTests).set({
    status: 'cancelled',
    updatedAt: new Date(),
  }).where(eq(mktAbTests.id, id)).returning();
  return result[0];
}

export function determineWinner(results: AbTestResults, metric: string): 'A' | 'B' {
  const getRate = (variant: typeof results.variantA) => {
    switch (metric) {
      case 'open_rate':
        return variant.sent > 0 ? variant.opened / variant.sent : 0;
      case 'click_rate':
        return variant.sent > 0 ? variant.clicked / variant.sent : 0;
      case 'conversion_rate':
        return variant.sent > 0 ? variant.converted / variant.sent : 0;
      default:
        return 0;
    }
  };

  const rateA = getRate(results.variantA);
  const rateB = getRate(results.variantB);

  return rateA > rateB ? 'A' : 'B';
}

export async function getAbTestStats(opts?: { startDate?: string; endDate?: string }) {
  const { startDate, endDate } = opts || {};

  let whereClause = [];
  if (startDate) whereClause.push(sql`${mktAbTests.createdAt} >= ${startDate}`);
  if (endDate) whereClause.push(sql`${mktAbTests.createdAt} <= ${endDate}`);

  const where = whereClause.length > 0 ? and(...whereClause) : undefined;

  const [statusCounts, completedTests, winnerCounts] = await Promise.all([
    db.select({ status: mktAbTests.status, count: count() }).from(mktAbTests).where(where).groupBy(mktAbTests.status),
    db.select({ count: count() }).from(mktAbTests).where(and(where, eq(mktAbTests.status, 'completed'))),
    db.select({ winnerVariant: mktAbTests.winnerVariant, count: count() }).from(mktAbTests).where(and(where, eq(mktAbTests.status, 'completed'))).groupBy(mktAbTests.winnerVariant)
  ]);

  const byStatus = statusCounts.reduce((acc: Record<string, number>, row: { status: "draft" | "paused" | "completed" | "running" | "cancelled" | null; count: number }) => {
    if (row.status) acc[row.status] = row.count;
    return acc;
  }, {} as Record<string, number>);

  const winnerDistribution = winnerCounts.reduce((acc: { A: number; B: number }, row: { winnerVariant: string | null; count: number }) => {
    if (row.winnerVariant === 'A') acc.A = row.count;
    if (row.winnerVariant === 'B') acc.B = row.count;
    return acc;
  }, { A: 0, B: 0 });

  const total = statusCounts.reduce((sum: number, row: { status: "draft" | "paused" | "completed" | "running" | "cancelled" | null; count: number }) => sum + row.count, 0);

  return {
    total,
    byStatus,
    completedTests: completedTests[0].count,
    winnerDistribution
  };
}