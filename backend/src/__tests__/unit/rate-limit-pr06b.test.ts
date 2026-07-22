/**
 * PR-06b — route quotas: MP anti-flood before HMAC, handshake RL.
 */
jest.mock('../../../../server/modules/fornecedores-hub/redis-connection', () => ({
  isRedisRequiredForLocks: () => false,
  getRedisConnection: async () => {
    throw new Error('redis mocked off in unit test');
  },
}));

import express from 'express';
import request from 'supertest';

describe('PR-06b route quotas', () => {
  describe('mpWebhookIpLimiter (Express)', () => {
    it('exports documented high ceiling (MP redelivery headroom)', () => {
      jest.resetModules();
      const {
        MP_WEBHOOK_MAX_PER_WINDOW,
      } = require('../../../../server/middleware/mp-webhook-ip-limiter');
      expect(MP_WEBHOOK_MAX_PER_WINDOW).toBe(600);
    });

    it('returns 429 after ceiling WITHOUT invoking downstream (HMAC gate)', async () => {
      jest.resetModules();
      jest.doMock('../../../../server/modules/fornecedores-hub/redis-connection', () => ({
        isRedisRequiredForLocks: () => false,
        getRedisConnection: async () => {
          throw new Error('redis mocked off in unit test');
        },
      }));
      const { createIpRateLimiter } = require('../../../../server/middleware/create-ip-rate-limit');
      const limiter = await createIpRateLimiter({
        windowMs: 60_000,
        max: 3,
        prefix: 'rl:test-mp:',
        message: 'Too many webhook requests',
      });

      let downstream = 0;
      const app = express();
      app.set('trust proxy', 1);
      app.post('/wh', limiter, (_req, res) => {
        downstream += 1;
        res.json({ ok: true });
      });

      for (let i = 0; i < 3; i += 1) {
        const res = await request(app)
          .post('/wh')
          .set('x-forwarded-for', '203.0.113.50')
          .send({});
        expect(res.status).toBe(200);
      }
      const blocked = await request(app)
        .post('/wh')
        .set('x-forwarded-for', '203.0.113.50')
        .send({});
      expect(blocked.status).toBe(429);
      expect(downstream).toBe(3);
    });
  });

  describe('socket handshake rate limit', () => {
    it('rejects after SOCKET_HANDSHAKE_MAX_PER_WINDOW', () => {
      jest.resetModules();
      const {
        attachSocketHandshakeRateLimit,
        clearSocketHandshakeRateLimitForTests,
        SOCKET_HANDSHAKE_MAX_PER_WINDOW,
      } = require('../../../../server/middleware/socket-handshake-rate-limit');

      clearSocketHandshakeRateLimitForTests();
      expect(SOCKET_HANDSHAKE_MAX_PER_WINDOW).toBe(100);

      const middleware: Array<(socket: unknown, next: (err?: Error) => void) => void> = [];
      const io = {
        use: (fn: (socket: unknown, next: (err?: Error) => void) => void) => {
          middleware.push(fn);
        },
      };
      attachSocketHandshakeRateLimit(io as never);
      expect(middleware).toHaveLength(1);

      const socket = { handshake: { address: '198.51.100.9', headers: {} } };
      let errors = 0;
      for (let i = 0; i < SOCKET_HANDSHAKE_MAX_PER_WINDOW; i += 1) {
        middleware[0](socket, (err) => {
          if (err) errors += 1;
        });
      }
      expect(errors).toBe(0);
      middleware[0](socket, (err) => {
        if (err) errors += 1;
      });
      expect(errors).toBe(1);
    });
  });
});
