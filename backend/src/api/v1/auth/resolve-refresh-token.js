/**
 * PR-10c-pré-a — resolve refresh token: cookie first, body fallback (legacy).
 * AUTH_REFRESH_COOKIE_REQUIRED=true rejects direct body (BFF may still forward via cookie).
 */
const {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TRANSPORT_HEADER,
  isRefreshCookieRequired,
  readCookieValue,
} = require('@rsv360/shared');
const {
  authRefreshDeprecatedTotal,
  authRefreshCookieRequiredRejectedTotal,
} = require('../../../monitoring/prometheus');

/**
 * @param {import('express').Request} req
 * @param {{ optional?: boolean }} [opts]
 * @returns {{ token: string|undefined, source: 'cookie'|'body'|'none' } | { error: true, status: number, message: string }}
 */
function resolveRefreshToken(req, opts = {}) {
  const optional = opts.optional === true;
  const fromCookie = readCookieValue(req.headers?.cookie, REFRESH_TOKEN_COOKIE_NAME);
  const rawBody = req.body && typeof req.body.refresh_token === 'string' ? req.body.refresh_token : '';
  const fromBody = rawBody.trim() ? rawBody : undefined;
  const transport = String(req.get?.(REFRESH_TRANSPORT_HEADER) || '')
    .trim()
    .toLowerCase();
  const transportLabel = transport || 'direct-body';

  if (fromCookie) {
    return { token: fromCookie, source: 'cookie' };
  }

  if (fromBody) {
    if (isRefreshCookieRequired() && transport !== 'bff-cookie') {
      authRefreshCookieRequiredRejectedTotal.inc({ transport: transportLabel });
      return {
        error: true,
        status: 401,
        message: 'Refresh via cookie obrigatório',
      };
    }
    if (transport !== 'bff-cookie') {
      // Deprecation signal for planning cut-over after 10c-pré-b (no PII).
      authRefreshDeprecatedTotal.inc({ transport: transportLabel });
      console.warn(
        JSON.stringify({
          event: 'auth_refresh_body_deprecated',
          transport: transportLabel,
          origin: req.get?.('origin') || null,
          path: req.originalUrl || req.url || null,
        }),
      );
    }
    return { token: fromBody, source: 'body' };
  }

  if (optional) {
    return { token: undefined, source: 'none' };
  }

  return {
    error: true,
    status: 400,
    message: 'refresh_token é obrigatório',
  };
}

module.exports = { resolveRefreshToken };
