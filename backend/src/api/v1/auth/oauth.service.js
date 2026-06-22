const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { queryDatabase, isDbRefreshEnabled } = require('./refresh-token.service');
const { issueLoginTokens } = require('./login.service');

const ALLOWED_PROVIDERS = new Set(['google', 'facebook']);

function normalizeOAuthPayload(body = {}) {
  const provider =
    typeof body.provider === 'string' ? body.provider.trim().toLowerCase() : '';
  const providerId =
    typeof body.provider_id === 'string'
      ? body.provider_id.trim()
      : typeof body.providerId === 'string'
        ? body.providerId.trim()
        : body.provider_id != null
          ? String(body.provider_id)
          : '';
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  return { provider, providerId, email, name };
}

function isValidProvider(provider) {
  return ALLOWED_PROVIDERS.has(provider);
}

function resolveOAuthEmail(provider, providerId, email) {
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return email;
  }
  return `${provider}_${providerId}@oauth.local`;
}

async function findUserByEmail(email) {
  const rows = await queryDatabase('SELECT * FROM users WHERE email = $1', [email]);
  return rows?.[0] ?? null;
}

async function insertOAuthUser({ name, email }) {
  const randomPassword = crypto.randomBytes(32).toString('hex');
  const passwordHash = await bcrypt.hash(randomPassword, 12);

  try {
    const rows = await queryDatabase(
      `INSERT INTO users (name, email, password, role, is_active)
       VALUES ($1, $2, $3, 'user', true)
       RETURNING *`,
      [name, email, passwordHash]
    );
    return rows?.[0] ?? null;
  } catch (error) {
    if (String(error.message).includes('password')) {
      const rows = await queryDatabase(
        `INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, 'user', true)
         RETURNING *`,
        [name, email, passwordHash]
      );
      return rows?.[0] ?? null;
    }
    if (String(error.message).includes('unique') || String(error.code) === '23505') {
      return { error: 'email_exists' };
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

async function oauthLoginWithProfile(payload, meta = {}) {
  if (!isDbRefreshEnabled()) {
    return null;
  }

  const { provider, providerId, email, name } = normalizeOAuthPayload(payload);

  if (!isValidProvider(provider)) {
    return { error: 'validation', status: 400, message: 'Provider OAuth inválido' };
  }

  if (!providerId) {
    return { error: 'validation', status: 400, message: 'provider_id é obrigatório' };
  }

  const resolvedEmail = resolveOAuthEmail(provider, providerId, email);
  const displayName = name || `Usuário ${provider}`;

  let user = await findUserByEmail(resolvedEmail);

  if (!user) {
    const created = await insertOAuthUser({ name: displayName, email: resolvedEmail });
    if (created?.error === 'email_exists') {
      user = await findUserByEmail(resolvedEmail);
    } else {
      user = created;
    }
  }

  if (!user) {
    return { error: 'insert_failed', status: 503, message: 'Não foi possível autenticar' };
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
    };
  }

  return issueLoginTokens(user, meta);
}

function isOAuthBffAuthorized(req) {
  const expected = (process.env.OAUTH_BFF_SECRET || '').trim();
  if (!expected) {
    return process.env.NODE_ENV !== 'production';
  }
  return req.get('X-OAuth-Bff-Secret') === expected;
}

module.exports = {
  oauthLoginWithProfile,
  isOAuthBffAuthorized,
  isDbOAuthEnabled: isDbRefreshEnabled,
  normalizeOAuthPayload,
  resolveOAuthEmail,
};
