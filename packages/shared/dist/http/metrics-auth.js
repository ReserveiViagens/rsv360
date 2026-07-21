"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetricsToken = getMetricsToken;
exports.isMetricsBearerAuthorized = isMetricsBearerAuthorized;
/**
 * PR-05b — bearer auth for Prometheus metrics endpoints.
 * Fail-closed: missing METRICS_TOKEN → deny all scrapes.
 */
const crypto_1 = require("crypto");
function readNonEmpty(env, key) {
    const raw = env[key];
    if (raw == null)
        return undefined;
    const trimmed = String(raw).trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
function getMetricsToken(env = process.env) {
    return readNonEmpty(env, 'METRICS_TOKEN');
}
function safeEqualString(a, b) {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length)
        return false;
    return (0, crypto_1.timingSafeEqual)(bufA, bufB);
}
/**
 * Returns true only when Authorization: Bearer <METRICS_TOKEN> matches.
 * No token configured → always false (fail-closed).
 */
function isMetricsBearerAuthorized(authorizationHeader, env = process.env) {
    const expected = getMetricsToken(env);
    if (!expected)
        return false;
    if (!authorizationHeader || typeof authorizationHeader !== 'string')
        return false;
    const match = /^Bearer\s+(\S+)$/i.exec(authorizationHeader.trim());
    if (!match)
        return false;
    return safeEqualString(match[1], expected);
}
