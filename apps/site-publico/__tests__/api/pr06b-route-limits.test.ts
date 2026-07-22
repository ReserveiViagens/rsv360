/**
 * PR-06b — Next IP ceilings (enumeration + MP anti-flood before HMAC).
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  createIpRateLimitStore,
  clientIpFromHeaders,
} from '@/lib/ip-rate-limit';
import {
  clearPr06bNextIpLimitsForTests,
  bookingsLookupIpLimit,
  mpWebhookIpLimit,
  ENUMERATION_MAX_PER_WINDOW,
  MP_WEBHOOK_MAX_PER_WINDOW,
} from '@/lib/pr06b-route-limits';

describe('PR-06b Next ip rate limits', () => {
  beforeEach(() => {
    clearPr06bNextIpLimitsForTests();
  });

  it('clientIpFromHeaders prefers first x-forwarded-for hop', () => {
    expect(
      clientIpFromHeaders((n) =>
        n === 'x-forwarded-for' ? '203.0.113.1, 10.0.0.1' : null,
      ),
    ).toBe('203.0.113.1');
  });

  it('bookingsLookupIpLimit blocks after enumeration ceiling', () => {
    const ip = '198.51.100.40';
    for (let i = 0; i < ENUMERATION_MAX_PER_WINDOW; i += 1) {
      expect(bookingsLookupIpLimit.allow(ip)).toBe(true);
    }
    expect(bookingsLookupIpLimit.allow(ip)).toBe(false);
  });

  it('mpWebhookIpLimit allows high burst then blocks (HMAC must stay downstream)', () => {
    const ip = '198.51.100.41';
    for (let i = 0; i < MP_WEBHOOK_MAX_PER_WINDOW; i += 1) {
      expect(mpWebhookIpLimit.allow(ip)).toBe(true);
    }
    expect(mpWebhookIpLimit.allow(ip)).toBe(false);
  });

  it('createIpRateLimitStore isolates buckets by IP', () => {
    const store = createIpRateLimitStore({ windowMs: 60_000, max: 2 });
    expect(store.allow('a')).toBe(true);
    expect(store.allow('a')).toBe(true);
    expect(store.allow('a')).toBe(false);
    expect(store.allow('b')).toBe(true);
  });
});
