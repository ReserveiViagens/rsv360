import { Request, Response, NextFunction } from 'express';

/**
 * Role gate for housekeeping — identity ONLY from JWT (req.user).
 * Never trust x-user-role or other client headers.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    return next();
  };
}

module.exports = { requireRole };
