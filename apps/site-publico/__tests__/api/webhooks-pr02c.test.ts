/**
 * PR-02c — MP API lookup before baixa (injectable deps).
 */
import crypto from 'crypto';
import { describe, it, expect, beforeEach, afterAll, jest } from '@jest/globals';
import {
  buildMpWebhookManifest,
  normalizeMpDataId,
} from '@rsv360/shared';
import { handleMercadoPagoWebhook } from '@/lib/mp-webhook-handler';
import {
  MpApiUnavailableError,
  logMpStatusDivergence,
  mapMpPaymentStatus,
  sanitizeMpApiStatusLabel,
} from '@/lib/mp-payment-lookup';
import { processPaymentWebhook } from '@/lib/mercadopago-enhanced';

const TEST_SECRET = 'pr02c-mp-webhook-test-secret';

function sign(dataId: string, requestId: string, ts: number, secret = TEST_SECRET) {
  const id = normalizeMpDataId(dataId)!;
  const manifest = buildMpWebhookManifest({ dataId: id, requestId, ts: String(ts) });
  const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': requestId };
}

describe('PR-02c — mp-payment-lookup helpers', () => {
  it('mapMpPaymentStatus', () => {
    expect(mapMpPaymentStatus('approved')).toBe('paid');
    expect(mapMpPaymentStatus('rejected')).toBe('failed');
    expect(mapMpPaymentStatus('cancelled')).toBe('cancelled');
  });

  it('sanitizeMpApiStatusLabel allowlist', () => {
    expect(sanitizeMpApiStatusLabel('approved')).toBe('approved');
    expect(sanitizeMpApiStatusLabel('totally-fake<script>')).toBe('unrecognized');
  });

  it('logMpStatusDivergence só quando diverge', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    logMpStatusDivergence({
      paymentId: '1',
      eventStatus: 'approved',
      apiStatus: 'approved',
    });
    expect(spy).not.toHaveBeenCalled();
    logMpStatusDivergence({
      paymentId: '1',
      eventStatus: 'approved',
      apiStatus: 'pending',
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('PR-02c — processPaymentWebhook lookup always', () => {
  it('evento approved + API approved → baixa 1x (booking confirmed)', async () => {
    const getPaymentStatus = jest.fn(async () => ({ status: 'approved', id: 'pay-1' }));
    const updateBookingStatus = jest.fn(async () => undefined);
    const logStatusChange = jest.fn(async () => undefined);
    const queryDatabase = jest.fn(async (sql: string) => {
      if (sql.includes('FROM payments')) {
        return [
          {
            id: 10,
            booking_id: 20,
            payment_status: 'pending',
            paid_at: null,
            gateway_transaction_id: 'pay-1',
          },
        ];
      }
      if (sql.includes('FROM bookings')) {
        return [{ id: 20, customer_email: 'a@example.com', status: 'pending' }];
      }
      return [];
    });

    const result = await processPaymentWebhook(
      {
        id: 'evt-1',
        type: 'payment',
        data: { id: 'pay-1', status: 'approved' },
      },
      {
        queryDatabase: queryDatabase as never,
        getPaymentStatus: getPaymentStatus as never,
        updateBookingStatus: updateBookingStatus as never,
        logStatusChange: logStatusChange as never,
      },
    );

    expect(getPaymentStatus).toHaveBeenCalledWith('pay-1');
    expect(result.processed).toBe(true);
    expect(result.payment_status).toBe('paid');
    expect(updateBookingStatus).toHaveBeenCalledWith(
      20,
      'confirmed',
      undefined,
      'a@example.com',
      expect.stringContaining('API MP approved'),
    );
  });

  it('evento approved + API pending → sem confirm (pending); lookup chamado', async () => {
    const getPaymentStatus = jest.fn(async () => ({ status: 'pending', id: 'pay-2' }));
    const updateBookingStatus = jest.fn(async () => undefined);
    const logStatusChange = jest.fn(async () => undefined);
    const queryDatabase = jest.fn(async (sql: string) => {
      if (sql.includes('FROM payments')) {
        return [
          {
            id: 11,
            booking_id: 21,
            payment_status: 'pending',
            paid_at: null,
            gateway_transaction_id: 'pay-2',
          },
        ];
      }
      if (sql.includes('FROM bookings')) {
        return [{ id: 21, customer_email: 'b@example.com', status: 'pending' }];
      }
      return [];
    });

    const result = await processPaymentWebhook(
      {
        id: 'evt-2',
        data: { id: 'pay-2', status: 'approved' },
      },
      {
        queryDatabase: queryDatabase as never,
        getPaymentStatus: getPaymentStatus as never,
        updateBookingStatus: updateBookingStatus as never,
        logStatusChange: logStatusChange as never,
      },
    );

    expect(getPaymentStatus).toHaveBeenCalledTimes(1);
    expect(result.payment_status).toBe('pending');
    expect(updateBookingStatus).not.toHaveBeenCalled();
  });

  it('evento approved + API rejected → cancela (só pela API)', async () => {
    const getPaymentStatus = jest.fn(async () => ({ status: 'rejected', id: 'pay-3' }));
    const updateBookingStatus = jest.fn(async () => undefined);
    const logStatusChange = jest.fn(async () => undefined);
    const queryDatabase = jest.fn(async (sql: string) => {
      if (sql.includes('FROM payments')) {
        return [
          {
            id: 12,
            booking_id: 22,
            payment_status: 'pending',
            paid_at: null,
            gateway_transaction_id: 'pay-3',
          },
        ];
      }
      if (sql.includes('FROM bookings')) {
        return [{ id: 22, customer_email: 'c@example.com', status: 'pending' }];
      }
      return [];
    });

    const result = await processPaymentWebhook(
      {
        id: 'evt-3',
        data: { id: 'pay-3', status: 'approved' },
      },
      {
        queryDatabase: queryDatabase as never,
        getPaymentStatus: getPaymentStatus as never,
        updateBookingStatus: updateBookingStatus as never,
        logStatusChange: logStatusChange as never,
      },
    );

    expect(result.payment_status).toBe('failed');
    expect(updateBookingStatus).toHaveBeenCalledWith(
      22,
      'cancelled',
      undefined,
      'c@example.com',
      expect.stringContaining('API MP'),
    );
  });

  it('API indisponível → MpApiUnavailableError (fail-closed)', async () => {
    const getPaymentStatus = jest.fn(async () => {
      throw new Error('timeout');
    });
    await expect(
      processPaymentWebhook(
        { id: 'evt-4', data: { id: 'pay-4', status: 'approved' } },
        {
          queryDatabase: jest.fn(async () => []) as never,
          getPaymentStatus: getPaymentStatus as never,
          updateBookingStatus: jest.fn(async () => undefined) as never,
          logStatusChange: jest.fn(async () => undefined) as never,
        },
      ),
    ).rejects.toBeInstanceOf(MpApiUnavailableError);
  });
});

describe('PR-02c — handler 503 + replay', () => {
  const prevSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    if (prevSecret === undefined) delete process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    else process.env.MERCADO_PAGO_WEBHOOK_SECRET = prevSecret;
  });

  it('API unavailable no process → 503; sem e-mail', async () => {
    const now = Date.now();
    const dataId = '999001';
    const signed = sign(dataId, 'req-503', now);
    const processSpy = jest.fn(async () => {
      throw new MpApiUnavailableError('upstream down');
    });
    const emailSpy = jest.fn(async () => true);

    const res = await handleMercadoPagoWebhook(
      {
        xSignature: signed['x-signature'],
        xRequestId: signed['x-request-id'],
        dataIdFromQuery: dataId,
        body: { id: 'evt-503', type: 'payment', data: { id: dataId, status: 'approved' } },
        nowMs: now,
      },
      {
        queryDatabase: jest.fn(async () => []) as never,
        processWebhookEvent: processSpy as never,
        sendPaymentConfirmed: emailSpy as never,
      },
    );

    expect(res.status).toBe(503);
    expect(emailSpy).not.toHaveBeenCalled();
  });

  it('replay → duplicate sem process', async () => {
    const now = Date.now();
    const dataId = '999002';
    const signed = sign(dataId, 'req-dup', now);
    const processSpy = jest.fn(async () => ({ processed: true, payment_status: 'paid' }));
    const emailSpy = jest.fn(async () => true);

    const res = await handleMercadoPagoWebhook(
      {
        xSignature: signed['x-signature'],
        xRequestId: signed['x-request-id'],
        dataIdFromQuery: dataId,
        body: { id: 'evt-dup', type: 'payment', data: { id: dataId } },
        nowMs: now,
      },
      {
        queryDatabase: jest.fn(async () => [{ id: 1 }]) as never,
        processWebhookEvent: processSpy as never,
        sendPaymentConfirmed: emailSpy as never,
      },
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.duplicate).toBe(true);
    expect(processSpy).not.toHaveBeenCalled();
  });
});
