jest.mock('../../../../server/modules/fornecedores-hub/redis-connection', () => ({
  isRedisRequiredForLocks: () => false,
}));

import express from 'express';
import request from 'supertest';
import {
  initPublicLimiter,
  publicLimiter,
  resetPublicLimiterForTests,
  PublicLimiterInitError,
  MAX_PER_WINDOW,
} from '../../../../server/middleware/public-limiter';

describe('publicLimiter (PR-06a)', () => {
  afterEach(() => {
    resetPublicLimiterForTests();
  });

  it('fail-closed: uninitialized limiter returns 503 (never next())', async () => {
    resetPublicLimiterForTests();
    const app = express();
    app.get('/p/test', publicLimiter, (_req, res) => {
      res.json({ ok: true });
    });

    const res = await request(app).get('/p/test');
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ success: false, error: 'Rate limiter unavailable' });
  });

  it('initPublicLimiter succeeds (boot assert may listen)', async () => {
    await expect(initPublicLimiter()).resolves.toBeUndefined();
  });

  it('PublicLimiterInitError carries fail-closed code', () => {
    const err = new PublicLimiterInitError('boom');
    expect(err.code).toBe('PUBLIC_LIMITER_INIT_FAILED');
    expect(err).toBeInstanceOf(Error);
  });

  it(`returns 429 on request ${MAX_PER_WINDOW + 1} in the same minute`, async () => {
    await initPublicLimiter();
    const app = express();
    app.get('/p/test', publicLimiter, (_req, res) => {
      res.json({ ok: true });
    });

    for (let i = 0; i < MAX_PER_WINDOW; i += 1) {
      const res = await request(app).get('/p/test').set('X-Forwarded-For', '203.0.113.50');
      expect(res.status).toBe(200);
    }

    const blocked = await request(app).get('/p/test').set('X-Forwarded-For', '203.0.113.50');
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/Muitas solicitações/i);
  });
});
