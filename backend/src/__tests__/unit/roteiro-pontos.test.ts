const mockOrderBy = jest.fn();
const mockWhere = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();

function chainRows(rows: unknown[]) {
  const chain = {
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: jest.fn().mockResolvedValue(rows),
    then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
      Promise.resolve(rows).then(resolve, reject),
  };
  mockWhere.mockReturnValue(chain);
  mockOrderBy.mockResolvedValue(rows);
  mockFrom.mockReturnValue(chain);
  return chain;
}

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => {
      mockSelect(...args);
      return { from: mockFrom };
    },
  },
}));

jest.mock('../../../../backend/src/db/schema/roteiro-pontos', () => ({
  roteiroPontos: {
    id: 'id',
    hotelId: 'hotel_id',
    tipo: 'tipo',
    titulo: 'titulo',
    descricao: 'descricao',
    lat: 'lat',
    lng: 'lng',
    dia: 'dia',
    ordem: 'ordem',
    ativo: 'ativo',
  },
}));

jest.mock('../../../../backend/src/db/schema/empreendimentos', () => ({
  empreendimentos: { id: 'id', hotelId: 'hotel_id' },
}));

jest.mock('../../../../backend/src/db/schema/propostas', () => ({
  propostas: {
    tokenPublico: 'token_publico',
    isPublica: 'is_publica',
    status: 'status',
    metadata: 'metadata',
    conteudo: 'conteudo',
  },
}));

jest.mock('../../../../server/modules/acomodacoes/services/resolve-hotel-id', () => ({
  resolverHotelIdParaAcomodacoes: jest.fn().mockResolvedValue('piazza-diroma'),
}));

jest.mock('drizzle-orm', () => ({
  and: (...args: unknown[]) => args,
  asc: (col: unknown) => col,
  eq: (...args: unknown[]) => args,
}));

import {
  calcularBounds,
  getPontosByToken,
  listarPontos,
} from '../../../../server/modules/roteiro/roteiro-pontos.service';

const propostaPaga = {
  isPublica: true,
  status: 'paid',
  metadata: { hotelId: 'piazza-diroma' },
  conteudo: { inclusions: { hotel: 'Piazza diRoma' } },
};

const pontosDb = [
  {
    id: 2,
    tipo: 'parque',
    titulo: 'Hot Park',
    descricao: 'Dia 2',
    lat: '-17.750000',
    lng: '-48.630000',
    dia: 2,
    ordem: 1,
  },
  {
    id: 1,
    tipo: 'hospedagem',
    titulo: 'Hotel',
    descricao: null,
    lat: '-17.744000',
    lng: '-48.624000',
    dia: 1,
    ordem: 0,
  },
];

describe('roteiro-pontos.service (PR 25)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    let call = 0;
    mockFrom.mockImplementation(() => {
      call += 1;
      if (call === 1) return chainRows([propostaPaga]);
      if (call === 2) return chainRows([{ id: 7 }]);
      return chainRows(pontosDb);
    });
  });

  it('listarPontos filtra ativo=false e ordena por dia,ordem', async () => {
    mockFrom.mockImplementation(() => chainRows(pontosDb));

    const pontos = await listarPontos(7);

    expect(mockWhere).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();
    expect(pontos).toHaveLength(2);
    expect(pontos[0]?.dia).toBe(2);
    expect(pontos[1]?.dia).toBe(1);
  });

  it('calcularBounds retorna min/max corretos', () => {
    const bounds = calcularBounds([
      { lat: -17.75, lng: -48.63 },
      { lat: -17.744, lng: -48.624 },
      { lat: -17.748, lng: -48.628 },
    ]);

    expect(bounds).toEqual({
      minLat: -17.75,
      maxLat: -17.744,
      minLng: -48.63,
      maxLng: -48.624,
    });
  });

  it('getPontosByToken retorna 403 quando status não é accepted/paid', async () => {
    mockFrom.mockImplementation(() =>
      chainRows([
        {
          isPublica: true,
          status: 'sent',
          metadata: { hotelId: 'piazza-diroma' },
          conteudo: {},
        },
      ]),
    );

    const result = await getPontosByToken('rt-sent');
    expect(result).toEqual({ kind: 'forbidden', propostaStatus: 'sent' });
  });

  it('getPontosByToken retorna lista vazia 200 quando não há pontos', async () => {
    let call = 0;
    mockFrom.mockImplementation(() => {
      call += 1;
      if (call === 1) return chainRows([propostaPaga]);
      if (call === 2) return chainRows([{ id: 7 }]);
      return chainRows([]);
    });

    const result = await getPontosByToken('rt-paga');
    expect(result).toEqual({
      kind: 'ok',
      data: { pontos: [], bounds: null },
    });
  });
});
