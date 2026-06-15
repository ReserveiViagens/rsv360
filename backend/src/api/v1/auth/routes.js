const express = require('express');
const { verifyAccessToken, extractBearerToken } = require('./jwt-verify');

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

  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
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

/** POST /api/v1/auth/login — piloto dev (sem DB); produção usa site-publico */
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'E-mail e senha são obrigatórios' });
  }

  if (process.env.AUTH_PILOT_ENABLED !== 'true') {
    return res.status(501).json({
      success: false,
      error: 'Login piloto desabilitado. Use site-publico /api/auth/login.',
    });
  }

  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const crypto = require('crypto');
  const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payloadObj = {
    userId: crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 12),
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
