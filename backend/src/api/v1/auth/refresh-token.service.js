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
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refresh-secret-key';
  const tokenFamily = generateTokenFamily();
  const tokenHash = hashToken(crypto.randomBytes(32).toString('hex'));
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const jwtRefreshToken = signJwt(
    { userId, tokenFamily, type: 'refresh' },
    refreshSecret,
    60 * 60 * 24 * 30
  );

  await queryDatabase(
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
  await queryDatabase(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP, revoked_reason = $1
     WHERE id = $2`,
    [reason || 'Revogado', tokenId]
  );
}

async function revokeTokenFamily(tokenFamily, reason) {
  await queryDatabase(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP, revoked_reason = $1
     WHERE token_family = $2 AND revoked_at IS NULL`,
    [reason || 'Token family revogado', tokenFamily]
  );
}

async function verifyAndRotateRefreshToken(refreshToken, ipAddress, userAgent) {
  const db = getPool();
  if (!db) return null;

  const refreshSecret =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refresh-secret-key';
  const accessSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

  const tokens = await queryDatabase(
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

  const users = await queryDatabase(
    `SELECT id, email, name, role, status FROM users WHERE id = $1`,
    [userId]
  );
  if (!users || users.length === 0) return null;

  const user = users[0];
  if (user.status !== 'active') return null;

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

function isDbRefreshEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

module.exports = {
  isDbRefreshEnabled,
  verifyAndRotateRefreshToken,
  createRefreshToken,
};
