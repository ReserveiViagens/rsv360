import request from 'supertest';
const express = require('express');
const { brandingHeaders } = require('../../middleware/security-headers');
const { SecurityConfig } = require('../../middleware/security-config');

describe('PR-05a security headers', () => {
  async function buildApp() {
    const app = express();
    await SecurityConfig.initialize(app);
    app.use(brandingHeaders);
    app.get('/t', (_req: any, res: any) => res.status(200).json({ ok: true }));
    return app;
  }

  it('emits DENY + nosniff + referrer; branding does not overwrite; no X-Powered-By', async () => {
    const prev = process.env.ENABLE_HSTS;
    delete process.env.ENABLE_HSTS;
    const app = await buildApp();
    const response = await request(app).get('/t');

    expect(response.status).toBe(200);
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['referrer-policy']).toMatch(/strict-origin/i);
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-author']).toBeTruthy();
    expect(response.headers['strict-transport-security']).toBeUndefined();

    if (prev === undefined) delete process.env.ENABLE_HSTS;
    else process.env.ENABLE_HSTS = prev;
  });

  it('does not emit HSTS when ENABLE_HSTS is off', async () => {
    const prev = process.env.ENABLE_HSTS;
    process.env.ENABLE_HSTS = 'false';
    const app = await buildApp();
    const response = await request(app).get('/t');
    expect(response.headers['strict-transport-security']).toBeUndefined();
    expect(response.headers['x-frame-options']).toBe('DENY');
    if (prev === undefined) delete process.env.ENABLE_HSTS;
    else process.env.ENABLE_HSTS = prev;
  });

  it('emits HSTS without preload when ENABLE_HSTS=true', async () => {
    const prev = process.env.ENABLE_HSTS;
    process.env.ENABLE_HSTS = 'true';
    const app = await buildApp();
    const response = await request(app).get('/t');
    const hsts = response.headers['strict-transport-security'];
    expect(hsts).toBeTruthy();
    expect(String(hsts).toLowerCase()).toContain('max-age=');
    expect(String(hsts).toLowerCase()).not.toContain('preload');
    expect(response.headers['x-frame-options']).toBe('DENY');
    if (prev === undefined) delete process.env.ENABLE_HSTS;
    else process.env.ENABLE_HSTS = prev;
  });
});
