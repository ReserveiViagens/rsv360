import type { TaxaHospedePublicaConfig } from '@/components/cotacao/wizard/wizard-types';

/** Quebra de taint: só primitivos validados, sem repassar objeto do fetch. */
export function parseTaxaHospedePublicaFields(raw: unknown): TaxaHospedePublicaConfig | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (o.ativa !== true) return null;

  const pct = typeof o.pct === 'number' ? o.pct : Number(o.pct);
  const nomeRaw = typeof o.nome === 'string' ? o.nome.trim() : '';
  const descricaoRaw = typeof o.descricao === 'string' ? o.descricao.trim() : '';

  if (!Number.isFinite(pct) || pct < 0 || pct > 10 || !nomeRaw) return null;

  return {
    ativa: true,
    pct,
    nome: nomeRaw.slice(0, 120),
    descricao: descricaoRaw.slice(0, 500),
  };
}

export function taxaHospedePublicaLiteral(
  parsed: TaxaHospedePublicaConfig,
): TaxaHospedePublicaConfig {
  return {
    ativa: true,
    pct: parsed.pct,
    nome: parsed.nome,
    descricao: parsed.descricao,
  };
}
