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
const JTI_KEY_PREFIX = 'dpop:jti:';
let redisClient;
let jtiStoreForTests;

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

function dpopJtiKey(jti) {
  const digest = crypto.createHash('sha256').update(jti, 'utf8').digest('hex');
  return `${JTI_KEY_PREFIX}${digest}`;
}

function createRedisJtiStore(client) {
  return {
    async consume(jti, ttlMs = JTI_TTL_MS) {
      const result = await client.set(dpopJtiKey(jti), '1', 'PX', ttlMs, 'NX');
      return result === 'OK';
    },
  };
}

async function getDpopJtiStore() {
  if (jtiStoreForTests) return jtiStoreForTests;
  if (process.env.REDIS_DISABLED === 'true' || !process.env.REDIS_URL) {
    throw new Error('DPoP replay store unavailable');
  }
  if (!redisClient) {
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      enableReadyCheck: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 5_000,
    });
    redisClient.on('error', () => {
      // Request validation maps connection failures to dpop_jti_store_unavailable.
    });
    await redisClient.connect();
  }
  return createRedisJtiStore(redisClient);
}

async function rememberJti(jti) {
  try {
    const store = await getDpopJtiStore();
    return { ok: await store.consume(jti, JTI_TTL_MS) };
  } catch {
    return { ok: false, error: 'dpop_jti_store_unavailable' };
  }
}

function setDpopJtiStoreForTests(store) {
  jtiStoreForTests = store;
}

function clearDpopJtiCacheForTests() {
  jtiStoreForTests = undefined;
}

function buildRequestHtu(req) {
  const proto = String(req.protocol || 'http').trim();
  const host = String(req.get?.('host') || 'localhost').trim();
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

async function verifyDpopProofForTokenEndpoint(req) {
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
  if (!jti) {
    return { ok: false, error: 'dpop_jti_replay' };
  }
  const consumed = await rememberJti(jti);
  if (!consumed.ok) {
    return { ok: false, error: consumed.error || 'dpop_jti_replay' };
  }

  return { ok: true, jkt: computeJwkThumbprintSync(jwk) };
}

async function verifyDpopProofForResource(req, accessToken, expectedJkt) {
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
  if (!jti) return { ok: false, error: 'dpop_jti_replay' };
  const consumed = await rememberJti(jti);
  if (!consumed.ok) {
    return { ok: false, error: consumed.error || 'dpop_jti_replay' };
  }

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
async function bindCnfToClaims(claims, req, options = {}) {
  if (Object.prototype.hasOwnProperty.call(options, 'dpopJkt')) {
    if (typeof options.dpopJkt === 'string' && options.dpopJkt) {
      return { ...claims, cnf: { jkt: options.dpopJkt } };
    }
    return { ...claims };
  }
  if (!req) return { ...claims };
  const verified = await verifyDpopProofForTokenEndpoint(req);
  if (!verified.ok) return { ...claims };
  return { ...claims, cnf: { jkt: verified.jkt } };
}

async function signAccessTokenBound(claims, secret, expiresInSeconds, req, options) {
  const boundClaims = await bindCnfToClaims(claims, req, options || {});
  return signJwt(boundClaims, secret, expiresInSeconds);
}

async function enforceDpopIfEnabled(req, accessToken, payload) {
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
  setDpopJtiStoreForTests,
  createRedisJtiStore,
  dpopJtiKey,
  DPOP_SKEW_SECONDS,
  JTI_TTL_MS,
  accessTokenHash,
  computeJwkThumbprintSync,
  base64UrlEncode,
  parseDeviceInfo,
  extractDpopJktFromDeviceInfo,
  mergeDpopJktIntoDeviceInfo,
  DPOP_JKT_DEVICE_KEY,
};
