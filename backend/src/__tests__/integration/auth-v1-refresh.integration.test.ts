import request from 'supertest';
import crypto from 'crypto';
import express from 'express';
import { authRouter } from '../../api/v1/auth/routes';
import { signJwt } from '../../api/v1/auth/jwt-verify';

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  return app;
}

describe('auth v1 refresh', () => {
  const app = buildAuthApp();
  const originalDbUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDbUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDbUrl;
    }
  });

  it('returns 400 without refresh_token', async () => {
    const response = await request(app).post('/api/v1/auth/refresh').send({});
    expect(response.status).toBe(400);
  });

  it('returns new access token for valid refresh JWT', async () => {
    delete process.env.DATABASE_URL;
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'REDACTED_REFRESH_SECRET';
    const refreshToken = signJwt(
      { userId: 'usr_2', type: 'refresh', tokenFamily: 'fam_1', enterpriseId: 'ent_1' },
      refreshSecret,
      3600
    );

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.access_token).toBeTruthy();
  });
});
