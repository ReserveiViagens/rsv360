/**
 * PR-04a — JWT hardening: alg:none, alg confusion, custom verifier alg pin.
 */
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getJwtSecret, JWT_HS256_VERIFY_OPTIONS } from '@rsv360/shared';

const { verifyAccessToken, signJwt } = require('../../api/v1/auth/jwt-verify');

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function forgeToken(header: object, payload: object, secret?: string): string {
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 900 }));
  if (!secret) {
    return `${h}.${p}.`;
  }
  const sig = b64url(crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest());
  return `${h}.${p}.${sig}`;
}

describe('PR-04a jwt hardening', () => {
  const secret = getJwtSecret();

  it('accepts valid HS256 access token (anti-regression)', () => {
    const token = signJwt({ userId: 1, email: 'a@b.c', role: 'admin' }, secret, 900);
    const payload = verifyAccessToken(token, secret);
    expect(payload?.userId).toBe(1);
    const decoded = jwt.verify(token, secret, JWT_HS256_VERIFY_OPTIONS) as unknown as {
      userId: number;
    };
    expect(decoded.userId).toBe(1);
  });

  it('rejects alg:none (custom verifier)', () => {
    const token = forgeToken({ alg: 'none', typ: 'JWT' }, { userId: 1, role: 'admin' });
    expect(verifyAccessToken(token, secret)).toBeNull();
  });

  it('rejects alg:none (jsonwebtoken pin)', () => {
    const token = forgeToken({ alg: 'none', typ: 'JWT' }, { userId: 1, role: 'admin' });
    expect(() => jwt.verify(token, secret, JWT_HS256_VERIFY_OPTIONS)).toThrow();
  });

  it('rejects header alg ≠ HS256 before HMAC (custom verifier)', () => {
    const token = forgeToken({ alg: 'RS256', typ: 'JWT' }, { userId: 1, role: 'admin' }, secret);
    expect(verifyAccessToken(token, secret)).toBeNull();
  });

  it('rejects RS256→HS256 confusion (public key as HMAC secret)', () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const token = jwt.sign({ userId: 99, role: 'admin' }, privateKey, {
      algorithm: 'RS256',
      expiresIn: 900,
    });
    const pubPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
    expect(verifyAccessToken(token, pubPem)).toBeNull();
    expect(() => jwt.verify(token, pubPem, JWT_HS256_VERIFY_OPTIONS)).toThrow();
  });

  it('getJwtSecret fails closed when env absent', () => {
    const { getJwtSecret: g, JwtSecretMissingError } = require('@rsv360/shared');
    expect(() => g({ JWT_SECRET: undefined })).toThrow(JwtSecretMissingError);
  });
});
