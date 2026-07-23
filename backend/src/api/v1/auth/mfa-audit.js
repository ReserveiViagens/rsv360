/**
 * PR-06c — structured MFA audit events (never log TOTP/secret/recovery codes).
 */

const MFA_EVENTS = [
  'MFAEnrollmentStarted',
  'MFAEnrollmentCompleted',
  'MFAVerificationFailed',
  'MFAVerificationSucceeded',
  'RecoveryCodeUsed',
  'RecoveryCodeRegenerated',
  'MFAResetRequested',
  'MFAResetCompleted',
];

function emitMfaAudit(event, fields = {}) {
  if (!MFA_EVENTS.includes(event)) {
    console.warn('[AUTH][MFA-AUDIT] unknown event', event);
    return;
  }
  const payload = {
    event,
    userId: fields.userId != null ? String(fields.userId) : undefined,
    role: fields.role || undefined,
    ip: fields.ip || undefined,
    userAgent: fields.userAgent || undefined,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    release: process.env.RELEASE_SHA || process.env.GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    surface: fields.surface || undefined,
    detail: fields.detail || undefined,
  };
  // Structured single-line JSON for log scrapers / alerts (MFAEnrollmentStarted).
  console.info(`[AUTH][MFA-AUDIT] ${JSON.stringify(payload)}`);
}

module.exports = {
  MFA_EVENTS,
  emitMfaAudit,
};
