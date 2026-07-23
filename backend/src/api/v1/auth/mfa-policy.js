/**
 * PR-06c — MFA / enrollment / Turnstile policy flags (enforcement OFF by default).
 */

const PRIVILEGED_ROLES = new Set(['admin', 'manager']);

function envFlagTrue(name) {
  return String(process.env[name] || '').toLowerCase() === 'true';
}

/** Master switch: mandatory TOTP for admin|manager. Default OFF. */
function isMfaEnforceEnabled() {
  return envFlagTrue('AUTH_MFA_ENFORCE');
}

/**
 * Progressive lockout + Turnstile-after-3. Default OFF.
 * Owner enables in coordinated window — never as merge side-effect.
 */
function isLoginProtectionEnabled() {
  return envFlagTrue('AUTH_LOGIN_PROTECTION_ENABLED');
}

/**
 * When login protection requires Turnstile, verification is fail-closed
 * (missing secret ⇒ deny). Default follows protection flag.
 */
function isLoginTurnstileFailClosed() {
  if (process.env.AUTH_LOGIN_TURNSTILE_FAIL_CLOSED != null) {
    return envFlagTrue('AUTH_LOGIN_TURNSTILE_FAIL_CLOSED');
  }
  return isLoginProtectionEnabled();
}

function roleRequiresMfa(role) {
  if (!role) return false;
  return PRIVILEGED_ROLES.has(String(role).toLowerCase());
}

/**
 * Enrollment window from explicit env timestamp — never deploy clock.
 * AUTH_MFA_ENROLLMENT_START_AT = ISO-8601; empty ⇒ no open window.
 * AUTH_MFA_ENROLLMENT_WINDOW_HOURS = default 72.
 */
function getEnrollmentWindow() {
  const startRaw = String(process.env.AUTH_MFA_ENROLLMENT_START_AT || '').trim();
  if (!startRaw) {
    return { open: false, startAt: null, endAt: null, reason: 'start_unset' };
  }
  const startAt = new Date(startRaw);
  if (Number.isNaN(startAt.getTime())) {
    return { open: false, startAt: null, endAt: null, reason: 'start_invalid' };
  }
  const hours = Number(process.env.AUTH_MFA_ENROLLMENT_WINDOW_HOURS || 72);
  const windowHours = Number.isFinite(hours) && hours > 0 ? hours : 72;
  const endAt = new Date(startAt.getTime() + windowHours * 60 * 60 * 1000);
  const now = Date.now();
  const open = now >= startAt.getTime() && now <= endAt.getTime();
  return {
    open,
    startAt,
    endAt,
    windowHours,
    reason: open ? 'open' : now < startAt.getTime() ? 'not_started' : 'expired',
  };
}

function isEnrollmentWindowOpen() {
  return getEnrollmentWindow().open;
}

module.exports = {
  PRIVILEGED_ROLES,
  isMfaEnforceEnabled,
  isLoginProtectionEnabled,
  isLoginTurnstileFailClosed,
  roleRequiresMfa,
  getEnrollmentWindow,
  isEnrollmentWindowOpen,
};
