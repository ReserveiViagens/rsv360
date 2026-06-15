import request from 'supertest';
import express from 'express';
import { authRouter } from '../../api/v1/auth/routes';
import { signJwt } from '../../api/v1/auth/jwt-verify';

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  return app;
}

describe('auth v1 logout', () => {
  const app = buildAuthApp();
  const originalDbUrl = process.env.DATABASE_URL;
  const originalPilot = process.env.AUTH_PILOT_ENABLED;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalDbUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDbUrl;
    }
    process.env.AUTH_PILOT_ENABLED = originalPilot;
  });

  it('returns 401 without bearer token', async () => {
    const response = await request(app).post('/api/v1/auth/logout').send({});
    expect(response.status).toBe(401);
  });

  it('returns success for valid access token without DB', async () => {
    delete process.env.DATABASE_URL;
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const accessToken = signJwt(
      { userId: 'usr_9', email: 'logout@test.com', role: 'admin', enterpriseId: 'ent_1' },
      secret,
      900
    );

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('revokes tokens when DATABASE_URL is set', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const logout = require('../../api/v1/auth/logout.service');
    jest.spyOn(logout, 'logoutUser').mockResolvedValue({ success: true, userId: '1' });

    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const accessToken = signJwt(
      { userId: 1, email: 'admin@test.com', role: 'admin', enterpriseId: 'ent_1' },
      secret,
      900
    );

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refresh_token: 'refresh-token' });

    expect(response.status).toBe(200);
    expect(logout.logoutUser).toHaveBeenCalledWith(accessToken, 'refresh-token');
  });
});
