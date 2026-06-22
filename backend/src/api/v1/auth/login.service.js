const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { signJwt } = require('./jwt-verify');
const {
  isDbRefreshEnabled,
  createRefreshToken,
  queryDatabase,
} = require('./refresh-token.service');

async function comparePassword(password, passwordHash) {
  if (!passwordHash) return false;
  if (passwordHash.startsWith('$2')) {
    return bcrypt.compare(password, passwordHash);
  }
  return crypto.createHash('sha256').update(password).digest('hex') === passwordHash;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function getStoredPasswordHash(user) {
  return user.password_hash ?? user.password ?? null;
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

async function updateUserPassword(userId, hashedPassword) {
  try {
    await queryDatabase('UPDATE users SET password_hash = $1 WHERE id = $2', [
      hashedPassword,
      userId,
    ]);
  } catch (error) {
    if (String(error.message).includes('password_hash')) {
      await queryDatabase('UPDATE users SET password = $1 WHERE id = $2', [
        hashedPassword,
        userId,
      ]);
      return;
    }
    throw error;
  }
}

async function touchLastLogin(userId) {
  try {
    await queryDatabase('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [
      userId,
    ]);
  } catch {
    // Coluna last_login ausente em schemas legados — ignorar
  }
}

async function loginWithDatabase(email, password, meta = {}) {
  if (!isDbRefreshEnabled()) return null;

  const users = await queryDatabase('SELECT * FROM users WHERE email = $1', [
    email.toLowerCase(),
  ]);

  if (!users || users.length === 0) {
    return { error: 'invalid_credentials', status: 401 };
  }

  const user = users[0];

  if (!isUserActive(user)) {
    return { error: 'account_disabled', status: 403 };
  }

  const storedHash = getStoredPasswordHash(user);

  if (storedHash) {
    const valid = await comparePassword(password, storedHash);
    if (!valid) {
      return { error: 'invalid_credentials', status: 401 };
    }
  } else {
    const hashedPassword = await hashPassword(password);
    await updateUserPassword(user.id, hashedPassword);
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

async function issueLoginTokens(user, meta = {}) {
  await touchLastLogin(user.id);

  const accessSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const accessToken = signJwt(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      enterpriseId: user.enterprise_id ?? 'ent_1',
    },
    accessSecret,
    900
  );

  const { refreshToken } = await createRefreshToken(
    user.id,
    meta.deviceInfo,
    meta.ipAddress,
    meta.userAgent
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      enterpriseId: user.enterprise_id ?? 'ent_1',
    },
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 900,
  };
}

module.exports = {
  loginWithDatabase,
  isDbLoginEnabled: isDbRefreshEnabled,
  issueLoginTokens,
  comparePassword,
  getStoredPasswordHash,
};
