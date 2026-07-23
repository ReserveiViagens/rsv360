/**
 * PR-06c — login protection (per-account Turnstile + progressive lockout).
 */
describe('login-protection.service (PR-06c)', () => {
  const originalUrl = process.env.DATABASE_URL;
  const originalProtection = process.env.AUTH_LOGIN_PROTECTION_ENABLED;
  const originalFailClosed = process.env.AUTH_LOGIN_TURNSTILE_FAIL_CLOSED;
  const originalSecret = process.env.TURNSTILE_SECRET_KEY;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalUrl;
    if (originalProtection === undefined) delete process.env.AUTH_LOGIN_PROTECTION_ENABLED;
    else process.env.AUTH_LOGIN_PROTECTION_ENABLED = originalProtection;
    if (originalFailClosed === undefined) delete process.env.AUTH_LOGIN_TURNSTILE_FAIL_CLOSED;
    else process.env.AUTH_LOGIN_TURNSTILE_FAIL_CLOSED = originalFailClosed;
    if (originalSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = originalSecret;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    jest.resetModules();
  });

  function load() {
    jest.resetModules();
    delete process.env.DATABASE_URL;
    process.env.AUTH_LOGIN_PROTECTION_ENABLED = 'true';
    process.env.NODE_ENV = 'production';
    const svc = require('../../api/v1/auth/login-protection.service');
    svc.clearMemoryLoginProtectionStore();
    return svc;
  }

  it('is a no-op when AUTH_LOGIN_PROTECTION_ENABLED is off (default)', async () => {
    delete process.env.AUTH_LOGIN_PROTECTION_ENABLED;
    delete process.env.DATABASE_URL;
    jest.resetModules();
    const { evaluateLoginProtection, recordAccountFailure } = require('../../api/v1/auth/login-protection.service');
    const gate = await evaluateLoginProtection('admin@example.com');
    expect(gate.allowed).toBe(true);
    expect(gate.turnstileRequired).toBe(false);
    const fail = await recordAccountFailure('admin@example.com');
    expect(fail.consecutiveFailures).toBe(0);
  });

  it('requires Turnstile after 3 consecutive account failures', async () => {
    const { evaluateLoginProtection, recordAccountFailure, clearMemoryLoginProtectionStore } = load();
    clearMemoryLoginProtectionStore();
    const account = 'staff-a@example.com';

    for (let i = 0; i < 2; i += 1) {
      await recordAccountFailure(account);
      const gate = await evaluateLoginProtection(account);
      expect(gate.turnstileRequired).toBe(false);
    }

    await recordAccountFailure(account);
    const gate = await evaluateLoginProtection(account);
    expect(gate.turnstileRequired).toBe(true);
    expect(gate.allowed).toBe(true);
  });

  it('locks out on 5th failure for 15 min', async () => {
    const { evaluateLoginProtection, recordAccountFailure, clearMemoryLoginProtectionStore } = load();
    clearMemoryLoginProtectionStore();
    const account = 'staff-b@example.com';

    for (let i = 0; i < 5; i += 1) {
      await recordAccountFailure(account);
    }
    const gate = await evaluateLoginProtection(account);
    expect(gate.allowed).toBe(false);
    expect(gate.blockedUntil).toBeInstanceOf(Date);
    const ms = gate.blockedUntil.getTime() - Date.now();
    expect(ms).toBeGreaterThan(14 * 60 * 1000);
    expect(ms).toBeLessThanOrEqual(15 * 60 * 1000 + 2000);
  });

  it('escalates lockout 15 → 30 → 60', async () => {
    const {
      recordAccountFailure,
      evaluateLoginProtection,
      forceExpireLockoutForTests,
      clearMemoryLoginProtectionStore,
      LOCKOUT_DURATIONS_MS,
    } = load();
    clearMemoryLoginProtectionStore();
    const account = 'staff-c@example.com';
    expect(LOCKOUT_DURATIONS_MS).toEqual([15 * 60 * 1000, 30 * 60 * 1000, 60 * 60 * 1000]);

    for (let i = 0; i < 5; i += 1) await recordAccountFailure(account);
    let gate = await evaluateLoginProtection(account);
    expect(gate.blockedUntil.getTime() - Date.now()).toBeGreaterThan(14 * 60 * 1000);

    forceExpireLockoutForTests(account);
    for (let i = 0; i < 5; i += 1) await recordAccountFailure(account);
    gate = await evaluateLoginProtection(account);
    expect(gate.blockedUntil.getTime() - Date.now()).toBeGreaterThan(29 * 60 * 1000);

    forceExpireLockoutForTests(account);
    for (let i = 0; i < 5; i += 1) await recordAccountFailure(account);
    gate = await evaluateLoginProtection(account);
    expect(gate.blockedUntil.getTime() - Date.now()).toBeGreaterThan(59 * 60 * 1000);
  });

  it('resets consecutive failures after successful login', async () => {
    const {
      recordAccountFailure,
      resetAccountProtection,
      evaluateLoginProtection,
      clearMemoryLoginProtectionStore,
    } = load();
    clearMemoryLoginProtectionStore();
    const account = 'staff-d@example.com';
    await recordAccountFailure(account);
    await recordAccountFailure(account);
    await recordAccountFailure(account);
    expect((await evaluateLoginProtection(account)).turnstileRequired).toBe(true);
    await resetAccountProtection(account);
    expect((await evaluateLoginProtection(account)).turnstileRequired).toBe(false);
    expect((await evaluateLoginProtection(account)).consecutiveFailures).toBe(0);
  });

  it('Turnstile fail-closed when secret absent and protection active', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.AUTH_LOGIN_PROTECTION_ENABLED = 'true';
    process.env.AUTH_LOGIN_TURNSTILE_FAIL_CLOSED = 'true';
    process.env.NODE_ENV = 'development';
    delete process.env.DATABASE_URL;
    jest.resetModules();
    const { verifyLoginTurnstile } = require('../../api/v1/auth/login-protection.service');
    const result = await verifyLoginTurnstile('token-long-enough', '127.0.0.1');
    expect(result.ok).toBe(false);
  });
});
