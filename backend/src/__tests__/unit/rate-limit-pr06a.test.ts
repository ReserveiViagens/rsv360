/**
 * PR-06a — auth rate-limit fail-closed + memory pilot path + helpers.
 */
describe('rate-limit.service (PR-06a)', () => {
  const originalUrl = process.env.DATABASE_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalUrl;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    jest.resetModules();
    const { clearMemoryRateLimitStore } = require('../../api/v1/auth/memory-rate-limit');
    clearMemoryRateLimitStore();
  });

  it('checkRateLimit denies when DATABASE_URL unset (never allowed:true)', async () => {
    delete process.env.DATABASE_URL;
    jest.resetModules();
    const { checkRateLimit } = require('../../api/v1/auth/rate-limit.service');
    const result = await checkRateLimit('user@example.com', 'email', 'login');
    expect(result.allowed).toBe(false);
    expect(result.storeUnavailable).toBe(true);
  });

  it('rateLimitDeniedStatus maps storeUnavailable → 503', () => {
    jest.resetModules();
    const { rateLimitDeniedStatus, rateLimitDeniedBody } = require('../../api/v1/auth/rate-limit.service');
    expect(rateLimitDeniedStatus({ allowed: false, storeUnavailable: true })).toBe(503);
    expect(rateLimitDeniedBody({ allowed: false, storeUnavailable: true })).toMatchObject({
      success: false,
      error: 'Serviço temporariamente indisponível',
    });
  });

  it('enforceLoginRateLimit uses memory when DB store off — eventually blocks', async () => {
    delete process.env.DATABASE_URL;
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const { enforceLoginRateLimit } = require('../../api/v1/auth/rate-limit.service');
    require('../../api/v1/auth/memory-rate-limit').clearMemoryRateLimitStore();

    const email = 'pilot-flood@example.com';
    const ip = '198.51.100.20';

    // prod login maxAttempts = 5
    for (let i = 0; i < 5; i += 1) {
      const ok = await enforceLoginRateLimit(email, ip);
      expect(ok.allowed).toBe(true);
    }
    const blocked = await enforceLoginRateLimit(email, ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.blockedUntil).toBeDefined();
  });
});
