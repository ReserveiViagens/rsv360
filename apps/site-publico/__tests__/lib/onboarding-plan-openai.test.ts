/**
 * PR-13e-followup-c — onboarding plan via shared LLM gateway.
 */
import { beforeEach, describe, it, expect, jest } from '@jest/globals';
import { clearLlmGatewayBudgetForTests } from '@rsv360/shared';
import { generateOnboardingPlanViaLlm } from '@/lib/onboarding-plan-openai';

const sampleData = {
  profile: { name: 'Ana', email: 'ana@example.com', role: 'Agente' },
  assessment: { industryKnowledge: 3 },
  preferences: {},
  goals: {},
};

describe('PR-13e-followup-c — generateOnboardingPlanViaLlm', () => {
  beforeEach(() => {
    clearLlmGatewayBudgetForTests();
  });

  it('returns parsed plan and never logs allowlisted PII or secrets', async () => {
    const logs: string[] = [];
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        model: 'gpt-4o-mini',
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: 'Plano Ana',
                description: 'Intro',
                estimatedDuration: 90,
                difficulty: 'beginner',
                steps: [{ title: 'Reservas', duration: 15 }],
                resources: [],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 8, completion_tokens: 20 },
      }),
    }));

    const plan = await generateOnboardingPlanViaLlm(sampleData, {
      apiKey: 'sk-test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      log: (event, meta) => {
        logs.push(`${event}:${JSON.stringify(meta)}`);
      },
    });

    expect(plan).not.toBeNull();
    expect(plan?.id).toBe('plan-openai');
    expect(plan?.title).toBe('Plano Ana');
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const callArgs = fetchImpl.mock.calls[0] as unknown as [
      unknown,
      { body: string },
    ];
    const body = JSON.parse(callArgs[1].body) as {
      response_format?: { type: string };
      messages: Array<{ content: string }>;
    };
    expect(body.response_format?.type).toBe('json_object');
    expect(body.messages[0].content).not.toContain('ana@example.com');

    const joined = logs.join('\n');
    expect(joined).toContain('"surface":"onboarding-plan"');
    expect(joined).not.toContain('ana@example.com');
    expect(joined).not.toContain('sk-test');
  });

  it('returns null on gateway error (caller falls back to mock)', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: false,
      status: 429,
      json: async () => ({}),
    }));

    const plan = await generateOnboardingPlanViaLlm(sampleData, {
      apiKey: 'sk-test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      log: () => undefined,
    });
    expect(plan).toBeNull();
  });
});
