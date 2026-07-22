/**
 * PR-06b — Next route IP ceilings (enumeration + MP webhook anti-flood).
 */
import {
  createIpRateLimitStore,
  clientIpFromHeaders,
} from '@/lib/ip-rate-limit';

/** Same class as Express publicLimiter (30/min) for lookup / check-in. */
export const ENUMERATION_MAX_PER_WINDOW = 30;
export const ENUMERATION_WINDOW_MS = 60_000;

/**
 * High ceiling BEFORE HMAC — accommodates PR-02c 503 native MP redelivery.
 * Signed legitimate traffic hitting 429 = stop and retune (vinculante).
 */
export const MP_WEBHOOK_MAX_PER_WINDOW = 600;
export const MP_WEBHOOK_WINDOW_MS = 60_000;

export const bookingsLookupIpLimit = createIpRateLimitStore({
  windowMs: ENUMERATION_WINDOW_MS,
  max: ENUMERATION_MAX_PER_WINDOW,
});

export const checkinIpLimit = createIpRateLimitStore({
  windowMs: ENUMERATION_WINDOW_MS,
  max: ENUMERATION_MAX_PER_WINDOW,
});

export const mpWebhookIpLimit = createIpRateLimitStore({
  windowMs: MP_WEBHOOK_WINDOW_MS,
  max: MP_WEBHOOK_MAX_PER_WINDOW,
});

export function clearPr06bNextIpLimitsForTests() {
  bookingsLookupIpLimit.clear();
  checkinIpLimit.clear();
  mpWebhookIpLimit.clear();
}

export { clientIpFromHeaders };
