import request from 'supertest';
import express from 'express';

jest.mock('../../api/v1/auth/two-factor.service', () => ({
  isTwoFactorDbEnabled: jest.fn(() => true),
  verifyTwoFactorLogin: jest.fn(),
  hashToken: jest.fn((token: string) => token),
  setupTwoFactor: jest.fn(),
  verifyTwoFactorSetup: jest.fn(),
  disableTwoFactor: jest.fn(),
  regenerateBackupCodes: jest.fn(),
  isTwoFactorEnabled: jest.fn(),
  createLoginChallenge: jest.fn(),
}));

import { authRouter } from '../../api/v1/auth/routes';

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  return app;
}

describe('auth v1 two-factor (D2.5)', () => {
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

  function mockRateLimits() {
    const rateLimit = require('../../api/v1/auth/rate-limit.service');
    jest.spyOn(rateLimit, 'enforceTwoFactorVerifyRateLimit').mockResolvedValue({ allowed: true });
    jest.spyOn(rateLimit, 'enforceLoginRateLimit').mockResolvedValue({ allowed: true });
    jest.spyOn(rateLimit, 'resetLoginRateLimit').mockResolvedValue(undefined);
    jest.spyOn(rateLimit, 'recordLoginAttempt').mockResolvedValue(undefined);
  }

  it('2fa/setup returns 401 without bearer', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const response = await request(app).post('/api/v1/auth/2fa/setup');
    expect(response.status).toBe(401);
  });

  it('2fa/verify returns 401 for invalid temp_token', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    mockRateLimits();
    const twoFactor = require('../../api/v1/auth/two-factor.service');
    twoFactor.verifyTwoFactorLogin.mockResolvedValue({
      error: 'invalid_token',
      status: 401,
      message: 'Token inválido ou expirado',
    });

    const response = await request(app)
      .post('/api/v1/auth/2fa/verify')
      .send({ temp_token: 'bad', code: '123456' });

    expect(response.status).toBe(401);
  });

  it('login returns requires_2fa when enabled', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    mockRateLimits();
    const login = require('../../api/v1/auth/login.service');
    jest.spyOn(login, 'loginWithDatabase').mockResolvedValue({
      requires_2fa: true,
      temp_token: 'temp-abc',
      expires_in: 300,
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@test.com', password: 'secret123' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data?.requires_2fa).toBe(true);
    expect(response.body.data?.access_token).toBeUndefined();
  });
});
