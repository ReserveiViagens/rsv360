/**
 * PR-02b — Next MP HMAC gate (pure) + receive 410
 * (Evita mock de @/lib/db — automock do site-publico está quebrado no ambiente.)
 */
import crypto from 'crypto';
import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import {
  buildMpWebhookManifest,
  normalizeMpDataId,
  verifyMercadoPagoWebhookSignature,
} from '@rsv360/shared';
import { authorizeMercadoPagoWebhook, isAlreadyProcessedWebhook } from '@/lib/mp-webhook-auth';
import { POST as klarnaPost } from '@/app/api/webhooks/receive/klarna/route';
import { POST as kakauPost } from '@/app/api/webhooks/receive/kakau/route';

const TEST_SECRET = 'pr02b-mp-webhook-test-secret';

function sign(dataId: string, requestId: string, ts: number, secret = TEST_SECRET) {
  const id = normalizeMpDataId(dataId)!;
  const manifest = buildMpWebhookManifest({ dataId: id, requestId, ts: String(ts) });
  const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': requestId };
}

describe('PR-02b — Next MP authorize + receive disable', () => {
  const prevSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    if (prevSecret === undefined) delete process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    else process.env.MERCADO_PAGO_WEBHOOK_SECRET = prevSecret;
  });

  it('sem headers → 401 (missing_signature)', () => {
    const result = authorizeMercadoPagoWebhook({
      xSignature: undefined,
      xRequestId: undefined,
      dataIdFromQuery: '1',
      secret: TEST_SECRET,
    });
    expect(result).toEqual({ ok: false, code: 'missing_signature' });
  });

  it('assinatura inválida → 401', () => {
    const now = Date.now();
    const result = authorizeMercadoPagoWebhook({
      xSignature: `ts=${now},v1=deadbeef`,
      xRequestId: 'req-bad',
      dataIdFromQuery: '1',
      secret: TEST_SECRET,
      nowMs: now,
    });
    expect(result).toEqual({ ok: false, code: 'invalid_signature' });
  });

  it('assinatura válida → ok (processa 1x no handler; gate passa)', () => {
    const now = Date.now();
    const dataId = '555666';
    const signed = sign(dataId, 'req-ok', now);
    const result = authorizeMercadoPagoWebhook({
      xSignature: signed['x-signature'],
      xRequestId: signed['x-request-id'],
      dataIdFromQuery: dataId,
      secret: TEST_SECRET,
      nowMs: now,
    });
    expect(result).toEqual({ ok: true });
  });

  it('replay → already processed ⇒ skip side-effect', () => {
    expect(isAlreadyProcessedWebhook([{ id: 99 }])).toBe(true);
    expect(isAlreadyProcessedWebhook([])).toBe(false);
    expect(isAlreadyProcessedWebhook(undefined)).toBe(false);
  });

  it('paridade: shared verify aceita o mesmo vetor do Express (#125)', () => {
    const now = Date.now();
    const dataId = 'ORD01ABC';
    const requestId = 'parity-req';
    const headers = sign(dataId, requestId, now);
    expect(() =>
      verifyMercadoPagoWebhookSignature({
        xSignature: headers['x-signature'],
        xRequestId: headers['x-request-id'],
        dataIdFromQuery: dataId,
        secret: TEST_SECRET,
        nowMs: now,
      }),
    ).not.toThrow();
  });

  it('receive/klarna → 410', async () => {
    const res = await klarnaPost();
    expect(res.status).toBe(410);
  });

  it('receive/kakau → 410', async () => {
    const res = await kakauPost();
    expect(res.status).toBe(410);
  });
});
