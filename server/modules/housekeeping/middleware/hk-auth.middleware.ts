import { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id?: string | number;
      role?: string;
      email?: string;
    };
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const headerRole = typeof req.header('x-user-role') === 'string' ? req.header('x-user-role') : undefined;
    const role = req.user?.role || headerRole;

    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
  };
}

module.exports = { requireRole };

