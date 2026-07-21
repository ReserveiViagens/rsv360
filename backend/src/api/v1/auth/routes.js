const { getJwtSecret, getJwtRefreshSecret } = require('@rsv360/shared');
const express = require('express');
const crypto = require('crypto');
const { verifyAccessToken, verifyRefreshToken, signJwt, extractBearerToken } = require('./jwt-verify');

const router = express.Router();

function normalizePayload(payload) {
  const userId = payload.userId ?? payload.sub ?? payload.id;
  if (!userId) return null;

  const role = payload.role ?? 'user';
  const enterpriseId = payload.enterpriseId ?? payload.enterprise_id ?? 'ent_1';

  return {
    authenticated: true,
    user: {
      id: String(userId),
      email: payload.email ?? '',
      name: payload.name ?? payload.email ?? 'Usuário',
      enterpriseId: String(enterpriseId),
      roles: Array.isArray(payload.roles) ? payload.roles : [role],
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    },
    session: {
      enterpriseId: String(enterpriseId),
      userId: String(userId),
      roles: Array.isArray(payload.roles) ? payload.roles : [role],
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    },
  };
}

/** GET /api/v1/auth/session — sessão canônica a partir de Bearer JWT */
router.get('/session', (req, res) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ authenticated: false, error: 'Token ausente' });
  }

  const secret = getJwtSecret();
  const payload = verifyAccessToken(token, secret);
  if (!payload) {
    return res.status(401).json({ authenticated: false, error: 'Token inválido ou expirado' });
  }

  const body = normalizePayload(payload);
  if (!body) {
    return res.status(401).json({ authenticated: false, error: 'Payload inválido' });
  }

  body.user.token = token;
  return res.json(body);
});

/** POST /api/v1/auth/logout — revoga refresh tokens (DB) ou confirma logout piloto */
router.post('/logout', async (req, res) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token ausente' });
  }

  const { refresh_token: refreshToken } = req.body || {};
  const { logoutUser } = require('./logout.service');

  try {
    const result = await logoutUser(token, refreshToken);
    if (result?.error) {
      return res.status(result.status).json({ success: false, error: 'Token inválido ou expirado' });
    }
    return res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('[AUTH] logout error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/refresh — renova access token (DB com rotação ou piloto JWT). */
router.post('/refresh', async (req, res) => {
  const { refresh_token: refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'refresh_token é obrigatório' });
  }

  const { isDbRefreshEnabled, verifyAndRotateRefreshToken } = require('./refresh-token.service');

  if (isDbRefreshEnabled()) {
    try {
      const { getClientIp, checkRateLimit } = require('./rate-limit.service');
      const ipAddress = getClientIp(req);
      const userAgent = req.get('user-agent');

      const ipRefreshCheck = await checkRateLimit(ipAddress, 'ip', 'refresh');
      if (!ipRefreshCheck.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Muitas tentativas. Tente novamente mais tarde.',
          blocked_until: ipRefreshCheck.blockedUntil?.toISOString(),
        });
      }

      const result = await verifyAndRotateRefreshToken(
        refreshToken,
        ipAddress,
        userAgent
      );

      if (!result) {
        return res.status(401).json({ success: false, error: 'Refresh token inválido ou expirado' });
      }

      return res.json({
        success: true,
        message: 'Tokens renovados',
        data: {
          access_token: result.newAccessToken,
          refresh_token: result.newRefreshToken,
          expires_in: 900,
          user: {
            id: String(result.user.id),
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            enterpriseId: 'ent_1',
          },
        },
      });
    } catch (error) {
      console.error('[AUTH] refresh DB error:', error.message);
      return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
    }
  }

  const refreshSecret =
    getJwtRefreshSecret();
  const accessSecret = getJwtSecret();

  const payload = verifyRefreshToken(refreshToken, refreshSecret);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Refresh token inválido ou expirado' });
  }

  const userId = payload.userId ?? payload.sub;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Payload inválido' });
  }

  const accessToken = signJwt(
    {
      userId,
      email: payload.email ?? '',
      name: payload.name ?? payload.email ?? 'Usuário',
      role: payload.role ?? 'user',
      enterpriseId: payload.enterpriseId ?? payload.enterprise_id ?? 'ent_1',
    },
    accessSecret,
    900
  );

  let newRefreshToken = refreshToken;
  if (process.env.AUTH_PILOT_ENABLED === 'true') {
    const tokenFamily = payload.tokenFamily ?? crypto.randomBytes(8).toString('hex');
    newRefreshToken = signJwt(
      {
        userId,
        tokenFamily,
        type: 'refresh',
        enterpriseId: payload.enterpriseId ?? 'ent_1',
      },
      refreshSecret,
      60 * 60 * 24 * 30
    );
  }

  return res.json({
    success: true,
    message: 'Tokens renovados',
    data: {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      expires_in: 900,
      user: {
        id: String(userId),
        email: payload.email ?? '',
        name: payload.name ?? 'Usuário',
        role: payload.role ?? 'user',
        enterpriseId: payload.enterpriseId ?? 'ent_1',
      },
    },
  });
});

/** POST /api/v1/auth/register — cria conta (DB); sem auto-login (D2.2) */
router.post('/register', async (req, res) => {
  const { registerWithDatabase, isDbRegisterEnabled } = require('./register.service');

  if (!isDbRegisterEnabled()) {
    return res.status(501).json({
      success: false,
      error: 'Registro indisponível. Configure DATABASE_URL.',
    });
  }

  try {
    const result = await registerWithDatabase(req.body);

    if (result?.error === 'validation') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (result?.error === 'email_exists') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (!result?.user) {
      return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
    }

    return res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso',
      data: result.user,
    });
  } catch (error) {
    console.error('[AUTH] register error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/sso/issue — emite código one-time (S1 → S2, Fase 4) */
router.post('/sso/issue', async (req, res) => {
  const { issueSsoCode, isSsoBffAuthorized, isSsoDbEnabled } = require('./sso.service');

  if (!isSsoBffAuthorized(req)) {
    return res.status(403).json({ success: false, error: 'Não autorizado' });
  }

  if (!isSsoDbEnabled()) {
    return res.status(501).json({
      success: false,
      error: 'SSO indisponível. Configure DATABASE_URL.',
    });
  }

  try {
    const result = await issueSsoCode(req.body);

    if (result?.error === 'validation') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (!result) {
      return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
    }

    return res.json({
      success: true,
      message: 'Código SSO emitido',
      data: result,
    });
  } catch (error) {
    console.error('[AUTH] sso/issue error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/sso/exchange — troca código por tokens JWT (S2 BFF) */
router.post('/sso/exchange', async (req, res) => {
  const { exchangeSsoCode, isSsoDbEnabled } = require('./sso.service');

  if (!isSsoDbEnabled()) {
    return res.status(501).json({
      success: false,
      error: 'SSO indisponível. Configure DATABASE_URL.',
    });
  }

  try {
    const { getClientIp } = require('./rate-limit.service');
    const ipAddress = getClientIp(req);
    const userAgent = req.get('user-agent');

    const result = await exchangeSsoCode(req.body?.code, {
      ipAddress,
      userAgent,
    });

    if (result?.error === 'validation') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (result?.error === 'invalid_code') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (result?.error === 'account_disabled') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (result?.error === 'user_sync') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (!result) {
      return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
    }

    if (result.requires_2fa) {
      return res.json({
        success: true,
        message: 'Autenticação em dois fatores necessária',
        data: {
          requires_2fa: true,
          temp_token: result.temp_token,
          expires_in: result.expires_in ?? 300,
          return_url: result.return_url ?? '/lab',
        },
      });
    }

    return res.json({
      success: true,
      message: 'SSO realizado',
      data: {
        user: {
          id: String(result.user.id),
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          enterpriseId: result.user.enterpriseId ?? 'ent_1',
        },
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in ?? 900,
        return_url: result.return_url ?? '/lab',
      },
    });
  } catch (error) {
    console.error('[AUTH] sso/exchange error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/oauth — login/cadastro via perfil OAuth (BFF site-publico, D2.9) */
router.post('/oauth', async (req, res) => {
  const {
    oauthLoginWithProfile,
    isDbOAuthEnabled,
    isOAuthBffAuthorized,
  } = require('./oauth.service');

  if (!isOAuthBffAuthorized(req)) {
    return res.status(403).json({ success: false, error: 'Não autorizado' });
  }

  if (!isDbOAuthEnabled()) {
    return res.status(501).json({
      success: false,
      error: 'OAuth indisponível. Configure DATABASE_URL.',
    });
  }

  try {
    const { getClientIp } = require('./rate-limit.service');
    const ipAddress = getClientIp(req);
    const userAgent = req.get('user-agent');

    const result = await oauthLoginWithProfile(req.body, {
      ipAddress,
      userAgent,
    });

    if (result?.error === 'validation') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (result?.error === 'account_disabled') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (!result) {
      return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
    }

    if (result.requires_2fa) {
      return res.json({
        success: true,
        message: 'Autenticação em dois fatores necessária',
        data: {
          requires_2fa: true,
          temp_token: result.temp_token,
          expires_in: result.expires_in ?? 300,
        },
      });
    }

    return res.json({
      success: true,
      message: 'Login OAuth realizado',
      data: {
        user: {
          id: String(result.user.id),
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          enterpriseId: result.user.enterpriseId ?? 'ent_1',
        },
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in ?? 900,
      },
    });
  } catch (error) {
    console.error('[AUTH] oauth error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/forgot-password — solicita reset (D2.4) */
router.post('/forgot-password', async (req, res) => {
  const {
    requestPasswordReset,
    isDbPasswordResetEnabled,
    GENERIC_FORGOT_MESSAGE,
  } = require('./password-reset.service');

  if (!isDbPasswordResetEnabled()) {
    return res.status(501).json({
      success: false,
      error: 'Recuperação de senha indisponível. Configure DATABASE_URL.',
    });
  }

  try {
    const { enforceForgotPasswordRateLimit, getClientIp } = require('./rate-limit.service');
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const ipAddress = getClientIp(req);

    if (email) {
      const rateLimitCheck = await enforceForgotPasswordRateLimit(email, ipAddress);
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Muitas tentativas. Tente novamente mais tarde.',
          blocked_until: rateLimitCheck.blockedUntil?.toISOString(),
        });
      }
    }

    const result = await requestPasswordReset(req.body?.email);

    if (result?.error === 'validation') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (!result) {
      return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
    }

    return res.json({
      success: true,
      message: result.message || GENERIC_FORGOT_MESSAGE,
    });
  } catch (error) {
    console.error('[AUTH] forgot-password error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/reset-password — redefine senha com token (D2.4) */
router.post('/reset-password', async (req, res) => {
  const { resetPasswordWithToken, isDbPasswordResetEnabled } = require('./password-reset.service');

  if (!isDbPasswordResetEnabled()) {
    return res.status(501).json({
      success: false,
      error: 'Recuperação de senha indisponível. Configure DATABASE_URL.',
    });
  }

  try {
    const { enforceResetPasswordRateLimit, getClientIp } = require('./rate-limit.service');
    const ipAddress = getClientIp(req);
    const rateLimitCheck = await enforceResetPasswordRateLimit(ipAddress);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Muitas tentativas. Tente novamente mais tarde.',
        blocked_until: rateLimitCheck.blockedUntil?.toISOString(),
      });
    }

    const result = await resetPasswordWithToken(req.body);

    if (result?.error === 'validation') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (result?.error === 'invalid_token') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (!result) {
      return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
    }

    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('[AUTH] reset-password error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

function resolveBearerUser(req) {
  const token = extractBearerToken(req);
  if (!token) return null;
  const secret = getJwtSecret();
  const payload = verifyAccessToken(token, secret);
  if (!payload) return null;
  const userId = payload.userId ?? payload.sub ?? payload.id;
  if (!userId) return null;
  return {
    userId: Number(userId),
    email: payload.email,
  };
}

/** POST /api/v1/auth/2fa/setup — gera secret + QR (D2.5) */
router.post('/2fa/setup', async (req, res) => {
  const bearer = resolveBearerUser(req);
  if (!bearer) {
    return res.status(401).json({ success: false, error: 'Token ausente ou inválido' });
  }

  const { setupTwoFactor, isTwoFactorDbEnabled } = require('./two-factor.service');
  if (!isTwoFactorDbEnabled()) {
    return res.status(501).json({ success: false, error: '2FA indisponível. Configure DATABASE_URL.' });
  }

  try {
    const data = await setupTwoFactor(bearer.userId, bearer.email || `user-${bearer.userId}`);
    return res.json({ success: true, data });
  } catch (error) {
    console.error('[AUTH] 2fa/setup error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/2fa/verify-setup — ativa 2FA (D2.5) */
router.post('/2fa/verify-setup', async (req, res) => {
  const bearer = resolveBearerUser(req);
  if (!bearer) {
    return res.status(401).json({ success: false, error: 'Token ausente ou inválido' });
  }

  const { verifyTwoFactorSetup, isTwoFactorDbEnabled } = require('./two-factor.service');
  if (!isTwoFactorDbEnabled()) {
    return res.status(501).json({ success: false, error: '2FA indisponível. Configure DATABASE_URL.' });
  }

  try {
    const result = await verifyTwoFactorSetup(bearer.userId, req.body?.code);
    if (result?.error) {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AUTH] 2fa/verify-setup error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/2fa/verify — completa login com 2FA (D2.5) */
router.post('/2fa/verify', async (req, res) => {
  const { verifyTwoFactorLogin, isTwoFactorDbEnabled, hashToken } = require('./two-factor.service');
  if (!isTwoFactorDbEnabled()) {
    return res.status(501).json({ success: false, error: '2FA indisponível. Configure DATABASE_URL.' });
  }

  try {
    const { enforceTwoFactorVerifyRateLimit, getClientIp } = require('./rate-limit.service');
    const tempToken = typeof req.body?.temp_token === 'string' ? req.body.temp_token.trim() : '';
    const rateKey = tempToken ? hashToken(tempToken) : getClientIp(req);
    const rateLimitCheck = await enforceTwoFactorVerifyRateLimit(rateKey);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Muitas tentativas. Tente novamente mais tarde.',
        blocked_until: rateLimitCheck.blockedUntil?.toISOString(),
      });
    }

    const result = await verifyTwoFactorLogin(req.body, {
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
    });

    if (result?.error === 'validation') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (result?.error) {
      return res.status(result.status).json({ success: false, error: result.message });
    }

    return res.json({
      success: true,
      message: 'Login realizado',
      data: result,
    });
  } catch (error) {
    console.error('[AUTH] 2fa/verify error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/2fa/disable — desativa 2FA (D2.5) */
router.post('/2fa/disable', async (req, res) => {
  const bearer = resolveBearerUser(req);
  if (!bearer) {
    return res.status(401).json({ success: false, error: 'Token ausente ou inválido' });
  }

  const { disableTwoFactor, isTwoFactorDbEnabled } = require('./two-factor.service');
  if (!isTwoFactorDbEnabled()) {
    return res.status(501).json({ success: false, error: '2FA indisponível. Configure DATABASE_URL.' });
  }

  try {
    const result = await disableTwoFactor(bearer.userId, req.body?.password, req.body?.code);
    if (result?.error) {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    return res.json({ success: true, message: result.message });
  } catch (error) {
    console.error('[AUTH] 2fa/disable error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/2fa/backup-codes — regenera códigos (D2.5) */
router.post('/2fa/backup-codes', async (req, res) => {
  const bearer = resolveBearerUser(req);
  if (!bearer) {
    return res.status(401).json({ success: false, error: 'Token ausente ou inválido' });
  }

  const { regenerateBackupCodes, isTwoFactorDbEnabled } = require('./two-factor.service');
  if (!isTwoFactorDbEnabled()) {
    return res.status(501).json({ success: false, error: '2FA indisponível. Configure DATABASE_URL.' });
  }

  try {
    const result = await regenerateBackupCodes(bearer.userId, req.body?.password, req.body?.code);
    if (result?.error) {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AUTH] 2fa/backup-codes error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/login — DB (produção) ou piloto dev */
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'E-mail e senha são obrigatórios' });
  }

  const { loginWithDatabase, isDbLoginEnabled } = require('./login.service');

  if (isDbLoginEnabled()) {
    try {
      const {
        enforceLoginRateLimit,
        resetLoginRateLimit,
        recordLoginAttempt,
        getClientIp,
      } = require('./rate-limit.service');
      const ipAddress = getClientIp(req);
      const userAgent = req.get('user-agent');
      const normalizedEmail = email.toLowerCase();

      const rateLimitCheck = await enforceLoginRateLimit(normalizedEmail, ipAddress);
      if (!rateLimitCheck.allowed) {
        await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'Rate limit excedido');
        return res.status(429).json({
          success: false,
          error: 'Muitas tentativas. Tente novamente mais tarde.',
          blocked_until: rateLimitCheck.blockedUntil?.toISOString(),
        });
      }

      const result = await loginWithDatabase(email, password, {
        ipAddress,
        userAgent,
      });

      if (result?.error === 'invalid_credentials') {
        await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'Senha inválida');
        return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
      }
      if (result?.error === 'account_disabled') {
        await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'Conta desativada');
        return res.status(403).json({ success: false, error: 'Conta desativada' });
      }
      if (result) {
        await resetLoginRateLimit(normalizedEmail, ipAddress);
        await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, true);
        return res.json({
          success: true,
          message: 'Login realizado',
          data: result,
        });
      }
    } catch (error) {
      console.error('[AUTH] login DB error:', error.message);
      return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
    }
  }

  if (process.env.AUTH_PILOT_ENABLED !== 'true') {
    return res.status(501).json({
      success: false,
      error: 'Login indisponível. Configure DATABASE_URL ou AUTH_PILOT_ENABLED.',
    });
  }

  const secret = getJwtSecret();
  const crypto = require('crypto');
  const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  // Numeric pilot id: 12 hex chars → 48-bit int (< MAX_SAFE_INTEGER), deterministic per email.
  // Magnitude ~1e14 avoids collision with DB serial user ids. Replaces hex string that Number() → NaN.
  const payloadObj = {
    userId: parseInt(
      crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 12),
      16,
    ),
    email: email.toLowerCase(),
    name: email.split('@')[0],
    role: 'admin',
    enterpriseId: 'ent_1',
    exp: Math.floor(Date.now() / 1000) + 900,
  };
  const payload = base64UrlEncode(Buffer.from(JSON.stringify(payloadObj)));
  const signature = base64UrlEncode(
    crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest()
  );
  const accessToken = `${header}.${payload}.${signature}`;

  const refreshSecret =
    getJwtRefreshSecret();
  const refreshToken = signJwt(
    {
      userId: payloadObj.userId,
      tokenFamily: crypto.randomBytes(8).toString('hex'),
      type: 'refresh',
      enterpriseId: payloadObj.enterpriseId,
      email: payloadObj.email,
      name: payloadObj.name,
      role: payloadObj.role,
    },
    refreshSecret,
    60 * 60 * 24 * 30
  );

  return res.json({
    success: true,
    message: 'Login piloto (dev)',
    data: {
      user: {
        id: payloadObj.userId,
        name: payloadObj.name,
        email: payloadObj.email,
        role: payloadObj.role,
        enterpriseId: payloadObj.enterpriseId,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900,
    },
  });
});

function base64UrlEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

module.exports = { authRouter: router };
