/**
 * Shared Next.js security headers for PR-05a (no CSP — PR-16).
 * Require from next.config.js: require('../../packages/shared/security-headers.cjs')
 */
'use strict';

function getNextSecurityHeaders() {
  const headers = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ];
  if (process.env.ENABLE_HSTS === 'true') {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=15552000; includeSubDomains',
    });
  }
  return headers;
}

module.exports = { getNextSecurityHeaders };
