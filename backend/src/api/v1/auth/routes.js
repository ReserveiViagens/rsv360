const { getJwtSecret, getJwtRefreshSecret } = require('@rsv360/shared');
const express = require('express');
const crypto = require('crypto');
const { verifyAccessToken, verifyRefreshToken, signJwt, extractBearerToken } = require('./jwt-verify');
const { resolveRefreshToken } = require('./resolve-refresh-token');
const {
  sendAuthJson,
  clearRefreshTokenCookie,
  cookieMutationOriginGuard,
} = require('./refresh-cookie-response');

const router = express.Router();

/** PR-10c-pré-b — CSRF when refresh cookie is present (16b helper). */
router.use(cookieMutationOriginGuard);

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

  // PR-06c: enrollment-scoped token cannot access admin pages.
  if (payload.purpose === 'mfa_enrollment') {
    return res.status(403).json({
      authenticated: false,
      requires_mfa_enrollment: true,
      error: 'Conclua o cadastro MFA antes de acessar outras páginas',
    });
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

  const resolved = resolveRefreshToken(req, { optional: true });
  if (resolved.error) {
    return res.status(resolved.status).json({ success: false, error: resolved.message });
  }
  const refreshToken = resolved.token;
  const { logoutUser } = require('./logout.service');

  try {
    const result = await logoutUser(token, refreshToken);
    if (result?.error) {
      return res.status(result.status).json({ success: false, error: 'Token inválido ou expirado' });
    }
    clearRefreshTokenCookie(res);
    return res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('[AUTH] logout error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/**
 * POST /api/v1/auth/logout-all — PR-10a
 * Order: 401 Bearer → 429 rate limit → 400 refresh ownership → 503 DB → 200
 * Preserves the caller's refresh family; revokes other families only.
 */
router.post('/logout-all', async (req, res) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token ausente' });
  }

  const secret = getJwtSecret();
  const payload = verifyAccessToken(token, secret);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
  }

  const userId = payload.userId ?? payload.sub ?? payload.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
  }

  const { enforceMemoryRateLimit } = require('./memory-rate-limit');
  const rate = enforceMemoryRateLimit(`logout-all:${userId}`, {
    maxAttempts: 1,
    windowMs: 60 * 1000,
    blockDurationMs: 60 * 1000,
  });
  if (!rate.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Muitas tentativas. Aguarde um minuto e tente novamente.',
    });
  }

  const resolvedLogoutAll = resolveRefreshToken(req, { optional: true });
  if (resolvedLogoutAll.error) {
    return res
      .status(resolvedLogoutAll.status)
      .json({ success: false, error: resolvedLogoutAll.message });
  }
  const refreshToken = resolvedLogoutAll.token;
  const { logoutAllOtherSessions } = require('./logout.service');

  try {
    const result = await logoutAllOtherSessions(token, refreshToken);
    if (result?.error) {
      const status = result.status || 400;
      const message =
        status === 503
          ? 'Serviço temporariamente indisponível'
          : status === 401
            ? 'Token inválido ou expirado'
            : 'refresh_token inválido ou não pertence à sessão atual';
      return res.status(status).json({ success: false, error: message });
    }

    console.log(
      `[AUTH][LOGOUT_ALL] userId=${result.userId} sessionsRevoked=${result.sessionsRevoked}`
    );
    // Keep caller's refresh cookie — logout-all preserves this session family.
    return res.json({
      success: true,
      message: 'Todas as outras sessões foram encerradas',
      sessionsRevoked: result.sessionsRevoked,
    });
  } catch (error) {
    console.error('[AUTH] logout-all error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/refresh — renova access token (DB com rotação ou piloto JWT). */
router.post('/refresh', async (req, res) => {
  const resolved = resolveRefreshToken(req);
  if (resolved.error) {
    return res.status(resolved.status).json({ success: false, error: resolved.message });
  }
  const refreshToken = resolved.token;

  const { isDbRefreshEnabled, verifyAndRotateRefreshToken } = require('./refresh-token.service');

  if (isDbRefreshEnabled()) {
    try {
      const { getClientIp, checkRateLimit } = require('./rate-limit.service');
      const ipAddress = getClientIp(req);
      const userAgent = req.get('user-agent');

      const ipRefreshCheck = await checkRateLimit(ipAddress, 'ip', 'refresh');
      if (!ipRefreshCheck.allowed) {
        const {
          rateLimitDeniedStatus,
          rateLimitDeniedBody,
        } = require('./rate-limit.service');
        return res
          .status(rateLimitDeniedStatus(ipRefreshCheck))
          .json(rateLimitDeniedBody(ipRefreshCheck));
      }

      const result = await verifyAndRotateRefreshToken(
        refreshToken,
        ipAddress,
        userAgent,
        req,
      );

      if (!result) {
        return res.status(401).json({ success: false, error: 'Refresh token inválido ou expirado' });
      }

      return sendAuthJson(res, req, {
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

  const { signAccessTokenBound } = require('./dpop.service');
  const accessToken = await signAccessTokenBound(
    {
      userId,
      email: payload.email ?? '',
      name: payload.name ?? payload.email ?? 'Usuário',
      role: payload.role ?? 'user',
      enterpriseId: payload.enterpriseId ?? payload.enterprise_id ?? 'ent_1',
    },
    accessSecret,
    900,
    req,
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

  return sendAuthJson(res, req, {
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
    const {
      getClientIp,
      enforceSsoExchangeRateLimit,
      rateLimitDeniedStatus,
      rateLimitDeniedBody,
    } = require('./rate-limit.service');
    const ipAddress = getClientIp(req);
    const userAgent = req.get('user-agent');

    // HIG-02 — rate limit before consuming SSO code (same shape as /refresh, /2fa/verify)
    const rateLimitCheck = await enforceSsoExchangeRateLimit(ipAddress);
    if (!rateLimitCheck.allowed) {
      return res
        .status(rateLimitDeniedStatus(rateLimitCheck))
        .json(rateLimitDeniedBody(rateLimitCheck));
    }

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

    return sendAuthJson(res, req, {
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

    return sendAuthJson(res, req, {
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
    const {
      enforceForgotPasswordRateLimit,
      getClientIp,
      rateLimitDeniedStatus,
      rateLimitDeniedBody,
    } = require('./rate-limit.service');
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const ipAddress = getClientIp(req);

    if (email) {
      const rateLimitCheck = await enforceForgotPasswordRateLimit(email, ipAddress);
      if (!rateLimitCheck.allowed) {
        return res
          .status(rateLimitDeniedStatus(rateLimitCheck))
          .json(rateLimitDeniedBody(rateLimitCheck));
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
    const {
      enforceResetPasswordRateLimit,
      getClientIp,
      rateLimitDeniedStatus,
      rateLimitDeniedBody,
    } = require('./rate-limit.service');
    const ipAddress = getClientIp(req);
    const rateLimitCheck = await enforceResetPasswordRateLimit(ipAddress);
    if (!rateLimitCheck.allowed) {
      return res
        .status(rateLimitDeniedStatus(rateLimitCheck))
        .json(rateLimitDeniedBody(rateLimitCheck));
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

/** POST /api/v1/auth/change-password — senha atual + TOTP (F5; sem logar segredos) */
router.post('/change-password', async (req, res) => {
  const {
    changePasswordWithTotp,
    isDbChangePasswordEnabled,
  } = require('./change-password.service');

  if (!isDbChangePasswordEnabled()) {
    return res.status(501).json({
      success: false,
      error: 'Troca de senha indisponível. Configure DATABASE_URL.',
    });
  }

  try {
    const {
      enforceChangePasswordRateLimit,
      getClientIp,
      rateLimitDeniedStatus,
      rateLimitDeniedBody,
    } = require('./rate-limit.service');

    const email =
      typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const ipAddress = getClientIp(req);
    const rateLimitCheck = await enforceChangePasswordRateLimit(email, ipAddress);
    if (!rateLimitCheck.allowed) {
      return res
        .status(rateLimitDeniedStatus(rateLimitCheck))
        .json(rateLimitDeniedBody(rateLimitCheck));
    }

    const result = await changePasswordWithTotp(req.body, {
      ipAddress,
      userAgent: req.header('user-agent') || undefined,
      surface: 'auth-v1-change-password',
    });

    if (!result) {
      return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
    }
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, error: result.message });
    }

    return res.json({ success: true, message: result.message });
  } catch (error) {
    console.error('[AUTH] change-password error:', error.message);
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
    role: payload.role,
    purpose: payload.purpose || null,
  };
}

/** Full session or enrollment-scoped token (PR-06c). */
function resolveMfaActor(req) {
  const bearer = resolveBearerUser(req);
  if (!bearer) return null;
  return bearer;
}

function enrollmentOnlyDenied(res) {
  return res.status(403).json({
    success: false,
    error: 'Conclua o cadastro MFA antes de acessar outras páginas',
    requires_mfa_enrollment: true,
  });
}

/** POST /api/v1/auth/2fa/setup — gera secret + QR (D2.5 / PR-06c) */
router.post('/2fa/setup', async (req, res) => {
  const actor = resolveMfaActor(req);
  if (!actor) {
    return res.status(401).json({ success: false, error: 'Token ausente ou inválido' });
  }

  const { setupTwoFactor, isTwoFactorDbEnabled } = require('./two-factor.service');
  if (!isTwoFactorDbEnabled()) {
    return res.status(501).json({ success: false, error: '2FA indisponível. Configure DATABASE_URL.' });
  }

  try {
    const { getClientIp } = require('./rate-limit.service');
    const data = await setupTwoFactor(actor.userId, actor.email || `user-${actor.userId}`, {
      role: actor.role,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      surface: 'staff-db',
    });
    return res.json({ success: true, data });
  } catch (error) {
    console.error('[AUTH] 2fa/setup error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auth/2fa/verify-setup — ativa 2FA (D2.5 / PR-06c) */
router.post('/2fa/verify-setup', async (req, res) => {
  const actor = resolveMfaActor(req);
  if (!actor) {
    return res.status(401).json({ success: false, error: 'Token ausente ou inválido' });
  }

  const { verifyTwoFactorSetup, isTwoFactorDbEnabled } = require('./two-factor.service');
  if (!isTwoFactorDbEnabled()) {
    return res.status(501).json({ success: false, error: '2FA indisponível. Configure DATABASE_URL.' });
  }

  try {
    const { getClientIp } = require('./rate-limit.service');
    const { issueLoginTokens } = require('./login.service');
    const result = await verifyTwoFactorSetup(actor.userId, req.body?.code, {
      role: actor.role,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      surface: 'staff-db',
    });
    if (result?.error) {
      return res.status(result.status).json({ success: false, error: result.message });
    }

    // Enrollment token → promote to full session after setup completes.
    if (actor.purpose === 'mfa_enrollment') {
      const { queryDatabase } = require('./refresh-token.service');
      const rows = await queryDatabase('SELECT * FROM users WHERE id = $1', [actor.userId]);
      const user = rows?.[0];
      if (user) {
        const tokens = await issueLoginTokens(user, {
          ipAddress: getClientIp(req),
          userAgent: req.get('user-agent'),
          req,
        });
        return sendAuthJson(res, req, {
          success: true,
          data: { ...result, ...tokens },
        });
      }
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
    const {
      enforceTwoFactorVerifyRateLimit,
      getClientIp,
      rateLimitDeniedStatus,
      rateLimitDeniedBody,
    } = require('./rate-limit.service');
    const tempToken = typeof req.body?.temp_token === 'string' ? req.body.temp_token.trim() : '';
    const rateKey = tempToken ? hashToken(tempToken) : getClientIp(req);
    const rateLimitCheck = await enforceTwoFactorVerifyRateLimit(rateKey);
    if (!rateLimitCheck.allowed) {
      return res
        .status(rateLimitDeniedStatus(rateLimitCheck))
        .json(rateLimitDeniedBody(rateLimitCheck));
    }

    const result = await verifyTwoFactorLogin(req.body, {
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      surface: 'staff-db',
    });

    if (result?.error === 'validation') {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    if (result?.error) {
      return res.status(result.status).json({ success: false, error: result.message });
    }

    const { resetAccountProtection } = require('./login-protection.service');
    if (result?.user?.email) {
      await resetAccountProtection(result.user.email);
    }

    return sendAuthJson(res, req, {
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
  if (bearer.purpose === 'mfa_enrollment') {
    return enrollmentOnlyDenied(res);
  }

  const { disableTwoFactor, isTwoFactorDbEnabled } = require('./two-factor.service');
  if (!isTwoFactorDbEnabled()) {
    return res.status(501).json({ success: false, error: '2FA indisponível. Configure DATABASE_URL.' });
  }

  try {
    const { getClientIp } = require('./rate-limit.service');
    const result = await disableTwoFactor(bearer.userId, req.body?.password, req.body?.code, {
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      surface: 'staff-db',
    });
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
  if (bearer.purpose === 'mfa_enrollment') {
    return enrollmentOnlyDenied(res);
  }

  const { regenerateBackupCodes, isTwoFactorDbEnabled } = require('./two-factor.service');
  if (!isTwoFactorDbEnabled()) {
    return res.status(501).json({ success: false, error: '2FA indisponível. Configure DATABASE_URL.' });
  }

  try {
    const { getClientIp } = require('./rate-limit.service');
    const result = await regenerateBackupCodes(bearer.userId, req.body?.password, req.body?.code, {
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      surface: 'staff-db',
    });
    if (result?.error) {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AUTH] 2fa/backup-codes error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/**
 * POST /api/v1/auth/admin/unlock-account — administrative unlock (PR-06c).
 * Never public UI; requires privileged bearer + AUTH_MFA_ADMIN_OPS=true.
 */
router.post('/admin/unlock-account', async (req, res) => {
  const bearer = resolveBearerUser(req);
  if (!bearer || bearer.purpose === 'mfa_enrollment') {
    return res.status(401).json({ success: false, error: 'Não autorizado' });
  }
  if (String(process.env.AUTH_MFA_ADMIN_OPS || '').toLowerCase() !== 'true') {
    return res.status(404).json({ success: false, error: 'Não encontrado' });
  }
  const { roleRequiresMfa } = require('./mfa-policy');
  if (!roleRequiresMfa(bearer.role)) {
    return res.status(403).json({ success: false, error: 'Permissão insuficiente' });
  }
  const accountKey =
    typeof req.body?.account_key === 'string'
      ? req.body.account_key
      : typeof req.body?.email === 'string'
        ? req.body.email
        : '';
  if (!accountKey) {
    return res.status(400).json({ success: false, error: 'account_key é obrigatório' });
  }
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
  if (!reason || reason.length < 8) {
    return res.status(400).json({ success: false, error: 'motivo obrigatório (≥8 chars)' });
  }

  const { adminUnlockAccount } = require('./login-protection.service');
  const { getClientIp } = require('./rate-limit.service');
  const result = await adminUnlockAccount(accountKey);
  console.info(
    `[AUTH][LOCKOUT-AUDIT] ${JSON.stringify({
      event: 'AccountUnlockCompleted',
      operatorId: bearer.userId,
      accountKey: result.accountKey,
      reason,
      ip: getClientIp(req),
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      release: process.env.RELEASE_SHA || process.env.GIT_SHA || undefined,
    })}`
  );
  return res.json({ success: true, data: result });
});

/**
 * POST /api/v1/auth/admin/reset-mfa — administrative MFA reset (PR-06c).
 */
router.post('/admin/reset-mfa', async (req, res) => {
  const bearer = resolveBearerUser(req);
  if (!bearer || bearer.purpose === 'mfa_enrollment') {
    return res.status(401).json({ success: false, error: 'Não autorizado' });
  }
  if (String(process.env.AUTH_MFA_ADMIN_OPS || '').toLowerCase() !== 'true') {
    return res.status(404).json({ success: false, error: 'Não encontrado' });
  }
  const { roleRequiresMfa } = require('./mfa-policy');
  if (!roleRequiresMfa(bearer.role)) {
    return res.status(403).json({ success: false, error: 'Permissão insuficiente' });
  }
  const targetUserId = Number(req.body?.user_id);
  if (!Number.isFinite(targetUserId) || targetUserId <= 0) {
    return res.status(400).json({ success: false, error: 'user_id inválido' });
  }
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
  if (!reason || reason.length < 8) {
    return res.status(400).json({ success: false, error: 'motivo obrigatório (≥8 chars)' });
  }

  const { adminResetTwoFactor, isTwoFactorDbEnabled } = require('./two-factor.service');
  if (!isTwoFactorDbEnabled()) {
    return res.status(501).json({ success: false, error: '2FA indisponível' });
  }
  const { getClientIp } = require('./rate-limit.service');
  await adminResetTwoFactor(targetUserId, {
    operatorId: bearer.userId,
    ipAddress: getClientIp(req),
    userAgent: req.get('user-agent'),
    surface: 'admin-ops',
    targetRole: req.body?.target_role,
  });
  console.info(
    `[AUTH][LOCKOUT-AUDIT] ${JSON.stringify({
      event: 'MFAResetReason',
      operatorId: bearer.userId,
      targetUserId,
      reason,
      timestamp: new Date().toISOString(),
    })}`
  );
  return res.json({ success: true, message: 'MFA resetado' });
});

/** POST /api/v1/auth/login — DB (produção) ou piloto dev */
router.post('/login', async (req, res) => {
  const { email, password, turnstileToken, turnstile_token } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'E-mail e senha são obrigatórios' });
  }

  const { loginWithDatabase, isDbLoginEnabled } = require('./login.service');
  const {
    evaluateLoginProtection,
    recordAccountFailure,
    resetAccountProtection,
    verifyLoginTurnstile,
  } = require('./login-protection.service');

  async function applyLoginProtectionGate(normalizedEmail, ipAddress) {
    const gate = await evaluateLoginProtection(normalizedEmail);
    if (!gate.allowed) {
      return {
        deny: true,
        status: 423,
        body: {
          success: false,
          error: 'Conta temporariamente bloqueada. Tente novamente mais tarde.',
          blocked_until: gate.blockedUntil?.toISOString?.() || gate.blockedUntil,
        },
      };
    }
    if (gate.turnstileRequired) {
      const ts = await verifyLoginTurnstile(turnstileToken || turnstile_token, ipAddress);
      if (!ts.ok) {
        await recordAccountFailure(normalizedEmail);
        return {
          deny: true,
          status: 403,
          body: {
            success: false,
            error: 'Verificação Turnstile obrigatória ou inválida',
            turnstile_required: true,
          },
        };
      }
    }
    return { deny: false, turnstileRequired: gate.turnstileRequired };
  }

  if (isDbLoginEnabled()) {
    try {
      const {
        enforceLoginRateLimit,
        resetLoginRateLimit,
        recordLoginAttempt,
        getClientIp,
        rateLimitDeniedStatus,
        rateLimitDeniedBody,
      } = require('./rate-limit.service');
      const ipAddress = getClientIp(req);
      const userAgent = req.get('user-agent');
      const normalizedEmail = email.toLowerCase();

      const rateLimitCheck = await enforceLoginRateLimit(normalizedEmail, ipAddress);
      if (!rateLimitCheck.allowed) {
        await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'Rate limit excedido');
        return res
          .status(rateLimitDeniedStatus(rateLimitCheck))
          .json(rateLimitDeniedBody(rateLimitCheck));
      }

      const protection = await applyLoginProtectionGate(normalizedEmail, ipAddress);
      if (protection.deny) {
        await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'Login protection');
        return res.status(protection.status).json(protection.body);
      }

      const result = await loginWithDatabase(email, password, {
        ipAddress,
        userAgent,
        surface: 'staff-db',
        req,
      });

      if (result?.error === 'invalid_credentials') {
        const failure = await recordAccountFailure(normalizedEmail);
        await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'Senha inválida');
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas',
          turnstile_required: failure.turnstileRequired || undefined,
          blocked_until: failure.blockedUntil?.toISOString?.(),
        });
      }
      if (result?.error === 'account_disabled') {
        await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'Conta desativada');
        return res.status(403).json({ success: false, error: 'Conta desativada' });
      }
      if (result?.error === 'mfa_required') {
        await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'MFA required');
        return res.status(403).json({ success: false, error: result.message || 'MFA obrigatório' });
      }
      if (result) {
        // Do not reset protection until full login (incl. 2FA) succeeds — except enrollment token is a gate.
        if (result.requires_2fa) {
          await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, true, 'pending_2fa');
          return res.json({
            success: true,
            message: 'Autenticação em dois fatores necessária',
            data: result,
          });
        }
        if (result.requires_mfa_enrollment) {
          await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, true, 'pending_enrollment');
          return res.json({
            success: true,
            message: 'Cadastro MFA obrigatório',
            data: result,
          });
        }
        await resetLoginRateLimit(normalizedEmail, ipAddress);
        await resetAccountProtection(normalizedEmail);
        await recordLoginAttempt(normalizedEmail, ipAddress, userAgent, true);
        return sendAuthJson(res, req, {
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

  // PR-06a + PR-06c: pilot inherits rate limit + account protection + MFA enforce.
  {
    const {
      enforceLoginRateLimit,
      getClientIp,
      rateLimitDeniedStatus,
      rateLimitDeniedBody,
    } = require('./rate-limit.service');
    const { isMfaEnforceEnabled, isEnrollmentWindowOpen } = require('./mfa-policy');
    const ipAddress = getClientIp(req);
    const normalizedEmail = String(email).toLowerCase();

    const rateLimitCheck = await enforceLoginRateLimit(normalizedEmail, ipAddress);
    if (!rateLimitCheck.allowed) {
      return res
        .status(rateLimitDeniedStatus(rateLimitCheck))
        .json(rateLimitDeniedBody(rateLimitCheck));
    }

    const protection = await applyLoginProtectionGate(normalizedEmail, ipAddress);
    if (protection.deny) {
      return res.status(protection.status).json(protection.body);
    }

    // Pilot always issues role=admin — MFA enforce applies identically.
    if (isMfaEnforceEnabled()) {
      if (!isDbLoginEnabled()) {
        await recordAccountFailure(normalizedEmail);
        return res.status(403).json({
          success: false,
          error: 'MFA obrigatório: configure DATABASE_URL para enrollment/TOTP no piloto',
        });
      }
      // With DB available, pilot should not short-circuit — fall through was already skipped.
      // Here DB is off (we're in pilot branch), so deny when enforce is on.
      if (!isEnrollmentWindowOpen()) {
        return res.status(403).json({
          success: false,
          error: 'MFA TOTP obrigatório para este perfil',
        });
      }
      return res.status(403).json({
        success: false,
        error: 'MFA enrollment requer login staff com DATABASE_URL',
        requires_mfa_enrollment: true,
      });
    }
  }

  const secret = getJwtSecret();
  const crypto = require('crypto');
  const { signAccessTokenBound } = require('./dpop.service');
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
  };
  const accessToken = await signAccessTokenBound(payloadObj, secret, 900, req);

  const refreshSecret = getJwtRefreshSecret();
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

  {
    const { getClientIp } = require('./rate-limit.service');
    const { resetLoginRateLimit } = require('./rate-limit.service');
    const normalizedEmail = String(email).toLowerCase();
    await resetLoginRateLimit(normalizedEmail, getClientIp(req));
    await resetAccountProtection(normalizedEmail);
  }

  return sendAuthJson(res, req, {
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

module.exports = { authRouter: router };
