/**
 * PR-13a — AI search rate limit, input validation, history isolation.
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  checkAiSearchRateLimit,
  clearAiSearchRateLimitForTests,
  aiSearchRateLimitKey,
  AI_SEARCH_MAX_PER_WINDOW,
  AI_SEARCH_MAX_INPUT_CHARS,
} from '@/lib/ai-search-rate-limit';
import { validateAiSearchTextInput } from '@/lib/ai-search-guard';
import { AISearchService } from '@/lib/ai-search-service';

describe('PR-13a — ai-search rate limit', () => {
  beforeEach(() => {
    clearAiSearchRateLimitForTests();
  });

  it('prefers user key over IP', () => {
    expect(aiSearchRateLimitKey({ userId: 42, ip: '203.0.113.9' })).toBe(
      'user:42',
    );
  });

  it('falls back to IP when user missing', () => {
    expect(aiSearchRateLimitKey({ ip: '203.0.113.9' })).toBe('ip:203.0.113.9');
  });

  it('allows up to ceiling then denies with retryAfterSec', () => {
    for (let i = 0; i < AI_SEARCH_MAX_PER_WINDOW; i += 1) {
      expect(checkAiSearchRateLimit({ userId: 7 }).allowed).toBe(true);
    }
    const blocked = checkAiSearchRateLimit({ userId: 7 });
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSec).toBeGreaterThanOrEqual(1);
    }
  });

  it('isolates buckets by user', () => {
    for (let i = 0; i < AI_SEARCH_MAX_PER_WINDOW; i += 1) {
      expect(checkAiSearchRateLimit({ userId: 1 }).allowed).toBe(true);
    }
    expect(checkAiSearchRateLimit({ userId: 1 }).allowed).toBe(false);
    expect(checkAiSearchRateLimit({ userId: 2 }).allowed).toBe(true);
  });
});

describe('PR-13a — ai-search input validation', () => {
  it('rejects missing / empty / non-string', () => {
    expect(validateAiSearchTextInput(undefined, 'Mensagem')?.status).toBe(400);
    expect(validateAiSearchTextInput('', 'Mensagem')?.status).toBe(400);
    expect(validateAiSearchTextInput('   ', 'Mensagem')?.status).toBe(400);
    expect(validateAiSearchTextInput(123, 'Mensagem')?.status).toBe(400);
  });

  it('rejects oversize input', () => {
    const big = 'x'.repeat(AI_SEARCH_MAX_INPUT_CHARS + 1);
    expect(validateAiSearchTextInput(big, 'Query')?.status).toBe(400);
  });

  it('accepts valid trimmed input', () => {
    expect(validateAiSearchTextInput('  hotel em caldas  ', 'Mensagem')).toBeNull();
  });
});

describe('PR-13a — ai-search history isolation', () => {
  it('keeps conversation history per userId', async () => {
    const svc = new AISearchService(undefined);
    svc.clearAllHistoriesForTests();

    await svc.processMessage('olá', undefined, 1);
    await svc.processMessage('buscar hotel', undefined, 2);

    const h1 = svc.getHistory(1);
    const h2 = svc.getHistory(2);

    expect(h1.some((m) => m.content === 'olá')).toBe(true);
    expect(h1.some((m) => m.content === 'buscar hotel')).toBe(false);
    expect(h2.some((m) => m.content === 'buscar hotel')).toBe(true);
    expect(h2.some((m) => m.content === 'olá')).toBe(false);
  });

  it('clearHistory only clears the target user', async () => {
    const svc = new AISearchService(undefined);
    svc.clearAllHistoriesForTests();

    await svc.processMessage('msg-a', undefined, 10);
    await svc.processMessage('msg-b', undefined, 20);

    svc.clearHistory(10);

    expect(svc.getHistory(10)).toEqual([]);
    expect(svc.getHistory(20).some((m) => m.content === 'msg-b')).toBe(true);
  });

  it('rejects processMessage without userId', async () => {
    const svc = new AISearchService(undefined);
    const result = await svc.processMessage('hi');
    expect(result.response).toMatch(/erro|Desculpe/i);
  });
});
