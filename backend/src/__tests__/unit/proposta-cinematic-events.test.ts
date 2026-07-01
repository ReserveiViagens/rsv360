const mockSelectWhere = jest.fn();
const mockSelectFrom = jest.fn(() => ({ where: mockSelectWhere, limit: jest.fn(() => mockSelectWhere) }));
const mockSelectLimit = jest.fn();
const mockSelect = jest.fn(() => ({
  from: jest.fn(() => ({
    where: jest.fn(() => ({
      limit: mockSelectLimit,
    })),
  })),
}));

const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
const mockUpdateSet = jest.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = jest.fn(() => ({ set: mockUpdateSet }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

jest.mock('../../../../backend/src/db/schema/propostas', () => ({
  propostas: { tokenPublico: 'token_publico', isPublica: 'is_publica', id: 'id' },
  propostaEventos: {
    id: 'id',
    propostaId: 'proposta_id',
    tipo: 'tipo',
    payload: 'payload',
  },
}));

jest.mock('drizzle-orm', () => ({
  and: (...args: unknown[]) => args,
  eq: (...args: unknown[]) => args,
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
}));

const mockLogEvent = jest.fn().mockResolvedValue({ id: 1 });
jest.mock('../../../../server/modules/propostas/services/propostas.service', () => ({
  propostasService: {
    logEvent: (...args: unknown[]) => mockLogEvent(...args),
  },
}));

import {
  registrarEventosCinematicos,
  resolvePropostaPublicaByToken,
} from '../../../../server/modules/propostas/services/proposta-cinematic-events.service';

describe('proposta-cinematic-events.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectLimit.mockReset();
  });

  describe('resolvePropostaPublicaByToken', () => {
    it('retorna not_found quando token não existe', async () => {
      mockSelectLimit.mockResolvedValueOnce([]);
      const result = await resolvePropostaPublicaByToken('rt-missing');
      expect(result).toEqual({ kind: 'not_found' });
    });

    it('retorna forbidden quando proposta não é pública', async () => {
      mockSelectLimit.mockResolvedValueOnce([{ id: 5, isPublica: false }]);
      const result = await resolvePropostaPublicaByToken('rt-private');
      expect(result).toEqual({ kind: 'forbidden' });
    });

    it('retorna ok com propostaId', async () => {
      mockSelectLimit.mockResolvedValueOnce([{ id: 12, isPublica: true }]);
      const result = await resolvePropostaPublicaByToken('rt-ok');
      expect(result).toEqual({ kind: 'ok', propostaId: 12 });
    });
  });

  describe('registrarEventosCinematicos', () => {
    it('insere tempo_pagina na primeira vez', async () => {
      mockSelectLimit.mockResolvedValueOnce([]);

      const result = await registrarEventosCinematicos(10, {
        session_id: 'sess-a',
        tempo_pagina_segundos: 30,
      });

      expect(result.eventos).toContain('tempo_pagina');
      expect(mockLogEvent).toHaveBeenCalledWith(
        10,
        'tempo_pagina',
        'Tempo ativo na prévia da proposta',
        { session_id: 'sess-a', segundos: 30 },
      );
    });

    it('atualiza tempo_pagina com max cumulativo por session_id', async () => {
      mockSelectLimit.mockResolvedValueOnce([
        { id: 99, payload: { session_id: 'sess-a', segundos: 20 } },
      ]);

      await registrarEventosCinematicos(10, {
        session_id: 'sess-a',
        tempo_pagina_segundos: 45,
      });

      expect(mockUpdateSet).toHaveBeenCalledWith({
        payload: { session_id: 'sess-a', segundos: 45 },
        descricao: 'Tempo ativo na prévia da proposta',
      });
      expect(mockLogEvent).not.toHaveBeenCalled();
    });

    it('não duplica marcos de scroll na mesma sessão', async () => {
      mockSelectLimit
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ id: 2 }]);

      await registrarEventosCinematicos(10, {
        session_id: 'sess-b',
        scroll: { percentual_max: 60, marcos: [25, 50] },
      });

      await registrarEventosCinematicos(10, {
        session_id: 'sess-b',
        scroll: { percentual_max: 60, marcos: [25, 50] },
      });

      const scrollCalls = mockLogEvent.mock.calls.filter((c) => c[1] === 'scroll_profundidade');
      expect(scrollCalls).toHaveLength(2);
      expect(scrollCalls[0][3]).toMatchObject({ marco: 25 });
      expect(scrollCalls[1][3]).toMatchObject({ marco: 50 });
    });

    it('exige session_id', async () => {
      await expect(registrarEventosCinematicos(1, { session_id: '' })).rejects.toThrow(
        'session_id obrigatório',
      );
    });
  });
});
