import type { Request, Response, NextFunction } from 'express';
import { PropertyRepository } from '../db/property.repository';

declare global {
  namespace Express {
    interface Request {
      propertyId?: number;
    }
  }
}

export function createTenantMiddleware(repo: PropertyRepository) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const headerPropertyId = req.header('x-property-id');
      const queryPropertyId = (req.query as any)?.property_id;
      const requestedPropertyId = headerPropertyId || queryPropertyId;
      const userId = Number((req as any).user?.id || req.header('x-user-id') || 0) || undefined;

      if (requestedPropertyId) {
        const propertyId = Number(requestedPropertyId);
        if (userId) {
          const hasAccess = await repo.validateUserAccess(propertyId, userId);
          if (!hasAccess) {
            return res.status(403).json({
              error: 'Sem acesso a esta propriedade',
              code: 'PROPERTY_ACCESS_DENIED',
            });
          }
        }
        req.propertyId = propertyId;
        return next();
      }

      if (userId) {
        req.propertyId = await repo.getDefaultPropertyForUser(userId);
        return next();
      }

      req.propertyId = 1;
      return next();
    } catch {
      req.propertyId = 1;
      return next();
    }
  };
}
