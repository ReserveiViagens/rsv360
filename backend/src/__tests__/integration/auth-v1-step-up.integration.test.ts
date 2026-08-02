/**
 * PR-10b — step-up 1B + 2B-lite
 */
describe('PR-10b step-up service', () => {
  const originalFlag = process.env.AUTH_STEP_UP_ENABLED;
  const originalDb = process.env.DATABASE_URL;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalFlag === undefined) delete process.env.AUTH_STEP_UP_ENABLED;
    else process.env.AUTH_STEP_UP_ENABLED = originalFlag;
    if (originalDb === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDb;
    jest.resetModules();
  });

  function load() {
    return require('../../api/v1/auth/step-up.service');
  }

  it('flag OFF by default', () => {
    delete process.env.AUTH_STEP_UP_ENABLED;
    expect(load().isStepUpEnabled()).toBe(false);
  });

  it('isKnownClient: empty active sessions → known (first session)', () => {
    const { isKnownClient } = load();
    expect(isKnownClient('1.1.1.1', 'Mozilla/A', [])).toBe(true);
  });

  it('isKnownClient 1B: IP OR UA match against any active family', () => {
    const { isKnownClient } = load();
    const fps = [
      { ip_address: '10.0.0.1', user_agent: 'Browser/Old' },
      { ip_address: '10.0.0.2', user_agent: 'Browser/Phone' },
    ];
    expect(isKnownClient('10.0.0.1', 'Browser/New', fps)).toBe(true);
    expect(isKnownClient('9.9.9.9', 'Browser/Phone', fps)).toBe(true);
    expect(isKnownClient('9.9.9.9', 'Browser/Evil', fps)).toBe(false);
  });

  it('isAlienClient 2B-lite: only when BOTH IP and UA unknown', () => {
    const { isAlienClient } = load();
    const fps = [{ ip_address: '10.0.0.1', user_agent: 'Browser/Home' }];
    expect(isAlienClient('9.9.9.9', 'Browser/Evil', fps)).toBe(true);
    expect(isAlienClient('9.9.9.9', 'Browser/Home', fps)).toBe(false);
    expect(isAlienClient('10.0.0.1', 'Browser/Evil', fps)).toBe(false);
  });
});

describe('PR-10b refresh deny (no UPDATE)', () => {
  const originalFlag = process.env.AUTH_STEP_UP_ENABLED;
  const originalDb = process.env.DATABASE_URL;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalFlag === undefined) delete process.env.AUTH_STEP_UP_ENABLED;
    else process.env.AUTH_STEP_UP_ENABLED = originalFlag;
    if (originalDb === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDb;
    jest.resetModules();
  });

  it('flag OFF → verifyAndRotate unchanged path (no step-up query)', async () => {
    process.env.AUTH_STEP_UP_ENABLED = 'false';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    jest.resetModules();
    const refresh = require('../../api/v1/auth/refresh-token.service');
    const stepUp = require('../../api/v1/auth/step-up.service');
    const spyLoad = jest.spyOn(stepUp, 'loadActiveFingerprints');
    const { getJwtRefreshSecret } = require('@rsv360/shared');
    const { signJwt } = require('../../api/v1/auth/jwt-verify');

    const token = signJwt(
      { userId: 1, tokenFamily: 'fam-1', type: 'refresh' },
      getJwtRefreshSecret(),
      3600
    );

    jest.spyOn(refresh, 'queryDatabase').mockImplementation(async (...args: unknown[]) => {
      const sql = String(args[0] ?? '');
      if (sql.includes('SELECT * FROM refresh_tokens')) {
        return [
          {
            id: 1,
            user_id: 1,
            token_family: 'fam-1',
            expires_at: new Date(Date.now() + 86_400_000).toISOString(),
            device_info: null,
          },
        ];
      }
      if (sql.includes('FROM users')) {
        return [{ id: 1, email: 'a@test.com', role: 'admin', status: 'active', name: 'A' }];
      }
      return [];
    });

    const result = await refresh.verifyAndRotateRefreshToken(token, '9.9.9.9', 'Evil');
    expect(result).not.toBeNull();
    expect(spyLoad).not.toHaveBeenCalled();
  });

  it('flag ON + alien IP+UA → null and no rotation UPDATE', async () => {
    process.env.AUTH_STEP_UP_ENABLED = 'true';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    jest.resetModules();
    const refresh = require('../../api/v1/auth/refresh-token.service');
    const stepUp = require('../../api/v1/auth/step-up.service');
    const { getJwtRefreshSecret } = require('@rsv360/shared');
    const { signJwt } = require('../../api/v1/auth/jwt-verify');

    const token = signJwt(
      { userId: 1, tokenFamily: 'fam-1', type: 'refresh' },
      getJwtRefreshSecret(),
      3600
    );

    const updates: string[] = [];
    jest.spyOn(refresh, 'queryDatabase').mockImplementation(async (...args: unknown[]) => {
      const sql = String(args[0] ?? '');
      if (sql.includes('UPDATE')) updates.push(sql);
      if (sql.includes('SELECT * FROM refresh_tokens') && sql.includes('token_family')) {
        return [
          {
            id: 1,
            user_id: 1,
            token_family: 'fam-1',
            expires_at: new Date(Date.now() + 86_400_000).toISOString(),
            device_info: null,
          },
        ];
      }
      if (sql.includes('FROM users')) {
        return [{ id: 1, email: 'a@test.com', role: 'admin', status: 'active', name: 'A' }];
      }
      return [];
    });

    jest.spyOn(stepUp, 'loadActiveFingerprints').mockResolvedValue([
      { ip_address: '10.0.0.1', user_agent: 'Browser/Home' },
    ]);

    const result = await refresh.verifyAndRotateRefreshToken(token, '9.9.9.9', 'Browser/Evil');
    expect(result).toBeNull();
    expect(updates.some((s) => s.includes('Rotação'))).toBe(false);
    expect(updates.length).toBe(0);
  });

  it('flag ON + only new IP (UA known) → rotates', async () => {
    process.env.AUTH_STEP_UP_ENABLED = 'true';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    jest.resetModules();
    const refresh = require('../../api/v1/auth/refresh-token.service');
    const stepUp = require('../../api/v1/auth/step-up.service');
    const { getJwtRefreshSecret } = require('@rsv360/shared');
    const { signJwt } = require('../../api/v1/auth/jwt-verify');

    const token = signJwt(
      { userId: 1, tokenFamily: 'fam-1', type: 'refresh' },
      getJwtRefreshSecret(),
      3600
    );

    jest.spyOn(refresh, 'queryDatabase').mockImplementation(async (...args: unknown[]) => {
      const sql = String(args[0] ?? '');
      if (sql.includes('SELECT * FROM refresh_tokens') && sql.includes('token_family')) {
        return [
          {
            id: 1,
            user_id: 1,
            token_family: 'fam-1',
            expires_at: new Date(Date.now() + 86_400_000).toISOString(),
            device_info: null,
          },
        ];
      }
      if (sql.includes('FROM users')) {
        return [{ id: 1, email: 'a@test.com', role: 'admin', status: 'active', name: 'A' }];
      }
      return [];
    });

    jest.spyOn(stepUp, 'loadActiveFingerprints').mockResolvedValue([
      { ip_address: '10.0.0.1', user_agent: 'Browser/Home' },
    ]);

    const result = await refresh.verifyAndRotateRefreshToken(token, '9.9.9.9', 'Browser/Home');
    expect(result).not.toBeNull();
    expect(result.newAccessToken).toBeTruthy();
  });
});

describe('PR-10b login step-up', () => {
  const originalFlag = process.env.AUTH_STEP_UP_ENABLED;
  const originalDb = process.env.DATABASE_URL;

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
    if (originalFlag === undefined) delete process.env.AUTH_STEP_UP_ENABLED;
    else process.env.AUTH_STEP_UP_ENABLED = originalFlag;
    if (originalDb === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDb;
  });

  function mockTwoFactor() {
    jest.doMock('../../api/v1/auth/two-factor.service', () => ({
      isTwoFactorEnabled: jest.fn(),
      createLoginChallenge: jest.fn(),
    }));
  }

  async function setupLoginUser() {
    const login = require('../../api/v1/auth/login.service');
    const twoFactor = require('../../api/v1/auth/two-factor.service');
    const refresh = require('../../api/v1/auth/refresh-token.service');
    const stepUp = require('../../api/v1/auth/step-up.service');

    jest.spyOn(refresh, 'queryDatabase').mockImplementation(async (...args: unknown[]) => {
      const sql = String(args[0] ?? '');
      if (sql.includes('FROM users WHERE email')) {
        return [
          {
            id: 1,
            email: 'a@test.com',
            role: 'user',
            status: 'active',
            name: 'A',
            password_hash: '$2a$10$abcdefghijklmnopqrstuv',
          },
        ];
      }
      return [];
    });
    jest.spyOn(login, 'comparePassword').mockResolvedValue(true);
    jest.spyOn(refresh, 'createRefreshToken').mockResolvedValue({
      refreshToken: 'rt',
      tokenFamily: 'f',
      expiresAt: new Date(),
    });

    return { login, twoFactor, refresh, stepUp };
  }

  it('flag OFF + MFA → always requires_2fa (byte-compatible)', async () => {
    process.env.AUTH_STEP_UP_ENABLED = 'false';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    jest.resetModules();
    mockTwoFactor();
    const { login, twoFactor } = await setupLoginUser();
    (twoFactor.isTwoFactorEnabled as jest.Mock).mockResolvedValue(true);
    (twoFactor.createLoginChallenge as jest.Mock).mockResolvedValue({
      temp_token: 'tmp',
      expires_in: 300,
    });

    const result = await login.loginWithDatabase('a@test.com', 'pw', {
      ipAddress: '1.1.1.1',
      userAgent: 'UA',
    });
    expect(result.requires_2fa).toBe(true);
    expect(twoFactor.createLoginChallenge).toHaveBeenCalled();
  });

  it('flag ON + MFA + unknown device → requires_2fa via 06c challenge', async () => {
    process.env.AUTH_STEP_UP_ENABLED = 'true';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    jest.resetModules();
    mockTwoFactor();
    const { login, twoFactor, stepUp } = await setupLoginUser();
    (twoFactor.isTwoFactorEnabled as jest.Mock).mockResolvedValue(true);
    (twoFactor.createLoginChallenge as jest.Mock).mockResolvedValue({
      temp_token: 'tmp-step',
      expires_in: 300,
    });
    jest.spyOn(stepUp, 'loadActiveFingerprints').mockResolvedValue([
      { ip_address: '10.0.0.1', user_agent: 'Home' },
    ]);

    const result = await login.loginWithDatabase('a@test.com', 'pw', {
      ipAddress: '9.9.9.9',
      userAgent: 'Evil',
    });
    expect(result.requires_2fa).toBe(true);
    expect(result.temp_token).toBe('tmp-step');
  });

  it('flag ON + MFA + known device → no step-up (issues tokens)', async () => {
    process.env.AUTH_STEP_UP_ENABLED = 'true';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    jest.resetModules();
    mockTwoFactor();
    const { login, twoFactor, stepUp } = await setupLoginUser();
    (twoFactor.isTwoFactorEnabled as jest.Mock).mockResolvedValue(true);
    jest.spyOn(stepUp, 'loadActiveFingerprints').mockResolvedValue([
      { ip_address: '10.0.0.1', user_agent: 'Home' },
    ]);

    const result = await login.loginWithDatabase('a@test.com', 'pw', {
      ipAddress: '10.0.0.1',
      userAgent: 'OtherUA',
    });
    expect(result.requires_2fa).toBeUndefined();
    expect(result.access_token).toBeTruthy();
    expect(twoFactor.createLoginChallenge).not.toHaveBeenCalled();
  });

  it('flag ON + no MFA + unknown → skip log path issues tokens', async () => {
    process.env.AUTH_STEP_UP_ENABLED = 'true';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    jest.resetModules();
    mockTwoFactor();
    const { login, twoFactor, stepUp } = await setupLoginUser();
    (twoFactor.isTwoFactorEnabled as jest.Mock).mockResolvedValue(false);
    jest.spyOn(stepUp, 'loadActiveFingerprints').mockResolvedValue([
      { ip_address: '10.0.0.1', user_agent: 'Home' },
    ]);
    const skipSpy = jest.spyOn(stepUp, 'logStepUpSkip');

    const result = await login.loginWithDatabase('a@test.com', 'pw', {
      ipAddress: '9.9.9.9',
      userAgent: 'Evil',
    });
    expect(result.access_token).toBeTruthy();
    expect(skipSpy).toHaveBeenCalledWith(1, 'no_mfa');
  });
});
