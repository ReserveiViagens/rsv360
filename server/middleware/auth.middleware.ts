import type { NextFunction, Request, Response } from 'express';

const { extractBearerToken, verifyAccessToken } = require('../../backend/src/api/v1/auth/jwt-verify');

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'your-secret-key-change-in-production';
}

/** Valida Bearer JWT (API v1) e popula req.user. */
export function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token ausente' });
  }

  const payload = verifyAccessToken(token, getJwtSecret());
  if (!payload || payload.userId == null) {
    return res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
  }

  const id = Number(payload.userId);
  if (!Number.isFinite(id)) {
    return res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
  }

  req.user = {
    id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    enterpriseId: payload.enterpriseId,
  };
  return next();
}

/** Autenticação opcional — não falha se token ausente. */
export function optionalJwt(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (token) {
    const payload = verifyAccessToken(token, getJwtSecret());
    if (payload?.userId != null) {
      const id = Number(payload.userId);
      if (!Number.isFinite(id)) {
        return res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
      }
      req.user = {
        id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        enterpriseId: payload.enterpriseId,
      };
    }
  }
  return next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }
    return next();
  };
}

export const staffAuth = [authenticateJwt, requireRole('admin', 'manager', 'user')];

module.exports = { authenticateJwt, optionalJwt, requireRole, staffAuth };
