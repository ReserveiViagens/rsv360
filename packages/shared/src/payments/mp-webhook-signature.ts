import crypto from 'crypto';

export const MP_WEBHOOK_TS_TOLERANCE_MS = 300_000; // ±5 minutes (MP ts is milliseconds)

export class MpWebhookAuthError extends Error {
  readonly code: 'missing_signature' | 'invalid_signature' | 'timestamp_out_of_window' | 'missing_secret';

  constructor(
    code: MpWebhookAuthError['code'],
    message = 'Unauthorized webhook',
  ) {
    super(message);
    this.name = 'MpWebhookAuthError';
    this.code = code;
  }
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

function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

/** Official: alphanumeric data.id → lowercase in the manifest. */
export function normalizeMpDataId(dataId: string | undefined): string | undefined {
  if (dataId == null || dataId === '') return undefined;
  return isAlphanumeric(dataId) ? dataId.toLowerCase() : dataId;
}

export function parseMpXSignature(xSignature: string): { ts: string; v1: string } | null {
  let ts: string | undefined;
  let v1: string | undefined;
  for (const part of xSignature.split(',')) {
    const [rawKey, ...rest] = part.split('=');
    const key = rawKey?.trim();
    const value = rest.join('=').trim();
    if (!key || !value) continue;
    if (key === 'ts') ts = value;
    if (key === 'v1') v1 = value;
  }
  if (!ts || !v1) return null;
  return { ts, v1 };
}

/**
 * Manifest: `id:[data.id];request-id:[x-request-id];ts:[ts];`
 * Omit pairs whose values are absent before HMAC.
 */
export function buildMpWebhookManifest(parts: {
  dataId?: string;
  requestId?: string;
  ts: string;
}): string {
  const chunks: string[] = [];
  if (parts.dataId) chunks.push(`id:${parts.dataId}`);
  if (parts.requestId) chunks.push(`request-id:${parts.requestId}`);
  chunks.push(`ts:${parts.ts}`);
  return `${chunks.join(';')};`;
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function isMpTimestampWithinWindow(
  tsMs: number,
  nowMs: number,
  toleranceMs = MP_WEBHOOK_TS_TOLERANCE_MS,
): boolean {
  if (!Number.isFinite(tsMs)) return false;
  return Math.abs(nowMs - tsMs) <= toleranceMs;
}

/**
 * Validates Mercado Pago webhook `x-signature` (HMAC-SHA256 hex of official manifest).
 * Throws MpWebhookAuthError on failure — never logs the secret or expected hash.
 */
export function verifyMercadoPagoWebhookSignature(input: MpWebhookVerifyInput): void {
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

  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  if (!timingSafeEqualHex(expected, parsed.v1)) {
    throw new MpWebhookAuthError('invalid_signature');
  }
}
