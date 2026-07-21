const { getJwtSecret } = require('@rsv360/shared');
const { verifyAccessToken } = require('./jwt-verify');
const {
  isDbRefreshEnabled,
  revokeAllUserTokens,
  revokeRefreshTokenByJwt,
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

module.exports = { logoutUser };
