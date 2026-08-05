/**
 * PR-11e — coupon redeem rate limit (user key + IP fallback).
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  checkCouponRedeemRateLimit,
  clearCouponRedeemRateLimitForTests,
  couponRedeemRateLimitKey,
  COUPON_REDEEM_MAX_PER_WINDOW,
} from '@/lib/coupon-redeem-rate-limit';
import { createIpRateLimitStore } from '@/lib/ip-rate-limit';

describe('PR-11e — coupon redeem rate limit', () => {
  beforeEach(() => {
    clearCouponRedeemRateLimitForTests();
  });

  it('prefers user key over IP', () => {
    expect(couponRedeemRateLimitKey({ userId: 42, ip: '203.0.113.9' })).toBe(
      'user:42',
    );
  });

  it('falls back to IP when user missing', () => {
    expect(couponRedeemRateLimitKey({ ip: '203.0.113.9' })).toBe(
      'ip:203.0.113.9',
    );
  });

  it('allows up to ceiling then denies with retryAfterSec', () => {
    for (let i = 0; i < COUPON_REDEEM_MAX_PER_WINDOW; i += 1) {
      const r = checkCouponRedeemRateLimit({ userId: 7 });
      expect(r.allowed).toBe(true);
    }
    const blocked = checkCouponRedeemRateLimit({ userId: 7 });
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSec).toBeGreaterThanOrEqual(1);
    }
  });

  it('isolates buckets by user', () => {
    for (let i = 0; i < COUPON_REDEEM_MAX_PER_WINDOW; i += 1) {
      expect(checkCouponRedeemRateLimit({ userId: 1 }).allowed).toBe(true);
    }
    expect(checkCouponRedeemRateLimit({ userId: 1 }).allowed).toBe(false);
    expect(checkCouponRedeemRateLimit({ userId: 2 }).allowed).toBe(true);
  });

  it('IP fallback buckets are independent of user buckets', () => {
    for (let i = 0; i < COUPON_REDEEM_MAX_PER_WINDOW; i += 1) {
      expect(checkCouponRedeemRateLimit({ ip: '198.51.100.1' }).allowed).toBe(
        true,
      );
    }
    expect(checkCouponRedeemRateLimit({ ip: '198.51.100.1' }).allowed).toBe(
      false,
    );
    expect(checkCouponRedeemRateLimit({ userId: 99 }).allowed).toBe(true);
  });

  it('check() Retry-After shrinks within window (store unit)', () => {
    const store = createIpRateLimitStore({ windowMs: 10_000, max: 1 });
    expect(store.check('k').allowed).toBe(true);
    const denied = store.check('k');
    expect(denied.allowed).toBe(false);
    if (!denied.allowed) {
      expect(denied.retryAfterSec).toBeLessThanOrEqual(10);
      expect(denied.retryAfterSec).toBeGreaterThanOrEqual(1);
    }
  });
});
