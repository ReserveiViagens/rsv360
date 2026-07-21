import { MpWebhookAuthError, verifyMercadoPagoWebhookSignature } from '@rsv360/shared';

export type MpAuthorizeInput = {
  xSignature: string | undefined;
  xRequestId: string | undefined;
  dataIdFromQuery: string | undefined;
  secret: string | undefined;
  nowMs?: number;
};

export type MpAuthorizeResult =
  | { ok: true }
  | { ok: false; code: MpWebhookAuthError['code'] };

/** Pure helper — used by handler and unit-tested (replay = zero side-effect). */
export function isAlreadyProcessedWebhook(
  rows: Array<{ id?: unknown }> | null | undefined,
): boolean {
  return Array.isArray(rows) && rows.length > 0;
}

/** Fail-closed HMAC gate used by the Next MP webhook handler. */
export function authorizeMercadoPagoWebhook(input: MpAuthorizeInput): MpAuthorizeResult {
  try {
    verifyMercadoPagoWebhookSignature({
      xSignature: input.xSignature,
      xRequestId: input.xRequestId,
      dataIdFromQuery: input.dataIdFromQuery,
      secret: input.secret,
      nowMs: input.nowMs,
    });
    return { ok: true };
  } catch (error) {
    if (
      error instanceof MpWebhookAuthError ||
      (typeof error === 'object' &&
        error !== null &&
        (error as { name?: string }).name === 'MpWebhookAuthError')
    ) {
      return {
        ok: false,
        code: (error as MpWebhookAuthError).code ?? 'invalid_signature',
      };
    }
    throw error;
  }
}
