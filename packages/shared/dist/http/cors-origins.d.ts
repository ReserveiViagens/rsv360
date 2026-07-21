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
export {};
