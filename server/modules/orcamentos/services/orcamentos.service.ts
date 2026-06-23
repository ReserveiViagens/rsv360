import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { orcamentoItens, orcamentos } from '../../../../backend/src/db/schema/orcamentos';

export class OrcamentosService {
  async list(filters: { status?: string; enterpriseId?: number } = {}) {
    const conditions = [];
    if (filters.status) conditions.push(eq(orcamentos.status, filters.status));
    if (filters.enterpriseId) conditions.push(eq(orcamentos.enterpriseId, filters.enterpriseId));

    const query = db.select().from(orcamentos).orderBy(desc(orcamentos.createdAt));
    if (conditions.length) {
      return query.where(and(...conditions));
    }
    return query;
  }

  async getById(id: number) {
    const [row] = await db.select().from(orcamentos).where(eq(orcamentos.id, id));
    if (!row) return null;
    const itens = await db
      .select()
      .from(orcamentoItens)
      .where(eq(orcamentoItens.orcamentoId, id))
      .orderBy(orcamentoItens.ordem);
    return { ...row, itens };
  }

  async create(data: Record<string, unknown>, actorId?: number) {
    const [created] = await db
      .insert(orcamentos)
      .values({
        ...data,
        criadoPor: actorId ?? null,
      } as typeof orcamentos.$inferInsert)
      .returning();
    return created;
  }

  async update(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(orcamentos)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof orcamentos.$inferInsert>)
      .where(eq(orcamentos.id, id))
      .returning();
    return updated ?? null;
  }

  async remove(id: number) {
    const [deleted] = await db.delete(orcamentos).where(eq(orcamentos.id, id)).returning();
    return deleted ?? null;
  }

  async addItem(orcamentoId: number, item: Record<string, unknown>) {
    const [created] = await db
      .insert(orcamentoItens)
      .values({ ...item, orcamentoId } as typeof orcamentoItens.$inferInsert)
      .returning();
    return created;
  }
}

export const orcamentosService = new OrcamentosService();

module.exports = { OrcamentosService, orcamentosService };
