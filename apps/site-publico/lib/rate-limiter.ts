/**
 * ✅ RATE LIMITING AVANÇADO
 * 
 * Sistema de rate limiting com:
 * - Rate limiting por IP
 * - Rate limiting por usuário
 * - Rate limiting por endpoint
 * - Whitelist/Blacklist
 * - Monitoring de tentativas
 */

import { redisCache } from './redis-cache';
import { queryDatabase } from './db';

export interface RateLimitConfig {
  windowMs: number; // Janela de tempo em milissegundos
  maxRequests: number; // Máximo de requisições na janela
  keyGenerator?: (req: any) => string; // Função para gerar chave única
  skipSuccessfulRequests?: boolean; // Não contar requisições bem-sucedidas
  skipFailedRequests?: boolean; // Não contar requisições com falha
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // Segundos até poder tentar novamente
}

/**
 * Verificar rate limit
 */
export async function checkRateLimit(
  identifier: string, // IP, userId, etc.
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Buscar requisições na janela atual
    const requests = await redisCache.get<number[]>(key) || [];

    // Filtrar requisições dentro da janela
    const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart);

    // Verificar se excedeu o limite
    if (recentRequests.length >= config.maxRequests) {
      const oldestRequest = Math.min(...recentRequests);
      const resetTime = new Date(oldestRequest + config.windowMs);
      const retryAfter = Math.ceil((resetTime.getTime() - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter,
      };
    }

    // Adicionar requisição atual
    recentRequests.push(now);
    await redisCache.set(key, recentRequests, Math.ceil(config.windowMs / 1000));

    return {
      allowed: true,
      remaining: config.maxRequests - recentRequests.length,
      resetTime: new Date(now + config.windowMs),
    };
  } catch (error: any) {
    console.error('Erro ao verificar rate limit:', error);
    // Em caso de erro, permitir (fail open)
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs),
    };
  }
}

/**
 * Rate limit por IP
 */
export async function rateLimitByIP(
  ipAddress: string,
  endpoint: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minuto
): Promise<RateLimitResult> {
  return checkRateLimit(`ip:${ipAddress}:${endpoint}`, {
    windowMs,
    maxRequests,
  });
}

/**
 * Rate limit por usuário
 */
export async function rateLimitByUser(
  userId: number,
  endpoint: string,
  maxRequests: number = 200,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  return checkRateLimit(`user:${userId}:${endpoint}`, {
    windowMs,
    maxRequests,
  });
}

/**
 * Verificar se IP está na whitelist
 */
export async function isIPWhitelisted(ipAddress: string): Promise<boolean> {
  try {
    const result = await queryDatabase(
      `SELECT COUNT(*) as count FROM rate_limit_whitelist WHERE ip_address = $1`,
      [ipAddress]
    );
    return parseInt(result[0]?.count || '0') > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Verificar se IP está na blacklist
 */
export async function isIPBlacklisted(ipAddress: string): Promise<boolean> {
  try {
    const result = await queryDatabase(
      `SELECT COUNT(*) as count FROM rate_limit_blacklist 
       WHERE ip_address = $1 
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
      [ipAddress]
    );
    return parseInt(result[0]?.count || '0') > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Adicionar IP à blacklist
 */
export async function addToBlacklist(
  ipAddress: string,
  reason: string,
  expiresAt?: Date
): Promise<void> {
  try {
    await queryDatabase(
      `INSERT INTO rate_limit_blacklist (ip_address, reason, expires_at, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (ip_address) DO UPDATE SET
         reason = EXCLUDED.reason,
         expires_at = EXCLUDED.expires_at,
         updated_at = CURRENT_TIMESTAMP`,
      [ipAddress, reason, expiresAt?.toISOString() || null]
    );
  } catch (error: any) {
    console.error('Erro ao adicionar à blacklist:', error);
    throw error;
  }
}

/**
 * Obter estatísticas de rate limiting
 */
export async function getRateLimitStats(
  startDate?: string,
  endDate?: string
): Promise<{
  totalBlocks: number;
  blocksByIP: Array<{ ip: string; count: number }>;
  blocksByEndpoint: Array<{ endpoint: string; count: number }>;
}> {
  try {
    const dateFilter = startDate && endDate
      ? `WHERE created_at BETWEEN $1 AND $2`
      : startDate
      ? `WHERE created_at >= $1`
      : endDate
      ? `WHERE created_at <= $1`
      : '';

    const params = startDate && endDate
      ? [startDate, endDate]
      : startDate || endDate
      ? [startDate || endDate]
      : [];

    const [total, byIP, byEndpoint] = await Promise.all([
      queryDatabase(`SELECT COUNT(*) as total FROM rate_limit_logs ${dateFilter}`, params),
      queryDatabase(
        `SELECT ip_address, COUNT(*) as count
         FROM rate_limit_logs
         ${dateFilter}
         GROUP BY ip_address
         ORDER BY count DESC
         LIMIT 10`,
        params
      ),
      queryDatabase(
        `SELECT endpoint, COUNT(*) as count
         FROM rate_limit_logs
         ${dateFilter}
         GROUP BY endpoint
         ORDER BY count DESC
         LIMIT 10`,
        params
      ),
    ]);

    return {
      totalBlocks: parseInt(total[0]?.total || '0'),
      blocksByIP: byIP.map((row: any) => ({
        ip: row.ip_address,
        count: parseInt(row.count),
      })),
      blocksByEndpoint: byEndpoint.map((row: any) => ({
        endpoint: row.endpoint,
        count: parseInt(row.count),
      })),
    };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas de rate limit:', error);
    throw error;
  }
}

/**
 * Registrar bloqueio de rate limit
 */
export async function logRateLimitBlock(
  identifier: string,
  endpoint: string,
  ipAddress?: string
): Promise<void> {
  try {
    await queryDatabase(
      `INSERT INTO rate_limit_logs (identifier, endpoint, ip_address, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [identifier, endpoint, ipAddress || null]
    );
  } catch (error) {
    // Não falhar se não conseguir logar
    console.error('Erro ao registrar bloqueio:', error);
  }
}

