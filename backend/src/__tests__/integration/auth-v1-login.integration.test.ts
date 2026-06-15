import request from 'supertest';
import crypto from 'crypto';
import express from 'express';
import { authRouter } from '../../api/v1/auth/routes';

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  return app;
}

describe('auth v1 login', () => {
  const app = buildAuthApp();
  const originalDbUrl = process.env.DATABASE_URL;
  const originalPilot = process.env.AUTH_PILOT_ENABLED;

  afterEach(() => {
    if (originalDbUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDbUrl;
    }
    process.env.AUTH_PILOT_ENABLED = originalPilot;
  });

  it('returns 400 without email or password', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({});
    expect(response.status).toBe(400);
  });

  it('returns 501 when DB and pilot are disabled', async () => {
    delete process.env.DATABASE_URL;
    process.env.AUTH_PILOT_ENABLED = 'false';

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'secret' });

    expect(response.status).toBe(501);
  });

  it('returns tokens for pilot login when AUTH_PILOT_ENABLED=true', async () => {
    delete process.env.DATABASE_URL;
    process.env.AUTH_PILOT_ENABLED = 'true';

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'secret' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.access_token).toBeTruthy();
    expect(response.body.data.refresh_token).toBeTruthy();
  });
});
