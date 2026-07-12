/**
 * Taxa de Segurança e Tecnologia (hóspede) + split comissões em centavos.
 * Fonte única para wizard (client) e backend (server).
 */

/** Diárias e upgrade varanda em `buildOrcamentoItens` usam categoria `hotel`. */
export const CATEGORIAS_BASE_ELEGIVEL = ['hotel'] as const;

/** Categorias reais em montar-roteiro.ts — fora da base da taxa 2%. */
export const CATEGORIAS_FORA_BASE_TAXA = [
  'ticket',
  'attraction',
  'breakfast',
  'accommodation',
  'insurance',
  'taxa_hospede',
  'taxa_parque',
] as const;

export const TAXA_HOSPEDE_PCT_DEFAULT = 2;

export const TAXA_HOSPEDE_DEFAULT_RESERVEI = {
  taxaHospedePct: TAXA_HOSPEDE_PCT_DEFAULT,
  taxaHospedeAtiva: false,
  taxaHospedeNome: 'Taxa de Segurança e Tecnologia',
  taxaHospedeDescricao: 'Inclui proteção da reserva, antifraude e suporte digital',
} as const;

export interface OrcamentoItemBase {
  categoria: string;
  precoTotal: string | number;
}

export interface SplitComissoesConfig {
  taxaPlataformaPct: number;
  taxaCorretorPct: number;
}

export interface SplitComissoesResult {
  plataforma: { percentual: number; valor: number };
  corretor: { percentual: number; valor: number };
  proprietario: { percentual: number; valor: number };
}

export interface TaxaHospedeResult {
  pct: number;
  valor: number;
  ativa: boolean;
}

/** Arredondamento monetário half-up em centavos inteiros. */
export function roundCentavosHalfUp(valor: number): number {
  if (!Number.isFinite(valor)) return 0;
  return Math.round(valor * 100) / 100;
}

export function toCentavos(valor: number): number {
  return Math.round(roundCentavosHalfUp(valor) * 100);
}

export function fromCentavos(centavos: number): number {
  return centavos / 100;
}

export function resolveTaxaHospedePct(raw: unknown, ativa: boolean): number {
  if (!ativa) return TAXA_HOSPEDE_PCT_DEFAULT;
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0 && n <= 10) return n;
  return TAXA_HOSPEDE_PCT_DEFAULT;
}

/**
 * Soma itens elegíveis (hotel) + add-ons resolvidos server-side (somente quando taxa ON).
 */
export function calcularBaseElegivelTaxa(
  itens: OrcamentoItemBase[],
  addonTotal = 0,
): number {
  let base = 0;
  for (const item of itens) {
    if (!CATEGORIAS_BASE_ELEGIVEL.includes(item.categoria as (typeof CATEGORIAS_BASE_ELEGIVEL)[number])) {
      continue;
    }
    const v = Number(item.precoTotal);
    if (Number.isFinite(v) && v > 0) base += v;
  }
  const addons = Number(addonTotal);
  if (Number.isFinite(addons) && addons > 0) base += addons;
  return roundCentavosHalfUp(base);
}

export function calcularTaxaHospede(
  baseElegivel: number,
  pct: number,
  ativa: boolean,
): TaxaHospedeResult {
  if (!ativa || baseElegivel <= 0) {
    return { pct: resolveTaxaHospedePct(pct, false), valor: 0, ativa: false };
  }
  const effectivePct = resolveTaxaHospedePct(pct, true);
  if (effectivePct <= 0) {
    return { pct: effectivePct, valor: 0, ativa: true };
  }
  const baseC = toCentavos(baseElegivel);
  const valorC = Math.round((baseC * effectivePct) / 100);
  return {
    pct: effectivePct,
    valor: fromCentavos(valorC),
    ativa: true,
  };
}

/** Split sobre a base SEM a taxa do hóspede; anfitrião absorve residual em centavos. */
export function calcularSplitComissoesCentavos(
  baseValor: number,
  config: SplitComissoesConfig,
  opts: { temCorretor: boolean },
): SplitComissoesResult {
  const baseC = toCentavos(baseValor);
  const taxaPlataforma = config.taxaPlataformaPct;
  const taxaCorretor = opts.temCorretor ? config.taxaCorretorPct : 0;
  const taxaProprietario = Math.max(0, 100 - taxaPlataforma - taxaCorretor);

  const valorPlataformaC = Math.round((baseC * taxaPlataforma) / 100);
  const valorCorretorC = Math.round((baseC * taxaCorretor) / 100);
  const valorProprietarioC = baseC - valorPlataformaC - valorCorretorC;

  return {
    plataforma: { percentual: taxaPlataforma, valor: fromCentavos(valorPlataformaC) },
    corretor: { percentual: taxaCorretor, valor: fromCentavos(valorCorretorC) },
    proprietario: { percentual: taxaProprietario, valor: fromCentavos(valorProprietarioC) },
  };
}

export function calcularPlataformaTotal(
  split: SplitComissoesResult,
  taxa: TaxaHospedeResult,
): { split: number; taxa: number; total: number } {
  const splitVal = split.plataforma.valor;
  const taxaVal = taxa.ativa ? taxa.valor : 0;
  return {
    split: splitVal,
    taxa: taxaVal,
    total: roundCentavosHalfUp(splitVal + taxaVal),
  };
}
