import express from 'express';
import request from 'supertest';

const TOKEN = 'pr05b-unit-metrics-token-32chars!!';

const { metricsRouter, metricsMiddleware } = require('../../routes/metrics.route');

describe('E5 — GET /metrics (prom-client baseline + PR-05b bearer)', () => {
  const prevToken = process.env.METRICS_TOKEN;

  beforeAll(() => {
    process.env.METRICS_TOKEN = TOKEN;
  });

  afterAll(() => {
    if (prevToken === undefined) delete process.env.METRICS_TOKEN;
    else process.env.METRICS_TOKEN = prevToken;
  });

  function buildApp() {
    const app = express();
    app.use(metricsMiddleware);
    app.get('/health', (_req, res) => res.json({ status: 'OK' }));
    app.use('/metrics', metricsRouter);
    return app;
  }

  it('rejects anonymous scrape with 401', async () => {
    const app = buildApp();
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, error: 'Unauthorized' });
  });

  it('rejects wrong bearer with 401', async () => {
    const app = buildApp();
    const res = await request(app)
      .get('/metrics')
      .set('Authorization', 'Bearer wrong-token');
    expect(res.status).toBe(401);
  });

  it('exposes prometheus text with valid bearer', async () => {
    const app = buildApp();
    await request(app).get('/health').expect(200);

    const res = await request(app)
      .get('/metrics')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(String(res.headers['content-type'])).toMatch(/text\/plain/);
    expect(res.text).toMatch(/rsv360_process_/);
    expect(res.text).toMatch(/rsv360_http_request_duration_seconds/);
    expect(res.text).toMatch(/rsv360_http_requests_total/);
  });
});
