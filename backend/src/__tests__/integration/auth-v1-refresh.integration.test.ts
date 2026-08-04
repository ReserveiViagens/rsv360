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

  it('accepts refresh from rsv360_refresh_token cookie', async () => {
    delete process.env.DATABASE_URL;
    const refreshSecret =
      (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string;
    const refreshToken = signJwt(
      { userId: 'usr_2', type: 'refresh', tokenFamily: 'fam_cookie', enterpriseId: 'ent_1' },
      refreshSecret,
      3600,
    );

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Origin', 'http://localhost:3004')
      .set('Cookie', `rsv360_refresh_token=${refreshToken}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.access_token).toBeTruthy();
  });

  it('rejects body when AUTH_REFRESH_COOKIE_REQUIRED=true', async () => {
    const prev = process.env.AUTH_REFRESH_COOKIE_REQUIRED;
    process.env.AUTH_REFRESH_COOKIE_REQUIRED = 'true';
    delete process.env.DATABASE_URL;
    try {
      const refreshSecret =
        (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string;
      const refreshToken = signJwt(
        { userId: 'usr_2', type: 'refresh', tokenFamily: 'fam_flag', enterpriseId: 'ent_1' },
        refreshSecret,
        3600,
      );
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refresh_token: refreshToken });
      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/cookie/i);
    } finally {
      if (prev === undefined) delete process.env.AUTH_REFRESH_COOKIE_REQUIRED;
      else process.env.AUTH_REFRESH_COOKIE_REQUIRED = prev;
    }
  });

  it('returns new access token for valid refresh JWT', async () => {
    delete process.env.DATABASE_URL;
    const refreshSecret =
      (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string;
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

  it('sets Path=/api/v1/auth cookie and strips JSON when Origin present', async () => {
    delete process.env.DATABASE_URL;
    const refreshSecret =
      (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string;
    const refreshToken = signJwt(
      { userId: 'usr_2', type: 'refresh', tokenFamily: 'fam_strip', enterpriseId: 'ent_1' },
      refreshSecret,
      3600,
    );

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Origin', 'http://localhost:3004')
      .send({ refresh_token: refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.data.access_token).toBeTruthy();
    expect(response.body.data.refresh_token).toBeUndefined();
    const setCookie = response.headers['set-cookie'];
    expect(setCookie).toBeTruthy();
    expect(String(setCookie)).toMatch(/rsv360_refresh_token=/);
    expect(String(setCookie)).toMatch(/Path=\/api\/v1\/auth/);
    expect(String(setCookie)).toMatch(/HttpOnly/i);
  });

  it('rejects cookie-authenticated refresh from evil Origin (CSRF)', async () => {
    delete process.env.DATABASE_URL;
    const prevCors = process.env.CORS_ORIGIN;
    process.env.CORS_ORIGIN = 'http://localhost:3004,http://localhost:3005';
    const refreshSecret =
      (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string;
    const refreshToken = signJwt(
      { userId: 'usr_2', type: 'refresh', tokenFamily: 'fam_csrf', enterpriseId: 'ent_1' },
      refreshSecret,
      3600,
    );
    try {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Origin', 'https://evil.example')
        .set('Cookie', `rsv360_refresh_token=${refreshToken}`)
        .send({});
      expect(response.status).toBe(403);
    } finally {
      if (prevCors === undefined) delete process.env.CORS_ORIGIN;
      else process.env.CORS_ORIGIN = prevCors;
    }
  });
});
