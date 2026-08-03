/**
 * PR-05b — shared CORS origin allowlist (Express + Socket.IO).
 * Never falls back to '*' — unset CORS_ORIGIN → explicit dev allowlist.
 */
export declare const DEV_CORS_ORIGIN_ALLOWLIST: readonly string[];
type EnvLike = Record<string, string | undefined>;
/**
 * Parse CORS_ORIGIN CSV, or return the fixed dev allowlist.
 * Values equal to '*' (or containing only wildcard) are ignored — never open.
 */
export declare function getCorsOriginAllowlist(env?: EnvLike): string[];
/** Exact match only — no substring / URL construction from input. */
export declare function isCorsOriginAllowed(origin: string | undefined | null, allowlist?: readonly string[]): boolean;
/**
 * Socket.IO / cors package callback helper.
 * Missing Origin (non-browser / same-host tools) is allowed; browser Origin must be allowlisted.
 */
export declare function corsOriginDelegate(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void, env?: EnvLike): void;
export type CookieCsrfCheckResult = {
    ok: true;
    source: 'origin' | 'referer';
} | {
    ok: false;
    reason: 'missing_origin_referer' | 'origin_not_allowed' | 'referer_not_allowed';
};
/**
 * PR-16b — fail-closed Origin/Referer check for cookie-authenticated mutations.
 * Reuses PR-05b CORS allowlist. Never trusts Host / X-Forwarded-Host.
 * Missing both Origin and Referer → reject (unlike corsOriginDelegate for non-browser).
 */
export declare function assertCookieMutationOrigin(headers: {
    origin?: string | null;
    referer?: string | null;
}, env?: EnvLike): CookieCsrfCheckResult;
/** SameSite=Lax — OAuth / Mercado Pago top-level returns must keep the session cookie. */
export declare const BROWSER_SESSION_COOKIE_SAME_SITE: "Lax";
export declare function isSecureBrowserCookieRequired(env?: EnvLike): boolean;
export declare function formatBrowserSessionCookie(name: string, value: string, options?: {
    maxAgeSeconds?: number;
    env?: EnvLike;
}): string;
export declare function formatClearedBrowserSessionCookie(name: string, env?: EnvLike): string;
export {};
