import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service';

function extractPortalToken(req: Request) {
  const headerToken = req.header('X-Portal-Token');
  if (headerToken) return headerToken.trim();

  const queryToken = typeof req.query.token === 'string' ? req.query.token.trim() : null;
  if (queryToken) return queryToken;

  const authHeader = req.header('authorization') || req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const bearerToken = authHeader.slice(7).trim();
  if (!bearerToken || !bearerToken.startsWith('portal_')) {
    return null;
  }

  return bearerToken.slice('portal_'.length).trim();
}

export async function portalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractPortalToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Token de portal inválido ou expirado' });
    }

    const result = await tokenService.validateToken(token);
    if (!result) {
      return res.status(401).json({ error: 'Token de portal inválido ou expirado' });
    }

    (req as any).portalToken = result.token;
    (req as any).portalBooking = result.booking;
    (req as any).portalGuest = result.guest;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token de portal inválido ou expirado' });
  }
}

module.exports = { portalAuthMiddleware };

