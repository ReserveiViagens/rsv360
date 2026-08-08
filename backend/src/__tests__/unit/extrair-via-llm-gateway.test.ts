/**
 * PR-13e-followup-b — acomodações import via shared LLM gateway.
 */
import { clearLlmGatewayBudgetForTests } from '@rsv360/shared';
import { extrairViaLLM } from '../../../../server/modules/acomodacoes/import/parse';

describe('PR-13e-followup-b — extrairViaLLM gateway', () => {
  beforeEach(() => {
    clearLlmGatewayBudgetForTests();
  });

  it('parses inline JSON array without calling OpenAI', async () => {
    const fetchImpl = jest.fn();
    const rows = await extrairViaLLM(
      'prefix [{"codigo_externo":"X1","titulo":"Suite"}] suffix',
      { apiKey: 'sk-test', fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(rows).toHaveLength(1);
    expect(rows[0].codigo_externo).toBe('X1');
  });

  it('fails closed without API key', async () => {
    await expect(
      extrairViaLLM('sem json inline — precisa LLM', {
        apiKey: '',
        fetchImpl: jest.fn() as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/OPENAI_API_KEY ausente/);
  });

  it('routes through llmChatCompletion and never logs document text', async () => {
    const logs: string[] = [];
    const secretDoc = 'DOC-SECRET-ACOM-IMPORT-XYZ';
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        model: 'gpt-4o-mini',
        choices: [
          {
            message: {
              content: JSON.stringify({
                itens: [
                  {
                    codigo_externo: 'A9',
                    empreendimento: 'hotel-demo',
                    tipo: 'apto',
                    titulo: 'Apto 1',
                    quartos: 1,
                    capacidade_max: 2,
                    config_sala: 'nenhum',
                    config_banheiro: 'so_suite',
                    preco_diaria: 200,
                  },
                ],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 20 },
      }),
    })) as unknown as typeof fetch;

    const rows = await extrairViaLLM(secretDoc, {
      apiKey: 'sk-test',
      fetchImpl,
      log: (event, meta) => {
        logs.push(`${event}:${JSON.stringify(meta)}`);
      },
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const body = JSON.parse(
      (fetchImpl.mock.calls[0][1] as { body: string }).body,
    ) as {
      response_format?: { type: string };
      messages: Array<{ role: string; content: string }>;
    };
    expect(body.response_format?.type).toBe('json_object');
    expect(body.messages.some((m) => m.content.includes(secretDoc))).toBe(true);

    expect(rows).toHaveLength(1);
    expect(rows[0].codigoExterno ?? rows[0].codigo_externo).toBeTruthy();

    const joined = logs.join('\n');
    expect(joined).toContain('"surface":"acomodacoes-import"');
    expect(joined).not.toContain(secretDoc);
    expect(joined).not.toContain('sk-test');
  });

  it('maps gateway http_error without leaking upstream body', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: false,
      status: 502,
      json: async () => ({ error: { message: 'upstream-secret' } }),
      text: async () => 'upstream-secret-body',
    })) as unknown as typeof fetch;

    await expect(
      extrairViaLLM('texto livre para LLM', {
        apiKey: 'sk-test',
        fetchImpl,
        log: () => undefined,
      }),
    ).rejects.toThrow(/LLM falhou: http_error \(502\)/);

    try {
      await extrairViaLLM('texto livre para LLM', {
        apiKey: 'sk-test',
        fetchImpl,
        log: () => undefined,
      });
    } catch (err) {
      expect(String(err)).not.toContain('upstream-secret');
    }
  });
});
