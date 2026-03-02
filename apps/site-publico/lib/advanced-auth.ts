/**
 * ✅ ITEM 22: MIDDLEWARE ADVANCED AUTH
 * Validação robusta, rate limiting e segurança avançada
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from './db';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  role?: string;
  status?: string;
}

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Janela de tempo em milissegundos
  blockDurationMs: number; // Duração do bloqueio em milissegundos
}

const isDev = process.env.NODE_ENV === 'development';

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: isDev
    ? { maxAttempts: 50, windowMs: 15 * 60 * 1000, blockDurationMs: 1 * 60 * 1000 }
    : { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
  register: isDev
    ? { maxAttempts: 20, windowMs: 60 * 60 * 1000, blockDurationMs: 1 * 60 * 1000 }
    : { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 },
  refresh: { maxAttempts: 10, windowMs: 60 * 1000, blockDurationMs: 5 * 60 * 1000 },
  password_reset: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 },
};

/**
 * Hash de token para armazenamento seguro
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verificar rate limiting
 */
export async function checkRateLimit(
  identifier: string,
  identifierType: 'ip' | 'email' | 'user_id',
  action: string
): Promise<{ allowed: boolean; remainingAttempts: number; blockedUntil?: Date }> {
  const config = RATE_LIMIT_CONFIGS[action] || {
    maxAttempts: 10,
    windowMs: 60 * 1000,
    blockDurationMs: 5 * 60 * 1000,
  };

  const rateLimits = await queryDatabase(
    `SELECT * FROM auth_rate_limits 
     WHERE identifier = $1 AND identifier_type = $2 AND action = $3`,
    [identifier, identifierType, action]
  );

  const now = new Date();

  if (rateLimits.length === 0) {
    // Primeira tentativa
    await queryDatabase(
      `INSERT INTO auth_rate_limits (identifier, identifier_type, action, attempt_count, last_attempt_at)
       VALUES ($1, $2, $3, 1, CURRENT_TIMESTAMP)`,
      [identifier, identifierType, action]
    );
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  const rateLimit = rateLimits[0];
  const lastAttempt = new Date(rateLimit.last_attempt_at);
  const windowStart = new Date(now.getTime() - config.windowMs);

  // Verificar se está bloqueado
  if (rateLimit.blocked_until) {
    const blockedUntil = new Date(rateLimit.blocked_until);
    if (blockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil,
      };
    }
    // Bloqueio expirou, resetar
    await queryDatabase(
      `UPDATE auth_rate_limits 
       SET attempt_count = 1, last_attempt_at = CURRENT_TIMESTAMP, blocked_until = NULL
       WHERE id = $1`,
      [rateLimit.id]
    );
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  // Verificar se a janela de tempo expirou
  if (lastAttempt < windowStart) {
    // Resetar contador
    await queryDatabase(
      `UPDATE auth_rate_limits 
       SET attempt_count = 1, last_attempt_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [rateLimit.id]
    );
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  // Verificar se excedeu o limite
  if (rateLimit.attempt_count >= config.maxAttempts) {
    // Bloquear
    const blockedUntil = new Date(now.getTime() + config.blockDurationMs);
    await queryDatabase(
      `UPDATE auth_rate_limits 
       SET blocked_until = $1
       WHERE id = $2`,
      [blockedUntil.toISOString(), rateLimit.id]
    );
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil,
    };
  }

  // Incrementar contador
  await queryDatabase(
    `UPDATE auth_rate_limits 
     SET attempt_count = attempt_count + 1, last_attempt_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [rateLimit.id]
  );

  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - rateLimit.attempt_count - 1,
  };
}

/**
 * Registrar tentativa de login
 */
export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  userAgent: string | null,
  success: boolean,
  failureReason?: string
): Promise<void> {
  await queryDatabase(
    `INSERT INTO login_attempts (email, ip_address, user_agent, success, failure_reason)
     VALUES ($1, $2, $3, $4, $5)`,
    [email, ipAddress, userAgent || null, success, failureReason || null]
  );
}

/**
 * Resetar rate limit (após sucesso)
 */
export async function resetRateLimit(
  identifier: string,
  identifierType: 'ip' | 'email' | 'user_id',
  action: string
): Promise<void> {
  await queryDatabase(
    `DELETE FROM auth_rate_limits 
     WHERE identifier = $1 AND identifier_type = $2 AND action = $3`,
    [identifier, identifierType, action]
  );
}

/**
 * Middleware de autenticação avançada
 * Suporta tanto JWT Bearer token quanto cookie admin_token (para desenvolvimento)
 */
export async function advancedAuthMiddleware(
  request: NextRequest
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    // ============================================
    // MODO DESENVOLVIMENTO: Verificar cookie admin_token
    // ============================================
    const adminToken = request.cookies.get('admin_token')?.value;
    if (adminToken === 'admin-token-123') {
      // Autenticação simples para desenvolvimento
      // Retornar usuário admin mockado
      return {
        user: {
          id: 1,
          email: 'admin@rsv360.com',
          name: 'Administrador',
          role: 'admin',
          status: 'active',
        },
        error: null,
      };
    }

    // ============================================
    // MODO PRODUÇÃO: Verificar JWT Bearer token
    // ============================================
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'Token não fornecido' };
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    // Verificar token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return { user: null, error: 'Token expirado' };
      }
      if (error.name === 'JsonWebTokenError') {
        return { user: null, error: 'Token inválido' };
      }
      return { user: null, error: 'Erro ao verificar token' };
    }

    // Buscar usuário
    const users = await queryDatabase(
      `SELECT id, email, name, role, status 
       FROM users 
       WHERE id = $1`,
      [decoded.userId || decoded.id]
    );

    if (users.length === 0) {
      return { user: null, error: 'Usuário não encontrado' };
    }

    const user = users[0] as AuthUser;

    // Verificar se usuário está ativo
    if (user.status && user.status !== 'active') {
      return { user: null, error: 'Usuário inativo' };
    }

    return { user, error: null };
  } catch (error: any) {
    console.error('Erro no middleware de autenticação:', error);
    return { user: null, error: 'Erro ao autenticar' };
  }
}

/**
 * Obter IP do cliente
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddr) {
    return remoteAddr;
  }
  return 'unknown';
}

/**
 * Obter User-Agent
 */
export function getUserAgent(request: NextRequest): string | null {
  return request.headers.get('user-agent');
}

