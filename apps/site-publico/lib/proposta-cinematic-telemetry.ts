import { computeScrollDepthPct } from './roteiro-engagement';

export const SCROLL_MILESTONES = [25, 50, 75, 100] as const;
export const FLUSH_INTERVAL_MS = 15_000;
export const SESSION_STORAGE_PREFIX = 'rsv-proposta-session:';

export interface PropostaCinematicPayload {
  session_id: string;
  tempo_pagina_segundos?: number;
  scroll?: {
    percentual_max: number;
    marcos: number[];
  };
}

export function propostaCinematicEventosUrl(token: string): string {
  return `/api/propostas/${encodeURIComponent(token)}/eventos`;
}

export function sendEngagementBeacon(url: string, payload: PropostaCinematicPayload): void {
  if (typeof window === 'undefined') return;

  const body = JSON.stringify(payload);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
    return;
  }

  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function getOrCreateSessionId(token: string): string {
  if (typeof window === 'undefined') return 'ssr';

  const key = `${SESSION_STORAGE_PREFIX}${token}`;
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return `sess-${Date.now()}`;
  }
}

export function detectNewScrollMilestones(
  maxDepthPct: number,
  alreadyFired: ReadonlySet<number>,
): number[] {
  const fired: number[] = [];
  for (const marco of SCROLL_MILESTONES) {
    if (maxDepthPct >= marco && !alreadyFired.has(marco)) {
      fired.push(marco);
    }
  }
  return fired;
}

export function buildCinematicFlushPayload(input: {
  sessionId: string;
  activeMs: number;
  maxScrollPct: number;
  marcosToSend: number[];
}): PropostaCinematicPayload | null {
  const segundos = Math.max(0, Math.round(input.activeMs / 1000));
  const hasTempo = segundos > 0;
  const hasMarcos = input.marcosToSend.length > 0;

  if (!hasTempo && !hasMarcos) return null;

  const payload: PropostaCinematicPayload = {
    session_id: input.sessionId,
  };

  if (hasTempo) {
    payload.tempo_pagina_segundos = segundos;
  }

  if (hasMarcos || input.maxScrollPct > 0) {
    payload.scroll = {
      percentual_max: input.maxScrollPct,
      marcos: input.marcosToSend,
    };
  }

  return payload;
}

export function measureScrollDepthPct(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  return computeScrollDepthPct(
    window.scrollY,
    document.documentElement.scrollHeight,
    window.innerHeight,
  );
}

/** Acumula tempo ativo somente com aba visível (testável). */
export function nextActiveMs(
  isVisible: boolean,
  lastTick: number,
  now: number,
  activeMs: number,
): { activeMs: number; lastTick: number } {
  if (!isVisible) return { activeMs, lastTick: now };
  return { activeMs: activeMs + Math.max(0, now - lastTick), lastTick: now };
}

export function urgencyLoadingClockClass(prefersReducedMotion: boolean): string {
  return prefersReducedMotion ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5 animate-pulse';
}
