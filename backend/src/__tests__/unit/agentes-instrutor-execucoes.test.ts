const mockInsertReturning = jest.fn();
const mockValues = jest.fn(() => ({ returning: mockInsertReturning }));
const mockInsert = jest.fn(() => ({ values: mockValues }));

jest.mock('../../../../server/lib/db', () => ({
  db: { insert: () => mockInsert() },
}));

jest.mock('../../../../backend/src/db/schema/agentes', () => ({
  agenteExecucoes: {},
}));

import { InstrutorService } from '../../../../server/modules/agentes/instrutor/instrutor.service';

jest.mock('../../../../server/modules/agentes/instrutor/graph', () => ({
  runInstrutorGraph: jest.fn(async () => ({
    resposta: 'Oi\n\nOnde clicar: /modulos',
    tier: 't0' as const,
    cacheHit: 'none' as const,
    status: 200 as const,
    entradaHash: 'abc',
    tokensIn: null as number | null,
    tokensOut: null as number | null,
    modelo: null as string | null,
  })),
}));

jest.mock('../../../../server/modules/agentes/execucoes.service', () => ({
  AgentesExecucoesService: {
    registrar: jest.fn(async (input: unknown) => input),
  },
}));

import { AgentesExecucoesService } from '../../../../server/modules/agentes/execucoes.service';

describe('InstrutorService — registro em agente_execucoes', () => {
  it('registra tier e cache_hit após pergunta', async () => {
    const result = await InstrutorService.perguntar({
      pergunta: 'Olá',
      papel: 'staff',
      userId: 1,
    });
    expect(result.tier).toBe('t0');
    expect(AgentesExecucoesService.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        agente: 'instrutor',
        tier: 't0',
        cacheHit: 'none',
        entradaHash: 'abc',
      }),
    );
  });
});
