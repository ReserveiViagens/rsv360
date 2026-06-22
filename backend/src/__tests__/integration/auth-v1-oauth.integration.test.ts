import request from 'supertest';
import express from 'express';
import { authRouter } from '../../api/v1/auth/routes';

jest.mock('../../api/v1/auth/two-factor.service', () => ({
  isTwoFactorEnabled: jest.fn().mockResolvedValue(false),
  createLoginChallenge: jest.fn(),
}));

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  return app;
}

describe('auth v1 oauth (D2.9)', () => {
  const app = buildAuthApp();
  const originalDbUrl = process.env.DATABASE_URL;
  const originalOAuthSecret = process.env.OAUTH_BFF_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalDbUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDbUrl;
    }
    if (originalOAuthSecret === undefined) {
      delete process.env.OAUTH_BFF_SECRET;
    } else {
      process.env.OAUTH_BFF_SECRET = originalOAuthSecret;
    }
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('oauth returns 501 when DATABASE_URL is unset', async () => {
    delete process.env.DATABASE_URL;
    process.env.OAUTH_BFF_SECRET = 'test-secret';

    const response = await request(app)
      .post('/api/v1/auth/oauth')
      .set('X-OAuth-Bff-Secret', 'test-secret')
      .send({
        provider: 'google',
        provider_id: 'gid-1',
        email: 'oauth@test.local',
        name: 'OAuth User',
      });

    expect(response.status).toBe(501);
  });

  it('oauth returns 403 when BFF secret is wrong in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.OAUTH_BFF_SECRET = 'expected-secret';

    const response = await request(app)
      .post('/api/v1/auth/oauth')
      .set('X-OAuth-Bff-Secret', 'wrong-secret')
      .send({
        provider: 'google',
        provider_id: 'gid-1',
        email: 'oauth@test.local',
        name: 'OAuth User',
      });

    expect(response.status).toBe(403);
  });

  it('oauth returns 400 for invalid provider', async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.OAUTH_BFF_SECRET = 'test-secret';

    const oauth = require('../../api/v1/auth/oauth.service');
    jest.spyOn(oauth, 'oauthLoginWithProfile').mockResolvedValue({
      error: 'validation',
      status: 400,
      message: 'Provider OAuth inválido',
    });

    const response = await request(app)
      .post('/api/v1/auth/oauth')
      .set('X-OAuth-Bff-Secret', 'test-secret')
      .send({ provider: 'twitter', provider_id: '1', email: 'a@b.c', name: 'X' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('oauth returns 200 with tokens on success', async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.OAUTH_BFF_SECRET = 'test-secret';

    const oauth = require('../../api/v1/auth/oauth.service');
    jest.spyOn(oauth, 'oauthLoginWithProfile').mockResolvedValue({
      user: { id: 1, email: 'oauth@test.local', name: 'OAuth', role: 'user' },
      access_token: 'access-abc',
      refresh_token: 'refresh-xyz',
      expires_in: 900,
    });

    const response = await request(app)
      .post('/api/v1/auth/oauth')
      .set('X-OAuth-Bff-Secret', 'test-secret')
      .send({
        provider: 'google',
        provider_id: 'gid-1',
        email: 'oauth@test.local',
        name: 'OAuth User',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.access_token).toBe('access-abc');
    expect(response.body.data.refresh_token).toBe('refresh-xyz');
  });
});
