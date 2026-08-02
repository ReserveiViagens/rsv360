const { getJwtSecret } = require('@rsv360/shared');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { signJwt } = require('./jwt-verify');
const { isDbRefreshEnabled } = require('./refresh-token.service');

function db() {
  return require('./refresh-token.service');
}

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
    await db().queryDatabase('UPDATE users SET password_hash = $1 WHERE id = $2', [
      hashedPassword,
      userId,
    ]);
  } catch (error) {
    if (String(error.message).includes('password_hash')) {
      await db().queryDatabase('UPDATE users SET password = $1 WHERE id = $2', [
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
    await db().queryDatabase('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [
      userId,
    ]);
  } catch {
    // Coluna last_login ausente em schemas legados — ignorar
  }
}

async function loginWithDatabase(email, password, meta = {}) {
  if (!isDbRefreshEnabled()) return null;

  const {
    isMfaEnforceEnabled,
    roleRequiresMfa,
    isEnrollmentWindowOpen,
  } = require('./mfa-policy');

  const users = await db().queryDatabase('SELECT * FROM users WHERE email = $1', [
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
    const valid = await module.exports.comparePassword(password, storedHash);
    if (!valid) {
      return { error: 'invalid_credentials', status: 401 };
    }
  } else {
    const hashedPassword = await hashPassword(password);
    await updateUserPassword(user.id, hashedPassword);
  }

  const twoFactor = require('./two-factor.service');
  const mfaOn = await twoFactor.isTwoFactorEnabled(user.id);
  const privileged = roleRequiresMfa(user.role);

  if (isMfaEnforceEnabled() && privileged) {
    if (!mfaOn) {
      if (isEnrollmentWindowOpen()) {
        const enrollmentToken = signJwt(
          {
            userId: user.id,
            email: user.email,
            role: user.role,
            purpose: 'mfa_enrollment',
          },
          getJwtSecret(),
          3600
        );
        return {
          requires_mfa_enrollment: true,
          enrollment_token: enrollmentToken,
          expires_in: 3600,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        };
      }
      return {
        error: 'mfa_required',
        status: 403,
        message: 'MFA TOTP obrigatório para este perfil',
      };
    }
  }

  if (mfaOn) {
    const {
      isStepUpEnabled,
      loadActiveFingerprints,
      isKnownClient,
      stepUpReasons,
      logStepUp,
    } = require('./step-up.service');

    if (isStepUpEnabled()) {
      const fingerprints = await loadActiveFingerprints(user.id);
      if (isKnownClient(meta.ipAddress, meta.userAgent, fingerprints)) {
        // Known device: skip TOTP challenge when step-up mode is on
        return issueLoginTokens(user, meta);
      }
      logStepUp(user.id, stepUpReasons(meta.ipAddress, meta.userAgent, fingerprints));
      const challenge = await twoFactor.createLoginChallenge(user.id);
      return {
        requires_2fa: true,
        temp_token: challenge.temp_token,
        expires_in: challenge.expires_in,
      };
    }

    const challenge = await twoFactor.createLoginChallenge(user.id);
    return {
      requires_2fa: true,
      temp_token: challenge.temp_token,
      expires_in: challenge.expires_in,
    };
  }

  if (require('./step-up.service').isStepUpEnabled()) {
    const {
      loadActiveFingerprints,
      isKnownClient,
      logStepUpSkip,
    } = require('./step-up.service');
    const fingerprints = await loadActiveFingerprints(user.id);
    if (!isKnownClient(meta.ipAddress, meta.userAgent, fingerprints)) {
      logStepUpSkip(user.id, 'no_mfa');
    }
  }

  return issueLoginTokens(user, meta);
}

async function issueLoginTokens(user, meta = {}) {
  await touchLastLogin(user.id);

  const accessSecret = getJwtSecret();
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

  const refreshSvc = db();
  const { refreshToken } = await refreshSvc.createRefreshToken(
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
