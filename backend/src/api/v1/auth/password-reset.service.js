const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const {
  queryDatabase,
  isDbRefreshEnabled,
  revokeAllUserTokens,
} = require('./refresh-token.service');
const { sendPasswordResetEmail } = require('./password-reset-email.service');

const GENERIC_FORGOT_MESSAGE = 'Se o e-mail existir, enviaremos instruções.';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function updateUserPassword(userId, passwordHash) {
  try {
    await queryDatabase('UPDATE users SET password_hash = $1 WHERE id = $2', [
      passwordHash,
      userId,
    ]);
  } catch (error) {
    if (String(error.message).includes('password_hash')) {
      await queryDatabase('UPDATE users SET password = $1 WHERE id = $2', [
        passwordHash,
        userId,
      ]);
      return;
    }
    throw error;
  }
}

function buildResetUrl(token) {
  const base = (
    process.env.PASSWORD_RESET_BASE_URL ||
    process.env.PASSWORD_RESET_URL_BASE ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');

  if (base.includes('/redefinir-senha')) {
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}token=${encodeURIComponent(token)}`;
  }

  return `${base}/redefinir-senha?token=${encodeURIComponent(token)}`;
}

async function invalidateActiveResetTokens(userId) {
  await queryDatabase(
    `UPDATE password_reset_tokens
     SET used_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND used_at IS NULL`,
    [userId]
  );
}

async function createResetToken(userId) {
  const rawToken = generateResetToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await queryDatabase(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt.toISOString()]
  );

  return rawToken;
}

async function findValidResetToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  const rows = await queryDatabase(
    `SELECT id, user_id, expires_at, used_at
     FROM password_reset_tokens
     WHERE token_hash = $1
     LIMIT 1`,
    [tokenHash]
  );
  const row = rows?.[0];
  if (!row || row.used_at) {
    return null;
  }
  if (new Date(row.expires_at) <= new Date()) {
    return null;
  }
  return row;
}

async function requestPasswordReset(email) {
  if (!isDbRefreshEnabled()) {
    return null;
  }

  const normalized = normalizeEmail(email);
  if (!normalized) {
    return { error: 'validation', status: 400, message: 'E-mail é obrigatório' };
  }
  if (!isValidEmail(normalized)) {
    return { error: 'validation', status: 400, message: 'E-mail inválido' };
  }

  const users = await queryDatabase('SELECT id, email, name FROM users WHERE email = $1', [
    normalized,
  ]);

  if (users?.length) {
    const user = users[0];
    await invalidateActiveResetTokens(user.id);
    const token = await createResetToken(user.id);
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl: buildResetUrl(token),
      token,
    });
  }

  return { message: GENERIC_FORGOT_MESSAGE };
}

function normalizeResetPayload(body = {}) {
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const passwordConfirmation =
    typeof body.password_confirmation === 'string'
      ? body.password_confirmation
      : typeof body.passwordConfirmation === 'string'
        ? body.passwordConfirmation
        : password;

  return { token, password, passwordConfirmation };
}

async function resetPasswordWithToken(payload) {
  if (!isDbRefreshEnabled()) {
    return null;
  }

  const { token, password, passwordConfirmation } = normalizeResetPayload(payload);

  if (!token || !password) {
    return {
      error: 'validation',
      status: 400,
      message: 'Token e senha são obrigatórios',
    };
  }

  if (password.length < 8) {
    return {
      error: 'validation',
      status: 400,
      message: 'Senha deve ter pelo menos 8 caracteres',
    };
  }

  if (password !== passwordConfirmation) {
    return {
      error: 'validation',
      status: 400,
      message: 'Confirmação de senha não confere',
    };
  }

  const resetRow = await findValidResetToken(token);
  if (!resetRow) {
    return { error: 'invalid_token', status: 401, message: 'Token inválido ou expirado' };
  }

  const passwordHash = await hashPassword(password);
  await updateUserPassword(resetRow.user_id, passwordHash);

  await queryDatabase(
    `UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [resetRow.id]
  );

  await revokeAllUserTokens(resetRow.user_id, 'Senha redefinida');

  return { message: 'Senha alterada. Faça login.' };
}

module.exports = {
  requestPasswordReset,
  resetPasswordWithToken,
  isDbPasswordResetEnabled: isDbRefreshEnabled,
  hashToken,
  buildResetUrl,
  GENERIC_FORGOT_MESSAGE,
};
