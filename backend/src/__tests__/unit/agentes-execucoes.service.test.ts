const mockReturning = jest.fn();
const mockValues = jest.fn(() => ({ returning: mockReturning }));
const mockInsert = jest.fn(() => ({ values: mockValues }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    insert: () => mockInsert(),
  },
}));

jest.mock('../../../../backend/src/db/schema/agentes', () => ({
  agenteExecucoes: { id: 'id' },
}));

import { AgentesExecucoesService } from '../../../../server/modules/agentes/execucoes.service';

describe('AgentesExecucoesService.registrar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persiste execução em agente_execucoes', async () => {
    const saved = {
      id: '11111111-1111-1111-1111-111111111111',
      agente: 'instrutor',
      tier: 't0',
      cacheHit: 'exact',
      entradaHash: 'abc',
    };
    mockReturning.mockResolvedValueOnce([saved]);

    const row = await AgentesExecucoesService.registrar({
      agente: 'instrutor',
      canal: 'turismo',
      entradaHash: 'abc',
      tier: 't0',
      cacheHit: 'exact',
      modelo: null,
      tokensIn: 0,
      tokensOut: 0,
      custoEstimado: 0,
      duracaoMs: 12,
    });

    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        agente: 'instrutor',
        canal: 'turismo',
        entradaHash: 'abc',
        tier: 't0',
        cacheHit: 'exact',
        duracaoMs: 12,
      }),
    );
    expect(row).toEqual(saved);
  });
});
