/**
 * PR-11e — rate limit for POST /api/coupons/usage (coupon redeem).
 * Key: user:{id} when authenticated; else ip:{clientIp}.
 * Reuses PR-06b in-memory store (no Redis / no DDL).
 */

import {
  createIpRateLimitStore,
  clientIpFromHeaders,
  type KeyedRateLimitResult,
} from '@/lib/ip-rate-limit';

/** Tight ceiling — redeem is authenticated write; abuse ≠ browse. */
export const COUPON_REDEEM_MAX_PER_WINDOW = 5;
export const COUPON_REDEEM_WINDOW_MS = 60_000;

export const couponRedeemRateLimit = createIpRateLimitStore({
  windowMs: COUPON_REDEEM_WINDOW_MS,
  max: COUPON_REDEEM_MAX_PER_WINDOW,
});

export function couponRedeemRateLimitKey(input: {
  userId?: number | string | null;
  ip?: string | null;
}): string {
  if (input.userId !== undefined && input.userId !== null && input.userId !== '') {
    return `user:${input.userId}`;
  }
  if (input.ip) return `ip:${input.ip}`;
  return 'anon:unknown';
}

export function checkCouponRedeemRateLimit(input: {
  userId?: number | string | null;
  ip?: string | null;
}): KeyedRateLimitResult {
  return couponRedeemRateLimit.check(couponRedeemRateLimitKey(input));
}

export function clearCouponRedeemRateLimitForTests(): void {
  couponRedeemRateLimit.clear();
}

export { clientIpFromHeaders };
