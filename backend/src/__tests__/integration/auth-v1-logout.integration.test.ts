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
    const { clearMemoryRateLimitStore } = require('../../api/v1/auth/memory-rate-limit');
    clearMemoryRateLimitStore();
  });

  it('returns 401 without bearer token', async () => {
    const response = await request(app).post('/api/v1/auth/logout').send({});
    expect(response.status).toBe(401);
  });

  it('returns success for valid access token without DB', async () => {
    delete process.env.DATABASE_URL;
    const secret = process.env.JWT_SECRET as string;
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

    const secret = process.env.JWT_SECRET as string;
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

describe('auth v1 logout-all (PR-10a)', () => {
  const app = buildAuthApp();
  const originalDbUrl = process.env.DATABASE_URL;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalDbUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDbUrl;
    }
    const { clearMemoryRateLimitStore } = require('../../api/v1/auth/memory-rate-limit');
    clearMemoryRateLimitStore();
  });

  function accessFor(userId: string | number = 1) {
    const secret = process.env.JWT_SECRET as string;
    return signJwt(
      { userId, email: 'admin@test.com', role: 'admin', enterpriseId: 'ent_1' },
      secret,
      900
    );
  }

  it('returns 401 without bearer token', async () => {
    const response = await request(app).post('/api/v1/auth/logout-all').send({});
    expect(response.status).toBe(401);
  });

  it('returns 400 when refresh_token missing (after auth)', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const accessToken = accessFor(42);

    const response = await request(app)
      .post('/api/v1/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns 429 on second call within one minute', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const logout = require('../../api/v1/auth/logout.service');
    jest.spyOn(logout, 'logoutAllOtherSessions').mockResolvedValue({
      success: true,
      userId: '7',
      sessionsRevoked: 2,
    });

    const accessToken = accessFor(7);

    const first = await request(app)
      .post('/api/v1/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refresh_token: 'keep-me' });
    expect(first.status).toBe(200);

    const second = await request(app)
      .post('/api/v1/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refresh_token: 'keep-me' });
    expect(second.status).toBe(429);
  });

  it('returns 200 and preserves wording for other sessions', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const logout = require('../../api/v1/auth/logout.service');
    jest.spyOn(logout, 'logoutAllOtherSessions').mockResolvedValue({
      success: true,
      userId: '3',
      sessionsRevoked: 4,
    });

    const accessToken = accessFor(3);
    const response = await request(app)
      .post('/api/v1/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refresh_token: 'keep-family' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.sessionsRevoked).toBe(4);
    expect(response.body.message).toBe('Todas as outras sessões foram encerradas');
  });
});

describe('PR-10a logout-all ownership + refresh semantics', () => {
  const originalDbUrl = process.env.DATABASE_URL;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalDbUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDbUrl;
    }
  });

  it('assertActiveRefreshOwnership rejects foreign userId (no revoke path)', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const refresh = require('../../api/v1/auth/refresh-token.service');
    const { getJwtRefreshSecret } = require('@rsv360/shared');
    const keep = signJwt(
      { userId: 1, tokenFamily: 'fam-keep', type: 'refresh' },
      getJwtRefreshSecret(),
      3600
    );

    jest.spyOn(refresh, 'queryDatabase').mockResolvedValue([
      { id: 10, expires_at: new Date(Date.now() + 60_000).toISOString() },
    ]);

    const owned = await refresh.assertActiveRefreshOwnership(keep, 1);
    expect(owned).toEqual({ tokenFamily: 'fam-keep' });

    const foreign = await refresh.assertActiveRefreshOwnership(keep, 999);
    expect(foreign).toBeNull();
  });

  it('revokeOtherUserTokens keeps keepFamily and returns count', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const refresh = require('../../api/v1/auth/refresh-token.service');
    const spy = jest.spyOn(refresh, 'queryDatabase').mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const count = await refresh.revokeOtherUserTokens(1, 'fam-keep', 'test');
    expect(count).toBe(2);
    expect(spy).toHaveBeenCalled();
    const sql = String(spy.mock.calls[0][0]);
    expect(sql).toContain('token_family <>');
    expect(spy.mock.calls[0][1]).toEqual(['test', 1, 'fam-keep']);
  });

  it('kept family still refreshable; revoked family refresh fails', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const refresh = require('../../api/v1/auth/refresh-token.service');
    const { getJwtRefreshSecret } = require('@rsv360/shared');

    const keptToken = signJwt(
      { userId: 1, tokenFamily: 'fam-keep', type: 'refresh' },
      getJwtRefreshSecret(),
      3600
    );
    const revokedToken = signJwt(
      { userId: 1, tokenFamily: 'fam-revoked', type: 'refresh' },
      getJwtRefreshSecret(),
      3600
    );

    jest.spyOn(refresh, 'queryDatabase').mockImplementation(async (...args: unknown[]) => {
      const sql = String(args[0] ?? '');
      const params = (args[1] as unknown[]) || [];
      if (sql.includes('revoked_at IS NULL') && sql.includes('SELECT') && params[0] === 'fam-keep') {
        return [
          {
            id: 1,
            user_id: 1,
            token_family: 'fam-keep',
            expires_at: new Date(Date.now() + 86_400_000).toISOString(),
            device_info: null,
          },
        ];
      }
      if (sql.includes('revoked_at IS NULL') && sql.includes('SELECT') && params[0] === 'fam-revoked') {
        return [];
      }
      if (sql.includes('FROM users')) {
        return [{ id: 1, email: 'a@test.com', role: 'admin', status: 'active', name: 'A' }];
      }
      if (sql.includes('UPDATE refresh_tokens') && sql.includes('Rotação')) {
        return [];
      }
      if (sql.includes('INSERT INTO refresh_tokens')) {
        return [];
      }
      return [];
    });

    const kept = await refresh.verifyAndRotateRefreshToken(keptToken, '127.0.0.1', 'jest');
    expect(kept).not.toBeNull();
    expect(kept.newAccessToken).toBeTruthy();
    expect(kept.newRefreshToken).toBeTruthy();

    const revoked = await refresh.verifyAndRotateRefreshToken(revokedToken, '127.0.0.1', 'jest');
    expect(revoked).toBeNull();
  });
});
