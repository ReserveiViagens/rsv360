import express from 'express';
import request from 'supertest';

const { metricsRouter, metricsMiddleware } = require('../../routes/metrics.route');

describe('E5 — GET /metrics (prom-client baseline)', () => {
  function buildApp() {
    const app = express();
    app.use(metricsMiddleware);
    app.get('/health', (_req, res) => res.json({ status: 'OK' }));
    app.use('/metrics', metricsRouter);
    return app;
  }

  it('exposes prometheus text with default Node metrics and HTTP histogram', async () => {
    const app = buildApp();
    await request(app).get('/health').expect(200);

    const res = await request(app).get('/metrics');

    expect(res.status).toBe(200);
    expect(String(res.headers['content-type'])).toMatch(/text\/plain/);
    expect(res.text).toMatch(/rsv360_process_/);
    expect(res.text).toMatch(/rsv360_http_request_duration_seconds/);
    expect(res.text).toMatch(/rsv360_http_requests_total/);
  });
});
