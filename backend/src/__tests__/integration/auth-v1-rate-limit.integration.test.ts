import request from 'supertest';
import express from 'express';
import { authRouter } from '../../api/v1/auth/routes';

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  return app;
}

describe('auth v1 rate limit', () => {
  const app = buildAuthApp();
  const originalDbUrl = process.env.DATABASE_URL;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalDbUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDbUrl;
    }
  });

  it('returns 429 when login rate limit blocks', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const rateLimit = require('../../api/v1/auth/rate-limit.service');
    jest.spyOn(rateLimit, 'enforceLoginRateLimit').mockResolvedValue({
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: new Date('2030-01-01T00:00:00.000Z'),
    });
    jest.spyOn(rateLimit, 'recordLoginAttempt').mockResolvedValue(undefined);
    const login = require('../../api/v1/auth/login.service');
    jest.spyOn(login, 'loginWithDatabase').mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'blocked@test.com', password: 'secret' });

    expect(response.status).toBe(429);
    expect(response.body.error).toMatch(/Muitas tentativas/i);
  });

  it('returns 429 when refresh rate limit blocks', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const rateLimit = require('../../api/v1/auth/rate-limit.service');
    jest.spyOn(rateLimit, 'checkRateLimit').mockResolvedValue({
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: new Date('2030-01-01T00:00:00.000Z'),
    });
    const refresh = require('../../api/v1/auth/refresh-token.service');
    jest.spyOn(refresh, 'verifyAndRotateRefreshToken').mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: 'dummy-token' });

    expect(response.status).toBe(429);
  });
});
