/**
 * PR-05b — bearer auth for Prometheus metrics endpoints.
 * Fail-closed: missing METRICS_TOKEN → deny all scrapes.
 */
import { timingSafeEqual } from 'crypto';

type EnvLike = Record<string, string | undefined>;

function readNonEmpty(env: EnvLike, key: string): string | undefined {
  const raw = env[key];
  if (raw == null) return undefined;
  const trimmed = String(raw).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getMetricsToken(env: EnvLike = process.env): string | undefined {
  return readNonEmpty(env, 'METRICS_TOKEN');
}

function safeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Returns true only when Authorization: Bearer <METRICS_TOKEN> matches.
 * No token configured → always false (fail-closed).
 */
export function isMetricsBearerAuthorized(
  authorizationHeader: string | null | undefined,
  env: EnvLike = process.env,
): boolean {
  const expected = getMetricsToken(env);
  if (!expected) return false;

  if (!authorizationHeader || typeof authorizationHeader !== 'string') return false;
  const match = /^Bearer\s+(\S+)$/i.exec(authorizationHeader.trim());
  if (!match) return false;
  return safeEqualString(match[1], expected);
}
