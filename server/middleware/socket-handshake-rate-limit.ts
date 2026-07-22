/**
 * PR-06b — Socket.IO handshake rate limit (memory, per handshake.address).
 * Does NOT touch CORS — callers must keep corsOriginDelegate / allowlist (05b).
 */
import type { Server } from 'socket.io';

export const SOCKET_HANDSHAKE_WINDOW_MS = 60_000;
export const SOCKET_HANDSHAKE_MAX_PER_WINDOW = 100;

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

/** Test helper */
export function clearSocketHandshakeRateLimitForTests(): void {
  buckets.clear();
}

function allowHandshake(ip: string): boolean {
  const now = Date.now();
  const entry = buckets.get(ip);
  if (!entry || now - entry.windowStart > SOCKET_HANDSHAKE_WINDOW_MS) {
    buckets.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= SOCKET_HANDSHAKE_MAX_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

/**
 * Attach to the root Server (all namespaces inherit connection middleware).
 */
export function attachSocketHandshakeRateLimit(io: Server): void {
  io.use((socket, next) => {
    const ip =
      socket.handshake.address ||
      (socket.handshake.headers['x-forwarded-for'] as string | undefined)
        ?.split(',')[0]
        ?.trim() ||
      'unknown';

    if (!allowHandshake(ip)) {
      const err = new Error('Too many handshake attempts') as Error & {
        data?: { content: string };
      };
      err.data = { content: 'rate_limited' };
      return next(err);
    }
    return next();
  });
}
