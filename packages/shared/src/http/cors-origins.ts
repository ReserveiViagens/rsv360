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

/** PR-10c-pré-a / 04b — HttpOnly refresh cookie (BFF Path=/api/auth). */
export const REFRESH_TOKEN_COOKIE_NAME = 'rsv360_refresh_token';
export const REFRESH_TOKEN_COOKIE_PATH_BFF = '/api/auth';
export const REFRESH_TOKEN_COOKIE_PATH_API = '/api/v1/auth';
/** Max-Age aligned with backend refresh TTL (30 days). */
export const REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const REFRESH_TRANSPORT_HEADER = 'x-rsv-refresh-transport';

export function isRefreshCookieRequired(env: EnvLike = process.env): boolean {
  return env.AUTH_REFRESH_COOKIE_REQUIRED === 'true';
}

export type RefreshCookieSerializeOptions = {
  maxAgeSeconds?: number;
  /** BFF same-origin path (default) or future API path. */
  path?: string;
  env?: EnvLike;
};

export function getRefreshCookieDomain(
  env: EnvLike = process.env,
): string | undefined {
  const domain = env.AUTH_REFRESH_COOKIE_DOMAIN?.trim();
  if (!domain) return undefined;
  if (!/^\.?[a-z0-9.-]+$/i.test(domain) || domain.includes('..')) {
    throw new Error('AUTH_REFRESH_COOKIE_DOMAIN inválido');
  }
  return domain;
}

/** Options for NextResponse.cookies.set / .delete (HttpOnly refresh). */
export function getRefreshTokenCookieOptions(
  options: RefreshCookieSerializeOptions = {},
): {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
  domain?: string;
} {
  const env = options.env ?? process.env;
  const domain = getRefreshCookieDomain(env);
  return {
    httpOnly: true,
    secure: isSecureBrowserCookieRequired(env),
    sameSite: 'lax',
    path: options.path ?? REFRESH_TOKEN_COOKIE_PATH_BFF,
    maxAge: options.maxAgeSeconds ?? REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
    ...(domain ? { domain } : {}),
  };
}

export function stripRefreshTokenFromAuthPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const root = payload as Record<string, unknown>;
  const next: Record<string, unknown> = { ...root };
  if ('refresh_token' in next) {
    delete next.refresh_token;
  }
  if (next.data && typeof next.data === 'object') {
    const data = { ...(next.data as Record<string, unknown>) };
    delete data.refresh_token;
    next.data = data;
  }
  return next;
}

/** Parse a single cookie value from a Cookie header (no cookie-parser). */
export function readCookieValue(
  cookieHeader: string | undefined | null,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key !== name) continue;
    const raw = part.slice(idx + 1).trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return undefined;
}
