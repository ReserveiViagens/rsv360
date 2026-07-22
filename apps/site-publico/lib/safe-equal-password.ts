import { createHash, timingSafeEqual } from 'crypto';

/**
 * Constant-time password compare via SHA-256 digests (equal length) — avoids length oracle.
 * PR-06a admin login.
 */
export function safeEqualPassword(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided, 'utf8').digest();
  const b = createHash('sha256').update(expected, 'utf8').digest();
  return timingSafeEqual(a, b);
}
