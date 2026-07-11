import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { acomodacoes } from '../../../../backend/src/db/schema/acomodacoes';
import { comissoesLancamento } from '../../../../backend/src/db/schema/comissoes-lancamento';
import { configuracoesSistema } from '../../../../backend/src/db/schema/configuracoes-sistema';
import { propostas } from '../../../../backend/src/db/schema/propostas';
import {
  COMISSOES_OFICIAL_RESERVEI,
  comissoesConfigSchema,
  type ComissoesConfigInput,
} from '../schema';

const CHAVE_CONFIG = 'comissoes';
const EVENTO_GERADOR = 'pagamento_confirmado';

export interface RegraComissaoAplicada {
  fonte: 'manual' | 'ia' | 'oficial_reservei_2026';
  atualizadoEm: string;
  motivoIa?: string;
  marca: string;
  split: {
    plataforma: number;
    corretor: number;
    proprietario: number;
  };
}

export interface ComissoesConfig {
  comissoesModuloAtivo: boolean;
  taxaPlataformaPct: number;
  taxaCorretorPct: number;
  margemProprietarioPct: number;
  regraAplicada?: RegraComissaoAplicada;
}

export interface ComissaoListItem {
  id: number;
  propostaId: number;
  acomodacaoId: number | null;
  papel: string;
  baseValor: string;
  percentual: string;
  valorComissao: string;
  status: string;
  eventoGerador: string;
  criadoEm: Date | null;
  propostaCodigo: string | null;
  propostaTitulo: string;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function parsePct(val: unknown, fallback: number) {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function parseRegraAplicada(raw: unknown): RegraComissaoAplicada | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const r = raw as Record<string, unknown>;
  const split = r.split as Record<string, unknown> | undefined;
  if (!split) return undefined;
  const plataforma = Number(split.plataforma);
  const corretor = Number(split.corretor);
  const proprietario = Number(split.proprietario);
  if (![plataforma, corretor, proprietario].every((n) => Number.isFinite(n))) return undefined;
  const fonte = r.fonte;
  if (fonte !== 'manual' && fonte !== 'ia' && fonte !== 'oficial_reservei_2026') return undefined;
  return {
    fonte,
    atualizadoEm: String(r.atualizado_em ?? r.atualizadoEm ?? new Date().toISOString()),
    motivoIa: r.motivo_ia != null ? String(r.motivo_ia) : undefined,
    marca: String(r.marca ?? COMISSOES_OFICIAL_RESERVEI.marca),
    split: { plataforma, corretor, proprietario },
  };
}

function configFromRow(valores: Record<string, unknown>): ComissoesConfig {
  const taxaPlataformaPct = parsePct(valores.taxa_plataforma_pct, COMISSOES_OFICIAL_RESERVEI.taxaPlataformaPct);
  const taxaCorretorPct = parsePct(valores.taxa_corretor_pct, COMISSOES_OFICIAL_RESERVEI.taxaCorretorPct);
  return {
    comissoesModuloAtivo: valores.comissoes_modulo_ativo === true,
    taxaPlataformaPct,
    taxaCorretorPct,
    margemProprietarioPct: Math.max(0, 100 - taxaPlataformaPct - taxaCorretorPct),
    regraAplicada: parseRegraAplicada(valores.regra_aplicada),
  };
}

function buildRegraAplicada(
  config: Pick<ComissoesConfigInput, 'taxaPlataformaPct' | 'taxaCorretorPct'>,
  fonte: RegraComissaoAplicada['fonte'],
  motivoIa?: string,
): RegraComissaoAplicada {
  const proprietario = Math.max(0, 100 - config.taxaPlataformaPct - config.taxaCorretorPct);
  return {
    fonte,
    atualizadoEm: new Date().toISOString(),
    motivoIa,
    marca: COMISSOES_OFICIAL_RESERVEI.marca,
    split: {
      plataforma: config.taxaPlataformaPct,
      corretor: config.taxaCorretorPct,
      proprietario,
    },
  };
}
function parseMetadata(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export function calcularSplitComissoes(
  baseValor: number,
  config: Pick<ComissoesConfig, 'taxaPlataformaPct' | 'taxaCorretorPct'>,
  opts: { temCorretor: boolean },
) {
  const taxaPlataforma = config.taxaPlataformaPct;
  const taxaCorretor = opts.temCorretor ? config.taxaCorretorPct : 0;
  const taxaProprietario = Math.max(0, 100 - taxaPlataforma - taxaCorretor);

  const valorPlataforma = roundMoney((baseValor * taxaPlataforma) / 100);
  const valorCorretor = roundMoney((baseValor * taxaCorretor) / 100);
  const valorProprietario = roundMoney((baseValor * taxaProprietario) / 100);

  return {
    plataforma: { percentual: taxaPlataforma, valor: valorPlataforma },
    corretor: { percentual: taxaCorretor, valor: valorCorretor },
    proprietario: { percentual: taxaProprietario, valor: valorProprietario },
  };
}

export const comissoesService = {
  async getConfig(): Promise<ComissoesConfig> {
    const [row] = await db
      .select()
      .from(configuracoesSistema)
      .where(eq(configuracoesSistema.chave, CHAVE_CONFIG))
      .limit(1);
    const valores = (row?.valores ?? {}) as Record<string, unknown>;
    return configFromRow(valores);
  },

  async salvarConfig(
    partial: Partial<ComissoesConfigInput>,
    opts: { fonte: 'manual' | 'ia'; motivoIa?: string } = { fonte: 'manual' },
  ): Promise<ComissoesConfig> {
    const atual = await this.getConfig();
    const merged = comissoesConfigSchema.parse({
      comissoesModuloAtivo: partial.comissoesModuloAtivo ?? atual.comissoesModuloAtivo,
      taxaPlataformaPct: partial.taxaPlataformaPct ?? atual.taxaPlataformaPct,
      taxaCorretorPct: partial.taxaCorretorPct ?? atual.taxaCorretorPct,
    });

    const regra = buildRegraAplicada(merged, opts.fonte === 'ia' ? 'ia' : 'manual', opts.motivoIa);
    const valoresDb = {
      comissoes_modulo_ativo: merged.comissoesModuloAtivo,
      taxa_plataforma_pct: merged.taxaPlataformaPct,
      taxa_corretor_pct: merged.taxaCorretorPct,
      regra_aplicada: {
        fonte: regra.fonte,
        atualizado_em: regra.atualizadoEm,
        motivo_ia: regra.motivoIa,
        marca: regra.marca,
        split: regra.split,
      },
    };

    const [existing] = await db
      .select()
      .from(configuracoesSistema)
      .where(eq(configuracoesSistema.chave, CHAVE_CONFIG))
      .limit(1);

    if (existing) {
      await db
        .update(configuracoesSistema)
        .set({ valores: valoresDb, updatedAt: new Date() })
        .where(eq(configuracoesSistema.chave, CHAVE_CONFIG));
    } else {
      await db.insert(configuracoesSistema).values({
        chave: CHAVE_CONFIG,
        valores: valoresDb,
      });
    }

    return configFromRow(valoresDb);
  },

  async listarMinhas(userId: number, page = 1, pageSize = 20) {
    const safePage = Math.max(1, page);
    const safeSize = Math.min(100, Math.max(1, pageSize));
    const offset = (safePage - 1) * safeSize;

    const rows = await db
      .select({
        id: comissoesLancamento.id,
        propostaId: comissoesLancamento.propostaId,
        acomodacaoId: comissoesLancamento.acomodacaoId,
        papel: comissoesLancamento.papel,
        baseValor: comissoesLancamento.baseValor,
        percentual: comissoesLancamento.percentual,
        valorComissao: comissoesLancamento.valorComissao,
        status: comissoesLancamento.status,
        eventoGerador: comissoesLancamento.eventoGerador,
        criadoEm: comissoesLancamento.criadoEm,
        propostaCodigo: propostas.codigo,
        propostaTitulo: propostas.titulo,
      })
      .from(comissoesLancamento)
      .innerJoin(propostas, eq(comissoesLancamento.propostaId, propostas.id))
      .where(eq(comissoesLancamento.beneficiarioUserId, userId))
      .orderBy(desc(comissoesLancamento.criadoEm))
      .limit(safeSize)
      .offset(offset);

    return {
      items: rows as ComissaoListItem[],
      page: safePage,
      pageSize: safeSize,
    };
  },

  /**
   * MVP-B: chamar após pagamento confirmado (proposta.status = paid).
   * MVP-A: retorna cedo se comissoes_modulo_ativo = false.
   */
  async gerarLancamentos(propostaId: number) {
    const config = await this.getConfig();
    if (!config.comissoesModuloAtivo) {
      return { generated: false, reason: 'module_disabled' as const };
    }

    const [proposta] = await db.select().from(propostas).where(eq(propostas.id, propostaId)).limit(1);
    if (!proposta) {
      return { generated: false, reason: 'proposta_not_found' as const };
    }
    if (proposta.status !== 'paid') {
      return { generated: false, reason: 'proposta_not_paid' as const };
    }

    const metadata = parseMetadata(proposta.metadata);
    const acomodacaoId = Number(metadata.acomodacaoId ?? metadata.selectedAcomodacaoId ?? 0) || null;
    const corretorId = Number(metadata.corretorId ?? 0) || null;

    if (!acomodacaoId) {
      return { generated: false, reason: 'acomodacao_missing' as const };
    }

    const [acomodacao] = await db
      .select({ proprietarioId: acomodacoes.proprietarioId })
      .from(acomodacoes)
      .where(eq(acomodacoes.id, acomodacaoId))
      .limit(1);
    if (!acomodacao?.proprietarioId) {
      return { generated: false, reason: 'proprietario_missing' as const };
    }

    const baseValor = Number(proposta.valorTotal);
    if (!Number.isFinite(baseValor) || baseValor <= 0) {
      return { generated: false, reason: 'invalid_base_valor' as const };
    }

    const split = calcularSplitComissoes(baseValor, config, { temCorretor: corretorId != null && corretorId > 0 });

    const lancamentos: Array<typeof comissoesLancamento.$inferInsert> = [
      {
        propostaId,
        acomodacaoId,
        beneficiarioUserId: acomodacao.proprietarioId,
        papel: 'proprietario',
        baseValor: baseValor.toFixed(2),
        percentual: split.proprietario.percentual.toFixed(2),
        valorComissao: split.proprietario.valor.toFixed(2),
        status: 'confirmada',
        eventoGerador: EVENTO_GERADOR,
      },
    ];

    if (corretorId && corretorId > 0 && split.corretor.valor > 0) {
      lancamentos.push({
        propostaId,
        acomodacaoId,
        beneficiarioUserId: corretorId,
        papel: 'corretor',
        baseValor: baseValor.toFixed(2),
        percentual: split.corretor.percentual.toFixed(2),
        valorComissao: split.corretor.valor.toFixed(2),
        status: 'confirmada',
        eventoGerador: EVENTO_GERADOR,
      });
    }

    const inserted: number[] = [];
    for (const row of lancamentos) {
      const existing = await db
        .select({ id: comissoesLancamento.id })
        .from(comissoesLancamento)
        .where(
          and(
            eq(comissoesLancamento.propostaId, row.propostaId!),
            eq(comissoesLancamento.beneficiarioUserId, row.beneficiarioUserId!),
            eq(comissoesLancamento.papel, row.papel!),
          ),
        )
        .limit(1);
      if (existing.length > 0) continue;

      const [created] = await db.insert(comissoesLancamento).values(row).returning({ id: comissoesLancamento.id });
      if (created) inserted.push(created.id);
    }

    return { generated: true, insertedIds: inserted };
  },
};

module.exports = { comissoesService, calcularSplitComissoes };
