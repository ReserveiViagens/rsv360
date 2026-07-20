export interface RoteiroEngagementPayload {
  tempoMs: number;
  scrollDepthPct: number;
}

export function computeScrollDepthPct(
  scrollY: number,
  scrollHeight: number,
  innerHeight: number,
): number {
  const maxScroll = Math.max(0, scrollHeight - innerHeight);
  if (maxScroll <= 0) return 100;
  return Math.min(100, Math.round((scrollY / maxScroll) * 100));
}

export function buildRoteiroEngagementPayload(
  tempoMs: number,
  scrollDepthPct: number,
): RoteiroEngagementPayload {
  return {
    tempoMs: Math.max(0, Math.round(tempoMs)),
    scrollDepthPct: Math.min(100, Math.max(0, Math.round(scrollDepthPct))),
  };
}

export function roteiroEngagementUrl(token: string): string {
  return `/api/cotacao/roteiro/${encodeURIComponent(token)}/evento`;
}

export function sendRoteiroEngagementBeacon(token: string, payload: RoteiroEngagementPayload): void {
  if (!token || typeof window === 'undefined') return;

  const url = roteiroEngagementUrl(token);
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
  }).catch((): undefined => undefined);
}

export function shouldAutoplayCinematicVideo(
  videoSrc: string | undefined,
  prefersReducedMotion: boolean,
): boolean {
  return Boolean(videoSrc) && !prefersReducedMotion;
}
