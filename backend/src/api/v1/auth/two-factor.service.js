const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const { generateSecret, generateSync, verify, generateURI } = require('otplib');
const { encryptSecret, decryptSecret } = require('./two-factor-crypto');
const { queryDatabase, isDbRefreshEnabled } = require('./refresh-token.service');
const { issueLoginTokens, comparePassword, getStoredPasswordHash } = require('./login.service');

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const APP_NAME = process.env.TWO_FA_ISSUER || 'RSV360';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateTempToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const part1 = crypto.randomBytes(2).toString('hex');
    const part2 = crypto.randomBytes(2).toString('hex');
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

async function hashBackupCodes(codes) {
  const hashes = [];
  for (const code of codes) {
    hashes.push(await bcrypt.hash(code, 12));
  }
  return hashes;
}

async function verifyTotpCode(secret, code) {
  if (!secret || !code) return { valid: false };
  const result = await verify({
    secret,
    token: String(code).trim(),
    epochTolerance: 1,
  });
  if (!result?.valid) return { valid: false };
  // otplib: delta is steps from current (±1 window). Persist absolute step for anti-replay.
  const step = Math.floor(Date.now() / 30000) + (Number(result.delta) || 0);
  return { valid: true, step };
}

/**
 * PR-06c — reject TOTP already accepted within the ±1 window (anti-replay).
 */
async function assertTotpNotReplayed(userId, step) {
  const row = await getUser2faRow(userId);
  if (!row) return true;
  if (row.last_totp_step != null && Number(row.last_totp_step) === Number(step)) {
    return false;
  }
  await queryDatabase(
    `UPDATE user_2fa
     SET last_totp_step = $1, last_totp_used_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2`,
    [step, userId]
  );
  return true;
}

async function isTwoFactorEnabled(userId) {
  const rows = await queryDatabase(
    `SELECT enabled_at FROM user_2fa WHERE user_id = $1 AND enabled_at IS NOT NULL LIMIT 1`,
    [userId]
  );
  return Boolean(rows?.[0]?.enabled_at);
}

async function getUser2faRow(userId) {
  const rows = await queryDatabase(`SELECT * FROM user_2fa WHERE user_id = $1 LIMIT 1`, [userId]);
  return rows?.[0] || null;
}

async function getUserById(userId) {
  const rows = await queryDatabase('SELECT * FROM users WHERE id = $1', [userId]);
  return rows?.[0] || null;
}

async function createLoginChallenge(userId) {
  const rawToken = generateTempToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);

  await queryDatabase(
    `INSERT INTO login_2fa_challenges (temp_token_hash, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [tokenHash, userId, expiresAt.toISOString()]
  );

  return {
    temp_token: rawToken,
    expires_in: Math.floor(CHALLENGE_TTL_MS / 1000),
  };
}

async function findValidChallenge(rawToken) {
  const tokenHash = hashToken(rawToken);
  const rows = await queryDatabase(
    `SELECT id, user_id, expires_at, consumed_at
     FROM login_2fa_challenges
     WHERE temp_token_hash = $1
     LIMIT 1`,
    [tokenHash]
  );
  const row = rows?.[0];
  if (!row || row.consumed_at) return null;
  if (new Date(row.expires_at) <= new Date()) return null;
  return row;
}

async function consumeChallenge(challengeId) {
  await queryDatabase(
    `UPDATE login_2fa_challenges SET consumed_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [challengeId]
  );
}

async function getDecryptedSecret(row) {
  if (!row?.totp_secret_encrypted) return null;
  return decryptSecret(row.totp_secret_encrypted);
}

async function verifyBackupCode(row, backupCode) {
  const hashes = Array.isArray(row?.backup_codes_hash) ? row.backup_codes_hash : [];
  const normalized = String(backupCode || '').trim().toLowerCase();
  if (!normalized || hashes.length === 0) return false;

  for (let i = 0; i < hashes.length; i++) {
    const match = await bcrypt.compare(normalized, hashes[i]);
    if (match) {
      const nextHashes = [...hashes];
      nextHashes.splice(i, 1);
      await queryDatabase(
        `UPDATE user_2fa SET backup_codes_hash = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
        [JSON.stringify(nextHashes), row.user_id]
      );
      return true;
    }
  }
  return false;
}

async function setupTwoFactor(userId, email, meta = {}) {
  const { emitMfaAudit } = require('./mfa-audit');
  const secret = generateSecret(20);
  const encrypted = encryptSecret(secret);

  await queryDatabase(
    `INSERT INTO user_2fa (user_id, totp_secret_encrypted, enabled_at, backup_codes_hash, last_totp_step, last_totp_used_at)
     VALUES ($1, $2, NULL, NULL, NULL, NULL)
     ON CONFLICT (user_id)
     DO UPDATE SET totp_secret_encrypted = EXCLUDED.totp_secret_encrypted,
                   enabled_at = NULL,
                   backup_codes_hash = NULL,
                   last_totp_step = NULL,
                   last_totp_used_at = NULL,
                   updated_at = CURRENT_TIMESTAMP`,
    [userId, encrypted]
  );

  const otpauthUrl = generateURI({
    issuer: APP_NAME,
    label: email,
    secret,
  });
  const qrCode = await QRCode.toDataURL(otpauthUrl);

  emitMfaAudit('MFAEnrollmentStarted', {
    userId,
    role: meta.role,
    ip: meta.ipAddress,
    userAgent: meta.userAgent,
    surface: meta.surface,
  });

  return {
    secret,
    qr_code: qrCode,
    otpauth_url: otpauthUrl,
  };
}

async function verifyTwoFactorSetup(userId, code, meta = {}) {
  const { emitMfaAudit } = require('./mfa-audit');
  const row = await getUser2faRow(userId);
  if (!row || row.enabled_at) {
    return { error: 'invalid_state', status: 400, message: '2FA já ativo ou setup não iniciado' };
  }

  const secret = await getDecryptedSecret(row);
  const totp = await verifyTotpCode(secret, code);
  if (!totp.valid) {
    emitMfaAudit('MFAVerificationFailed', {
      userId,
      role: meta.role,
      ip: meta.ipAddress,
      userAgent: meta.userAgent,
      surface: meta.surface,
      detail: 'setup',
    });
    return { error: 'invalid_code', status: 401, message: 'Código inválido' };
  }

  const fresh = await assertTotpNotReplayed(userId, totp.step);
  if (!fresh) {
    emitMfaAudit('MFAVerificationFailed', {
      userId,
      role: meta.role,
      ip: meta.ipAddress,
      userAgent: meta.userAgent,
      surface: meta.surface,
      detail: 'replay',
    });
    return { error: 'replay', status: 401, message: 'Código já utilizado' };
  }

  const backupCodes = generateBackupCodes();
  const backupHashes = await hashBackupCodes(backupCodes);

  await queryDatabase(
    `UPDATE user_2fa
     SET enabled_at = CURRENT_TIMESTAMP,
         backup_codes_hash = $1::jsonb,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2`,
    [JSON.stringify(backupHashes), userId]
  );

  emitMfaAudit('MFAEnrollmentCompleted', {
    userId,
    role: meta.role,
    ip: meta.ipAddress,
    userAgent: meta.userAgent,
    surface: meta.surface,
  });

  return { backup_codes: backupCodes };
}

async function verifyTwoFactorLogin(payload, meta = {}) {
  const { emitMfaAudit } = require('./mfa-audit');
  const tempToken = typeof payload.temp_token === 'string' ? payload.temp_token.trim() : '';
  const code = typeof payload.code === 'string' ? payload.code.trim() : '';
  const backupCode =
    typeof payload.backup_code === 'string'
      ? payload.backup_code.trim()
      : typeof payload.backupCode === 'string'
        ? payload.backupCode.trim()
        : '';

  if (!tempToken || (!code && !backupCode)) {
    return {
      error: 'validation',
      status: 400,
      message: 'temp_token e code ou backup_code são obrigatórios',
    };
  }

  const challenge = await findValidChallenge(tempToken);
  if (!challenge) {
    return { error: 'invalid_token', status: 401, message: 'Token inválido ou expirado' };
  }

  const row = await getUser2faRow(challenge.user_id);
  if (!row?.enabled_at) {
    return { error: 'invalid_state', status: 401, message: '2FA não está ativo' };
  }

  const user = await getUserById(challenge.user_id);
  const auditBase = {
    userId: challenge.user_id,
    role: user?.role,
    ip: meta.ipAddress,
    userAgent: meta.userAgent,
    surface: meta.surface,
  };

  let verified = false;
  let usedBackup = false;
  if (code) {
    const secret = await getDecryptedSecret(row);
    const totp = await verifyTotpCode(secret, code);
    if (totp.valid) {
      const fresh = await assertTotpNotReplayed(challenge.user_id, totp.step);
      if (!fresh) {
        emitMfaAudit('MFAVerificationFailed', { ...auditBase, detail: 'replay' });
        return { error: 'replay', status: 401, message: 'Código já utilizado' };
      }
      verified = true;
    }
  } else {
    verified = await verifyBackupCode(row, backupCode);
    usedBackup = verified;
  }

  if (!verified) {
    emitMfaAudit('MFAVerificationFailed', { ...auditBase, detail: code ? 'totp' : 'backup' });
    return { error: 'invalid_code', status: 401, message: 'Código inválido' };
  }

  await consumeChallenge(challenge.id);
  if (!user) {
    return { error: 'invalid_state', status: 401, message: 'Usuário não encontrado' };
  }

  if (usedBackup) {
    emitMfaAudit('RecoveryCodeUsed', auditBase);
  }
  emitMfaAudit('MFAVerificationSucceeded', auditBase);

  return issueLoginTokens(user, meta);
}

async function assertUserPassword(user, password) {
  const storedHash = getStoredPasswordHash(user);
  if (!storedHash) return false;
  return comparePassword(password, storedHash);
}

async function disableTwoFactor(userId, password, code, meta = {}) {
  const { emitMfaAudit } = require('./mfa-audit');
  const user = await getUserById(userId);
  if (!user) {
    return { error: 'not_found', status: 404, message: 'Usuário não encontrado' };
  }

  const passwordOk = await assertUserPassword(user, password);
  if (!passwordOk) {
    return { error: 'invalid_credentials', status: 401, message: 'Senha inválida' };
  }

  const row = await getUser2faRow(userId);
  if (!row?.enabled_at) {
    return { error: 'invalid_state', status: 400, message: '2FA não está ativo' };
  }

  const secret = await getDecryptedSecret(row);
  const totp = await verifyTotpCode(secret, code);
  const backupOk = !totp.valid ? await verifyBackupCode(row, code) : false;
  if (!totp.valid && !backupOk) {
    return { error: 'invalid_code', status: 401, message: 'Código inválido' };
  }
  if (totp.valid) {
    const fresh = await assertTotpNotReplayed(userId, totp.step);
    if (!fresh) {
      return { error: 'replay', status: 401, message: 'Código já utilizado' };
    }
  }

  await queryDatabase('DELETE FROM user_2fa WHERE user_id = $1', [userId]);
  emitMfaAudit('MFAResetCompleted', {
    userId,
    role: user.role,
    ip: meta.ipAddress,
    userAgent: meta.userAgent,
    surface: meta.surface,
    detail: 'self_disable',
  });
  return { message: '2FA desativado' };
}

async function regenerateBackupCodes(userId, password, code, meta = {}) {
  const { emitMfaAudit } = require('./mfa-audit');
  const user = await getUserById(userId);
  if (!user) {
    return { error: 'not_found', status: 404, message: 'Usuário não encontrado' };
  }

  const passwordOk = await assertUserPassword(user, password);
  if (!passwordOk) {
    return { error: 'invalid_credentials', status: 401, message: 'Senha inválida' };
  }

  const row = await getUser2faRow(userId);
  if (!row?.enabled_at) {
    return { error: 'invalid_state', status: 400, message: '2FA não está ativo' };
  }

  const secret = await getDecryptedSecret(row);
  const totp = await verifyTotpCode(secret, code);
  if (!totp.valid) {
    return { error: 'invalid_code', status: 401, message: 'Código inválido' };
  }
  const fresh = await assertTotpNotReplayed(userId, totp.step);
  if (!fresh) {
    return { error: 'replay', status: 401, message: 'Código já utilizado' };
  }

  const backupCodes = generateBackupCodes();
  const backupHashes = await hashBackupCodes(backupCodes);

  await queryDatabase(
    `UPDATE user_2fa SET backup_codes_hash = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
    [JSON.stringify(backupHashes), userId]
  );

  emitMfaAudit('RecoveryCodeRegenerated', {
    userId,
    role: user.role,
    ip: meta.ipAddress,
    userAgent: meta.userAgent,
    surface: meta.surface,
  });

  return { backup_codes: backupCodes };
}

/**
 * Admin-only MFA reset (never public UI). Caller must authorize + audit request.
 */
async function adminResetTwoFactor(targetUserId, operatorMeta = {}) {
  const { emitMfaAudit } = require('./mfa-audit');
  emitMfaAudit('MFAResetRequested', {
    userId: targetUserId,
    role: operatorMeta.targetRole,
    ip: operatorMeta.ipAddress,
    userAgent: operatorMeta.userAgent,
    surface: operatorMeta.surface,
    detail: `operator:${operatorMeta.operatorId || 'unknown'}`,
  });

  await queryDatabase('DELETE FROM user_2fa WHERE user_id = $1', [targetUserId]);
  await queryDatabase('DELETE FROM login_2fa_challenges WHERE user_id = $1', [targetUserId]);

  emitMfaAudit('MFAResetCompleted', {
    userId: targetUserId,
    role: operatorMeta.targetRole,
    ip: operatorMeta.ipAddress,
    userAgent: operatorMeta.userAgent,
    surface: operatorMeta.surface,
    detail: `operator:${operatorMeta.operatorId || 'unknown'}`,
  });

  return { message: 'MFA resetado' };
}

function isTwoFactorDbEnabled() {
  return isDbRefreshEnabled();
}

/**
 * Verify TOTP for an enrolled user (no login challenge). Used by change-password.
 * Never logs the code.
 */
async function verifyEnabledTotp(userId, code, meta = {}) {
  const { emitMfaAudit } = require('./mfa-audit');
  const row = await getUser2faRow(userId);
  if (!row?.enabled_at) {
    return {
      ok: false,
      error: 'mfa_required',
      status: 403,
      message: 'Cadastre o autenticador TOTP antes de alterar a senha',
      detail: 'not_enrolled',
    };
  }

  const normalized = typeof code === 'string' ? code.trim() : '';
  if (!normalized) {
    return {
      ok: false,
      error: 'validation',
      status: 400,
      message: 'Código TOTP é obrigatório',
      detail: 'missing',
    };
  }

  const user = await getUserById(userId);
  const auditBase = {
    userId,
    role: user?.role,
    ip: meta.ipAddress,
    userAgent: meta.userAgent,
    surface: meta.surface || 'change-password',
  };

  const secret = await getDecryptedSecret(row);
  const totp = await verifyTotpCode(secret, normalized);
  if (!totp.valid) {
    emitMfaAudit('MFAVerificationFailed', { ...auditBase, detail: 'totp' });
    return {
      ok: false,
      error: 'invalid_code',
      status: 401,
      message: 'Código inválido',
      detail: 'totp',
    };
  }

  const fresh = await assertTotpNotReplayed(userId, totp.step);
  if (!fresh) {
    emitMfaAudit('MFAVerificationFailed', { ...auditBase, detail: 'replay' });
    return {
      ok: false,
      error: 'replay',
      status: 401,
      message: 'Código já utilizado',
      detail: 'replay',
    };
  }

  emitMfaAudit('MFAVerificationSucceeded', { ...auditBase, detail: 'change_password' });
  return { ok: true };
}

module.exports = {
  isTwoFactorEnabled,
  isTwoFactorDbEnabled,
  createLoginChallenge,
  setupTwoFactor,
  verifyTwoFactorSetup,
  verifyTwoFactorLogin,
  disableTwoFactor,
  regenerateBackupCodes,
  adminResetTwoFactor,
  verifyEnabledTotp,
  hashToken,
  verifyTotpCode,
  assertTotpNotReplayed,
};
