import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Simple authentication middleware - in production this would validate JWT tokens
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  // For now, just check if token exists - in production validate JWT
  if (!token) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Mock user - in production decode from JWT
  (req as AuthenticatedRequest).user = {
    id: 'user-123',
    email: 'user@example.com',
    role: 'admin'
  };

  next();
};