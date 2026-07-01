jest.mock('../../../../server/modules/fornecedores-hub/redis-connection', () => ({
  isRedisRequiredForLocks: () => false,
}));

import express from 'express';
import request from 'supertest';
import { initPublicLimiter, publicLimiter, MAX_PER_WINDOW } from '../../../../server/middleware/public-limiter';

describe('publicLimiter', () => {
  beforeAll(async () => {
    await initPublicLimiter();
  });

  it(`retorna 429 na requisição ${MAX_PER_WINDOW + 1} no mesmo minuto`, async () => {
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
