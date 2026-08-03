/**
 * PR-04a / PR-04b (10c-pré-a) — centralized JWT secrets (fail-closed).
 * No defaults. Prefer JWT_REFRESH_SECRET; absent → inherit JWT_SECRET (compat).
 */
export declare const JWT_HS256_ALGORITHMS: ['HS256'];
export type JwtHs256VerifyOptions = {
    algorithms: ['HS256'];
};
/** Options for jsonwebtoken.verify — pin HS256 only. */
export declare const JWT_HS256_VERIFY_OPTIONS: JwtHs256VerifyOptions;
export declare class JwtSecretMissingError extends Error {
    readonly code = "JWT_SECRET_MISSING";
    constructor(message?: string);
}
type EnvLike = Record<string, string | undefined>;
/** Access-token HMAC secret. Throws if unset/empty. */
export declare function getJwtSecret(env?: EnvLike): string;
/**
 * Refresh-token HMAC secret.
 * Prefer JWT_REFRESH_SECRET (PR-04b / 10c-pré-a). If absent, inherits JWT_SECRET (compat).
 */
export declare function getJwtRefreshSecret(env?: EnvLike): string;
/** Boot-time assert — call before listen / Next register. */
export declare function assertJwtSecretsConfigured(env?: EnvLike): void;
export {};
