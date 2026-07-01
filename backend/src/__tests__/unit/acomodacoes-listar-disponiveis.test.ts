const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockOffset = jest.fn();

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => {
      mockSelect(...args);
      return { from: mockFrom };
    },
  },
}));

jest.mock('../../../../backend/src/db/schema/acomodacoes', () => ({
  acomodacoes: {
    hotelId: 'hotel_id',
    ativo: 'ativo',
    statusPublicacao: 'status_publicacao',
    capacidadeMax: 'capacidade_max',
    precoDiaria: 'preco_diaria',
    id: 'id',
    titulo: 'titulo',
    quartos: 'quartos',
    configSala: 'config_sala',
    configBanheiro: 'config_banheiro',
  },
}));

jest.mock('drizzle-orm', () => ({
  and: jest.fn((...args: unknown[]) => args),
  eq: jest.fn((col: unknown, val: unknown) => ({ col, val })),
  asc: jest.fn((col: unknown) => col),
  desc: jest.fn((col: unknown) => col),
  sql: jest.fn(),
}));

import { acomodacoesService } from '../../../../server/modules/acomodacoes/services/acomodacoes.service';
import { eq } from 'drizzle-orm';
import { acomodacoes } from '../../../../backend/src/db/schema/acomodacoes';

describe('acomodacoesService.listarDisponiveis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOffset.mockResolvedValue([]);
    mockLimit.mockReturnValue({ offset: mockOffset });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect
      .mockReturnValueOnce({ from: mockFrom })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ count: 0 }]),
        }),
      });
  });

  it('filtra por status_publicacao=publicado (não dados_completos)', async () => {
    await acomodacoesService.listarDisponiveis({ hotelId: 'hotel-demo', hospedes: 2 });

    const eqCalls = (eq as jest.Mock).mock.calls;
    expect(eqCalls).toContainEqual([acomodacoes.statusPublicacao, 'publicado']);
  });
});
