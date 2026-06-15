import request from 'supertest';
import crypto from 'crypto';
import express from 'express';
import { authRouter } from '../../api/v1/auth/routes';

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function signTestToken(payload: Record<string, unknown>, secret: string) {
  const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const signature = base64UrlEncode(
    crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest()
  );
  return `${header}.${body}.${signature}`;
}

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  return app;
}

describe('auth v1 session', () => {
  const app = buildAuthApp();

  it('returns 401 without bearer token', async () => {
    const response = await request(app).get('/api/v1/auth/session');
    expect(response.status).toBe(401);
    expect(response.body.authenticated).toBe(false);
  });

  it('returns session for valid JWT', async () => {
    const secret = process.env.JWT_SECRET || 'REDACTED_JWT_SECRET';
    const token = signTestToken(
      {
        userId: 'usr_1',
        email: 'admin@test.com',
        name: 'Admin Test',
        role: 'admin',
        enterpriseId: 'ent_1',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      secret
    );

    const response = await request(app)
      .get('/api/v1/auth/session')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.authenticated).toBe(true);
    expect(response.body.user.id).toBe('usr_1');
    expect(response.body.session.enterpriseId).toBe('ent_1');
  });
});
