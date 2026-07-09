import { and, asc, desc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { acomodacoes } from '../../../../backend/src/db/schema/acomodacoes';
import { configuracoesSistema } from '../../../../backend/src/db/schema/configuracoes-sistema';
import { empreendimentos } from '../../../../backend/src/db/schema/empreendimentos';
import { tarifaCategoria } from '../../../../backend/src/db/schema/tarifa-categoria';
import { tarifaRegra } from '../../../../backend/src/db/schema/tarifa-regra';
import { tarifaTemporada, tarifaTemporadaPeriodo } from '../../../../backend/src/db/schema/tarifa-temporada';

const CHAVE_CONFIG = 'tarifario';

export interface ResolverTarifaInput {
  acomodacaoId: number;
  data: string;
  categoriaSlug?: string;
  /** Staff-only: resolve regras sem exigir motor ligado (não altera config). */
  preview?: boolean;
}

export interface TrilhaTarifa {
  passo: string;
  detalhe?: string;
}

export interface ResultadoTarifa {
  precoBase: number;
  precoFinal: number;
  temporada: { id: number; slug: string; nome: string } | null;
  categoria: { id: number; slug: string; nome: string } | null;
  regraAplicada: { id: number; nivel: string; tipoValor: string; valor: number } | null;
  trilha: TrilhaTarifa[];
  motorAtivo: boolean;
}

type RegraRow = typeof tarifaRegra.$inferSelect;

function nivelScore(nivel: string) {
  if (nivel === 'unidade') return 3;
  if (nivel === 'empreendimento') return 2;
  return 1;
}

function aplicarTipoValor(base: number, tipo: string, valor: number) {
  switch (tipo) {
    case 'absoluto':
      return valor;
    case 'multiplicador':
      return base * valor;
    case 'delta':
      return base + valor;
    case 'desconto_percentual':
      return base * (1 - valor / 100);
    default:
      return base;
  }
}

function dataNoIntervalo(data: string, inicio: string, fim: string) {
  return data >= inicio && data <= fim;
}

export const tarifaService = {
  async getConfig() {
    const [row] = await db
      .select()
      .from(configuracoesSistema)
      .where(eq(configuracoesSistema.chave, CHAVE_CONFIG))
      .limit(1);
    const valores = (row?.valores ?? {}) as Record<string, unknown>;
    return { tarifarioDinamicoAtivo: valores.tarifario_dinamico_ativo === true };
  },

  async setConfig(tarifarioDinamicoAtivo: boolean) {
    const [existing] = await db
      .select()
      .from(configuracoesSistema)
      .where(eq(configuracoesSistema.chave, CHAVE_CONFIG))
      .limit(1);

    if (existing) {
      await db
        .update(configuracoesSistema)
        .set({
          valores: { ...(existing.valores as object), tarifario_dinamico_ativo: tarifarioDinamicoAtivo },
          updatedAt: new Date(),
        })
        .where(eq(configuracoesSistema.chave, CHAVE_CONFIG));
    } else {
      await db.insert(configuracoesSistema).values({
        chave: CHAVE_CONFIG,
        valores: { tarifario_dinamico_ativo: tarifarioDinamicoAtivo },
      });
    }
    return { tarifarioDinamicoAtivo };
  },

  async isMotorAtivoParaUnidade(acomodacaoId: number, hotelId: string) {
    const global = await this.getConfig();
    if (!global.tarifarioDinamicoAtivo) return false;

    const [emp] = await db
      .select({ flag: empreendimentos.tarifarioDinamicoAtivo })
      .from(empreendimentos)
      .where(eq(empreendimentos.hotelId, hotelId))
      .limit(1);

    if (emp?.flag === false) return false;
    if (emp?.flag === true) return true;
    return global.tarifarioDinamicoAtivo;
  },

  async resolverTemporada(data: string) {
    const periodos = await db
      .select({
        temporadaId: tarifaTemporadaPeriodo.temporadaId,
        prioridade: tarifaTemporada.prioridade,
        slug: tarifaTemporada.slug,
        nome: tarifaTemporada.nome,
        dataInicio: tarifaTemporadaPeriodo.dataInicio,
        dataFim: tarifaTemporadaPeriodo.dataFim,
      })
      .from(tarifaTemporadaPeriodo)
      .innerJoin(tarifaTemporada, eq(tarifaTemporadaPeriodo.temporadaId, tarifaTemporada.id))
      .where(
        and(
          eq(tarifaTemporadaPeriodo.ativo, true),
          eq(tarifaTemporada.ativo, true),
          lte(tarifaTemporadaPeriodo.dataInicio, data),
          gte(tarifaTemporadaPeriodo.dataFim, data),
        ),
      )
      .orderBy(desc(tarifaTemporada.prioridade));

    const match = periodos.find((p) =>
      dataNoIntervalo(data, String(p.dataInicio), String(p.dataFim)),
    );
    if (!match) return null;
    return {
      id: match.temporadaId,
      slug: match.slug,
      nome: match.nome,
    };
  },

  escolherRegra(candidatas: RegraRow[], temporadaId: number | null, categoriaId: number | null) {
    const filtradas = candidatas.filter((r) => {
      if (r.temporadaId != null && r.temporadaId !== temporadaId) return false;
      if (r.categoriaId != null && r.categoriaId !== categoriaId) return false;
      return true;
    });

    filtradas.sort((a, b) => {
      const specA =
        nivelScore(a.nivel) * 100 +
        (a.temporadaId != null ? 10 : 0) +
        (a.categoriaId != null ? 1 : 0);
      const specB =
        nivelScore(b.nivel) * 100 +
        (b.temporadaId != null ? 10 : 0) +
        (b.categoriaId != null ? 1 : 0);
      if (specB !== specA) return specB - specA;
      return (b.prioridade ?? 0) - (a.prioridade ?? 0);
    });

    return filtradas[0] ?? null;
  },

  async resolverTarifa(input: ResolverTarifaInput): Promise<ResultadoTarifa> {
    const trilha: TrilhaTarifa[] = [];
    const categoriaSlug = input.categoriaSlug ?? 'padrao';

    const [unit] = await db
      .select()
      .from(acomodacoes)
      .where(eq(acomodacoes.id, input.acomodacaoId))
      .limit(1);

    if (!unit) {
      throw new Error(`Acomodação ${input.acomodacaoId} não encontrada`);
    }

    const precoBase = Number(unit.precoDiaria ?? 0);
    trilha.push({ passo: 'base', detalhe: `preco_diaria=${precoBase}` });

    const motorAtivo = await this.isMotorAtivoParaUnidade(unit.id, unit.hotelId);
    const preview = input.preview === true;
    if (!motorAtivo && !preview) {
      trilha.push({ passo: 'motor_off', detalhe: 'toggle desligado' });
      return {
        precoBase,
        precoFinal: precoBase,
        temporada: null,
        categoria: null,
        regraAplicada: null,
        trilha,
        motorAtivo: false,
      };
    }

    if (preview && !motorAtivo) {
      trilha.push({ passo: 'preview', detalhe: 'motor off — resolução dry-run' });
    } else {
      trilha.push({ passo: 'motor_on' });
    }

    const [categoria] = await db
      .select()
      .from(tarifaCategoria)
      .where(and(eq(tarifaCategoria.slug, categoriaSlug), eq(tarifaCategoria.ativo, true)))
      .limit(1);

    const temporada = await this.resolverTemporada(input.data);
    if (temporada) {
      trilha.push({ passo: 'temporada', detalhe: temporada.slug });
    } else {
      trilha.push({ passo: 'temporada', detalhe: 'nenhuma (qualquer)' });
    }

    const candidatas = await db
      .select()
      .from(tarifaRegra)
      .where(
        and(
          eq(tarifaRegra.ativo, true),
          or(
            and(eq(tarifaRegra.nivel, 'unidade'), eq(tarifaRegra.acomodacaoId, unit.id)),
            and(eq(tarifaRegra.nivel, 'empreendimento'), eq(tarifaRegra.hotelId, unit.hotelId)),
            eq(tarifaRegra.nivel, 'global'),
          ),
          or(isNull(tarifaRegra.vigenciaInicio), lte(tarifaRegra.vigenciaInicio, input.data)),
          or(isNull(tarifaRegra.vigenciaFim), gte(tarifaRegra.vigenciaFim, input.data)),
        ),
      );

    const regra = this.escolherRegra(
      candidatas,
      temporada?.id ?? null,
      categoria?.id ?? null,
    );

    let precoFinal = precoBase;
    if (regra) {
      precoFinal = aplicarTipoValor(precoBase, regra.tipoValor, Number(regra.valor));
      trilha.push({
        passo: 'regra',
        detalhe: `id=${regra.id} ${regra.tipoValor}=${regra.valor}`,
      });
    } else {
      trilha.push({ passo: 'regra', detalhe: 'nenhuma — mantém base' });
    }

    if (categoria?.descontoPercentual) {
      const pct = Number(categoria.descontoPercentual);
      if (pct > 0) {
        precoFinal = precoFinal * (1 - pct / 100);
        trilha.push({ passo: 'categoria_desconto', detalhe: `${categoria.slug} -${pct}%` });
      }
    }

    precoFinal = Math.round(precoFinal * 100) / 100;

    return {
      precoBase,
      precoFinal,
      temporada,
      categoria: categoria
        ? { id: categoria.id, slug: categoria.slug, nome: categoria.nome }
        : null,
      regraAplicada: regra
        ? {
            id: regra.id,
            nivel: regra.nivel,
            tipoValor: regra.tipoValor,
            valor: Number(regra.valor),
          }
        : null,
      trilha,
      // Preview staff não liga o motor; flag reflete o toggle real.
      motorAtivo,
    };
  },

  // CRUD helpers
  listCategorias() {
    return db.select().from(tarifaCategoria).orderBy(asc(tarifaCategoria.slug));
  },

  listTemporadas() {
    return db.select().from(tarifaTemporada).orderBy(asc(tarifaTemporada.slug));
  },

  listPeriodos(temporadaId: number) {
    return db
      .select()
      .from(tarifaTemporadaPeriodo)
      .where(eq(tarifaTemporadaPeriodo.temporadaId, temporadaId))
      .orderBy(asc(tarifaTemporadaPeriodo.dataInicio));
  },

  listRegras() {
    return db.select().from(tarifaRegra).orderBy(desc(tarifaRegra.prioridade));
  },

  async criarCategoria(data: {
    slug: string;
    nome: string;
    descontoPercentual?: string;
    ativo?: boolean;
    criadoPor?: number;
  }) {
    const [row] = await db.insert(tarifaCategoria).values(data).returning();
    return row;
  },

  async atualizarCategoria(id: number, patch: Partial<typeof tarifaCategoria.$inferInsert>) {
    const [row] = await db
      .update(tarifaCategoria)
      .set({ ...patch, atualizadoEm: new Date() })
      .where(eq(tarifaCategoria.id, id))
      .returning();
    return row ?? null;
  },

  async criarTemporada(data: { slug: string; nome: string; cor?: string; prioridade?: number }) {
    const [row] = await db.insert(tarifaTemporada).values(data).returning();
    return row;
  },

  async criarPeriodo(data: {
    temporadaId: number;
    dataInicio: string;
    dataFim: string;
  }) {
    const [row] = await db.insert(tarifaTemporadaPeriodo).values(data).returning();
    return row;
  },

  async criarRegra(data: typeof tarifaRegra.$inferInsert) {
    const [row] = await db.insert(tarifaRegra).values(data).returning();
    return row;
  },

  async atualizarRegra(id: number, patch: Partial<typeof tarifaRegra.$inferInsert>) {
    const [row] = await db
      .update(tarifaRegra)
      .set({ ...patch, atualizadoEm: new Date() })
      .where(eq(tarifaRegra.id, id))
      .returning();
    return row ?? null;
  },

  async deletarRegra(id: number) {
    await db.delete(tarifaRegra).where(eq(tarifaRegra.id, id));
  },
};

module.exports = { tarifaService };
