/**
 * PR-05b — Express CORS matrix (Access-Control-Allow-Origin).
 * Uses SecurityConfig.getCorsOptions() + cors middleware (same as app.js).
 */
import express from 'express';
import request from 'supertest';
import cors from 'cors';

const { SecurityConfig } = require('../../middleware/security-config');
const { DEV_CORS_ORIGIN_ALLOWLIST } = require('@rsv360/shared');

describe('PR-05b CORS ACAO matrix', () => {
  const prev = process.env.CORS_ORIGIN;

  beforeAll(() => {
    delete process.env.CORS_ORIGIN;
  });

  afterAll(() => {
    if (prev === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = prev;
  });

  function buildApp() {
    const app = express();
    app.use(cors(SecurityConfig.getCorsOptions()));
    app.get('/health', (_req, res) => res.json({ status: 'OK' }));
    return app;
  }

  it.each([...DEV_CORS_ORIGIN_ALLOWLIST])(
    'reflects legitimate Origin %s',
    async (origin: string) => {
      const res = await request(buildApp())
        .get('/health')
        .set('Origin', origin);
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(origin);
    },
  );

  it('denies evil.example (no ACAO reflection)', async () => {
    const res = await request(buildApp())
      .get('/health')
      .set('Origin', 'http://evil.example');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('preflight OPTIONS ok for admin :3004', async () => {
    const res = await request(buildApp())
      .options('/health')
      .set('Origin', 'http://localhost:3004')
      .set('Access-Control-Request-Method', 'GET');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:3004',
    );
  });
});
