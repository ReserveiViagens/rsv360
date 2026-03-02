/**
 * ✅ MIDDLEWARE DE AUTENTICAÇÃO PARA API ROUTES
 * Sistema robusto de autenticação JWT para Next.js API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { queryDatabase } from './db';

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

export interface AuthRequest extends NextRequest {
  user?: AuthenticatedUser;
}

/**
 * Extrair token do header Authorization
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}

/**
 * Verificar e decodificar JWT token
 */
export async function verifyToken(token: string): Promise<AuthenticatedUser> {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Buscar usuário no banco para garantir que ainda está ativo
    const users = await queryDatabase(
      'SELECT id, email, name, role, phone, status FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users[0];
    
    if (user.status !== 'active') {
      throw new Error('User account is inactive');
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw error;
  }
}

/**
 * Middleware de autenticação obrigatória
 * Retorna erro 401 se não autenticado
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const token = extractToken(request);
  
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: 'Token de autenticação é obrigatório',
        code: 'AUTH_TOKEN_MISSING',
      },
      { status: 401 }
    );
  }
  
  try {
    const user = await verifyToken(token);
    return { user };
  } catch (error: any) {
    let status = 401;
    let code = 'AUTH_TOKEN_INVALID';
    
    if (error.message === 'Token expired') {
      code = 'AUTH_TOKEN_EXPIRED';
    } else if (error.message === 'User not found' || error.message === 'User account is inactive') {
      status = 403;
      code = 'AUTH_USER_INACTIVE';
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Token inválido',
        code,
      },
      { status }
    );
  }
}

/**
 * Middleware de autenticação opcional
 * Não retorna erro se não autenticado, apenas adiciona user se existir
 */
export async function optionalAuth(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const token = extractToken(request);
  
  if (!token) {
    return null;
  }
  
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Middleware de autorização por role
 * Verifica se o usuário tem uma das roles permitidas
 */
export function requireRole(allowedRoles: string[]) {
  return async (
    request: NextRequest
  ): Promise<{ user: AuthenticatedUser } | NextResponse> => {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acesso negado. Permissões insuficientes.',
          code: 'AUTH_INSUFFICIENT_PERMISSIONS',
        },
        { status: 403 }
      );
    }
    
    return { user };
  };
}

/**
 * Helper para usar em API routes
 * Wrapper que executa handler com autenticação
 */
export function withAuth<T = any>(
  handler: (request: AuthRequest, user: AuthenticatedUser | null, context?: any) => Promise<NextResponse<T>>,
  options?: {
    required?: boolean;
    roles?: string[];
  }
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse<T>> => {
    const { required = true, roles } = options || {};
    
    // Autenticação obrigatória
    if (required) {
      const authResult = roles
        ? await requireRole(roles)(request)
        : await requireAuth(request);
      
      if (authResult instanceof NextResponse) {
        return authResult;
      }
      
      const { user } = authResult;
      (request as AuthRequest).user = user;
      return handler(request as AuthRequest, user, context);
    }
    
    // Autenticação opcional
    const user = await optionalAuth(request);
    if (user) {
      (request as AuthRequest).user = user;
    }
    return handler(request as AuthRequest, user, context);
  };
}

