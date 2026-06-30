import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getClientIp } from './get-client-ip';
import {
  getRedisConnection,
  isRedisRequiredForLocks,
} from '../modules/fornecedores-hub/redis-connection';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

let limiter: RequestHandler | null = null;

async function buildLimiter(): Promise<RequestHandler> {
  const base = {
    windowMs: WINDOW_MS,
    max: MAX_PER_WINDOW,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Parameters<RequestHandler>[0]) => getClientIp(req),
    handler: (
      _req: Parameters<RequestHandler>[0],
      res: Parameters<RequestHandler>[1],
    ) => {
      res.status(429).json({ success: false, error: 'Muitas solicitações. Tente novamente em instantes.' });
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
        sendCommand: (...args: string[]) =>
          redis.call(args[0], ...args.slice(1)) as ReturnType<typeof redis.call>,
      }),
    });
  } catch (error) {
    console.warn('[public-limiter] Redis indisponível, fallback em memória:', (error as Error).message);
    return rateLimit(base);
  }
}

export async function initPublicLimiter(): Promise<void> {
  limiter = await buildLimiter();
}

export const publicLimiter: RequestHandler = (req, res, next) => {
  if (!limiter) {
    return next();
  }
  return limiter(req, res, next);
};

module.exports = { initPublicLimiter, publicLimiter, WINDOW_MS, MAX_PER_WINDOW };
