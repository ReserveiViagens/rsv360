import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { campanhas, cupons, cuponsUso } from '../../../../backend/src/db/schema/marketing';

/** Campanhas/cupons Fase 1 (schema marketing) — distinto do módulo marketing WhatsApp. */
export class CampanhasViagemService {
  async listCampanhas(enterpriseId?: number) {
    if (enterpriseId) {
      return db.select().from(campanhas).where(eq(campanhas.enterpriseId, enterpriseId));
    }
    return db.select().from(campanhas).orderBy(desc(campanhas.createdAt));
  }

  async createCampanha(data: Record<string, unknown>) {
    const [created] = await db.insert(campanhas).values(data as typeof campanhas.$inferInsert).returning();
    return created;
  }

  async listCupons() {
    return db.select().from(cupons).orderBy(desc(cupons.createdAt));
  }

  async createCupom(data: Record<string, unknown>) {
    const [created] = await db.insert(cupons).values(data as typeof cupons.$inferInsert).returning();
    return created;
  }

  async usarCupom(cupomId: number, data: { clienteEmail?: string; bookingId?: number; valorDesconto: string }) {
    const [uso] = await db
      .insert(cuponsUso)
      .values({
        cupomId,
        clienteEmail: data.clienteEmail ?? null,
        bookingId: data.bookingId ?? null,
        valorDesconto: data.valorDesconto,
      })
      .returning();

    const [cupom] = await db.select().from(cupons).where(eq(cupons.id, cupomId));
    if (cupom) {
      await db
        .update(cupons)
        .set({ usoAtual: (cupom.usoAtual ?? 0) + 1, updatedAt: new Date() })
        .where(eq(cupons.id, cupomId));
    }
    return uso;
  }
}

export const campanhasViagemService = new CampanhasViagemService();
module.exports = { CampanhasViagemService, campanhasViagemService };
