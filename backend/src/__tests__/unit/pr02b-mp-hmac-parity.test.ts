/**
 * PR-02b — parity: backend re-export and @rsv360/shared agree on HMAC veredict.
 */
import crypto from 'crypto';
import {
  buildMpWebhookManifest,
  normalizeMpDataId,
  verifyMercadoPagoWebhookSignature as verifyShared,
  MpWebhookAuthError as SharedError,
} from '@rsv360/shared';
import {
  verifyMercadoPagoWebhookSignature as verifyBackend,
  MpWebhookAuthError as BackendError,
} from '../../../server/modules/payments/lib/mp-webhook-signature';

const SECRET = 'pr02b-parity-secret';

function sign(dataId: string, requestId: string, ts: number) {
  const id = normalizeMpDataId(dataId)!;
  const manifest = buildMpWebhookManifest({ dataId: id, requestId, ts: String(ts) });
  const v1 = crypto.createHmac('sha256', SECRET).update(manifest).digest('hex');
  return `ts=${ts},v1=${v1}`;
}

describe('PR-02b — MP HMAC parity shared ↔ backend re-export', () => {
  it('mesmo input → mesmo aceito nas duas superfícies', () => {
    const now = Date.now();
    const dataId = 'ParityId99';
    const requestId = 'req-parity';
    const xSignature = sign(dataId, requestId, now);
    const input = {
      xSignature,
      xRequestId: requestId,
      dataIdFromQuery: dataId,
      secret: SECRET,
      nowMs: now,
    };
    expect(() => verifyShared(input)).not.toThrow();
    expect(() => verifyBackend(input)).not.toThrow();
  });

  it('mesmo input inválido → rejeitado nas duas', () => {
    const input = {
      xSignature: undefined as string | undefined,
      xRequestId: 'r',
      dataIdFromQuery: '1',
      secret: SECRET,
    };
    expect(() => verifyShared(input)).toThrow(SharedError);
    expect(() => verifyBackend(input)).toThrow(BackendError);
  });
});
