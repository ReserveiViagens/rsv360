const STATUS_BLOQUEIA_ACEITE = new Set(['accepted', 'rejected', 'cancelled', 'expired', 'paid']);

export const PROPOSTA_STATUS_POS_ACEITE_UI = ['accepted', 'paid', 'converted'] as const;

export function isPropostaPosAceite(status: string | undefined | null): boolean {
  return (
    status != null &&
    (PROPOSTA_STATUS_POS_ACEITE_UI as readonly string[]).includes(status)
  );
}

export type UrgenciaEstilo = 'countdown' | 'badge' | 'nenhum';

export function normalizeUrgenciaEstilo(raw?: string | null): UrgenciaEstilo {
  if (raw === 'badge' || raw === 'nenhum') return raw;
  return 'countdown';
}

/** Indicador de urgência visível apenas enquanto a proposta não expirou. */
export function shouldShowUrgenciaIndicador(estilo: UrgenciaEstilo, expirada: boolean): boolean {
  if (expirada) return false;
  return estilo !== 'nenhum';
}

export function formatValidoAteLegivel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRestanteMs(ms: number | null): string {
  if (ms === null || ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/** Bloqueia aceite/recusa quando expirada (socket, polling ou status no servidor). */
export function propostaAceiteBloqueado(status: string | undefined, expirada: boolean): boolean {
  if (!status) return expirada;
  if (STATUS_BLOQUEIA_ACEITE.has(status)) return true;
  return expirada;
}
