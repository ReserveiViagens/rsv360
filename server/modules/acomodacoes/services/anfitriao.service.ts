import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { acomodacoes } from '../../../../backend/src/db/schema/acomodacoes';
import { carteiraCorretor } from '../../../../backend/src/db/schema/carteira-corretor';
import { disponibilidadeAcomodacao } from '../../../../backend/src/db/schema/disponibilidade-acomodacao';

const STAFF_ROLES = new Set(['admin', 'manager']);
const PARCEIRO_ROLES = new Set(['anfitriao', 'corretor']);

export interface AuthContext {
  userId: number;
  role: string;
}

async function proprietariosNaCarteira(corretorId: number): Promise<number[]> {
  const rows = await db
    .select({ proprietarioId: carteiraCorretor.proprietarioId })
    .from(carteiraCorretor)
    .where(
      and(eq(carteiraCorretor.corretorId, corretorId), eq(carteiraCorretor.status, 'ativo')),
    );
  return rows.map((r) => r.proprietarioId);
}

export async function podeVerUnidade(auth: AuthContext, row: typeof acomodacoes.$inferSelect) {
  if (STAFF_ROLES.has(auth.role)) return true;
  if (auth.role === 'anfitriao') return row.proprietarioId === auth.userId;
  if (auth.role === 'corretor') {
    if (row.proprietarioId === auth.userId) return true;
    const carteira = await proprietariosNaCarteira(auth.userId);
    return row.proprietarioId != null && carteira.includes(row.proprietarioId);
  }
  return false;
}

function escopoProprietarios(auth: AuthContext, proprietariosCarteira: number[]) {
  if (auth.role === 'anfitriao') {
    return eq(acomodacoes.proprietarioId, auth.userId);
  }
  if (auth.role === 'corretor') {
    const ids = [...new Set([auth.userId, ...proprietariosCarteira])];
    return inArray(acomodacoes.proprietarioId, ids);
  }
  return sql`true`;
}

export const anfitriaoService = {
  async listarMinhas(auth: AuthContext, page = 1, pageSize = 20) {
    if (!PARCEIRO_ROLES.has(auth.role) && !STAFF_ROLES.has(auth.role)) {
      return { items: [], total: 0, page, pageSize };
    }

    const offset = (Math.max(1, page) - 1) * pageSize;
    const proprietariosCarteira =
      auth.role === 'corretor' ? await proprietariosNaCarteira(auth.userId) : [];

    const whereScope = STAFF_ROLES.has(auth.role)
      ? sql`true`
      : escopoProprietarios(auth, proprietariosCarteira);

    const [rows, countRow] = await Promise.all([
      db
        .select()
        .from(acomodacoes)
        .where(whereScope)
        .orderBy(desc(acomodacoes.atualizadoEm))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(acomodacoes)
        .where(whereScope),
    ]);

    return { items: rows, total: countRow[0]?.count ?? 0, page, pageSize };
  },

  async obterUnidade(auth: AuthContext, id: number) {
    const [row] = await db.select().from(acomodacoes).where(eq(acomodacoes.id, id)).limit(1);
    if (!row) return { error: 'not_found' as const };
    const ok = await podeVerUnidade(auth, row);
    if (!ok) return { error: 'forbidden' as const };
    return { data: row };
  },

  async atualizarUnidade(
    auth: AuthContext,
    id: number,
    patch: Partial<{
      titulo: string;
      hotelId: string;
      proprietarioId: number;
      tipoId: number;
      codigoExterno: string;
      precoDiaria: string;
      utensilios: unknown;
      eletrodomesticos: unknown;
      amenidades: unknown;
      midia: unknown;
      capacidadeMax: number;
      statusPublicacao: string;
      dadosCompletos: boolean;
    }>,
  ) {
    const scoped = await this.obterUnidade(auth, id);
    if ('error' in scoped) return { error: scoped.error };

    const row = scoped.data;
    const {
      hotelId: _hotelId,
      proprietarioId: _proprietarioId,
      tipoId: _tipoId,
      codigoExterno: _codigoExterno,
      ...patchPermitido
    } = patch;

    const status = patchPermitido.statusPublicacao ?? row.statusPublicacao;
    const dadosCompletos =
      patchPermitido.dadosCompletos ??
      ['completo', 'em_aprovacao', 'publicado'].includes(String(status));

    const [updated] = await db
      .update(acomodacoes)
      .set({ ...patchPermitido, dadosCompletos, atualizadoEm: new Date() })
      .where(eq(acomodacoes.id, id))
      .returning();

    return { data: updated };
  },

  async enviarAprovacao(auth: AuthContext, id: number) {
    const scoped = await this.obterUnidade(auth, id);
    if ('error' in scoped) return { error: scoped.error };
    const row = scoped.data;

    if (row.statusPublicacao !== 'completo' || !row.dadosCompletos) {
      return { error: 'invalid_status' as const };
    }

    const [updated] = await db
      .update(acomodacoes)
      .set({
        statusPublicacao: 'em_aprovacao',
        dadosCompletos: true,
        atualizadoEm: new Date(),
      })
      .where(eq(acomodacoes.id, id))
      .returning();

    return { data: updated };
  },

  async aprovarUnidade(staffRole: string, id: number) {
    if (!STAFF_ROLES.has(staffRole)) return { error: 'forbidden' as const };

    const [updated] = await db
      .update(acomodacoes)
      .set({
        statusPublicacao: 'publicado',
        dadosCompletos: true,
        ativo: true,
        atualizadoEm: new Date(),
      })
      .where(and(eq(acomodacoes.id, id), eq(acomodacoes.statusPublicacao, 'em_aprovacao')))
      .returning();

    if (!updated) return { error: 'not_found' as const };
    return { data: updated };
  },

  async rejeitarUnidade(staffRole: string, id: number, motivo?: string) {
    if (!STAFF_ROLES.has(staffRole)) return { error: 'forbidden' as const };

    const [existing] = await db.select().from(acomodacoes).where(eq(acomodacoes.id, id)).limit(1);
    if (!existing) return { error: 'not_found' as const };

    const metadata = {
      ...(typeof existing.metadata === 'object' && existing.metadata ? existing.metadata : {}),
      motivoRejeicao: motivo ?? null,
    };

    const [updated] = await db
      .update(acomodacoes)
      .set({
        statusPublicacao: 'rejeitado',
        dadosCompletos: false,
        metadata,
        atualizadoEm: new Date(),
      })
      .where(eq(acomodacoes.id, id))
      .returning();

    return { data: updated };
  },

  async dashboardKpis(auth: AuthContext) {
    const { items } = await this.listarMinhas(auth, 1, 5000);
    const total = items.length;
    const incompletas = items.filter((i) => i.statusPublicacao === 'rascunho').length;
    const emAprovacao = items.filter((i) => i.statusPublicacao === 'em_aprovacao').length;
    const publicadas = items.filter((i) => i.statusPublicacao === 'publicado').length;
    return { total, incompletas, emAprovacao, publicadas };
  },

  async listarDisponibilidade(auth: AuthContext, acomodacaoId: number, de: string, ate: string) {
    const scoped = await this.obterUnidade(auth, acomodacaoId);
    if ('error' in scoped) return scoped;

    return db
      .select()
      .from(disponibilidadeAcomodacao)
      .where(
        and(
          eq(disponibilidadeAcomodacao.acomodacaoId, acomodacaoId),
          sql`${disponibilidadeAcomodacao.data} >= ${de}`,
          sql`${disponibilidadeAcomodacao.data} <= ${ate}`,
        ),
      )
      .orderBy(disponibilidadeAcomodacao.data);
  },

  async salvarDisponibilidade(
    auth: AuthContext,
    acomodacaoId: number,
    dias: Array<{ data: string; disponivel: boolean; precoOverride?: string; observacao?: string }>,
  ) {
    const scoped = await this.obterUnidade(auth, acomodacaoId);
    if ('error' in scoped) return { error: scoped.error };
    if (dias.length > 50) return { error: 'limit_exceeded' as const };

    for (const dia of dias) {
      const [existente] = await db
        .select()
        .from(disponibilidadeAcomodacao)
        .where(
          and(
            eq(disponibilidadeAcomodacao.acomodacaoId, acomodacaoId),
            eq(disponibilidadeAcomodacao.data, dia.data),
          ),
        )
        .limit(1);

      if (existente) {
        await db
          .update(disponibilidadeAcomodacao)
          .set({
            disponivel: dia.disponivel,
            precoOverride: dia.precoOverride ?? null,
            observacao: dia.observacao ?? null,
            atualizadoEm: new Date(),
          })
          .where(eq(disponibilidadeAcomodacao.id, existente.id));
      } else {
        await db.insert(disponibilidadeAcomodacao).values({
          acomodacaoId,
          data: dia.data,
          disponivel: dia.disponivel,
          precoOverride: dia.precoOverride ?? null,
          observacao: dia.observacao ?? null,
        });
      }
    }

    return { ok: true as const, count: dias.length };
  },

  async atribuirCarteira(staffRole: string, corretorId: number, proprietarioId: number) {
    if (!STAFF_ROLES.has(staffRole)) return { error: 'forbidden' as const };

    await db
      .insert(carteiraCorretor)
      .values({ corretorId, proprietarioId, status: 'ativo' })
      .onConflictDoUpdate({
        target: [carteiraCorretor.corretorId, carteiraCorretor.proprietarioId],
        set: { status: 'ativo' },
      });

    return { ok: true as const };
  },
};

module.exports = { anfitriaoService };
