import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { passageiroExcursao, passageiros } from '../../../../backend/src/db/schema/passageiros';

export class PassageirosService {
  async list(enterpriseId?: number) {
    if (enterpriseId) {
      return db.select().from(passageiros).where(eq(passageiros.enterpriseId, enterpriseId));
    }
    return db.select().from(passageiros).orderBy(desc(passageiros.createdAt));
  }

  async getById(id: number) {
    const [row] = await db.select().from(passageiros).where(eq(passageiros.id, id));
    if (!row) return null;
    const excursao = await db
      .select()
      .from(passageiroExcursao)
      .where(eq(passageiroExcursao.passageiroId, id));
    return { ...row, excursao };
  }

  async create(data: Record<string, unknown>) {
    const [created] = await db
      .insert(passageiros)
      .values(data as typeof passageiros.$inferInsert)
      .returning();
    return created;
  }

  async update(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(passageiros)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof passageiros.$inferInsert>)
      .where(eq(passageiros.id, id))
      .returning();
    return updated ?? null;
  }

  async remove(id: number) {
    const [deleted] = await db.delete(passageiros).where(eq(passageiros.id, id)).returning();
    return deleted ?? null;
  }

  async linkExcursao(passageiroId: number, data: Record<string, unknown>) {
    const [created] = await db
      .insert(passageiroExcursao)
      .values({ ...data, passageiroId } as typeof passageiroExcursao.$inferInsert)
      .returning();
    return created;
  }
}

export const passageirosService = new PassageirosService();

module.exports = { PassageirosService, passageirosService };
