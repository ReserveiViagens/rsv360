/**
 * Upgrade varanda por unidade (modelo híbrido Premium — 9 jul 2026).
 * Flags vivem em acomodacoes.metadata; valor calibrável sem redeploy.
 */

export const UPGRADE_VARANDA_DEFAULT_VALOR = 80;

export interface UpgradeVarandaMeta {
  disponivel: boolean;
  valor: number;
}

export function parseUpgradeVarandaMeta(metadata: unknown): UpgradeVarandaMeta {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return { disponivel: false, valor: UPGRADE_VARANDA_DEFAULT_VALOR };
  }
  const m = metadata as Record<string, unknown>;
  const disponivel = m.upgrade_varanda_disponivel === true;
  const raw = Number(m.upgrade_varanda_valor);
  const valor =
    Number.isFinite(raw) && raw >= 0 ? Math.round(raw * 100) / 100 : UPGRADE_VARANDA_DEFAULT_VALOR;
  return { disponivel, valor };
}

export function isPremiumAncora(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return false;
  return (metadata as Record<string, unknown>).premium_ancora === true;
}

export function sumUpgradeVaranda(
  enabled: boolean,
  valorPorNoite: number,
  nights: number,
): number {
  if (!enabled || !(valorPorNoite > 0) || nights < 1) return 0;
  return Math.round(valorPorNoite * nights * 100) / 100;
}
