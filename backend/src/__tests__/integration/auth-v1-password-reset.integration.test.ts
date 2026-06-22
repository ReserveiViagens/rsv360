import request from 'supertest';
import express from 'express';
import { authRouter } from '../../api/v1/auth/routes';

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  return app;
}

describe('auth v1 password reset (D2.4)', () => {
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
    jest.spyOn(rateLimit, 'enforceForgotPasswordRateLimit').mockResolvedValue({ allowed: true });
    jest.spyOn(rateLimit, 'enforceResetPasswordRateLimit').mockResolvedValue({ allowed: true });
  }

  it('forgot-password returns 501 when DATABASE_URL is unset', async () => {
    delete process.env.DATABASE_URL;

    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'user@test.com' });

    expect(response.status).toBe(501);
  });

  it('forgot-password returns 400 for invalid email', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    mockRateLimits();
    const passwordReset = require('../../api/v1/auth/password-reset.service');
    jest.spyOn(passwordReset, 'requestPasswordReset').mockResolvedValue({
      error: 'validation',
      status: 400,
      message: 'E-mail inválido',
    });

    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('forgot-password returns 200 generic on success', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    mockRateLimits();
    const passwordReset = require('../../api/v1/auth/password-reset.service');
    jest.spyOn(passwordReset, 'requestPasswordReset').mockResolvedValue({
      message: 'Se o e-mail existir, enviaremos instruções.',
    });

    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'user@test.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('e-mail existir');
  });

  it('reset-password returns 401 for invalid token', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    mockRateLimits();
    const passwordReset = require('../../api/v1/auth/password-reset.service');
    jest.spyOn(passwordReset, 'resetPasswordWithToken').mockResolvedValue({
      error: 'invalid_token',
      status: 401,
      message: 'Token inválido ou expirado',
    });

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: 'bad-token',
        password: 'newpass12',
        password_confirmation: 'newpass12',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('reset-password returns 200 on success', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    mockRateLimits();
    const passwordReset = require('../../api/v1/auth/password-reset.service');
    jest.spyOn(passwordReset, 'resetPasswordWithToken').mockResolvedValue({
      message: 'Senha alterada. Faça login.',
    });

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: 'valid-token',
        password: 'newpass12',
        password_confirmation: 'newpass12',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Senha alterada');
  });
});
