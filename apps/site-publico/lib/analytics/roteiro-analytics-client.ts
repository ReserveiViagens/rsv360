import {
  buildRoteiroAnalyticsBatch,
  roteiroAnalyticsUrl,
  shouldCollectRoteiroAnalytics,
  ROTEIRO_ANALYTICS_SESSION_KEY,
  type RoteiroAnalyticsEventPayload,
} from './roteiro-analytics';

const FLUSH_INTERVAL_MS = 10_000;
const MAX_BATCH = 50;

let activeToken = '';
let queue: RoteiroAnalyticsEventPayload[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(ROTEIRO_ANALYTICS_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(ROTEIRO_ANALYTICS_SESSION_KEY, id);
  }
  return id;
}

function canCollect(): boolean {
  return shouldCollectRoteiroAnalytics(
    typeof navigator !== 'undefined' ? navigator : null,
    typeof window !== 'undefined' ? window : null,
  );
}

export function initRoteiroAnalyticsQueue(token: string): void {
  if (!token || typeof window === 'undefined') return;
  activeToken = token;
  queue = [];

  if (flushTimer) clearInterval(flushTimer);
  flushTimer = setInterval(() => {
    void flushRoteiroAnalytics();
  }, FLUSH_INTERVAL_MS);
}

export function shutdownRoteiroAnalyticsQueue(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  void flushRoteiroAnalytics();
  activeToken = '';
  queue = [];
}

export function trackRoteiroAnalyticsEvent(event: RoteiroAnalyticsEventPayload): void {
  if (!activeToken || !canCollect()) return;
  queue.push(event);
  if (queue.length >= MAX_BATCH) {
    void flushRoteiroAnalytics();
  }
}

export async function flushRoteiroAnalytics(): Promise<void> {
  if (!activeToken || !canCollect() || queue.length === 0) return;

  const batch = buildRoteiroAnalyticsBatch(getSessionId(), queue.splice(0, MAX_BATCH));
  const url = roteiroAnalyticsUrl(activeToken);
  const body = JSON.stringify(batch);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon(url, blob)) return;
  }

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
