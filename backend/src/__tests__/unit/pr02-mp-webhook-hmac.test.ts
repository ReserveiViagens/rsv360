import crypto from 'crypto';
import express from 'express';
import request from 'supertest';
import {
  buildMpWebhookManifest,
  normalizeMpDataId,
  verifyMercadoPagoWebhookSignature,
  MpWebhookAuthError,
} from '../../../server/modules/payments/lib/mp-webhook-signature';
import { settleFromRedirectQuery } from '../../../server/modules/payments/lib/mp-payment-return';

const TEST_SECRET = 'pr02-mp-webhook-test-secret';

function signManifest(manifest: string, secret = TEST_SECRET): string {
  return crypto.createHmac('sha256', secret).update(manifest).digest('hex');
}

function buildSignedHeaders(opts: {
  dataId: string;
  requestId: string;
  ts: number;
  secret?: string;
}): { 'x-signature': string; 'x-request-id': string } {
  const dataId = normalizeMpDataId(opts.dataId)!;
  const manifest = buildMpWebhookManifest({
    dataId,
    requestId: opts.requestId,
    ts: String(opts.ts),
  });
  const v1 = signManifest(manifest, opts.secret);
  return {
    'x-signature': `ts=${opts.ts},v1=${v1}`,
    'x-request-id': opts.requestId,
  };
}

/** In-memory stand-in for webhook_events UNIQUE(external_event_id). */
function createWebhookDbMock() {
  const rows = new Map<
    string,
    {
      id: string;
      provider: string;
      externalEventId: string;
      eventType: string;
      payload: unknown;
      processed: boolean;
      processedAt: Date | null;
      error: string | null;
      retryCount: number;
    }
  >();

  const api = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            const id = (api as { _lastWhereId?: string })._lastWhereId;
            if (!id || !rows.has(id)) return [];
            return [rows.get(id)!];
          },
        }),
        limit: () => ({
          offset: () => ({
            orderBy: async () => [...rows.values()],
          }),
        }),
      }),
    }),
    insert: () => ({
      values: async (values: {
        provider: string;
        externalEventId: string;
        eventType: string;
        payload: unknown;
      }) => {
        if (rows.has(values.externalEventId)) {
          const err = new Error('unique_violation') as Error & { code: string };
          err.code = '23505';
          throw err;
        }
        rows.set(values.externalEventId, {
          id: `uuid-${values.externalEventId}`,
          provider: values.provider,
          externalEventId: values.externalEventId,
          eventType: values.eventType,
          payload: values.payload,
          processed: false,
          processedAt: null,
          error: null,
          retryCount: 0,
        });
      },
    }),
    update: () => ({
      set: (patch: Record<string, unknown>) => ({
        where: async () => {
          for (const row of rows.values()) {
            if (row.id === (api as { _lastUpdateId?: string })._lastUpdateId || true) {
              Object.assign(row, patch);
            }
          }
        },
      }),
    }),
    _rows: rows,
    _lastWhereId: undefined as string | undefined,
    _lastUpdateId: undefined as string | undefined,
  };

  // drizzle eq() returns opaque; we intercept by patching eq mock to stash id
  return api;
}

describe('PR-02 — Mercado Pago webhook HMAC + idempotency', () => {
  const prevSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  let mockDb: ReturnType<typeof createWebhookDbMock>;
  let eqStore: { value?: string };

  beforeAll(() => {
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    if (prevSecret === undefined) {
      delete process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    } else {
      process.env.MERCADO_PAGO_WEBHOOK_SECRET = prevSecret;
    }
  });

  beforeEach(() => {
    jest.resetModules();
    mockDb = createWebhookDbMock();
    eqStore = {};

    // Resolve to the same absolute modules webhook.service requires.
    jest.doMock('../../db/drizzle', () => ({ db: mockDb }));
    jest.doMock('../../db/schema', () => ({
      webhookEvents: {
        externalEventId: 'externalEventId',
        id: 'id',
        processed: 'processed',
        createdAt: 'createdAt',
      },
    }));
    jest.doMock('drizzle-orm', () => ({
      eq: (_col: unknown, value: string) => {
        eqStore.value = value;
        (mockDb as { _lastWhereId?: string })._lastWhereId = value;
        return { __eq: value };
      },
    }));
    jest.doMock('../../../server/modules/payments/factory', () => ({
      getPaymentProvider: () => ({
        name: 'mercadopago',
        verifyWebhookSignature: () => true,
      }),
    }));
  });

  afterEach(() => {
    jest.dontMock('../../db/drizzle');
    jest.dontMock('../../db/schema');
    jest.dontMock('drizzle-orm');
    jest.dontMock('../../../server/modules/payments/factory');
  });

  function loadService() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../../server/modules/payments/services/webhook.service') as typeof import('../../../server/modules/payments/services/webhook.service');
  }

  function loadPublicRouter() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('../../../server/modules/payments/routes/webhook-public.routes');
    return mod.default || mod;
  }

  it('normalizeMpDataId lowercases alphanumeric ids', () => {
    expect(normalizeMpDataId('ORD01ABC')).toBe('ord01abc');
    expect(normalizeMpDataId('12345')).toBe('12345');
  });

  it('webhook válido → processa exatamente 1x (processEvent chamado uma vez)', async () => {
    const { WebhookService } = loadService();
    const service = new WebhookService();
    const spy = jest.spyOn(service, 'processEvent');

    const now = Date.now();
    const dataId = '123456789';
    const requestId = 'req-valid-1';
    const headers = buildSignedHeaders({ dataId, requestId, ts: now });
    const body = {
      id: 'evt-mp-1',
      type: 'payment',
      data: { id: dataId },
    };

    const result = await service.processMPWebhook({
      body,
      query: { 'data.id': dataId },
      xSignature: headers['x-signature'],
      xRequestId: headers['x-request-id'],
      nowMs: now,
    });

    expect(result).toEqual({ received: true, duplicate: false });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('evt-mp-1');
    expect(mockDb._rows.has('evt-mp-1')).toBe(true);
  });

  it('replay do mesmo event_id → 200 e processEvent NÃO é chamado', async () => {
    const { WebhookService } = loadService();
    const service = new WebhookService();

    const now = Date.now();
    const dataId = '987654321';
    const requestId = 'req-replay-1';
    const headers = buildSignedHeaders({ dataId, requestId, ts: now });
    const body = {
      id: 'evt-mp-replay',
      type: 'payment',
      data: { id: dataId },
    };
    const input = {
      body,
      query: { 'data.id': dataId },
      xSignature: headers['x-signature'],
      xRequestId: headers['x-request-id'],
      nowMs: now,
    };

    await service.processMPWebhook(input);

    const spy = jest.spyOn(service, 'processEvent');
    const replay = await service.processMPWebhook(input);

    expect(replay).toEqual({ received: true, duplicate: true });
    expect(spy).not.toHaveBeenCalled();
  });

  it('assinatura inválida → 401 + logado (sem vazar secret)', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const app = express();
    app.use(express.json());
    app.use('/webhooks', loadPublicRouter());

    const now = Date.now();
    const dataId = '111';
    const res = await request(app)
      .post('/webhooks/mercadopago')
      .query({ 'data.id': dataId })
      .set('x-signature', `ts=${now},v1=deadbeefcafebabe`)
      .set('x-request-id', 'req-bad')
      .send({ id: 'evt-bad', type: 'payment', data: { id: dataId } });

    expect(res.status).toBe(401);
    expect(warnSpy).toHaveBeenCalled();
    const logged = String(warnSpy.mock.calls[0][0]);
    expect(logged).toContain('mp_webhook_auth_failed');
    expect(logged).not.toContain(TEST_SECRET);
    expect(logged).not.toContain('deadbeef');
    warnSpy.mockRestore();
  });

  it('assinatura ausente → 401', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const app = express();
    app.use(express.json());
    app.use('/webhooks', loadPublicRouter());

    const res = await request(app)
      .post('/webhooks/mercadopago')
      .query({ 'data.id': '222' })
      .send({ id: 'evt-nosig', type: 'payment' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
    warnSpy.mockRestore();
  });

  it('ts fora da janela (ms) → rejeitado', () => {
    const now = Date.now();
    const staleTs = now - 301_000; // > 5 min
    const dataId = '333';
    const requestId = 'req-stale';
    const headers = buildSignedHeaders({ dataId, requestId, ts: staleTs });

    expect(() =>
      verifyMercadoPagoWebhookSignature({
        xSignature: headers['x-signature'],
        xRequestId: headers['x-request-id'],
        dataIdFromQuery: dataId,
        secret: TEST_SECRET,
        nowMs: now,
      }),
    ).toThrow(MpWebhookAuthError);

    try {
      verifyMercadoPagoWebhookSignature({
        xSignature: headers['x-signature'],
        xRequestId: headers['x-request-id'],
        dataIdFromQuery: dataId,
        secret: TEST_SECRET,
        nowMs: now,
      });
    } catch (e) {
      expect((e as MpWebhookAuthError).code).toBe('timestamp_out_of_window');
    }
  });

  it('redirect de retorno adulterado (?status=approved) → NÃO dá baixa', () => {
    const result = settleFromRedirectQuery({
      status: 'approved',
      collection_status: 'approved',
      payment_id: '999',
    });
    expect(result.settled).toBe(false);
    expect(result.reason).toBe('redirect_query_forbidden');
  });

  it('HTTP replay path: second POST returns 200 without re-processing', async () => {
    const { WebhookService } = loadService();
    // Route instantiates its own service — spy via prototype
    const processSpy = jest.spyOn(WebhookService.prototype, 'processEvent');

    const app = express();
    app.use(express.json());
    app.use('/webhooks', loadPublicRouter());

    const now = Date.now();
    const dataId = '444555';
    const requestId = 'req-http-replay';
    const headers = buildSignedHeaders({ dataId, requestId, ts: now });
    const body = { id: 'evt-http-1', type: 'payment', data: { id: dataId } };

    const first = await request(app)
      .post('/webhooks/mercadopago')
      .query({ 'data.id': dataId })
      .set(headers)
      .send(body);

    expect(first.status).toBe(200);
    expect(first.body.duplicate).toBe(false);
    expect(processSpy).toHaveBeenCalledTimes(1);

    processSpy.mockClear();

    const second = await request(app)
      .post('/webhooks/mercadopago')
      .query({ 'data.id': dataId })
      .set(headers)
      .send(body);

    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);
    expect(processSpy).not.toHaveBeenCalled();

    processSpy.mockRestore();
  });
});
