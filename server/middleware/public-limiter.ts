import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import { getClientIp } from './get-client-ip';
import {
  getRedisConnection,
  isRedisRequiredForLocks,
} from '../modules/fornecedores-hub/redis-connection';

const WINDOW_MS = 60_000;
export const MAX_PER_WINDOW = 30;

export class PublicLimiterInitError extends Error {
  readonly code = 'PUBLIC_LIMITER_INIT_FAILED';

  constructor(message = 'publicLimiter failed to initialize (fail-closed).') {
    super(message);
    this.name = 'PublicLimiterInitError';
  }
}

let limiter: RequestHandler | null = null;

async function buildLimiter(): Promise<RequestHandler> {
  const base = {
    windowMs: WINDOW_MS,
    max: MAX_PER_WINDOW,
    standardHeaders: true,
    legacyHeaders: false,
    // express-rate-limit v7 validates IPs; trust proxy is set on the app.
    validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
    keyGenerator: (req: Parameters<RequestHandler>[0]) => getClientIp(req),
    handler: (
      _req: Parameters<RequestHandler>[0],
      res: Parameters<RequestHandler>[1],
    ) => {
      res.status(429).json({
        success: false,
        error: 'Muitas solicitações. Tente novamente em instantes.',
      });
    },
  };

  // No REDIS_URL → memory store (single-process). Documented degradation.
  if (!isRedisRequiredForLocks()) {
    return rateLimit(base);
  }

  // Redis required but connect fails at init → memory fallback (still limits; never open).
  try {
    const redis = await getRedisConnection();
    return rateLimit({
      ...base,
      store: new RedisStore({
        sendCommand: (...args: string[]): Promise<RedisReply> =>
          redis.call(args[0], ...args.slice(1)) as Promise<RedisReply>,
      }),
    });
  } catch (error) {
    console.warn(
      '[public-limiter] Redis unavailable at init — memory fallback (per-process counts):',
      (error as Error).message,
    );
    return rateLimit(base);
  }
}

/** Boot assert — must succeed or process must not listen (PR-06a). */
export async function initPublicLimiter(): Promise<void> {
  try {
    limiter = await buildLimiter();
  } catch (error) {
    limiter = null;
    const msg = error instanceof Error ? error.message : String(error);
    throw new PublicLimiterInitError(msg);
  }
  if (!limiter) {
    throw new PublicLimiterInitError('Limiter factory returned empty handler');
  }
}

/** Test helper — reset module state between suites. */
export function resetPublicLimiterForTests(): void {
  limiter = null;
}

export const publicLimiter: RequestHandler = (req, res, next) => {
  // PR-06a: never fail-open. Uninitialized → 503 (boot should have asserted).
  if (!limiter) {
    return res.status(503).json({
      success: false,
      error: 'Rate limiter unavailable',
    });
  }
  return limiter(req, res, next);
};

module.exports = {
  initPublicLimiter,
  publicLimiter,
  resetPublicLimiterForTests,
  PublicLimiterInitError,
  WINDOW_MS,
  MAX_PER_WINDOW,
};
