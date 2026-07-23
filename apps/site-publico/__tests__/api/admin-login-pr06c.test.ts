/**
 * PR-06c — admin login protection surface (site-publico).
 */
import {
  evaluateAdminLoginProtection,
  recordAdminAccountFailure,
  resetAdminAccountProtection,
  clearAdminLoginProtectionStoreForTests,
  isLoginProtectionEnabled,
  isMfaEnforceEnabled,
  TURNSTILE_AFTER,
  LOCKOUT_AFTER,
} from '@/lib/admin-login-protection'
import { safeEqualPassword } from '@/lib/safe-equal-password'

describe('admin login protection (PR-06c)', () => {
  const originalProtection = process.env.AUTH_LOGIN_PROTECTION_ENABLED
  const originalMfa = process.env.AUTH_MFA_ENFORCE

  afterEach(() => {
    if (originalProtection === undefined) delete process.env.AUTH_LOGIN_PROTECTION_ENABLED
    else process.env.AUTH_LOGIN_PROTECTION_ENABLED = originalProtection
    if (originalMfa === undefined) delete process.env.AUTH_MFA_ENFORCE
    else process.env.AUTH_MFA_ENFORCE = originalMfa
    clearAdminLoginProtectionStoreForTests()
  })

  it('keeps PR-06a timing-safe password compare', () => {
    expect(safeEqualPassword('secret-admin', 'secret-admin')).toBe(true)
    expect(safeEqualPassword('short', 'much-longer-password')).toBe(false)
  })

  it('defaults enforcement flags OFF', () => {
    delete process.env.AUTH_LOGIN_PROTECTION_ENABLED
    delete process.env.AUTH_MFA_ENFORCE
    expect(isLoginProtectionEnabled()).toBe(false)
    expect(isMfaEnforceEnabled()).toBe(false)
  })

  it('Turnstile required after 3 account failures when protection on', () => {
    process.env.AUTH_LOGIN_PROTECTION_ENABLED = 'true'
    clearAdminLoginProtectionStoreForTests()
    const account = 'admin@local'
    for (let i = 0; i < TURNSTILE_AFTER - 1; i += 1) {
      recordAdminAccountFailure(account)
      expect(evaluateAdminLoginProtection(account).turnstileRequired).toBe(false)
    }
    recordAdminAccountFailure(account)
    expect(evaluateAdminLoginProtection(account).turnstileRequired).toBe(true)
  })

  it('lockout on 5th failure; reset clears gate', () => {
    process.env.AUTH_LOGIN_PROTECTION_ENABLED = 'true'
    clearAdminLoginProtectionStoreForTests()
    const account = 'admin@local'
    for (let i = 0; i < LOCKOUT_AFTER; i += 1) {
      recordAdminAccountFailure(account)
    }
    expect(evaluateAdminLoginProtection(account).allowed).toBe(false)
    resetAdminAccountProtection(account)
    expect(evaluateAdminLoginProtection(account).allowed).toBe(true)
    expect(evaluateAdminLoginProtection(account).consecutiveFailures).toBe(0)
  })
})
