/**
 * PR-02c live smoke — signed MP webhook against Next (:3000).
 * Cases: approved+API → processed 1x · replay duplicate:true · 503 no processed.
 * Secrets only via env (never print).
 */
import crypto from 'crypto';
import http from 'http';
import { Client } from 'pg';
import {
  buildMpWebhookManifest,
  normalizeMpDataId,
} from '../packages/shared/dist/payments/mp-webhook-signature.js';

const BASE = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET || '';
const MOCK_PORT = Number(process.env.SMOKE_MP_MOCK_PORT || 19099);
const PAY_ID = process.env.SMOKE_PAYMENT_ID || `smoke${Date.now()}`;
const EVT_ID = process.env.SMOKE_EVENT_ID || `evt-${PAY_ID}`;

function requireSecret() {
  if (!SECRET || SECRET === 'valor_novo_aqui' || SECRET.length < 16) {
    console.error('FAIL: MERCADO_PAGO_WEBHOOK_SECRET ausente ou placeholder');
    process.exit(2);
  }
}

function sign(dataId, requestId, ts = Date.now()) {
  const id = normalizeMpDataId(dataId);
  const manifest = buildMpWebhookManifest({
    dataId: id,
    requestId,
    ts: String(ts),
  });
  const v1 = crypto.createHmac('sha256', SECRET).update(manifest).digest('hex');
  return {
    'x-signature': `ts=${ts},v1=${v1}`,
    'x-request-id': requestId,
    ts,
  };
}

async function postWebhook({ dataId, body, requestId }) {
  const signed = sign(dataId, requestId);
  const url = `${BASE}/api/webhooks/mercadopago?data.id=${encodeURIComponent(dataId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature': signed['x-signature'],
      'x-request-id': signed['x-request-id'],
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

function startMpMock({ mode }) {
  // mode: 'approved' | 'down'
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (mode === 'down') {
        res.writeHead(503, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ message: 'down' }));
        return;
      }
      if (req.method === 'GET' && req.url?.startsWith('/v1/payments/')) {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ id: PAY_ID, status: 'approved' }));
        return;
      }
      res.writeHead(404);
      res.end('{}');
    });
    server.listen(MOCK_PORT, '127.0.0.1', () => resolve(server));
  });
}

function dbClient() {
  return new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5433),
    database: process.env.DB_NAME || process.env.POSTGRES_DB || 'rsv_360_ecosystem',
    user: process.env.DB_USER || process.env.POSTGRES_USER || 'rsv360',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
  });
}

async function ensureSchemaAndSeed(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL,
      amount NUMERIC(12,2) NOT NULL DEFAULT 1,
      payment_method VARCHAR(20) NOT NULL DEFAULT 'pix',
      payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      gateway VARCHAR(50),
      gateway_transaction_id VARCHAR(255),
      gateway_response JSONB,
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS webhook_logs (
      id SERIAL PRIMARY KEY,
      webhook_id VARCHAR(255) UNIQUE,
      type VARCHAR(50),
      action VARCHAR(50),
      data JSONB,
      processed BOOLEAN DEFAULT FALSE,
      processed_at TIMESTAMP,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await client.query(`
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total NUMERIC(12,2);
  `);
  await client.query(`
    UPDATE bookings SET total = COALESCE(total, total_amount, 0) WHERE total IS NULL;
  `);

    const booking = await client.query(
    `INSERT INTO bookings (
      booking_code, booking_type, item_id, item_name, user_id,
      customer_name, customer_email, start_date, end_date,
      total_amount, total, payment_method, payment_status, status
    ) VALUES (
      $1, 'hotel', 1, 'Smoke Hotel', $2,
      'Smoke Guest', 'smoke@example.com', NOW(), NOW() + interval '2 days',
      100, 100, 'pix', 'pending', 'pending'
    ) RETURNING id`,
    [`SMOKE-${PAY_ID}`, Number(process.env.SMOKE_USER_ID || 6)],
  );
  const bookingId = booking.rows[0].id;
  await client.query(
    `INSERT INTO payments (booking_id, amount, payment_method, payment_status, gateway, gateway_transaction_id)
     VALUES ($1, 100, 'pix', 'pending', 'mercadopago', $2)`,
    [bookingId, PAY_ID],
  );
  return bookingId;
}

async function main() {
  requireSecret();
  const results = [];

  // 0) unsigned → 401
  {
    const res = await fetch(`${BASE}/api/webhooks/mercadopago`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'unsigned', type: 'payment', data: { id: '1' } }),
    });
    const ok = res.status === 401;
    results.push({ case: 'unsigned→401', ok, status: res.status });
    console.log(ok ? 'PASS' : 'FAIL', 'unsigned→401', res.status);
  }

  const client = dbClient();
  await client.connect();
  let bookingId;
  try {
    bookingId = await ensureSchemaAndSeed(client);

    // 1) approved + API mock → processed 1x
    const mockApproved = await startMpMock({ mode: 'approved' });
    try {
      // Note: Next process must already have MERCADO_PAGO_API_BASE_URL pointing at mock
      const body = {
        id: EVT_ID,
        type: 'payment',
        action: 'payment.updated',
        data: { id: PAY_ID, status: 'approved' },
      };
      const r1 = await postWebhook({
        dataId: PAY_ID,
        body,
        requestId: `req-ok-${PAY_ID}`,
      });
      const bookingAfter = await client.query(
        `SELECT status, payment_status FROM bookings WHERE id = $1`,
        [bookingId],
      );
      const payAfter = await client.query(
        `SELECT payment_status FROM payments WHERE gateway_transaction_id = $1`,
        [PAY_ID],
      );
      const logAfter = await client.query(
        `SELECT processed FROM webhook_logs WHERE webhook_id = $1`,
        [EVT_ID],
      );
      const ok =
        r1.status === 200 &&
        r1.json.processed === true &&
        r1.json.duplicate === false &&
        bookingAfter.rows[0]?.status === 'confirmed' &&
        payAfter.rows[0]?.payment_status === 'paid' &&
        logAfter.rows[0]?.processed === true;
      results.push({
        case: 'approved+API→baixa1x',
        ok,
        status: r1.status,
        json: r1.json,
        booking: bookingAfter.rows[0],
        payment: payAfter.rows[0],
        webhookProcessed: logAfter.rows[0]?.processed,
      });
      console.log(
        ok ? 'PASS' : 'FAIL',
        'approved+API→baixa1x',
        r1.status,
        JSON.stringify(r1.json),
        'booking=',
        bookingAfter.rows[0]?.status,
      );

      // 2) replay → duplicate:true (no second settle)
      const r2 = await postWebhook({
        dataId: PAY_ID,
        body,
        requestId: `req-replay-${PAY_ID}`,
      });
      const ok2 = r2.status === 200 && r2.json.duplicate === true;
      results.push({ case: 'replay→duplicate', ok: ok2, status: r2.status, json: r2.json });
      console.log(ok2 ? 'PASS' : 'FAIL', 'replay→duplicate', r2.status, JSON.stringify(r2.json));
    } finally {
      mockApproved.close();
    }

    // 3) 503 path — new event, mock down, must not mark processed
    const pay503 = `${PAY_ID}503`;
    const evt503 = `evt-${pay503}`;
    await client.query(
      `INSERT INTO payments (booking_id, amount, payment_method, payment_status, gateway, gateway_transaction_id)
       VALUES ($1, 50, 'pix', 'pending', 'mercadopago', $2)`,
      [bookingId, pay503],
    );
    const mockDown = await startMpMock({ mode: 'down' });
    try {
      const r3 = await postWebhook({
        dataId: pay503,
        body: {
          id: evt503,
          type: 'payment',
          data: { id: pay503, status: 'approved' },
        },
        requestId: `req-503-${pay503}`,
      });
      const log503 = await client.query(
        `SELECT processed FROM webhook_logs WHERE webhook_id = $1`,
        [evt503],
      );
      const processedFlag = log503.rows[0]?.processed === true;
      const ok3 = r3.status === 503 && !processedFlag;
      results.push({
        case: '503→sem_processed',
        ok: ok3,
        status: r3.status,
        json: r3.json,
        webhookProcessed: log503.rows[0]?.processed ?? null,
      });
      console.log(
        ok3 ? 'PASS' : 'FAIL',
        '503→sem_processed',
        r3.status,
        JSON.stringify(r3.json),
        'processed=',
        log503.rows[0]?.processed ?? null,
      );
    } finally {
      mockDown.close();
    }
  } finally {
    await client.end();
  }

  const failed = results.filter((r) => !r.ok);
  console.log('---');
  console.log(`SMOKE_SUMMARY pass=${results.length - failed.length}/${results.length}`);
  if (failed.length) {
    console.error('FAILED_CASES', failed.map((f) => f.case).join(','));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('SMOKE_ERROR', err instanceof Error ? err.message : err);
  process.exit(1);
});
