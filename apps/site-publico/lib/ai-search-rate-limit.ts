/**
 * PR-13a — rate limit for /api/ai-search/* (LLM cost / abuse ceiling).
 * Key: user:{id} when authenticated; else ip:{clientIp} (defense in depth).
 * Reuses PR-06b in-memory store (no Redis / no DDL).
 */

import {
  createIpRateLimitStore,
  clientIpFromHeaders,
  type KeyedRateLimitResult,
} from '@/lib/ip-rate-limit';

/** Tight ceiling — each hit may call OpenAI. */
export const AI_SEARCH_MAX_PER_WINDOW = 10;
export const AI_SEARCH_WINDOW_MS = 60_000;

/** Max chars for message / query body fields (prompt injection / cost). */
export const AI_SEARCH_MAX_INPUT_CHARS = 2_000;

export const aiSearchRateLimit = createIpRateLimitStore({
  windowMs: AI_SEARCH_WINDOW_MS,
  max: AI_SEARCH_MAX_PER_WINDOW,
});

export function aiSearchRateLimitKey(input: {
  userId?: number | string | null;
  ip?: string | null;
}): string {
  if (input.userId !== undefined && input.userId !== null && input.userId !== '') {
    return `user:${input.userId}`;
  }
  if (input.ip) return `ip:${input.ip}`;
  return 'anon:unknown';
}

export function checkAiSearchRateLimit(input: {
  userId?: number | string | null;
  ip?: string | null;
}): KeyedRateLimitResult {
  return aiSearchRateLimit.check(aiSearchRateLimitKey(input));
}

export function clearAiSearchRateLimitForTests(): void {
  aiSearchRateLimit.clear();
}

export { clientIpFromHeaders };
