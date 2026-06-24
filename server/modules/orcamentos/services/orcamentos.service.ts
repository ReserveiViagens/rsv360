import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { orcamentoItens, orcamentos } from '../../../../backend/src/db/schema/orcamentos';
import { propostasService } from '../../propostas/services/propostas.service';

function toNum(v: unknown): number {
  if (v == null) return 0;
  return typeof v === 'string' ? parseFloat(v) || 0 : Number(v) || 0;
}

export class OrcamentosService {
  async list(filters: { status?: string; enterpriseId?: number } = {}) {
    const conditions = [];
    if (filters.status) conditions.push(eq(orcamentos.status, filters.status));
    if (filters.enterpriseId) conditions.push(eq(orcamentos.enterpriseId, filters.enterpriseId));

    const query = db.select().from(orcamentos).orderBy(desc(orcamentos.createdAt));
    if (conditions.length) return query.where(and(...conditions));
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

  async recalculateTotals(orcamentoId: number) {
    const itens = await db
      .select()
      .from(orcamentoItens)
      .where(eq(orcamentoItens.orcamentoId, orcamentoId));
    const subtotal = itens.reduce((sum, i) => sum + toNum(i.precoTotal), 0);
    const [orc] = await db.select().from(orcamentos).where(eq(orcamentos.id, orcamentoId));
    if (!orc) return null;
    const desconto = toNum(orc.desconto);
    const impostos = toNum(orc.impostos);
    const total = Math.max(0, subtotal - desconto + impostos);
    const [updated] = await db
      .update(orcamentos)
      .set({ subtotal: String(subtotal), total: String(total), updatedAt: new Date() })
      .where(eq(orcamentos.id, orcamentoId))
      .returning();
    return updated;
  }

  async create(data: Record<string, unknown>, actorId?: number) {
    const codigo = (data.codigo as string) || `ORC-${Date.now().toString(36).toUpperCase()}`;
    const [created] = await db
      .insert(orcamentos)
      .values({ ...data, codigo, criadoPor: actorId ?? null } as typeof orcamentos.$inferInsert)
      .returning();
    return created;
  }

  async update(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(orcamentos)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof orcamentos.$inferInsert>)
      .where(eq(orcamentos.id, id))
      .returning();
    if (updated) await this.recalculateTotals(id);
    return updated ?? null;
  }

  async remove(id: number) {
    const [deleted] = await db.delete(orcamentos).where(eq(orcamentos.id, id)).returning();
    return deleted ?? null;
  }

  async addItem(orcamentoId: number, item: Record<string, unknown>) {
    const qty = toNum(item.quantidade) || 1;
    const unit = toNum(item.precoUnitario);
    const precoTotal = item.precoTotal != null ? String(item.precoTotal) : String(qty * unit);
    const [created] = await db
      .insert(orcamentoItens)
      .values({ ...item, orcamentoId, precoTotal } as typeof orcamentoItens.$inferInsert)
      .returning();
    await this.recalculateTotals(orcamentoId);
    return created;
  }

  async updateItem(orcamentoId: number, itemId: number, item: Record<string, unknown>) {
    const qty = item.quantidade != null ? toNum(item.quantidade) : undefined;
    const unit = item.precoUnitario != null ? toNum(item.precoUnitario) : undefined;
    let precoTotal = item.precoTotal;
    if (qty != null && unit != null) precoTotal = String(qty * unit);
    const [updated] = await db
      .update(orcamentoItens)
      .set({ ...item, ...(precoTotal != null ? { precoTotal: String(precoTotal) } : {}) } as Partial<
        typeof orcamentoItens.$inferInsert
      >)
      .where(and(eq(orcamentoItens.id, itemId), eq(orcamentoItens.orcamentoId, orcamentoId)))
      .returning();
    if (updated) await this.recalculateTotals(orcamentoId);
    return updated ?? null;
  }

  async removeItem(orcamentoId: number, itemId: number) {
    const [deleted] = await db
      .delete(orcamentoItens)
      .where(and(eq(orcamentoItens.id, itemId), eq(orcamentoItens.orcamentoId, orcamentoId)))
      .returning();
    if (deleted) await this.recalculateTotals(orcamentoId);
    return deleted ?? null;
  }

  async convertToProposta(orcamentoId: number, actorId?: number) {
    return propostasService.createFromOrcamento(orcamentoId, actorId);
  }
}

export const orcamentosService = new OrcamentosService();
module.exports = { OrcamentosService, orcamentosService };
