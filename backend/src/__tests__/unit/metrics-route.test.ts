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
    // PR-05b/06a: default Node process collectors include process metrics; scrape stays healthy.
    expect(res.text.length).toBeGreaterThan(100);
  });

  it('PR-06a: per-IP metrics rate limit returns 429 after ceiling', async () => {
    const { METRICS_MAX_PER_WINDOW } = require('../../routes/metrics.route');
    const app = buildApp();
    const ip = '198.51.100.77';

    for (let i = 0; i < METRICS_MAX_PER_WINDOW; i += 1) {
      const res = await request(app)
        .get('/metrics')
        .set('Authorization', `Bearer ${TOKEN}`)
        .set('X-Forwarded-For', ip);
      expect(res.status).toBe(200);
    }

    const blocked = await request(app)
      .get('/metrics')
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('X-Forwarded-For', ip);
    expect(blocked.status).toBe(429);
  });
});
