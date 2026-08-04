/**
 * PR-10c-a1/a2/b — DPoP access + refresh family bind (RFC 9449).
 * AUTH_DPOP_ENABLED default OFF → resource enforcement no-op (fail-closed only when ON).
 * Emission binds cnf.jkt when a valid proof is presented (retrocompatible).
 * PR-10c-b: refresh family jkt in device_info JSONB (no migration); ath required on resource when ON.
 */

const DPOP_JKT_DEVICE_KEY = 'dpop_jkt';
const crypto = require('crypto');
const { stripQueryAndFragment } = require('@rsv360/shared');
const { signJwt } = require('./jwt-verify');

const DPOP_SKEW_SECONDS = 60;
const JTI_TTL_MS = 90 * 1000;
const jtiCache = new Map();

function base64UrlEncode(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecodeToBuffer(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

function computeJwkThumbprintSync(jwk) {
  const ordered = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
  return base64UrlEncode(crypto.createHash('sha256').update(JSON.stringify(ordered), 'utf8').digest());
}

function accessTokenHash(accessToken) {
  return base64UrlEncode(crypto.createHash('sha256').update(accessToken, 'ascii').digest());
}

function isDpopEnabled(env = process.env) {
  return env.AUTH_DPOP_ENABLED === 'true';
}

function purgeJtiCache(now = Date.now()) {
  for (const [jti, exp] of jtiCache.entries()) {
    if (exp <= now) jtiCache.delete(jti);
  }
}

function rememberJti(jti) {
  purgeJtiCache();
  if (jtiCache.has(jti)) return false;
  jtiCache.set(jti, Date.now() + JTI_TTL_MS);
  return true;
}

function clearDpopJtiCacheForTests() {
  jtiCache.clear();
}

function buildRequestHtu(req) {
  const proto = String(req.get?.('x-forwarded-proto') || req.protocol || 'http')
    .split(',')[0]
    .trim();
  const host = String(req.get?.('x-forwarded-host') || req.get?.('host') || 'localhost')
    .split(',')[0]
    .trim();
  const path = String(req.originalUrl || req.url || '/').split('?')[0];
  return stripQueryAndFragment(`${proto}://${host}${path}`);
}

function parseDpopJwt(dpopHeader) {
  if (!dpopHeader || typeof dpopHeader !== 'string') {
    return { error: 'missing_dpop' };
  }
  const parts = dpopHeader.trim().split('.');
  if (parts.length !== 3) return { error: 'malformed_dpop' };
  const [encHeader, encPayload, encSig] = parts;
  let header;
  let payload;
  try {
    header = JSON.parse(base64UrlDecodeToBuffer(encHeader).toString('utf8'));
    payload = JSON.parse(base64UrlDecodeToBuffer(encPayload).toString('utf8'));
  } catch {
    return { error: 'malformed_dpop' };
  }
  if (!header || header.typ !== 'dpop+jwt' || header.alg !== 'ES256') {
    return { error: 'invalid_dpop_header' };
  }
  const jwk = header.jwk;
  if (!jwk || jwk.kty !== 'EC' || jwk.crv !== 'P-256' || !jwk.x || !jwk.y) {
    return { error: 'invalid_dpop_jwk' };
  }
  return {
    header,
    payload,
    jwk: { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y },
    signingInput: `${encHeader}.${encPayload}`,
    signature: base64UrlDecodeToBuffer(encSig),
  };
}

function verifyEs256(signingInput, signature, jwk) {
  try {
    const keyObject = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    return crypto.verify(
      'SHA256',
      Buffer.from(signingInput, 'utf8'),
      { key: keyObject, dsaEncoding: 'ieee-p1363' },
      signature,
    );
  } catch {
    return false;
  }
}

function verifyDpopProofForTokenEndpoint(req) {
  const raw = req.get?.('dpop') || req.headers?.dpop;
  const parsed = parseDpopJwt(raw);
  if (parsed.error) return { ok: false, error: parsed.error };

  if (!verifyEs256(parsed.signingInput, parsed.signature, parsed.jwk)) {
    return { ok: false, error: 'invalid_dpop_signature' };
  }

  const { payload, jwk } = parsed;
  const now = Math.floor(Date.now() / 1000);
  const iat = Number(payload.iat);
  if (!Number.isFinite(iat) || Math.abs(now - iat) > DPOP_SKEW_SECONDS) {
    return { ok: false, error: 'dpop_iat_skew' };
  }

  if (String(payload.htm || '').toUpperCase() !== String(req.method || '').toUpperCase()) {
    return { ok: false, error: 'dpop_htm_mismatch' };
  }

  const expectedHtu = buildRequestHtu(req);
  if (stripQueryAndFragment(String(payload.htu || '')) !== expectedHtu) {
    return { ok: false, error: 'dpop_htu_mismatch' };
  }

  const jti = typeof payload.jti === 'string' ? payload.jti : '';
  if (!jti || !rememberJti(jti)) {
    return { ok: false, error: 'dpop_jti_replay' };
  }

  return { ok: true, jkt: computeJwkThumbprintSync(jwk) };
}

function verifyDpopProofForResource(req, accessToken, expectedJkt) {
  const raw = req.get?.('dpop') || req.headers?.dpop;
  const parsed = parseDpopJwt(raw);
  if (parsed.error) return { ok: false, error: parsed.error };

  if (!verifyEs256(parsed.signingInput, parsed.signature, parsed.jwk)) {
    return { ok: false, error: 'invalid_dpop_signature' };
  }

  const { payload, jwk } = parsed;
  const jkt = computeJwkThumbprintSync(jwk);
  if (jkt !== expectedJkt) return { ok: false, error: 'dpop_jkt_mismatch' };

  const now = Math.floor(Date.now() / 1000);
  const iat = Number(payload.iat);
  if (!Number.isFinite(iat) || Math.abs(now - iat) > DPOP_SKEW_SECONDS) {
    return { ok: false, error: 'dpop_iat_skew' };
  }

  if (String(payload.htm || '').toUpperCase() !== String(req.method || '').toUpperCase()) {
    return { ok: false, error: 'dpop_htm_mismatch' };
  }

  if (stripQueryAndFragment(String(payload.htu || '')) !== buildRequestHtu(req)) {
    return { ok: false, error: 'dpop_htu_mismatch' };
  }

  const jti = typeof payload.jti === 'string' ? payload.jti : '';
  if (!jti || !rememberJti(jti)) return { ok: false, error: 'dpop_jti_replay' };

  // PR-10c-b — RFC 9449: ath required on resource requests with access token.
  if (payload.ath == null || payload.ath === '') {
    return { ok: false, error: 'dpop_ath_missing' };
  }
  if (String(payload.ath) !== accessTokenHash(accessToken)) {
    return { ok: false, error: 'dpop_ath_mismatch' };
  }

  return { ok: true, jkt };
}

function parseDeviceInfo(raw) {
  if (raw == null) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) return { ...raw };
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      return null;
    }
  }
  return null;
}

function extractDpopJktFromDeviceInfo(deviceInfo) {
  const info = parseDeviceInfo(deviceInfo);
  const jkt = info?.[DPOP_JKT_DEVICE_KEY];
  return typeof jkt === 'string' && jkt.trim() ? jkt.trim() : null;
}

function mergeDpopJktIntoDeviceInfo(deviceInfo, jkt) {
  const base = parseDeviceInfo(deviceInfo) || {};
  if (!jkt || typeof jkt !== 'string') return Object.keys(base).length ? base : null;
  return { ...base, [DPOP_JKT_DEVICE_KEY]: jkt };
}

/**
 * @param {object} claims
 * @param {object} [req]
 * @param {{ dpopJkt?: string | null }} [options]
 *   - dpopJkt undefined: verify proof from req (login)
 *   - dpopJkt string: bind that jkt (already verified; avoids jti double-consume)
 *   - dpopJkt null: no cnf binding
 */
function bindCnfToClaims(claims, req, options = {}) {
  if (Object.prototype.hasOwnProperty.call(options, 'dpopJkt')) {
    if (typeof options.dpopJkt === 'string' && options.dpopJkt) {
      return { ...claims, cnf: { jkt: options.dpopJkt } };
    }
    return { ...claims };
  }
  if (!req) return { ...claims };
  const verified = verifyDpopProofForTokenEndpoint(req);
  if (!verified.ok) return { ...claims };
  return { ...claims, cnf: { jkt: verified.jkt } };
}

function signAccessTokenBound(claims, secret, expiresInSeconds, req, options) {
  return signJwt(bindCnfToClaims(claims, req, options || {}), secret, expiresInSeconds);
}

function enforceDpopIfEnabled(req, accessToken, payload) {
  if (!isDpopEnabled()) return { ok: true };
  const jkt = payload?.cnf?.jkt;
  if (!jkt || typeof jkt !== 'string') return { ok: true };
  return verifyDpopProofForResource(req, accessToken, jkt);
}

module.exports = {
  isDpopEnabled,
  verifyDpopProofForTokenEndpoint,
  verifyDpopProofForResource,
  bindCnfToClaims,
  signAccessTokenBound,
  enforceDpopIfEnabled,
  buildRequestHtu,
  clearDpopJtiCacheForTests,
  DPOP_SKEW_SECONDS,
  accessTokenHash,
  computeJwkThumbprintSync,
  base64UrlEncode,
  parseDeviceInfo,
  extractDpopJktFromDeviceInfo,
  mergeDpopJktIntoDeviceInfo,
  DPOP_JKT_DEVICE_KEY,
};
