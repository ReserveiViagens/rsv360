import { eq } from 'drizzle-orm';
const { db } = require('../../../../src/db/drizzle');
const { disputes } = require('../../../../src/db/schema');

export class DisputeService {
  async createDispute(paymentId: string, reason: string, amount: number): Promise<any> {
    const result = await db.insert(disputes).values({
      paymentId,
      provider: 'mercadopago' as any, // Adjust
      reason,
      amount: amount.toString(),
      status: 'opened' as any,
    }).returning();

    return result[0];
  }

  async getDispute(id: string): Promise<any> {
    const result = await db.select().from(disputes)
      .where(eq(disputes.id, id)).limit(1);

    return result[0] || null;
  }

  async updateDispute(
    id: string,
    data: {
      reason?: string;
      status?: 'opened' | 'in_review' | 'won' | 'lost' | 'accepted';
      amount?: string;
      evidence?: Record<string, unknown>;
      deadline?: Date;
      resolvedAt?: Date | null;
      externalId?: string;
    },
  ): Promise<any> {
    const result = await db.update(disputes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(disputes.id, id))
      .returning();

    return result[0];
  }

  async listDisputes(limit = 10, offset = 0): Promise<any[]> {
    const results = await db.select().from(disputes)
      .limit(limit)
      .offset(offset)
      .orderBy(disputes.createdAt);

    return results;
  }

  async submitEvidence(id: string, evidence: any): Promise<void> {
    await db.update(disputes)
      .set({ evidence })
      .where(eq(disputes.id, id));
  }

  async acceptDispute(id: string): Promise<void> {
    await db.update(disputes)
      .set({ status: 'accepted' as any, resolvedAt: new Date() })
      .where(eq(disputes.id, id));
  }

  async getDisputeStats(): Promise<any> {
    const stats = await db.select({
      totalDisputes: db.$count(disputes.id),
      wonDisputes: db.$count(disputes.id).where(eq(disputes.status, 'won')),
    }).from(disputes);

    return stats[0];
  }
}