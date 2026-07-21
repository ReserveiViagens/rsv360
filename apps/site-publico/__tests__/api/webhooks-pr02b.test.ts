/**
 * PR-02b — Next MP HMAC + idempotência (replay spy) + receive 410
 */
import crypto from 'crypto';
import { describe, it, expect, beforeEach, afterAll, jest } from '@jest/globals';
import {
  buildMpWebhookManifest,
  normalizeMpDataId,
  verifyMercadoPagoWebhookSignature,
} from '@rsv360/shared';
import { authorizeMercadoPagoWebhook, isAlreadyProcessedWebhook } from '@/lib/mp-webhook-auth';
import { handleMercadoPagoWebhook } from '@/lib/mp-webhook-handler';
import { POST as klarnaPost } from '@/app/api/webhooks/receive/klarna/route';
import { POST as kakauPost } from '@/app/api/webhooks/receive/kakau/route';

const TEST_SECRET = 'pr02b-mp-webhook-test-secret';

function sign(dataId: string, requestId: string, ts: number, secret = TEST_SECRET) {
  const id = normalizeMpDataId(dataId)!;
  const manifest = buildMpWebhookManifest({ dataId: id, requestId, ts: String(ts) });
  const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': requestId };
}

describe('PR-02b — Next MP authorize + idempotency + receive disable', () => {
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

  it('assinatura válida → 200 e processWebhookEvent exatamente 1x', async () => {
    const now = Date.now();
    const dataId = '555666';
    const signed = sign(dataId, 'req-ok', now);
    const processSpy = jest.fn(async () => ({
      processed: true,
      payment_status: 'pending',
    }));
    const querySpy = jest.fn(async () => []);
    const emailSpy = jest.fn(async () => true);

    const res = await handleMercadoPagoWebhook(
      {
        xSignature: signed['x-signature'],
        xRequestId: signed['x-request-id'],
        dataIdFromQuery: dataId,
        body: { id: 'evt-ok-1', type: 'payment', data: { id: dataId } },
        nowMs: now,
      },
      {
        queryDatabase: querySpy as never,
        processWebhookEvent: processSpy as never,
        sendPaymentConfirmed: emailSpy as never,
      },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.processed).toBe(true);
    expect(json.duplicate).toBe(false);
    expect(processSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).not.toHaveBeenCalled(); // payment_status pending → sem e-mail
  });

  it('replay assinado do mesmo event_id → 200 sem side-effect (spy)', async () => {
    const now = Date.now();
    const dataId = '777888';
    const eventId = 'evt-replay-1';
    const signed = sign(dataId, 'req-replay', now);
    const processSpy = jest.fn(async () => ({
      processed: true,
      payment_status: 'paid',
    }));
    const emailSpy = jest.fn(async () => true);
    // webhook_logs já tem processed=TRUE para este event_id
    const querySpy = jest.fn(async () => [{ id: 99 }]);

    const res = await handleMercadoPagoWebhook(
      {
        xSignature: signed['x-signature'],
        xRequestId: signed['x-request-id'],
        dataIdFromQuery: dataId,
        body: { id: eventId, type: 'payment', data: { id: dataId } },
        nowMs: now,
      },
      {
        queryDatabase: querySpy as never,
        processWebhookEvent: processSpy as never,
        sendPaymentConfirmed: emailSpy as never,
      },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.duplicate).toBe(true);
    expect(processSpy).not.toHaveBeenCalled();
    expect(emailSpy).not.toHaveBeenCalled();
    expect(querySpy).toHaveBeenCalledWith(
      expect.stringContaining('webhook_logs'),
      [eventId],
    );
  });

  it('isAlreadyProcessedWebhook helper', () => {
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
