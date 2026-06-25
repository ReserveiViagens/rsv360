const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { queryDatabase, isDbRefreshEnabled } = require('./refresh-token.service');
const { issueLoginTokens } = require('./login.service');

const SSO_CODE_TTL_MS = 2 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateSsoCode() {
  return crypto.randomBytes(32).toString('base64url');
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSsoBffSecret() {
  return (process.env.SSO_BFF_SECRET || process.env.OAUTH_BFF_SECRET || '').trim();
}

function isSsoBffAuthorized(req) {
  const expected = getSsoBffSecret();
  if (!expected) {
    return process.env.NODE_ENV !== 'production';
  }
  return req.get('X-Sso-Bff-Secret') === expected;
}

function buildLabCallbackUrl(code, returnUrl) {
  const labBase = (
    process.env.MARKETING_LAB_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
  const safeReturn =
    typeof returnUrl === 'string' && returnUrl.startsWith('/') ? returnUrl : '/lab';
  return `${labBase}/auth/sso/callback?code=${encodeURIComponent(code)}&return=${encodeURIComponent(safeReturn)}`;
}

async function findUserByEmail(email) {
  const rows = await queryDatabase('SELECT * FROM users WHERE email = $1', [email]);
  return rows?.[0] ?? null;
}

async function insertSsoUser({ name, email }) {
  const randomPassword = crypto.randomBytes(32).toString('hex');
  const passwordHash = await bcrypt.hash(randomPassword, 12);

  try {
    const rows = await queryDatabase(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'user', true)
       RETURNING *`,
      [name, email, passwordHash]
    );
    return rows?.[0] ?? null;
  } catch (error) {
    if (String(error.message).includes('password_hash')) {
      const rows = await queryDatabase(
        `INSERT INTO users (name, email, password, role, is_active)
         VALUES ($1, $2, $3, 'user', true)
         RETURNING *`,
        [name, email, passwordHash]
      );
      return rows?.[0] ?? null;
    }
    if (String(error.message).includes('unique') || String(error.code) === '23505') {
      return findUserByEmail(email);
    }
    throw error;
  }
}

function isUserActive(user) {
  if (user.status != null) {
    return user.status === 'active';
  }
  if (user.is_active != null) {
    return user.is_active === true;
  }
  return true;
}

async function issueSsoCode(payload = {}) {
  if (!isDbRefreshEnabled()) {
    return null;
  }

  const email = normalizeEmail(payload.email);
  const name =
    typeof payload.name === 'string' && payload.name.trim()
      ? payload.name.trim()
      : email.split('@')[0];
  const externalUserId =
    payload.external_user_id != null ? String(payload.external_user_id) : null;
  const returnUrl =
    typeof payload.return_url === 'string' && payload.return_url.startsWith('/')
      ? payload.return_url
      : '/lab';

  if (!isValidEmail(email)) {
    return { error: 'validation', status: 400, message: 'E-mail inválido' };
  }

  const rawCode = generateSsoCode();
  const codeHash = hashToken(rawCode);
  const expiresAt = new Date(Date.now() + SSO_CODE_TTL_MS);

  await queryDatabase(
    `INSERT INTO auth_sso_codes (code_hash, email, name, external_user_id, return_url, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [codeHash, email, name, externalUserId, returnUrl, expiresAt]
  );

  return {
    code: rawCode,
    expires_in: Math.floor(SSO_CODE_TTL_MS / 1000),
    callback_url: buildLabCallbackUrl(rawCode, returnUrl),
    return_url: returnUrl,
  };
}

async function exchangeSsoCode(code, meta = {}) {
  if (!isDbRefreshEnabled()) {
    return null;
  }

  const rawCode = typeof code === 'string' ? code.trim() : '';
  if (!rawCode) {
    return { error: 'validation', status: 400, message: 'code é obrigatório' };
  }

  const codeHash = hashToken(rawCode);
  const rows = await queryDatabase(
    `SELECT * FROM auth_sso_codes
     WHERE code_hash = $1 AND consumed_at IS NULL AND expires_at > CURRENT_TIMESTAMP
     LIMIT 1`,
    [codeHash]
  );

  const record = rows?.[0];
  if (!record) {
    return { error: 'invalid_code', status: 401, message: 'Código SSO inválido ou expirado' };
  }

  await queryDatabase(
    `UPDATE auth_sso_codes SET consumed_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [record.id]
  );

  let user = await findUserByEmail(record.email);
  if (!user) {
    user = await insertSsoUser({
      email: record.email,
      name: record.name || record.email.split('@')[0],
    });
  }

  if (!user) {
    return { error: 'user_sync', status: 503, message: 'Não foi possível sincronizar usuário' };
  }

  if (!isUserActive(user)) {
    return { error: 'account_disabled', status: 403, message: 'Conta desativada' };
  }

  const twoFactor = require('./two-factor.service');
  if (await twoFactor.isTwoFactorEnabled(user.id)) {
    const challenge = await twoFactor.createLoginChallenge(user.id);
    return {
      requires_2fa: true,
      temp_token: challenge.temp_token,
      expires_in: challenge.expires_in,
      return_url: record.return_url || '/lab',
    };
  }

  const tokens = await issueLoginTokens(user, meta);
  return {
    ...tokens,
    return_url: record.return_url || '/lab',
  };
}

module.exports = {
  issueSsoCode,
  exchangeSsoCode,
  isSsoBffAuthorized,
  isSsoDbEnabled: isDbRefreshEnabled,
  buildLabCallbackUrl,
  getSsoBffSecret,
};
