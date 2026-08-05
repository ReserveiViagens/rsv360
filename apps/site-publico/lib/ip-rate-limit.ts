/**
 * PR-06b — in-memory per-IP rate limit for Next.js route handlers.
 * Process-local (same model as /api/metrics 06a). Never fail-open.
 * PR-11e: `check()` also returns Retry-After seconds for 429 responses.
 */

export type IpRateLimitConfig = {
  windowMs: number;
  max: number;
};

type Bucket = { count: number; windowStart: number };

export type KeyedRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export function createIpRateLimitStore(config: IpRateLimitConfig) {
  const buckets = new Map<string, Bucket>();

  function clear() {
    buckets.clear();
  }

  function check(key: string): KeyedRateLimitResult {
    const now = Date.now();
    const entry = buckets.get(key);
    if (!entry || now - entry.windowStart > config.windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      return { allowed: true };
    }
    if (entry.count >= config.max) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((entry.windowStart + config.windowMs - now) / 1000),
      );
      return { allowed: false, retryAfterSec };
    }
    entry.count += 1;
    return { allowed: true };
  }

  function allow(ip: string): boolean {
    return check(ip).allowed;
  }

  return { allow, check, clear, max: config.max, windowMs: config.windowMs };
}

export function clientIpFromHeaders(
  getHeader: (name: string) => string | null,
): string {
  const xf = getHeader('x-forwarded-for');
  if (xf) return xf.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
}
