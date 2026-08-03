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

export type CookieCsrfCheckResult =
  | { ok: true; source: 'origin' | 'referer' }
  | {
      ok: false;
      reason: 'missing_origin_referer' | 'origin_not_allowed' | 'referer_not_allowed';
    };

/**
 * PR-16b — fail-closed Origin/Referer check for cookie-authenticated mutations.
 * Reuses PR-05b CORS allowlist. Never trusts Host / X-Forwarded-Host.
 * Missing both Origin and Referer → reject (unlike corsOriginDelegate for non-browser).
 */
export function assertCookieMutationOrigin(
  headers: { origin?: string | null; referer?: string | null },
  env: EnvLike = process.env,
): CookieCsrfCheckResult {
  const allowlist = getCorsOriginAllowlist(env);
  const origin = headers.origin?.trim() || '';
  if (origin) {
    return isCorsOriginAllowed(origin, allowlist)
      ? { ok: true, source: 'origin' }
      : { ok: false, reason: 'origin_not_allowed' };
  }

  const referer = headers.referer?.trim() || '';
  if (!referer) {
    return { ok: false, reason: 'missing_origin_referer' };
  }

  try {
    const refererOrigin = new URL(referer).origin;
    return isCorsOriginAllowed(refererOrigin, allowlist)
      ? { ok: true, source: 'referer' }
      : { ok: false, reason: 'referer_not_allowed' };
  } catch {
    return { ok: false, reason: 'referer_not_allowed' };
  }
}

/** SameSite=Lax — OAuth / Mercado Pago top-level returns must keep the session cookie. */
export const BROWSER_SESSION_COOKIE_SAME_SITE = 'Lax' as const;

export function isSecureBrowserCookieRequired(env: EnvLike = process.env): boolean {
  return env.NODE_ENV === 'production';
}

export function formatBrowserSessionCookie(
  name: string,
  value: string,
  options: { maxAgeSeconds?: number; env?: EnvLike } = {},
): string {
  const env = options.env ?? process.env;
  const maxAge = options.maxAgeSeconds ?? 60 * 60 * 24 * 7;
  const secure = isSecureBrowserCookieRequired(env) ? '; Secure' : '';
  return `${name}=${encodeURIComponent(value)}; Path=/; SameSite=${BROWSER_SESSION_COOKIE_SAME_SITE}; Max-Age=${maxAge}${secure}`;
}

export function formatClearedBrowserSessionCookie(
  name: string,
  env: EnvLike = process.env,
): string {
  const secure = isSecureBrowserCookieRequired(env) ? '; Secure' : '';
  return `${name}=; Path=/; Max-Age=0; SameSite=${BROWSER_SESSION_COOKIE_SAME_SITE}${secure}`;
}
