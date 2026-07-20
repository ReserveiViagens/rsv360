import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { orcamentos } from '../../../../backend/src/db/schema/orcamentos';
import { propostas } from '../../../../backend/src/db/schema/propostas';
import { passageiros } from '../../../../backend/src/db/schema/passageiros';
import { transacoes } from '../../../../backend/src/db/schema/financeiro';
import { campanhas } from '../../../../backend/src/db/schema/marketing';
import { relatoriosSnapshots, relatoriosViews } from '../../../../backend/src/db/schema/relatorios';

type Proposta = typeof propostas.$inferSelect;

function escapeCsv(val: unknown): string {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export class RelatoriosService {
  async getDashboard() {
    const [orc, prop, pass, tx, camp] = await Promise.all([
      db.select().from(orcamentos),
      db.select().from(propostas),
      db.select().from(passageiros),
      db.select().from(transacoes),
      db.select().from(campanhas),
    ]);
    return {
      orcamentos: orc.length,
      propostas: prop.length,
      propostasAceitas: prop.filter((p: Proposta) => p.status === 'accepted').length,
      passageiros: pass.length,
      transacoes: tx.length,
      campanhas: camp.length,
      receitaEstimada: prop
        .filter((p: Proposta) => p.status === 'accepted')
        .reduce((s: number, p: Proposta) => s + parseFloat(String(p.valorTotal) || '0'), 0),
    };
  }

  async listViews(userId?: number) {
    if (userId) {
      return db.select().from(relatoriosViews).where(eq(relatoriosViews.userId, userId));
    }
    return db.select().from(relatoriosViews).orderBy(desc(relatoriosViews.createdAt));
  }

  async getView(id: number) {
    const [row] = await db.select().from(relatoriosViews).where(eq(relatoriosViews.id, id));
    return row ?? null;
  }

  async createView(data: Record<string, unknown>) {
    const [created] = await db
      .insert(relatoriosViews)
      .values(data as typeof relatoriosViews.$inferInsert)
      .returning();
    return created;
  }

  async updateView(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(relatoriosViews)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof relatoriosViews.$inferInsert>)
      .where(eq(relatoriosViews.id, id))
      .returning();
    return updated ?? null;
  }

  async deleteView(id: number) {
    const [deleted] = await db.delete(relatoriosViews).where(eq(relatoriosViews.id, id)).returning();
    return deleted ?? null;
  }

  async createSnapshot(data: Record<string, unknown>) {
    const [created] = await db
      .insert(relatoriosSnapshots)
      .values(data as typeof relatoriosSnapshots.$inferInsert)
      .returning();
    return created;
  }

  async listSnapshots(viewId?: number) {
    if (viewId) {
      return db.select().from(relatoriosSnapshots).where(eq(relatoriosSnapshots.viewId, viewId));
    }
    return db.select().from(relatoriosSnapshots).orderBy(desc(relatoriosSnapshots.createdAt));
  }

  async exportCsv(tipo: string) {
    let rows: Record<string, unknown>[] = [];
    let headers: string[] = [];

    if (tipo === 'orcamentos') {
      rows = await db.select().from(orcamentos);
      headers = ['id', 'codigo', 'titulo', 'clienteNome', 'status', 'total'];
    } else if (tipo === 'propostas') {
      rows = await db.select().from(propostas);
      headers = ['id', 'titulo', 'clienteNome', 'status', 'valorTotal'];
    } else if (tipo === 'passageiros') {
      rows = await db.select().from(passageiros);
      headers = ['id', 'nome', 'email', 'cpf', 'tipo'];
    } else if (tipo === 'transacoes') {
      rows = await db.select().from(transacoes);
      headers = ['id', 'tipo', 'descricao', 'valor', 'status', 'dataTransacao'];
    } else {
      const dash = await this.getDashboard();
      rows = [dash as Record<string, unknown>];
      headers = Object.keys(dash);
    }

    const lines = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(',')),
    ];
    return lines.join('\n');
  }

  async exportPdfHtml(tipo: string) {
    const dash = await this.getDashboard();
    const csv = await this.exportCsv(tipo === 'dashboard' ? 'dashboard' : tipo);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório ${tipo}</title></head>
<body><h1>RSV360 — Relatório ${tipo}</h1><p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
<pre>${csv.replace(/</g, '&lt;')}</pre>
<h2>Dashboard</h2><pre>${JSON.stringify(dash, null, 2)}</pre></body></html>`;
  }
}

export const relatoriosService = new RelatoriosService();
module.exports = { RelatoriosService, relatoriosService };
