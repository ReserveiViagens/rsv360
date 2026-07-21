/**
 * PR-04a — centralized JWT secrets (fail-closed).
 * No defaults. Refresh inherits JWT_SECRET until PR-04b separates them.
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
 * If JWT_REFRESH_SECRET is absent, inherits JWT_SECRET explicitly (PR-04a).
 * Real separation / rotation → PR-04b.
 */
export declare function getJwtRefreshSecret(env?: EnvLike): string;
/** Boot-time assert — call before listen / Next register. */
export declare function assertJwtSecretsConfigured(env?: EnvLike): void;
export {};
