import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { campanhas, cupons, cuponsUso } from '../../../../backend/src/db/schema/marketing';

function toNum(v: unknown): number {
  if (v == null) return 0;
  return typeof v === 'string' ? parseFloat(v) || 0 : Number(v) || 0;
}

export class CampanhasViagemService {
  async listCampanhas(enterpriseId?: number) {
    if (enterpriseId) {
      return db.select().from(campanhas).where(eq(campanhas.enterpriseId, enterpriseId));
    }
    return db.select().from(campanhas).orderBy(desc(campanhas.createdAt));
  }

  async getCampanha(id: number) {
    const [row] = await db.select().from(campanhas).where(eq(campanhas.id, id));
    return row ?? null;
  }

  async createCampanha(data: Record<string, unknown>) {
    const [created] = await db.insert(campanhas).values(data as typeof campanhas.$inferInsert).returning();
    return created;
  }

  async updateCampanha(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(campanhas)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof campanhas.$inferInsert>)
      .where(eq(campanhas.id, id))
      .returning();
    return updated ?? null;
  }

  async deleteCampanha(id: number) {
    const [deleted] = await db.delete(campanhas).where(eq(campanhas.id, id)).returning();
    return deleted ?? null;
  }

  async getMetricas(enterpriseId?: number) {
    const allCampanhas = await this.listCampanhas(enterpriseId);
    const allCupons = await this.listCupons();
    const usos = await db.select().from(cuponsUso);
    const gastoTotal = allCampanhas.reduce((s, c) => s + toNum(c.gastoAtual), 0);
    const orcamentoTotal = allCampanhas.reduce((s, c) => s + toNum(c.orcamento), 0);
    return {
      campanhasAtivas: allCampanhas.filter((c) => c.status === 'ativa').length,
      cuponsAtivos: allCupons.filter((c) => c.isActive).length,
      usosCupons: usos.length,
      gastoTotal,
      orcamentoTotal,
      roi: orcamentoTotal > 0 ? ((orcamentoTotal - gastoTotal) / orcamentoTotal) * 100 : 0,
    };
  }

  async listCupons() {
    return db.select().from(cupons).orderBy(desc(cupons.createdAt));
  }

  async getCupom(id: number) {
    const [row] = await db.select().from(cupons).where(eq(cupons.id, id));
    return row ?? null;
  }

  async createCupom(data: Record<string, unknown>) {
    const [created] = await db.insert(cupons).values(data as typeof cupons.$inferInsert).returning();
    return created;
  }

  async updateCupom(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(cupons)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof cupons.$inferInsert>)
      .where(eq(cupons.id, id))
      .returning();
    return updated ?? null;
  }

  async validarCupom(codigo: string) {
    const [cupom] = await db.select().from(cupons).where(eq(cupons.codigo, codigo));
    if (!cupom || !cupom.isActive) return { valido: false, motivo: 'Cupom inválido ou inativo' };
    if (cupom.usoMaximo && (cupom.usoAtual ?? 0) >= cupom.usoMaximo) {
      return { valido: false, motivo: 'Limite de uso atingido' };
    }
    const now = new Date();
    if (cupom.validoDe && new Date(cupom.validoDe) > now) return { valido: false, motivo: 'Cupom ainda não válido' };
    if (cupom.validoAte && new Date(cupom.validoAte) < now) return { valido: false, motivo: 'Cupom expirado' };
    return { valido: true, cupom };
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
