const crypto = require('crypto');

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

function base64UrlEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Verifica JWT HS256 (compatível com site-publico jsonwebtoken). */
function verifyJwt(token, secret, options = {}) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expected = base64UrlEncode(
    crypto.createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest()
  );

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8'));
    if (options.requireType && payload.type !== options.requireType) {
      return null;
    }
    if (payload.exp && Date.now() / 1000 >= payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function verifyAccessToken(token, secret) {
  return verifyJwt(token, secret);
}

function verifyRefreshToken(token, secret) {
  return verifyJwt(token, secret, { requireType: 'refresh' });
}

function signJwt(payload, secret, expiresInSeconds) {
  const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const bodyPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds };
  const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(bodyPayload)));
  const signature = base64UrlEncode(
    crypto.createHmac('sha256', secret).update(`${header}.${encodedPayload}`).digest()
  );
  return `${header}.${encodedPayload}.${signature}`;
}

function extractBearerToken(req) {
  const authHeader = req.header('authorization') || req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return token || null;
}

module.exports = {
  verifyAccessToken,
  verifyRefreshToken,
  signJwt,
  extractBearerToken,
};
