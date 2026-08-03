"use strict";
/**
 * PR-05b — shared CORS origin allowlist (Express + Socket.IO).
 * Never falls back to '*' — unset CORS_ORIGIN → explicit dev allowlist.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TRANSPORT_HEADER = exports.REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS = exports.REFRESH_TOKEN_COOKIE_PATH_API = exports.REFRESH_TOKEN_COOKIE_PATH_BFF = exports.REFRESH_TOKEN_COOKIE_NAME = exports.BROWSER_SESSION_COOKIE_SAME_SITE = exports.DEV_CORS_ORIGIN_ALLOWLIST = void 0;
exports.getCorsOriginAllowlist = getCorsOriginAllowlist;
exports.isCorsOriginAllowed = isCorsOriginAllowed;
exports.corsOriginDelegate = corsOriginDelegate;
exports.assertCookieMutationOrigin = assertCookieMutationOrigin;
exports.isSecureBrowserCookieRequired = isSecureBrowserCookieRequired;
exports.formatBrowserSessionCookie = formatBrowserSessionCookie;
exports.formatClearedBrowserSessionCookie = formatClearedBrowserSessionCookie;
exports.isRefreshCookieRequired = isRefreshCookieRequired;
exports.getRefreshTokenCookieOptions = getRefreshTokenCookieOptions;
exports.stripRefreshTokenFromAuthPayload = stripRefreshTokenFromAuthPayload;
exports.readCookieValue = readCookieValue;
exports.DEV_CORS_ORIGIN_ALLOWLIST = [
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
];
/**
 * Parse CORS_ORIGIN CSV, or return the fixed dev allowlist.
 * Values equal to '*' (or containing only wildcard) are ignored — never open.
 */
function getCorsOriginAllowlist(env = process.env) {
    const raw = env.CORS_ORIGIN?.trim();
    if (!raw) {
        return [...exports.DEV_CORS_ORIGIN_ALLOWLIST];
    }
    const parsed = raw
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0 && v !== '*');
    if (parsed.length === 0) {
        return [...exports.DEV_CORS_ORIGIN_ALLOWLIST];
    }
    return parsed;
}
/** Exact match only — no substring / URL construction from input. */
function isCorsOriginAllowed(origin, allowlist = getCorsOriginAllowlist()) {
    if (!origin)
        return false;
    return allowlist.includes(origin);
}
/**
 * Socket.IO / cors package callback helper.
 * Missing Origin (non-browser / same-host tools) is allowed; browser Origin must be allowlisted.
 */
function corsOriginDelegate(origin, callback, env = process.env) {
    if (!origin) {
        callback(null, true);
        return;
    }
    callback(null, isCorsOriginAllowed(origin, getCorsOriginAllowlist(env)));
}
/**
 * PR-16b — fail-closed Origin/Referer check for cookie-authenticated mutations.
 * Reuses PR-05b CORS allowlist. Never trusts Host / X-Forwarded-Host.
 * Missing both Origin and Referer → reject (unlike corsOriginDelegate for non-browser).
 */
function assertCookieMutationOrigin(headers, env = process.env) {
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
    }
    catch {
        return { ok: false, reason: 'referer_not_allowed' };
    }
}
/** SameSite=Lax — OAuth / Mercado Pago top-level returns must keep the session cookie. */
exports.BROWSER_SESSION_COOKIE_SAME_SITE = 'Lax';
function isSecureBrowserCookieRequired(env = process.env) {
    return env.NODE_ENV === 'production';
}
function formatBrowserSessionCookie(name, value, options = {}) {
    const env = options.env ?? process.env;
    const maxAge = options.maxAgeSeconds ?? 60 * 60 * 24 * 7;
    const secure = isSecureBrowserCookieRequired(env) ? '; Secure' : '';
    return `${name}=${encodeURIComponent(value)}; Path=/; SameSite=${exports.BROWSER_SESSION_COOKIE_SAME_SITE}; Max-Age=${maxAge}${secure}`;
}
function formatClearedBrowserSessionCookie(name, env = process.env) {
    const secure = isSecureBrowserCookieRequired(env) ? '; Secure' : '';
    return `${name}=; Path=/; Max-Age=0; SameSite=${exports.BROWSER_SESSION_COOKIE_SAME_SITE}${secure}`;
}
/** PR-10c-pré-a / 04b — HttpOnly refresh cookie (BFF Path=/api/auth). */
exports.REFRESH_TOKEN_COOKIE_NAME = 'rsv360_refresh_token';
exports.REFRESH_TOKEN_COOKIE_PATH_BFF = '/api/auth';
exports.REFRESH_TOKEN_COOKIE_PATH_API = '/api/v1/auth';
/** Max-Age aligned with backend refresh TTL (30 days). */
exports.REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
exports.REFRESH_TRANSPORT_HEADER = 'x-rsv-refresh-transport';
function isRefreshCookieRequired(env = process.env) {
    return env.AUTH_REFRESH_COOKIE_REQUIRED === 'true';
}
/** Options for NextResponse.cookies.set / .delete (HttpOnly refresh). */
function getRefreshTokenCookieOptions(options = {}) {
    const env = options.env ?? process.env;
    return {
        httpOnly: true,
        secure: isSecureBrowserCookieRequired(env),
        sameSite: 'lax',
        path: options.path ?? exports.REFRESH_TOKEN_COOKIE_PATH_BFF,
        maxAge: options.maxAgeSeconds ?? exports.REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
    };
}
function stripRefreshTokenFromAuthPayload(payload) {
    if (!payload || typeof payload !== 'object')
        return payload;
    const root = payload;
    const next = { ...root };
    if ('refresh_token' in next) {
        delete next.refresh_token;
    }
    if (next.data && typeof next.data === 'object') {
        const data = { ...next.data };
        delete data.refresh_token;
        next.data = data;
    }
    return next;
}
/** Parse a single cookie value from a Cookie header (no cookie-parser). */
function readCookieValue(cookieHeader, name) {
    if (!cookieHeader)
        return undefined;
    const parts = cookieHeader.split(';');
    for (const part of parts) {
        const idx = part.indexOf('=');
        if (idx === -1)
            continue;
        const key = part.slice(0, idx).trim();
        if (key !== name)
            continue;
        const raw = part.slice(idx + 1).trim();
        try {
            return decodeURIComponent(raw);
        }
        catch {
            return raw;
        }
    }
    return undefined;
}
