const { getJwtSecret, getJwtRefreshSecret } = require('@rsv360/shared');
const crypto = require('crypto');
const { Pool } = require('pg');
const { signJwt } = require('./jwt-verify');

let pool = null;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateTokenFamily() {
  return crypto.randomBytes(16).toString('hex');
}

async function queryDatabase(sql, params = []) {
  const db = getPool();
  if (!db) return null;
  const result = await db.query(sql, params);
  return result.rows;
}

async function createRefreshToken(userId, deviceInfo, ipAddress, userAgent) {
  const refreshSecret =
    getJwtRefreshSecret();
  const tokenFamily = generateTokenFamily();
  const tokenHash = hashToken(crypto.randomBytes(32).toString('hex'));
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const jwtRefreshToken = signJwt(
    { userId, tokenFamily, type: 'refresh' },
    refreshSecret,
    60 * 60 * 24 * 30
  );

  await module.exports.queryDatabase(
    `INSERT INTO refresh_tokens
     (user_id, token_hash, token_family, device_info, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      userId,
      tokenHash,
      tokenFamily,
      deviceInfo ? JSON.stringify(deviceInfo) : null,
      ipAddress || null,
      userAgent || null,
      expiresAt.toISOString(),
    ]
  );

  return { refreshToken: jwtRefreshToken, tokenFamily, expiresAt };
}

async function revokeRefreshToken(tokenId, reason) {
  await module.exports.queryDatabase(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP, revoked_reason = $1
     WHERE id = $2`,
    [reason || 'Revogado', tokenId]
  );
}

async function revokeTokenFamily(tokenFamily, reason) {
  await module.exports.queryDatabase(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP, revoked_reason = $1
     WHERE token_family = $2 AND revoked_at IS NULL`,
    [reason || 'Token family revogado', tokenFamily]
  );
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

async function verifyAndRotateRefreshToken(refreshToken, ipAddress, userAgent) {
  const db = getPool();
  if (!db) return null;

  const refreshSecret =
    getJwtRefreshSecret();
  const accessSecret = getJwtSecret();

  const { verifyRefreshToken } = require('./jwt-verify');
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken, refreshSecret);
  } catch {
    return null;
  }
  if (!decoded || decoded.type !== 'refresh') return null;

  const tokenFamily = decoded.tokenFamily;
  const userId = decoded.userId;
  if (!tokenFamily || !userId) return null;

  const tokens = await module.exports.queryDatabase(
    `SELECT * FROM refresh_tokens
     WHERE token_family = $1 AND user_id = $2 AND revoked_at IS NULL`,
    [tokenFamily, userId]
  );

  if (!tokens || tokens.length === 0) {
    await revokeTokenFamily(tokenFamily, 'Token family revogado por possível reutilização');
    return null;
  }

  const token = tokens[0];
  if (new Date(token.expires_at) < new Date()) {
    await revokeRefreshToken(token.id, 'Token expirado');
    return null;
  }

  const users = await module.exports.queryDatabase(`SELECT * FROM users WHERE id = $1`, [userId]);
  if (!users || users.length === 0) return null;

  const user = users[0];
  if (!isUserActive(user)) return null;

  await revokeRefreshToken(token.id, 'Rotação de token');
  const newRefresh = await createRefreshToken(
    userId,
    token.device_info,
    ipAddress,
    userAgent
  );

  const newAccessToken = signJwt(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      enterpriseId: decoded.enterpriseId ?? 'ent_1',
    },
    accessSecret,
    900
  );

  return {
    newAccessToken,
    newRefreshToken: newRefresh.refreshToken,
    user,
  };
}

async function revokeAllUserTokens(userId, reason) {
  await module.exports.queryDatabase(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP, revoked_reason = $1
     WHERE user_id = $2 AND revoked_at IS NULL`,
    [reason || 'Logout do usuário', userId]
  );
}

/**
 * PR-10a — fail-closed ownership of the refresh session to preserve.
 * Valid JWT refresh + same userId as access + active non-expired DB row.
 * @returns {{ tokenFamily: string } | null}
 */
async function assertActiveRefreshOwnership(refreshToken, userId) {
  if (!refreshToken || userId == null || userId === '') return null;

  const refreshSecret = getJwtRefreshSecret();
  const { verifyRefreshToken } = require('./jwt-verify');
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken, refreshSecret);
  } catch {
    return null;
  }
  if (!decoded || decoded.type !== 'refresh') return null;

  const tokenUserId = decoded.userId ?? decoded.sub ?? decoded.id;
  if (tokenUserId == null || String(tokenUserId) !== String(userId)) return null;

  const tokenFamily = decoded.tokenFamily;
  if (!tokenFamily) return null;

  const tokens = await module.exports.queryDatabase(
    `SELECT id, expires_at FROM refresh_tokens
     WHERE token_family = $1 AND user_id = $2 AND revoked_at IS NULL`,
    [tokenFamily, userId]
  );
  if (!tokens || tokens.length === 0) return null;

  if (new Date(tokens[0].expires_at) < new Date()) return null;

  return { tokenFamily };
}

/**
 * PR-10a — revoke all active refresh rows for user except keepTokenFamily.
 * @returns {Promise<number>} sessions revoked
 */
async function revokeOtherUserTokens(userId, keepTokenFamily, reason) {
  if (!keepTokenFamily) return 0;

  const rows = await module.exports.queryDatabase(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP, revoked_reason = $1
     WHERE user_id = $2 AND revoked_at IS NULL AND token_family <> $3
     RETURNING id`,
    [reason || 'Logout de outros dispositivos', userId, keepTokenFamily]
  );
  return rows ? rows.length : 0;
}

async function revokeRefreshTokenByJwt(refreshToken, reason) {
  if (!refreshToken) return false;

  const refreshSecret =
    getJwtRefreshSecret();
  const { verifyRefreshToken } = require('./jwt-verify');
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken, refreshSecret);
  } catch {
    return false;
  }

  if (!decoded?.tokenFamily) return false;
  await revokeTokenFamily(decoded.tokenFamily, reason || 'Logout do usuário');
  return true;
}

function isDbRefreshEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

module.exports = {
  isDbRefreshEnabled,
  verifyAndRotateRefreshToken,
  createRefreshToken,
  queryDatabase,
  revokeAllUserTokens,
  revokeOtherUserTokens,
  assertActiveRefreshOwnership,
  revokeRefreshTokenByJwt,
  revokeTokenFamily,
};
