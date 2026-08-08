/**
 * PR-13e / 13e-followup-a — shared LLM chat gateway unit tests.
 */
import { beforeEach, describe, it, expect, jest } from '@jest/globals';
import {
  clearLlmGatewayBudgetForTests,
  LLM_GATEWAY_BUDGET_MAX_CALLS,
  llmChatCompletion,
} from '@rsv360/shared';

describe('PR-13e — llmChatCompletion gateway', () => {
  beforeEach(() => {
    clearLlmGatewayBudgetForTests();
  });

  it('fails closed without API key', async () => {
    const result = await llmChatCompletion(
      {
        surface: 'test',
        messages: [{ role: 'user', content: 'hello' }],
      },
      { apiKey: '', fetchImpl: jest.fn() as unknown as typeof fetch },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('missing_api_key');
  });

  it('rejects empty / invalid messages', async () => {
    const result = await llmChatCompletion(
      { surface: 'test', messages: [] },
      { apiKey: 'sk-test', fetchImpl: jest.fn() as unknown as typeof fetch },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('invalid_request');
  });

  it('returns content on happy path and never logs prompt text', async () => {
    const logs: string[] = [];
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        model: 'gpt-4o-mini',
        choices: [{ message: { content: 'ok-response' } }],
        usage: { prompt_tokens: 3, completion_tokens: 2 },
      }),
    })) as unknown as typeof fetch;

    const result = await llmChatCompletion(
      {
        surface: 'tax-chat',
        messages: [
          { role: 'system', content: 'sys' },
          { role: 'user', content: 'secret-user-prompt-xyz' },
        ],
      },
      {
        apiKey: 'sk-test',
        fetchImpl,
        log: (event, meta) => {
          logs.push(`${event}:${JSON.stringify(meta)}`);
        },
      },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content).toBe('ok-response');
      expect(result.tokensIn).toBe(3);
    }
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const joined = logs.join('\n');
    expect(joined).toContain('"surface":"tax-chat"');
    expect(joined).not.toContain('secret-user-prompt-xyz');
    expect(joined).not.toContain('sk-test');
  });

  it('maps AbortError to timeout', async () => {
    const fetchImpl = jest.fn(async () => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      throw err;
    }) as unknown as typeof fetch;

    const result = await llmChatCompletion(
      {
        surface: 'split-suggest',
        messages: [{ role: 'user', content: 'ctx' }],
        timeoutMs: 1000,
      },
      { apiKey: 'sk-test', fetchImpl },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('timeout');
  });

  it('maps non-OK HTTP to http_error', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: false,
      status: 429,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    const result = await llmChatCompletion(
      {
        surface: 'comissoes-ia',
        messages: [{ role: 'user', content: 'obj=padrao' }],
      },
      { apiKey: 'sk-test', fetchImpl },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('http_error');
      expect(result.status).toBe(429);
    }
  });

  it('truncates output when over maxOutputChars', async () => {
    const long = 'x'.repeat(500);
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        model: 'gpt-4o-mini',
        choices: [{ message: { content: long } }],
        usage: { prompt_tokens: 1, completion_tokens: 10 },
      }),
    })) as unknown as typeof fetch;

    const result = await llmChatCompletion(
      {
        surface: 'ai-search',
        messages: [{ role: 'user', content: 'q' }],
        maxOutputChars: 100,
      },
      { apiKey: 'sk-test', fetchImpl },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content).toHaveLength(100);
      expect(result.truncated).toBe(true);
    }
  });

  it('rejects when per-surface call budget is exceeded', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        model: 'gpt-4o-mini',
        choices: [{ message: { content: 'ok' } }],
        usage: { prompt_tokens: 1, completion_tokens: 1 },
      }),
    })) as unknown as typeof fetch;

    const now = () => 1_000_000;
    for (let i = 0; i < LLM_GATEWAY_BUDGET_MAX_CALLS; i++) {
      const ok = await llmChatCompletion(
        {
          surface: 'budget-surface',
          messages: [{ role: 'user', content: 'ping' }],
          maxTokens: 1,
        },
        { apiKey: 'sk-test', fetchImpl, now },
      );
      expect(ok.ok).toBe(true);
    }

    const blocked = await llmChatCompletion(
      {
        surface: 'budget-surface',
        messages: [{ role: 'user', content: 'ping' }],
        maxTokens: 1,
      },
      { apiKey: 'sk-test', fetchImpl, now },
    );
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error).toBe('budget_exceeded');

    // Other surfaces remain independent
    const other = await llmChatCompletion(
      {
        surface: 'other-surface',
        messages: [{ role: 'user', content: 'ping' }],
        maxTokens: 1,
      },
      { apiKey: 'sk-test', fetchImpl, now },
    );
    expect(other.ok).toBe(true);
  });
});
