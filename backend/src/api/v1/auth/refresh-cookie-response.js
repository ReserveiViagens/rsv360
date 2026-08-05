/**
 * PR-10c-pré-b — HttpOnly refresh cookie on API origin (Path=/api/v1/auth).
 * Reuses shared cookie helpers; no new cookie policy.
 */
const {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH_API,
  assertCookieMutationOrigin,
  getRefreshTokenCookieOptions,
  readCookieValue,
  stripRefreshTokenFromAuthPayload,
} = require('@rsv360/shared');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function appendSetCookie(res, value) {
  const prev = res.getHeader('Set-Cookie');
  if (!prev) {
    res.setHeader('Set-Cookie', value);
  } else if (Array.isArray(prev)) {
    res.setHeader('Set-Cookie', [...prev, value]);
  } else {
    res.setHeader('Set-Cookie', [String(prev), value]);
  }
}

function serializeRefreshCookie(token, { cleared = false } = {}) {
  const opts = getRefreshTokenCookieOptions({ path: REFRESH_TOKEN_COOKIE_PATH_API });
  const parts = [
    `${REFRESH_TOKEN_COOKIE_NAME}=${cleared ? '' : encodeURIComponent(token)}`,
    `Path=${opts.path}`,
    `Max-Age=${cleared ? 0 : opts.maxAge}`,
    `SameSite=${opts.sameSite === 'lax' ? 'Lax' : opts.sameSite}`,
    'HttpOnly',
  ];
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  if (opts.secure) parts.push('Secure');
  return parts.join('; ');
}

function setRefreshTokenCookie(res, refreshToken) {
  if (!refreshToken || typeof refreshToken !== 'string') return;
  appendSetCookie(res, serializeRefreshCookie(refreshToken));
}

function clearRefreshTokenCookie(res) {
  appendSetCookie(res, serializeRefreshCookie('', { cleared: true }));
}

function extractRefreshTokenFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return undefined;
  const root = payload;
  if (typeof root.refresh_token === 'string' && root.refresh_token.trim()) {
    return root.refresh_token;
  }
  if (root.data && typeof root.data === 'object') {
    const data = root.data;
    if (typeof data.refresh_token === 'string' && data.refresh_token.trim()) {
      return data.refresh_token;
    }
  }
  return undefined;
}

/**
 * Browser calls send Origin; site-publico BFF (server fetch) typically does not.
 * Keep refresh in JSON for BFF so Path=/api/auth cookie minting stays intact.
 */
function shouldStripRefreshFromJson(req) {
  const origin = req.get?.('origin');
  return Boolean(origin && String(origin).trim());
}

/**
 * Send JSON auth payload: Set-Cookie Path=/api/v1/auth when refresh present;
 * strip refresh from body for browser Origins only.
 */
function sendAuthJson(res, req, body, status = 200) {
  const refresh = extractRefreshTokenFromPayload(body);
  if (refresh) {
    setRefreshTokenCookie(res, refresh);
  }
  const out =
    refresh && shouldStripRefreshFromJson(req)
      ? stripRefreshTokenFromAuthPayload(body)
      : body;
  return res.status(status).json(out);
}

/**
 * CSRF 16b for mutations that carry the refresh cookie (fail-closed Origin/Referer).
 * Bearer-only / body-only without cookie → unchanged.
 */
function cookieMutationOriginGuard(req, res, next) {
  if (SAFE_METHODS.has(String(req.method || '').toUpperCase())) {
    return next();
  }
  const cookie = readCookieValue(req.headers?.cookie, REFRESH_TOKEN_COOKIE_NAME);
  if (!cookie) {
    return next();
  }
  const check = assertCookieMutationOrigin({
    origin: req.get('origin') || null,
    referer: req.get('referer') || null,
  });
  if (!check.ok) {
    return res.status(403).json({
      success: false,
      error: 'Origem da requisição não permitida.',
    });
  }
  return next();
}

module.exports = {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  sendAuthJson,
  cookieMutationOriginGuard,
  extractRefreshTokenFromPayload,
  shouldStripRefreshFromJson,
  serializeRefreshCookie,
};
