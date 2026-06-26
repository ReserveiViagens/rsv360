import type { NextFunction, Request, Response } from 'express';

const ROLE_RANK: Record<string, number> = {
  user: 1,
  operador: 2,
  manager: 2,
  supervisor: 3,
  admin: 4,
};

export class ForbiddenError extends Error {
  readonly statusCode = 403;
  constructor(message = 'Acesso negado') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export function rankRole(role?: string): number {
  if (!role) return 0;
  return ROLE_RANK[role] ?? 0;
}

export function hasMinRole(userRole: string | undefined, minimo: string): boolean {
  return rankRole(userRole) >= rankRole(minimo);
}

export function requireRoleMin(minimo: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!hasMinRole(req.user?.role, minimo)) {
      return next(new ForbiddenError());
    }
    return next();
  };
}
