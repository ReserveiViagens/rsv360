/**
 * HIG-02 — SSO exchange IP rate limit (burst → 429).
 */
describe('enforceSsoExchangeRateLimit (HIG-02)', () => {
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

  it('burst without DB store eventually denies with 429 mapping', async () => {
    delete process.env.DATABASE_URL;
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const {
      enforceSsoExchangeRateLimit,
      rateLimitDeniedStatus,
      rateLimitDeniedBody,
      RATE_LIMIT_CONFIGS,
    } = require('../../api/v1/auth/rate-limit.service');
    require('../../api/v1/auth/memory-rate-limit').clearMemoryRateLimitStore();

    const ip = '203.0.113.50';
    const max = RATE_LIMIT_CONFIGS['sso-exchange'].maxAttempts;

    for (let i = 0; i < max; i += 1) {
      const ok = await enforceSsoExchangeRateLimit(ip);
      expect(ok.allowed).toBe(true);
    }

    const blocked = await enforceSsoExchangeRateLimit(ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.blockedUntil).toBeDefined();
    expect(rateLimitDeniedStatus(blocked)).toBe(429);
    expect(rateLimitDeniedBody(blocked)).toMatchObject({
      success: false,
      error: 'Muitas tentativas. Tente novamente mais tarde.',
    });
  });
});
