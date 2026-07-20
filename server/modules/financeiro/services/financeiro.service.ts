import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { contasPagar } from '../../../../backend/src/db/schema/fase1-ext';
import { contasReceber, transacoes } from '../../../../backend/src/db/schema/financeiro';

type Transacao = typeof transacoes.$inferSelect;
type ContaReceber = typeof contasReceber.$inferSelect;
type ContaPagar = typeof contasPagar.$inferSelect;

function toNum(v: unknown): number {
  if (v == null) return 0;
  return typeof v === 'string' ? parseFloat(v) || 0 : Number(v) || 0;
}

export class FinanceiroService {
  async listSummary() {
    const [tx, cr, cp] = await Promise.all([
      db.select().from(transacoes),
      db.select().from(contasReceber),
      db.select().from(contasPagar),
    ]);
    const receitas = tx
      .filter((t: Transacao) => t.tipo === 'receita')
      .reduce((s: number, t: Transacao) => s + toNum(t.valor), 0);
    const despesas = tx
      .filter((t: Transacao) => t.tipo === 'despesa')
      .reduce((s: number, t: Transacao) => s + toNum(t.valor), 0);
    const aReceber = cr
      .filter((c: ContaReceber) => c.status !== 'pago')
      .reduce((s: number, c: ContaReceber) => s + toNum(c.valor), 0);
    const aPagar = cp
      .filter((c: ContaPagar) => c.status !== 'pago')
      .reduce((s: number, c: ContaPagar) => s + toNum(c.valor), 0);
    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      contasReceberAberto: aReceber,
      contasPagarAberto: aPagar,
      fluxoLiquido: receitas - despesas + aReceber - aPagar,
    };
  }

  async getFluxoCaixa(inicio?: Date, fim?: Date) {
    const rows = await db.select().from(transacoes).orderBy(desc(transacoes.dataTransacao));
    const filtered = rows.filter((r: Transacao) => {
      const d = r.dataTransacao ? new Date(r.dataTransacao) : null;
      if (!d) return true;
      if (inicio && d < inicio) return false;
      if (fim && d > fim) return false;
      return true;
    });
    const entradas = filtered
      .filter((t: Transacao) => t.tipo === 'receita')
      .reduce((s: number, t: Transacao) => s + toNum(t.valor), 0);
    const saidas = filtered
      .filter((t: Transacao) => t.tipo === 'despesa')
      .reduce((s: number, t: Transacao) => s + toNum(t.valor), 0);
    return { periodo: { inicio, fim }, entradas, saidas, saldo: entradas - saidas, transacoes: filtered };
  }

  async listTransacoes(filters: { tipo?: string; status?: string } = {}) {
    const rows = await db.select().from(transacoes).orderBy(desc(transacoes.dataTransacao));
    return rows.filter((row: Transacao) => {
      if (filters.tipo && row.tipo !== filters.tipo) return false;
      if (filters.status && row.status !== filters.status) return false;
      return true;
    });
  }

  async getTransacao(id: number) {
    const [row] = await db.select().from(transacoes).where(eq(transacoes.id, id));
    return row ?? null;
  }

  async createTransacao(data: Record<string, unknown>) {
    const [created] = await db
      .insert(transacoes)
      .values(data as typeof transacoes.$inferInsert)
      .returning();
    return created;
  }

  async updateTransacao(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(transacoes)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof transacoes.$inferInsert>)
      .where(eq(transacoes.id, id))
      .returning();
    return updated ?? null;
  }

  async deleteTransacao(id: number) {
    const [deleted] = await db.delete(transacoes).where(eq(transacoes.id, id)).returning();
    return deleted ?? null;
  }

  async listContasReceber(status?: string) {
    if (status) return db.select().from(contasReceber).where(eq(contasReceber.status, status));
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
      .set({ valorRecebido, status: 'pago', recebidoEm: new Date(), updatedAt: new Date() })
      .where(eq(contasReceber.id, id))
      .returning();
    return updated ?? null;
  }

  async listContasPagar(status?: string) {
    if (status) return db.select().from(contasPagar).where(eq(contasPagar.status, status));
    return db.select().from(contasPagar).orderBy(desc(contasPagar.createdAt));
  }

  async createContaPagar(data: Record<string, unknown>) {
    const [created] = await db
      .insert(contasPagar)
      .values(data as typeof contasPagar.$inferInsert)
      .returning();
    return created;
  }

  async pagarConta(id: number, valorPago: string) {
    const [updated] = await db
      .update(contasPagar)
      .set({ valorPago, status: 'pago', pagoEm: new Date(), updatedAt: new Date() })
      .where(eq(contasPagar.id, id))
      .returning();
    return updated ?? null;
  }
}

export const financeiroService = new FinanceiroService();
module.exports = { FinanceiroService, financeiroService };
