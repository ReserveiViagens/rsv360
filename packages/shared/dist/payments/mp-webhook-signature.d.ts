export declare const MP_WEBHOOK_TS_TOLERANCE_MS = 300000;
export declare class MpWebhookAuthError extends Error {
    readonly code: 'missing_signature' | 'invalid_signature' | 'timestamp_out_of_window' | 'missing_secret';
    constructor(code: MpWebhookAuthError['code'], message?: string);
}
export type MpWebhookVerifyInput = {
    xSignature: string | undefined;
    xRequestId: string | undefined;
    /** Prefer query `data.id` (official MP docs). */
    dataIdFromQuery: string | undefined;
    secret: string | undefined;
    /** Injectable clock for tests (ms since epoch). */
    nowMs?: number;
};
/** Official: alphanumeric data.id → lowercase in the manifest. */
export declare function normalizeMpDataId(dataId: string | undefined): string | undefined;
export declare function parseMpXSignature(xSignature: string): {
    ts: string;
    v1: string;
} | null;
/**
 * Manifest: `id:[data.id];request-id:[x-request-id];ts:[ts];`
 * Omit pairs whose values are absent before HMAC.
 */
export declare function buildMpWebhookManifest(parts: {
    dataId?: string;
    requestId?: string;
    ts: string;
}): string;
export declare function timingSafeEqualHex(a: string, b: string): boolean;
export declare function isMpTimestampWithinWindow(tsMs: number, nowMs: number, toleranceMs?: number): boolean;
/**
 * Validates Mercado Pago webhook `x-signature` (HMAC-SHA256 hex of official manifest).
 * Throws MpWebhookAuthError on failure — never logs the secret or expected hash.
 */
export declare function verifyMercadoPagoWebhookSignature(input: MpWebhookVerifyInput): void;
