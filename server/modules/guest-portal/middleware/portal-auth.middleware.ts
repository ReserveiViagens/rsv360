import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service';
import { guestPortalAuditService } from '../services/audit.service';
import { getBookingIdentifier } from '../db/portal.repository';

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

function getRequestMeta(req: Request) {
  const forwarded = req.header('x-forwarded-for');
  const ipAddress = typeof forwarded === 'string'
    ? forwarded.split(',')[0]?.trim() || null
    : req.socket?.remoteAddress || null;

  return {
    ipAddress,
    userAgent: req.header('user-agent') || null,
    requestPath: req.originalUrl || req.url || '/api/portal',
  };
}

export async function portalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const auditMeta = getRequestMeta(req);
    const token = extractPortalToken(req);
    if (!token) {
      await guestPortalAuditService.recordAuthEvent({
        event: 'token_missing',
        ...auditMeta,
        reason: 'missing_token',
      });
      return res.status(401).json({ error: 'Token de portal inválido ou expirado' });
    }

    const result = await tokenService.validateToken(token);
    if (!result) {
      const inspection = await tokenService.inspectToken(token);
      await guestPortalAuditService.recordAuthEvent({
        event:
          inspection.state === 'expired'
            ? 'token_expired'
            : inspection.state === 'revoked'
              ? 'token_revoked'
              : 'token_invalid',
        token,
        bookingRef: inspection.bookingRef,
        ...auditMeta,
        reason: inspection.reason,
      });
      return res.status(401).json({ error: 'Token de portal inválido ou expirado' });
    }

    await guestPortalAuditService.recordAuthEvent({
      event: 'token_valid',
      token,
      bookingRef: getBookingIdentifier(result.booking) ? String(getBookingIdentifier(result.booking)) : null,
      ...auditMeta,
      reason: 'token_validated',
    });

    (req as any).portalToken = result.token;
    (req as any).portalBooking = result.booking;
    (req as any).portalGuest = result.guest;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token de portal inválido ou expirado' });
  }
}

module.exports = { portalAuthMiddleware };

