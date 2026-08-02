const { getJwtSecret } = require('@rsv360/shared');
const { verifyAccessToken } = require('./jwt-verify');
const {
  isDbRefreshEnabled,
  revokeAllUserTokens,
  revokeRefreshTokenByJwt,
  assertActiveRefreshOwnership,
  revokeOtherUserTokens,
} = require('./refresh-token.service');

async function logoutUser(accessToken, refreshToken) {
  const secret = getJwtSecret();
  const payload = verifyAccessToken(accessToken, secret);
  if (!payload) {
    return { error: 'invalid_token', status: 401 };
  }

  const userId = payload.userId ?? payload.sub ?? payload.id;
  if (!userId) {
    return { error: 'invalid_token', status: 401 };
  }

  if (isDbRefreshEnabled()) {
    if (refreshToken) {
      await revokeRefreshTokenByJwt(refreshToken, 'Logout do usuário');
    }
    await revokeAllUserTokens(userId, 'Logout do usuário');
  }

  return { success: true, userId: String(userId) };
}

/**
 * PR-10a — revoke other device sessions; keep the caller's refresh family.
 * Caller must already have passed Bearer 401 + rate-limit 429 in the route.
 */
async function logoutAllOtherSessions(accessToken, refreshToken) {
  const secret = getJwtSecret();
  const payload = verifyAccessToken(accessToken, secret);
  if (!payload) {
    return { error: 'invalid_token', status: 401 };
  }

  const userId = payload.userId ?? payload.sub ?? payload.id;
  if (!userId) {
    return { error: 'invalid_token', status: 401 };
  }

  if (!isDbRefreshEnabled()) {
    return { error: 'db_unavailable', status: 503 };
  }

  if (!refreshToken || typeof refreshToken !== 'string' || !refreshToken.trim()) {
    return { error: 'refresh_required', status: 400 };
  }

  const ownership = await assertActiveRefreshOwnership(refreshToken.trim(), userId);
  if (!ownership) {
    return { error: 'refresh_invalid', status: 400 };
  }

  const sessionsRevoked = await revokeOtherUserTokens(
    userId,
    ownership.tokenFamily,
    'Logout de outros dispositivos'
  );

  return {
    success: true,
    userId: String(userId),
    sessionsRevoked,
  };
}

module.exports = { logoutUser, logoutAllOtherSessions };
