import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { contasReceber, transacoes } from '../../../../backend/src/db/schema/financeiro';

export class FinanceiroService {
  async listTransacoes(filters: { tipo?: string; status?: string } = {}) {
    const rows = await db.select().from(transacoes).orderBy(desc(transacoes.dataTransacao));
    return rows.filter((row) => {
      if (filters.tipo && row.tipo !== filters.tipo) return false;
      if (filters.status && row.status !== filters.status) return false;
      return true;
    });
  }

  async createTransacao(data: Record<string, unknown>) {
    const [created] = await db
      .insert(transacoes)
      .values(data as typeof transacoes.$inferInsert)
      .returning();
    return created;
  }

  async listContasReceber(status?: string) {
    if (status) {
      return db.select().from(contasReceber).where(eq(contasReceber.status, status));
    }
    return db.select().from(contasReceber).orderBy(desc(contasReceber.createdAt));
  }

  async createContaReceber(data: Record<string, unknown>) {
    const [created] = await db
      .insert(contasReceber)
      .values(data as typeof contasReceber.$inferInsert)
      .returning();
    return created;
  }

  async receberConta(id: number, valorRecebido: string) {
    const [updated] = await db
      .update(contasReceber)
      .set({
        valorRecebido,
        status: 'pago',
        recebidoEm: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contasReceber.id, id))
      .returning();
    return updated ?? null;
  }
}

export const financeiroService = new FinanceiroService();
module.exports = { FinanceiroService, financeiroService };
