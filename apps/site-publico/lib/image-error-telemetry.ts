/**
 * PR-001c — ImageError / ImageRecovered telemetry (ingressos / parque images).
 * Principle of Instrumentation: measure before fixing origin (001a) or fallback UX (001b).
 *
 * Dedup: at most one ImageError per load attempt; ImageRecovered once per recovered attempt.
 * Sentinel: periodic heartbeat with known volume for loss-rate audit (< 1%).
 */

import { logWarn } from '@/lib/logging-service';
import { trackEvent } from '@/lib/analytics';

export const IMAGE_ERROR_EVENT = 'ImageError' as const;
export const IMAGE_RECOVERED_EVENT = 'ImageRecovered' as const;
export const IMAGE_SENTINEL_EVENT = 'ImageTelemetrySentinel' as const;

export type ImageTelemetryBrowser =
  | 'chrome'
  | 'edge'
  | 'safari'
  | 'firefox'
  | 'other'
  | 'unknown';

export interface ImageTelemetryContext {
  url: string;
  browser: ImageTelemetryBrowser;
  viewport: string;
  environment: string;
  image_id?: string;
  parque_id?: string;
  ingresso_id?: string;
  component_name: string;
  page_route: string;
  release_version: string;
  user_session_id?: string;
  /** Optional wall-clock for recovery latency (ms since ImageError). */
  failed_at_ms?: number;
}

export interface ImageRecoveredMetrics {
  /** Total ImageError events recorded in this session (process). */
  falhas_totais: number;
  /** Average ms from failure to recovery for recovered attempts. */
  tempo_medio_recuperacao_ms: number;
  /** 0–100 automatic recovery rate in this session. */
  pct_recuperacao_automatica: number;
  /** Failures that never recovered (permanent). */
  falhas_permanentes: number;
}

type EmitFn = (
  eventName: string,
  payload: Record<string, unknown>,
) => void | Promise<void>;

const emittedErrors = new Set<string>();
const emittedRecoveries = new Set<string>();
const attemptFailedAt = new Map<string, number>();

let sessionErrors = 0;
let sessionRecoveries = 0;
let sessionPermanents = 0;
let recoveryLatencySumMs = 0;

let emitOverride: EmitFn | null = null;

/** Test-only: inject emitter and reset dedup/session counters. */
export function __resetImageTelemetryForTests(opts?: { emit?: EmitFn | null }) {
  emittedErrors.clear();
  emittedRecoveries.clear();
  attemptFailedAt.clear();
  sessionErrors = 0;
  sessionRecoveries = 0;
  sessionPermanents = 0;
  recoveryLatencySumMs = 0;
  emitOverride = opts?.emit ?? null;
}

export function getImageTelemetrySessionMetrics(): ImageRecoveredMetrics {
  return {
    falhas_totais: sessionErrors,
    tempo_medio_recuperacao_ms:
      sessionRecoveries > 0
        ? Math.round(recoveryLatencySumMs / sessionRecoveries)
        : 0,
    pct_recuperacao_automatica:
      sessionErrors > 0
        ? Math.round((sessionRecoveries / sessionErrors) * 100)
        : 0,
    falhas_permanentes: sessionPermanents,
  };
}

export function detectBrowser(
  ua: string | undefined = typeof navigator !== 'undefined'
    ? navigator.userAgent
    : undefined,
): ImageTelemetryBrowser {
  if (!ua) return 'unknown';
  const s = ua.toLowerCase();
  if (s.includes('edg/')) return 'edge';
  if (s.includes('chrome/') && !s.includes('edg/')) return 'chrome';
  if (s.includes('safari/') && !s.includes('chrome/')) return 'safari';
  if (s.includes('firefox/')) return 'firefox';
  return 'other';
}

export function getViewportLabel(
  w: number | undefined = typeof window !== 'undefined' ? window.innerWidth : undefined,
  h: number | undefined = typeof window !== 'undefined' ? window.innerHeight : undefined,
): string {
  if (w == null || h == null) return 'unknown';
  return `${w}x${h}`;
}

export function getReleaseVersion(): string {
  return (
    process.env.NEXT_PUBLIC_APP_VERSION ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    'dev'
  );
}

export function getPageRoute(): string {
  if (typeof window === 'undefined') return 'ssr';
  return sanitizeUrlForTelemetry(window.location.pathname || '/');
}

/**
 * Strip query string and fragment before any telemetry emit.
 * Prevents capability tokens (e.g. rt-*, portal_*) leaking to Sentry/analytics
 * when this helper is reused on proposta/check-in surfaces (PR-03b).
 */
export function sanitizeUrlForTelemetry(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  // data: URLs have no capability query; avoid mangling base64
  if (trimmed.startsWith('data:')) {
    return trimmed.length > 96
      ? `${trimmed.slice(0, 48)}…(data-url)`
      : trimmed;
  }

  try {
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      const u = new URL(trimmed);
      u.search = '';
      u.hash = '';
      return u.toString();
    }
  } catch {
    // fall through to relative strip
  }

  const q = trimmed.indexOf('?');
  const h = trimmed.indexOf('#');
  let end = trimmed.length;
  if (q >= 0) end = Math.min(end, q);
  if (h >= 0) end = Math.min(end, h);
  return trimmed.slice(0, end);
}

function newAnonymousSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `sid_${Date.now()}`;
}

export function getUserSessionId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const key = 'rsv360_img_telemetry_sid';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = newAnonymousSessionId();
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/**
 * Stable attempt key: one logical load of (component + image identity + attempt nonce).
 * URL portion is sanitized (no query/fragment).
 */
export function buildLoadAttemptKey(parts: {
  component_name: string;
  url: string;
  attempt_id: string;
}): string {
  const safeUrl = sanitizeUrlForTelemetry(parts.url);
  const safeAttempt = sanitizeUrlForTelemetry(parts.attempt_id);
  return `${parts.component_name}::${safeUrl}::${safeAttempt}`;
}

async function defaultEmit(
  eventName: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await Promise.allSettled([
    logWarn(eventName, payload),
    trackEvent({
      event_type: 'media',
      event_name: eventName,
      properties: payload,
    }),
  ]);
}

async function emit(eventName: string, payload: Record<string, unknown>) {
  const fn = emitOverride ?? defaultEmit;
  await fn(eventName, payload);
}

function enrichContext(
  partial: Partial<ImageTelemetryContext> &
    Pick<ImageTelemetryContext, 'url' | 'component_name'>,
): ImageTelemetryContext {
  return {
    url: sanitizeUrlForTelemetry(partial.url),
    browser: partial.browser ?? detectBrowser(),
    viewport: partial.viewport ?? getViewportLabel(),
    environment: partial.environment ?? process.env.NODE_ENV ?? 'development',
    image_id: partial.image_id,
    parque_id: partial.parque_id,
    ingresso_id: partial.ingresso_id,
    component_name: partial.component_name,
    page_route: sanitizeUrlForTelemetry(
      partial.page_route ?? getPageRoute(),
    ),
    release_version: partial.release_version ?? getReleaseVersion(),
    user_session_id: partial.user_session_id ?? getUserSessionId(),
    failed_at_ms: partial.failed_at_ms,
  };
}

/**
 * Report ImageError once per load attempt. Returns true if emitted.
 */
export async function reportImageError(
  attemptKey: string,
  context: Partial<ImageTelemetryContext> &
    Pick<ImageTelemetryContext, 'url' | 'component_name'>,
): Promise<boolean> {
  if (emittedErrors.has(attemptKey)) return false;
  emittedErrors.add(attemptKey);

  const now = Date.now();
  attemptFailedAt.set(attemptKey, now);
  sessionErrors += 1;

  const full = enrichContext({ ...context, failed_at_ms: now });
  await emit(IMAGE_ERROR_EVENT, { ...full, attempt_key: attemptKey });
  return true;
}

/**
 * Report ImageRecovered once per recovered attempt (after a prior ImageError).
 */
export async function reportImageRecovered(
  attemptKey: string,
  context: Partial<ImageTelemetryContext> &
    Pick<ImageTelemetryContext, 'url' | 'component_name'>,
): Promise<boolean> {
  if (!emittedErrors.has(attemptKey)) return false;
  if (emittedRecoveries.has(attemptKey)) return false;
  emittedRecoveries.add(attemptKey);

  const failedAt = attemptFailedAt.get(attemptKey) ?? Date.now();
  const latency = Math.max(0, Date.now() - failedAt);
  recoveryLatencySumMs += latency;
  sessionRecoveries += 1;

  const metrics = getImageTelemetrySessionMetrics();
  const full = enrichContext(context);
  await emit(IMAGE_RECOVERED_EVENT, {
    ...full,
    attempt_key: attemptKey,
    recovery_latency_ms: latency,
    ...metrics,
  });
  return true;
}

/**
 * Mark permanent failure (fallback also failed). Idempotent per attempt.
 */
export async function reportImagePermanentFailure(
  attemptKey: string,
  context: Partial<ImageTelemetryContext> &
    Pick<ImageTelemetryContext, 'url' | 'component_name'>,
): Promise<boolean> {
  if (!emittedErrors.has(attemptKey)) {
    await reportImageError(attemptKey, context);
  }
  if (emittedRecoveries.has(attemptKey)) return false;

  const permanentKey = `${attemptKey}::permanent`;
  if (emittedErrors.has(permanentKey)) return false;
  emittedErrors.add(permanentKey);
  sessionPermanents += 1;

  const metrics = getImageTelemetrySessionMetrics();
  const full = enrichContext(context);
  await emit(IMAGE_ERROR_EVENT, {
    ...full,
    attempt_key: attemptKey,
    permanent: true,
    ...metrics,
  });
  return true;
}

/**
 * Sentinel heartbeat — known volume for loss-rate audit in the panel.
 */
export async function reportImageTelemetrySentinel(opts?: {
  sequence?: number;
  expected_interval_ms?: number;
}): Promise<void> {
  const payload = {
    event: IMAGE_SENTINEL_EVENT,
    sequence: opts?.sequence ?? 0,
    expected_interval_ms: opts?.expected_interval_ms ?? 60_000,
    browser: detectBrowser(),
    viewport: getViewportLabel(),
    environment: process.env.NODE_ENV ?? 'development',
    page_route: getPageRoute(),
    release_version: getReleaseVersion(),
    user_session_id: getUserSessionId(),
    sent_at: new Date().toISOString(),
  };
  await emit(IMAGE_SENTINEL_EVENT, payload);
}
