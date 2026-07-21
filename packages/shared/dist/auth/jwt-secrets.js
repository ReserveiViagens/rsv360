"use strict";
/**
 * PR-04a — centralized JWT secrets (fail-closed).
 * No defaults. Refresh inherits JWT_SECRET until PR-04b separates them.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtSecretMissingError = exports.JWT_HS256_VERIFY_OPTIONS = exports.JWT_HS256_ALGORITHMS = void 0;
exports.getJwtSecret = getJwtSecret;
exports.getJwtRefreshSecret = getJwtRefreshSecret;
exports.assertJwtSecretsConfigured = assertJwtSecretsConfigured;
exports.JWT_HS256_ALGORITHMS = ['HS256'];
/** Options for jsonwebtoken.verify — pin HS256 only. */
exports.JWT_HS256_VERIFY_OPTIONS = {
    algorithms: exports.JWT_HS256_ALGORITHMS,
};
class JwtSecretMissingError extends Error {
    code = 'JWT_SECRET_MISSING';
    constructor(message = 'JWT_SECRET is required (fail-closed). Set it in the environment.') {
        super(message);
        this.name = 'JwtSecretMissingError';
    }
}
exports.JwtSecretMissingError = JwtSecretMissingError;
function readNonEmpty(env, key) {
    const raw = env[key];
    if (raw == null)
        return undefined;
    const trimmed = String(raw).trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
/** Access-token HMAC secret. Throws if unset/empty. */
function getJwtSecret(env = process.env) {
    const secret = readNonEmpty(env, 'JWT_SECRET');
    if (!secret) {
        throw new JwtSecretMissingError();
    }
    return secret;
}
/**
 * Refresh-token HMAC secret.
 * If JWT_REFRESH_SECRET is absent, inherits JWT_SECRET explicitly (PR-04a).
 * Real separation / rotation → PR-04b.
 */
function getJwtRefreshSecret(env = process.env) {
    const refresh = readNonEmpty(env, 'JWT_REFRESH_SECRET');
    if (refresh)
        return refresh;
    return getJwtSecret(env);
}
/** Boot-time assert — call before listen / Next register. */
function assertJwtSecretsConfigured(env = process.env) {
    getJwtSecret(env);
}
