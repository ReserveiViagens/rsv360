/**
 * PR-06b — in-memory per-IP rate limit for Next.js route handlers.
 * Process-local (same model as /api/metrics 06a). Never fail-open.
 */

export type IpRateLimitConfig = {
  windowMs: number;
  max: number;
};

type Bucket = { count: number; windowStart: number };

export function createIpRateLimitStore(config: IpRateLimitConfig) {
  const buckets = new Map<string, Bucket>();

  function clear() {
    buckets.clear();
  }

  function allow(ip: string): boolean {
    const now = Date.now();
    const entry = buckets.get(ip);
    if (!entry || now - entry.windowStart > config.windowMs) {
      buckets.set(ip, { count: 1, windowStart: now });
      return true;
    }
    if (entry.count >= config.max) return false;
    entry.count += 1;
    return true;
  }

  return { allow, clear, max: config.max, windowMs: config.windowMs };
}

export function clientIpFromHeaders(
  getHeader: (name: string) => string | null,
): string {
  const xf = getHeader('x-forwarded-for');
  if (xf) return xf.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
}
