export type CotacaoAnalyticsEvent =
  | 'cotacao_step_viewed'
  | 'cotacao_step_completed'
  | 'cotacao_step_abandoned'
  | 'cotacao_item_selected'
  | 'cotacao_proposta_generated'
  | 'cotacao_roteiro_opened'
  | 'cotacao_roteiro_preview_viewed'
  | 'cotacao_roteiro_day_selected'
  | 'cotacao_roteiro_video_played'
  | 'cotacao_roteiro_preview_approved'
  | 'cotacao_entrada_contextual'
  | 'cotacao_lead_abandono';

export interface CotacaoAnalyticsPayload {
  step?: number;
  stepName?: string;
  profile?: string;
  selectionCount?: number;
  runningTotal?: number;
  lastAction?: string;
  itemType?: string;
  itemId?: string | number;
  price?: number;
  propostaId?: number;
  total?: number;
  token?: string;
  source?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
    gtag?: (...args: unknown[]) => void;
  }
}

function trackCotacaoEventInternal(
  event: CotacaoAnalyticsEvent,
  payload: CotacaoAnalyticsPayload = {},
): void {
  if (typeof window === 'undefined') return;

  try {
    window.posthog?.capture(event, payload);
  } catch {
    /* optional */
  }

  try {
    window.gtag?.('event', event, payload);
  } catch {
    /* optional */
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug('[cotacao-analytics]', event, payload);
  }

  try {
    const key = 'rsv360-cotacao-analytics';
    const existing = JSON.parse(sessionStorage.getItem(key) || '[]') as unknown[];
    existing.push({ event, payload, at: new Date().toISOString() });
    sessionStorage.setItem(key, JSON.stringify(existing.slice(-50)));
  } catch {
    /* ignore */
  }
}

/** Analytics nunca deve quebrar o funil — try/catch externo para chamadas pós-submit. */
export function safeTrack(
  event: CotacaoAnalyticsEvent,
  payload: CotacaoAnalyticsPayload = {},
): void {
  try {
    trackCotacaoEventInternal(event, payload);
  } catch {
    /* no-op */
  }
}

export function trackCotacaoEvent(
  event: CotacaoAnalyticsEvent,
  payload: CotacaoAnalyticsPayload = {},
): void {
  safeTrack(event, payload);
}

export const WIZARD_STEP_NAMES = [
  'Datas e hóspedes',
  'Hotel',
  'Diversão',
  'Atrações',
  'Café da manhã',
  'Kit acomodação',
  'Seu Roteiro',
  'Contato e pagamento',
] as const;
