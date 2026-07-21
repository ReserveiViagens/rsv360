/**
 * PR-05b — shared CORS origin allowlist (Express + Socket.IO).
 * Never falls back to '*' — unset CORS_ORIGIN → explicit dev allowlist.
 */

export const DEV_CORS_ORIGIN_ALLOWLIST: readonly string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3004',
  'http://127.0.0.1:3005',
  'http://127.0.0.1:3006',
] as const;

type EnvLike = Record<string, string | undefined>;

/**
 * Parse CORS_ORIGIN CSV, or return the fixed dev allowlist.
 * Values equal to '*' (or containing only wildcard) are ignored — never open.
 */
export function getCorsOriginAllowlist(env: EnvLike = process.env): string[] {
  const raw = env.CORS_ORIGIN?.trim();
  if (!raw) {
    return [...DEV_CORS_ORIGIN_ALLOWLIST];
  }

  const parsed = raw
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0 && v !== '*');

  if (parsed.length === 0) {
    return [...DEV_CORS_ORIGIN_ALLOWLIST];
  }
  return parsed;
}

/** Exact match only — no substring / URL construction from input. */
export function isCorsOriginAllowed(
  origin: string | undefined | null,
  allowlist: readonly string[] = getCorsOriginAllowlist(),
): boolean {
  if (!origin) return false;
  return allowlist.includes(origin);
}

/**
 * Socket.IO / cors package callback helper.
 * Missing Origin (non-browser / same-host tools) is allowed; browser Origin must be allowlisted.
 */
export function corsOriginDelegate(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
  env: EnvLike = process.env,
): void {
  if (!origin) {
    callback(null, true);
    return;
  }
  callback(null, isCorsOriginAllowed(origin, getCorsOriginAllowlist(env)));
}
