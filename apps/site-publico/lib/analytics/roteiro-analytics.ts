/** Políticas puras — testáveis sem DOM. */

export const ROTEIRO_ANALYTICS_SESSION_KEY = 'roteiro-analytics-session-v1';

export type RoteiroAnalyticsEventType =
  | 'hero_view'
  | 'section_view'
  | 'section_dwell'
  | 'scroll_depth'
  | 'carteira_open'
  | 'lazer_view';

export type RoteiroAnalyticsSection = 'hero' | 'timeline' | 'carteira' | 'lazer';

export interface RoteiroAnalyticsEventPayload {
  event_type: RoteiroAnalyticsEventType;
  section?: RoteiroAnalyticsSection | null;
  value_ms?: number | null;
  scroll_pct?: number | null;
  meta?: Record<string, unknown> | null;
}

export interface RoteiroAnalyticsBatchPayload {
  session_id: string;
  events: RoteiroAnalyticsEventPayload[];
}

export function shouldCollectRoteiroAnalytics(
  navigatorLike?: Pick<Navigator, 'doNotTrack'> | null,
  windowLike?: { doNotTrack?: string | null } | null,
): boolean {
  if (navigatorLike?.doNotTrack === '1') return false;
  if (windowLike?.doNotTrack === '1') return false;
  return true;
}

export function nextScrollDepthMilestone(currentMax: number, scrollPct: number): number | null {
  const milestones = [25, 50, 75, 100];
  for (const m of milestones) {
    if (scrollPct >= m && currentMax < m) return m;
  }
  return null;
}

export function roteiroAnalyticsUrl(token: string): string {
  return `/api/cotacao/roteiro/${encodeURIComponent(token)}/analytics`;
}

export function buildRoteiroAnalyticsBatch(
  sessionId: string,
  events: RoteiroAnalyticsEventPayload[],
): RoteiroAnalyticsBatchPayload {
  return { session_id: sessionId, events };
}
