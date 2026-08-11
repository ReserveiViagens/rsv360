/**
 * PR-13e-followup-c — Instrutor chat via shared LLM gateway.
 */
import { clearLlmGatewayBudgetForTests } from '@rsv360/shared';
import { chatInstrutor } from '../../../../server/modules/agentes/instrutor/openai.client';

describe('PR-13e-followup-c — chatInstrutor gateway', () => {
  beforeEach(() => {
    clearLlmGatewayBudgetForTests();
  });

  it('returns content and never logs prompt or api key', async () => {
    const logs: string[] = [];
    const secretQ = 'SECRET-INSTRUTOR-PROMPT-XYZ';
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        model: 'gpt-4o-mini',
        choices: [{ message: { content: 'Abra o menu.\nOnde clicar: /modulos' } }],
        usage: { prompt_tokens: 12, completion_tokens: 9 },
      }),
    }));

    const result = await chatInstrutor(
      {
        system: 'Você é o Instrutor.',
        user: secretQ,
        modelo: 'gpt-4o-mini',
      },
      {
        apiKey: 'sk-test',
        fetchImpl: fetchImpl as unknown as typeof fetch,
        log: (event, meta) => {
          logs.push(`${event}:${JSON.stringify(meta)}`);
        },
      },
    );

    expect(result.content).toContain('Onde clicar');
    expect(result.tokensIn).toBe(12);
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const joined = logs.join('\n');
    expect(joined).toContain('"surface":"instrutor"');
    expect(joined).not.toContain(secretQ);
    expect(joined).not.toContain('sk-test');
  });

  it('throws typed gateway error without leaking upstream body', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: false,
      status: 502,
      json: async () => ({ error: { message: 'upstream-secret' } }),
    }));

    await expect(
      chatInstrutor(
        { system: 'sys', user: 'como criar orçamento', modelo: 'gpt-4o-mini' },
        {
          apiKey: 'sk-test',
          fetchImpl: fetchImpl as unknown as typeof fetch,
          log: () => undefined,
        },
      ),
    ).rejects.toThrow(/LLM falhou: http_error/);
  });
});
