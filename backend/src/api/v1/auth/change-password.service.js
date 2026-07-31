/**
 * F5 — change password for authenticated staff (current password + TOTP).
 * Never logs password or TOTP values.
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {
  queryDatabase,
  isDbRefreshEnabled,
  revokeAllUserTokens,
} = require('./refresh-token.service');

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function getStoredPasswordHash(user) {
  return user.password_hash ?? user.password ?? null;
}

async function comparePassword(password, passwordHash) {
  if (!passwordHash) return false;
  if (passwordHash.startsWith('$2')) {
    return bcrypt.compare(password, passwordHash);
  }
  return crypto.createHash('sha256').update(password).digest('hex') === passwordHash;
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

function emitPasswordAudit(event, fields = {}) {
  const payload = {
    event,
    userId: fields.userId != null ? String(fields.userId) : undefined,
    role: fields.role || undefined,
    ip: fields.ip || undefined,
    userAgent: fields.userAgent || undefined,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    surface: fields.surface || undefined,
    detail: fields.detail || undefined,
  };
  console.info(`[AUTH][PASSWORD-AUDIT] ${JSON.stringify(payload)}`);
}

/**
 * @param {{ email: string, current_password: string, new_password: string, password_confirmation?: string, totp_code: string }} payload
 * @param {{ ipAddress?: string, userAgent?: string, surface?: string }} meta
 */
async function changePasswordWithTotp(payload = {}, meta = {}) {
  if (!isDbRefreshEnabled()) {
    return null;
  }

  const email = normalizeEmail(payload.email);
  const currentPassword =
    typeof payload.current_password === 'string'
      ? payload.current_password
      : typeof payload.currentPassword === 'string'
        ? payload.currentPassword
        : '';
  const newPassword =
    typeof payload.new_password === 'string'
      ? payload.new_password
      : typeof payload.newPassword === 'string'
        ? payload.newPassword
        : '';
  const passwordConfirmation =
    typeof payload.password_confirmation === 'string'
      ? payload.password_confirmation
      : typeof payload.passwordConfirmation === 'string'
        ? payload.passwordConfirmation
        : newPassword;
  const totpCode =
    typeof payload.totp_code === 'string'
      ? payload.totp_code.trim()
      : typeof payload.totpCode === 'string'
        ? payload.totpCode.trim()
        : typeof payload.code === 'string'
          ? payload.code.trim()
          : '';

  if (!email || !currentPassword || !newPassword || !totpCode) {
    return {
      error: 'validation',
      status: 400,
      message: 'E-mail, senha atual, senha nova e TOTP são obrigatórios',
    };
  }

  if (newPassword.length < 8) {
    return {
      error: 'validation',
      status: 400,
      message: 'Senha deve ter pelo menos 8 caracteres',
    };
  }

  if (newPassword !== passwordConfirmation) {
    return {
      error: 'validation',
      status: 400,
      message: 'Confirmação de senha não confere',
    };
  }

  if (newPassword === currentPassword) {
    return {
      error: 'validation',
      status: 400,
      message: 'A nova senha deve ser diferente da atual',
    };
  }

  const users = await queryDatabase('SELECT * FROM users WHERE email = $1', [email]);
  if (!users?.length) {
    return { error: 'invalid_credentials', status: 401, message: 'Credenciais inválidas' };
  }

  const user = users[0];
  const storedHash = getStoredPasswordHash(user);
  const passwordOk = await comparePassword(currentPassword, storedHash);
  if (!passwordOk) {
    emitPasswordAudit('PasswordChangeFailed', {
      userId: user.id,
      role: user.role,
      ip: meta.ipAddress,
      userAgent: meta.userAgent,
      surface: meta.surface,
      detail: 'bad_password',
    });
    return { error: 'invalid_credentials', status: 401, message: 'Credenciais inválidas' };
  }

  const twoFactor = require('./two-factor.service');
  const totpCheck = await twoFactor.verifyEnabledTotp(user.id, totpCode, meta);
  if (!totpCheck.ok) {
    emitPasswordAudit('PasswordChangeFailed', {
      userId: user.id,
      role: user.role,
      ip: meta.ipAddress,
      userAgent: meta.userAgent,
      surface: meta.surface,
      detail: totpCheck.detail || 'totp',
    });
    return {
      error: totpCheck.error,
      status: totpCheck.status,
      message: totpCheck.message,
    };
  }

  const passwordHash = await hashPassword(newPassword);
  await updateUserPassword(user.id, passwordHash);
  await revokeAllUserTokens(user.id, 'Senha alterada');

  emitPasswordAudit('PasswordChanged', {
    userId: user.id,
    role: user.role,
    ip: meta.ipAddress,
    userAgent: meta.userAgent,
    surface: meta.surface,
  });

  return { message: 'Senha alterada. Faça login novamente.' };
}

module.exports = {
  changePasswordWithTotp,
  isDbChangePasswordEnabled: isDbRefreshEnabled,
  emitPasswordAudit,
};
