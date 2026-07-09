import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { acomodacoes } from '../../../../backend/src/db/schema/acomodacoes';
import { wizardAddons } from '../../../../backend/src/db/schema/wizard-addons';
import { tiposAcomodacao } from '../../../../backend/src/db/schema/tipos-acomodacao';
import type { AcomodacaoDisponivel } from '@rsv360/shared';
import { isPremiumAncora, parseUpgradeVarandaMeta } from '@rsv360/shared';
import { tarifaService } from './tarifa.service';

export interface ListarAcomodacoesInput {
  hotelId: string;
  hospedes: number;
  page?: number;
  pageSize?: number;
  /** Data para resolução tarifária (YYYY-MM-DD); default hoje UTC */
  dataReferencia?: string;
  categoriaSlug?: string;
}

function rowToDisponivel(row: typeof acomodacoes.$inferSelect): AcomodacaoDisponivel {
  const upgrade = parseUpgradeVarandaMeta(row.metadata);
  return {
    id: row.id,
    titulo: row.titulo,
    quartos: row.quartos,
    configSala: row.configSala as AcomodacaoDisponivel['configSala'],
    configBanheiro: row.configBanheiro as AcomodacaoDisponivel['configBanheiro'],
    capacidadeMax: row.capacidadeMax,
    precoDiaria: Number(row.precoDiaria ?? 0),
    hotelId: row.hotelId,
    disponivel: row.capacidadeMax >= 0,
    upgradeVarandaDisponivel: upgrade.disponivel,
    upgradeVarandaValor: upgrade.valor,
    premiumAncora: isPremiumAncora(row.metadata),
  };
}

export const acomodacoesService = {
  async listarDisponiveis(input: ListarAcomodacoesInput) {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
    const offset = (page - 1) * pageSize;

    const conditions = and(
      eq(acomodacoes.hotelId, input.hotelId),
      eq(acomodacoes.ativo, true),
      eq(acomodacoes.statusPublicacao, 'publicado'),
    );

    const [rows, countRow] = await Promise.all([
      db
        .select()
        .from(acomodacoes)
        .where(conditions)
        .orderBy(desc(acomodacoes.capacidadeMax), asc(acomodacoes.precoDiaria))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(acomodacoes)
        .where(conditions),
    ]);

    const total = countRow[0]?.count ?? 0;
    const dataRef =
      input.dataReferencia ?? new Date().toISOString().slice(0, 10);
    const categoria = input.categoriaSlug ?? 'padrao';

    const items: AcomodacaoDisponivel[] = [];
    for (const row of rows) {
      const base = rowToDisponivel(row);
      try {
        const tarifa = await tarifaService.resolverTarifa({
          acomodacaoId: row.id,
          data: dataRef,
          categoriaSlug: categoria,
        });
        if (tarifa.motorAtivo && tarifa.precoFinal !== tarifa.precoBase) {
          base.precoDiaria = tarifa.precoFinal;
        }
      } catch {
        // mantém preco_diaria base
      }
      items.push(base);
    }

    return { items, total, page, pageSize };
  },

  async findById(id: number) {
    const [row] = await db.select().from(acomodacoes).where(eq(acomodacoes.id, id)).limit(1);
    return row ?? null;
  },

  async listarAddons(escopo = 'hotel') {
    return db
      .select()
      .from(wizardAddons)
      .where(and(eq(wizardAddons.ativo, true), eq(wizardAddons.escopo, escopo)))
      .orderBy(asc(wizardAddons.ordem));
  },

  async listarTipos() {
    return db
      .select()
      .from(tiposAcomodacao)
      .where(eq(tiposAcomodacao.ativo, true))
      .orderBy(asc(tiposAcomodacao.ordem));
  },

  async criarTipo(data: { slug: string; nome: string; icone?: string; ordem?: number }) {
    const [row] = await db.insert(tiposAcomodacao).values(data).returning();
    return row;
  },

  async atualizarTipo(id: number, data: Partial<{ nome: string; icone: string; ativo: boolean; ordem: number }>) {
    const [row] = await db.update(tiposAcomodacao).set(data).where(eq(tiposAcomodacao.id, id)).returning();
    return row ?? null;
  },

  async criarAddon(data: {
    nome: string;
    descricao?: string;
    precoTipo: string;
    valor: string;
    escopo?: string;
    requerConfigBanheiro?: string;
    ordem?: number;
  }) {
    const [row] = await db.insert(wizardAddons).values(data).returning();
    return row;
  },

  async atualizarAddon(
    id: number,
    data: Partial<{
      nome: string;
      descricao: string;
      precoTipo: string;
      valor: string;
      ativo: boolean;
      ordem: number;
    }>,
  ) {
    const [row] = await db.update(wizardAddons).set(data).where(eq(wizardAddons.id, id)).returning();
    return row ?? null;
  },

  async excluirAddon(id: number) {
    const [row] = await db
      .update(wizardAddons)
      .set({ ativo: false })
      .where(eq(wizardAddons.id, id))
      .returning();
    return row ?? null;
  },
};
