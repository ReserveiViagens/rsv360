/**
 * PR-06c — MFA policy flags + enrollment window (explicit env, never deploy clock).
 */
describe('mfa-policy (PR-06c)', () => {
  const keys = [
    'AUTH_MFA_ENFORCE',
    'AUTH_LOGIN_PROTECTION_ENABLED',
    'AUTH_MFA_ENROLLMENT_START_AT',
    'AUTH_MFA_ENROLLMENT_WINDOW_HOURS',
  ] as const;
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of keys) saved[k] = process.env[k];
  });

  afterEach(() => {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    jest.resetModules();
  });

  it('defaults enforcement OFF', () => {
    delete process.env.AUTH_MFA_ENFORCE;
    delete process.env.AUTH_LOGIN_PROTECTION_ENABLED;
    jest.resetModules();
    const {
      isMfaEnforceEnabled,
      isLoginProtectionEnabled,
    } = require('../../api/v1/auth/mfa-policy');
    expect(isMfaEnforceEnabled()).toBe(false);
    expect(isLoginProtectionEnabled()).toBe(false);
  });

  it('roleRequiresMfa only for admin|manager', () => {
    jest.resetModules();
    const { roleRequiresMfa } = require('../../api/v1/auth/mfa-policy');
    expect(roleRequiresMfa('admin')).toBe(true);
    expect(roleRequiresMfa('manager')).toBe(true);
    expect(roleRequiresMfa('user')).toBe(false);
    expect(roleRequiresMfa('host')).toBe(false);
  });

  it('enrollment window opens only with explicit START_AT', () => {
    delete process.env.AUTH_MFA_ENROLLMENT_START_AT;
    jest.resetModules();
    let policy = require('../../api/v1/auth/mfa-policy');
    expect(policy.isEnrollmentWindowOpen()).toBe(false);

    const start = new Date(Date.now() - 60_000).toISOString();
    process.env.AUTH_MFA_ENROLLMENT_START_AT = start;
    process.env.AUTH_MFA_ENROLLMENT_WINDOW_HOURS = '72';
    jest.resetModules();
    policy = require('../../api/v1/auth/mfa-policy');
    expect(policy.isEnrollmentWindowOpen()).toBe(true);

    process.env.AUTH_MFA_ENROLLMENT_START_AT = new Date(Date.now() + 3600_000).toISOString();
    jest.resetModules();
    policy = require('../../api/v1/auth/mfa-policy');
    expect(policy.isEnrollmentWindowOpen()).toBe(false);

    process.env.AUTH_MFA_ENROLLMENT_START_AT = new Date(Date.now() - 80 * 3600_000).toISOString();
    process.env.AUTH_MFA_ENROLLMENT_WINDOW_HOURS = '72';
    jest.resetModules();
    policy = require('../../api/v1/auth/mfa-policy');
    expect(policy.isEnrollmentWindowOpen()).toBe(false);
  });
});
