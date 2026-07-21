"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpWebhookAuthError = exports.MP_WEBHOOK_TS_TOLERANCE_MS = void 0;
exports.normalizeMpDataId = normalizeMpDataId;
exports.parseMpXSignature = parseMpXSignature;
exports.buildMpWebhookManifest = buildMpWebhookManifest;
exports.timingSafeEqualHex = timingSafeEqualHex;
exports.isMpTimestampWithinWindow = isMpTimestampWithinWindow;
exports.verifyMercadoPagoWebhookSignature = verifyMercadoPagoWebhookSignature;
const crypto_1 = __importDefault(require("crypto"));
exports.MP_WEBHOOK_TS_TOLERANCE_MS = 300_000; // ±5 minutes (MP ts is milliseconds)
class MpWebhookAuthError extends Error {
    code;
    constructor(code, message = 'Unauthorized webhook') {
        super(message);
        this.name = 'MpWebhookAuthError';
        this.code = code;
    }
}
exports.MpWebhookAuthError = MpWebhookAuthError;
function isAlphanumeric(value) {
    return /^[a-zA-Z0-9]+$/.test(value);
}
/** Official: alphanumeric data.id → lowercase in the manifest. */
function normalizeMpDataId(dataId) {
    if (dataId == null || dataId === '')
        return undefined;
    return isAlphanumeric(dataId) ? dataId.toLowerCase() : dataId;
}
function parseMpXSignature(xSignature) {
    let ts;
    let v1;
    for (const part of xSignature.split(',')) {
        const [rawKey, ...rest] = part.split('=');
        const key = rawKey?.trim();
        const value = rest.join('=').trim();
        if (!key || !value)
            continue;
        if (key === 'ts')
            ts = value;
        if (key === 'v1')
            v1 = value;
    }
    if (!ts || !v1)
        return null;
    return { ts, v1 };
}
/**
 * Manifest: `id:[data.id];request-id:[x-request-id];ts:[ts];`
 * Omit pairs whose values are absent before HMAC.
 */
function buildMpWebhookManifest(parts) {
    const chunks = [];
    if (parts.dataId)
        chunks.push(`id:${parts.dataId}`);
    if (parts.requestId)
        chunks.push(`request-id:${parts.requestId}`);
    chunks.push(`ts:${parts.ts}`);
    return `${chunks.join(';')};`;
}
function timingSafeEqualHex(a, b) {
    try {
        const bufA = Buffer.from(a, 'utf8');
        const bufB = Buffer.from(b, 'utf8');
        if (bufA.length !== bufB.length)
            return false;
        return crypto_1.default.timingSafeEqual(bufA, bufB);
    }
    catch {
        return false;
    }
}
function isMpTimestampWithinWindow(tsMs, nowMs, toleranceMs = exports.MP_WEBHOOK_TS_TOLERANCE_MS) {
    if (!Number.isFinite(tsMs))
        return false;
    return Math.abs(nowMs - tsMs) <= toleranceMs;
}
/**
 * Validates Mercado Pago webhook `x-signature` (HMAC-SHA256 hex of official manifest).
 * Throws MpWebhookAuthError on failure — never logs the secret or expected hash.
 */
function verifyMercadoPagoWebhookSignature(input) {
    const secret = input.secret;
    if (!secret) {
        throw new MpWebhookAuthError('missing_secret');
    }
    if (!input.xSignature) {
        throw new MpWebhookAuthError('missing_signature');
    }
    const parsed = parseMpXSignature(input.xSignature);
    if (!parsed) {
        throw new MpWebhookAuthError('invalid_signature');
    }
    const nowMs = input.nowMs ?? Date.now();
    const tsMs = Number(parsed.ts);
    if (!isMpTimestampWithinWindow(tsMs, nowMs)) {
        throw new MpWebhookAuthError('timestamp_out_of_window');
    }
    const dataId = normalizeMpDataId(input.dataIdFromQuery);
    const requestId = input.xRequestId?.trim() || undefined;
    const manifest = buildMpWebhookManifest({
        dataId,
        requestId,
        ts: parsed.ts,
    });
    const expected = crypto_1.default.createHmac('sha256', secret).update(manifest).digest('hex');
    if (!timingSafeEqualHex(expected, parsed.v1)) {
        throw new MpWebhookAuthError('invalid_signature');
    }
}
