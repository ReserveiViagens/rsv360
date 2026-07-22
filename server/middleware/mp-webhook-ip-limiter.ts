/**
 * PR-06b — Mercado Pago webhook anti-flood (Express).
 * High ceiling BEFORE HMAC so native MP redelivery (incl. PR-02c 503 storms) is not broken.
 * Ceiling: 600/min/IP ≈ 10/s sustained — well above normal + retry bursts from one edge IP.
 *
 * Memory limiter is available at module load (tests mount router without createApp).
 * Boot upgrades to Redis-backed store when available via initMpWebhookIpLimiter().
 */
import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { getClientIp } from './get-client-ip';
import { createIpRateLimiter } from './create-ip-rate-limit';

/** Documented ceiling — change only with evidence that legitimate signed retries hit 429. */
export const MP_WEBHOOK_MAX_PER_WINDOW = 600;
export const MP_WEBHOOK_WINDOW_MS = 60_000;

function buildMemoryLimiter(): RequestHandler {
  return rateLimit({
    windowMs: MP_WEBHOOK_WINDOW_MS,
    max: MP_WEBHOOK_MAX_PER_WINDOW,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
    keyGenerator: (req) => getClientIp(req),
    handler: (_req, res) => {
      res.status(429).json({ success: false, error: 'Too many webhook requests' });
    },
  });
}

let limiter: RequestHandler = buildMemoryLimiter();

export async function initMpWebhookIpLimiter(): Promise<void> {
  limiter = await createIpRateLimiter({
    windowMs: MP_WEBHOOK_WINDOW_MS,
    max: MP_WEBHOOK_MAX_PER_WINDOW,
    prefix: 'rl:mp-wh:',
    message: 'Too many webhook requests',
  });
}

/** Test helper — restore process-local memory limiter. */
export function resetMpWebhookIpLimiterForTests(): void {
  limiter = buildMemoryLimiter();
}

export const mpWebhookIpLimiter: RequestHandler = (req, res, next) =>
  limiter(req, res, next);
