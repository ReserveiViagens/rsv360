/**
 * PR-06b — configurable per-IP express-rate-limit (Redis when available, else memory).
 * Same degradation model as publicLimiter; never fail-open.
 */
import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import { getClientIp } from './get-client-ip';
import {
  getRedisConnection,
  isRedisRequiredForLocks,
} from '../modules/fornecedores-hub/redis-connection';

export type IpRateLimitOptions = {
  windowMs: number;
  max: number;
  /** Message returned on 429 */
  message?: string;
  /** Prefix for Redis store keys */
  prefix?: string;
};

export async function createIpRateLimiter(
  options: IpRateLimitOptions,
): Promise<RequestHandler> {
  const {
    windowMs,
    max,
    message = 'Muitas solicitações. Tente novamente em instantes.',
    prefix = 'rl:',
  } = options;

  const base = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
    keyGenerator: (req: Parameters<RequestHandler>[0]) => getClientIp(req),
    handler: (
      _req: Parameters<RequestHandler>[0],
      res: Parameters<RequestHandler>[1],
    ) => {
      res.status(429).json({
        success: false,
        error: message,
      });
    },
  };

  if (!isRedisRequiredForLocks()) {
    return rateLimit(base);
  }

  try {
    const redis = await getRedisConnection();
    return rateLimit({
      ...base,
      store: new RedisStore({
        prefix,
        sendCommand: (...args: string[]): Promise<RedisReply> =>
          redis.call(args[0], ...args.slice(1)) as Promise<RedisReply>,
      }),
    });
  } catch (error) {
    console.warn(
      `[ip-rate-limit] Redis unavailable — memory fallback (${prefix}):`,
      (error as Error).message,
    );
    return rateLimit(base);
  }
}
