const mockSelectWhere = jest.fn();
const mockSelectFrom = jest.fn(() => ({ where: mockSelectWhere }));
const mockSelect = jest.fn(() => ({ from: mockSelectFrom }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

jest.mock('../../../../backend/src/db/schema/propostas', () => ({
  propostas: { tokenPublico: 'token_publico', isPublica: 'is_publica', status: 'status', id: 'id' },
}));

jest.mock('drizzle-orm', () => ({
  eq: (...args: unknown[]) => args,
}));

const mockLogEvent = jest.fn().mockResolvedValue({ id: 1 });
jest.mock('../../../../server/modules/propostas/services/propostas.service', () => ({
  propostasService: {
    logEvent: (...args: unknown[]) => mockLogEvent(...args),
  },
}));

import { cotacaoPublicaService } from '../../../../server/modules/cotacao-publica/services/cotacao-publica.service';

describe('registrarEngagementRoteiro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persiste tempo_pagina e cinematic_scroll para accepted/paid', async () => {
    mockSelectWhere.mockResolvedValueOnce([
      { id: 26, isPublica: true, status: 'accepted', tokenPublico: 'rt-abc' },
    ]);

    const result = await cotacaoPublicaService.registrarEngagementRoteiro('rt-abc', {
      tempoMs: 12_345,
      scrollDepthPct: 67,
    });

    expect(result).toEqual({ propostaId: 26, eventos: ['tempo_pagina', 'cinematic_scroll'] });
    expect(mockLogEvent).toHaveBeenCalledTimes(2);
    expect(mockLogEvent).toHaveBeenNthCalledWith(
      1,
      26,
      'tempo_pagina',
      'Tempo na página do roteiro cinematográfico',
      { tempoMs: 12345, token: 'rt-abc', scrollDepthPct: 67 },
    );
    expect(mockLogEvent).toHaveBeenNthCalledWith(
      2,
      26,
      'cinematic_scroll',
      'Profundidade de scroll no roteiro cinematográfico',
      { scrollDepthPct: 67, token: 'rt-abc', tempoMs: 12345 },
    );
  });

  it('retorna null quando token não existe', async () => {
    mockSelectWhere.mockResolvedValueOnce([]);

    const result = await cotacaoPublicaService.registrarEngagementRoteiro('rt-missing', {
      tempoMs: 1000,
      scrollDepthPct: 10,
    });

    expect(result).toBeNull();
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it('rejeita status fora do gate accepted/paid', async () => {
    mockSelectWhere.mockResolvedValueOnce([
      { id: 10, isPublica: true, status: 'sent', tokenPublico: 'rt-sent' },
    ]);

    await expect(
      cotacaoPublicaService.registrarEngagementRoteiro('rt-sent', {
        tempoMs: 500,
        scrollDepthPct: 20,
      }),
    ).rejects.toMatchObject({
      message: 'Evento de roteiro requer proposta aceita ou paga',
      statusCode: 403,
      propostaStatus: 'sent',
    });

    expect(mockLogEvent).not.toHaveBeenCalled();
  });
});
