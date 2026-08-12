/**
 * PR-13e-followup-e — LLM gateway Redis boot wiring.
 */
import { afterEach, beforeEach, describe, it, expect, jest } from '@jest/globals';
import {
  clearLlmGatewayBudgetForTests,
  llmChatCompletion,
  setLlmGatewayRedis,
  type LlmGatewayRedisLike,
} from '@rsv360/shared';
import {
  isLlmGatewayRedisConfigured,
  wireLlmGatewayRedis,
} from '@/lib/llm-gateway-redis-boot';

describe('PR-13e-followup-e — llm gateway Redis boot', () => {
  const prevUrl = process.env.REDIS_URL;
  const prevDisabled = process.env.REDIS_DISABLED;

  beforeEach(() => {
    clearLlmGatewayBudgetForTests();
    delete process.env.REDIS_URL;
    delete process.env.REDIS_DISABLED;
  });

  afterEach(() => {
    if (prevUrl === undefined) delete process.env.REDIS_URL;
    else process.env.REDIS_URL = prevUrl;
    if (prevDisabled === undefined) delete process.env.REDIS_DISABLED;
    else process.env.REDIS_DISABLED = prevDisabled;
    clearLlmGatewayBudgetForTests();
  });

  it('isLlmGatewayRedisConfigured is false without REDIS_URL', () => {
    expect(isLlmGatewayRedisConfigured()).toBe(false);
  });

  it('isLlmGatewayRedisConfigured is false when REDIS_DISABLED=true', () => {
    process.env.REDIS_URL = 'redis://127.0.0.1:6379';
    process.env.REDIS_DISABLED = 'true';
    expect(isLlmGatewayRedisConfigured()).toBe(false);
  });

  it('wire without REDIS_URL leaves memory mode and gateway still works', async () => {
    const setRedis = jest.fn();
    const mode = await wireLlmGatewayRedis(setRedis);
    expect(mode).toBe('memory');
    expect(setRedis).toHaveBeenCalledWith(null);

    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        model: 'gpt-4o-mini',
        choices: [{ message: { content: 'ok' } }],
        usage: { prompt_tokens: 1, completion_tokens: 1 },
      }),
    }));

    const result = await llmChatCompletion(
      { surface: 'boot-memory', messages: [{ role: 'user', content: 'hi' }] },
      {
        apiKey: 'sk-test',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      },
    );
    expect(result.ok).toBe(true);
  });

  it('setLlmGatewayRedis enables shared budget path used by llmChatCompletion', async () => {
    let calls = 0;
    const redis: LlmGatewayRedisLike = {
      incr: async () => {
        calls += 1;
        return calls;
      },
      incrby: async (_k, n) => n,
      expire: async () => 1,
    };
    setLlmGatewayRedis(redis);

    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        model: 'gpt-4o-mini',
        choices: [{ message: { content: 'ok' } }],
        usage: { prompt_tokens: 1, completion_tokens: 1 },
      }),
    }));

    const result = await llmChatCompletion(
      {
        surface: 'boot-redis',
        messages: [{ role: 'user', content: 'hi' }],
        maxTokens: 1,
      },
      {
        apiKey: 'sk-test',
        fetchImpl: fetchImpl as unknown as typeof fetch,
        now: () => 5_000_000,
      },
    );
    expect(result.ok).toBe(true);
    expect(calls).toBeGreaterThanOrEqual(1);
  });
});
