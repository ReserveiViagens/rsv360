import type { AcomodacaoDisponivel } from '@rsv360/shared';
import { montarCardsPasso2, resolverCardsEtapaA } from '@rsv360/shared';
import { mergeDisponiveisParaCards } from '../../../../server/modules/acomodacoes/services/acomodacoes.service';

const mockListar = jest.fn();
const mockListarPins = jest.fn();

jest.mock('../../../../server/modules/acomodacoes/services/acomodacoes.service', () => {
  const actual = jest.requireActual(
    '../../../../server/modules/acomodacoes/services/acomodacoes.service',
  );
  return {
    ...actual,
    acomodacoesService: {
      listarDisponiveis: (...args: unknown[]) => mockListar(...args),
      listarPinsPublicadosPorCodigo: (...args: unknown[]) => mockListarPins(...args),
      listarAddons: jest.fn(),
    },
  };
});

jest.mock('../../../../server/middleware/public-limiter', () => ({
  publicLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import express from 'express';
import request from 'supertest';
import { registerAcomodacoesModule } from '../../../../server/modules/acomodacoes/index';

function disp(
  partial: Partial<AcomodacaoDisponivel> & { id: number; codigoExterno?: string },
): AcomodacaoDisponivel {
  return {
    titulo: partial.titulo ?? `Unit ${partial.id}`,
    quartos: partial.quartos ?? 1,
    configSala: partial.configSala ?? 'nenhum',
    configBanheiro: partial.configBanheiro ?? 'so_wc_social',
    capacidadeMax: partial.capacidadeMax ?? 4,
    precoDiaria: partial.precoDiaria ?? 120,
    hotelId: partial.hotelId ?? 'lacqua-diroma',
    disponivel: true,
    ...partial,
  };
}

const paginaSemKn39h = Array.from({ length: 20 }, (_, i) =>
  disp({
    id: 100 + i,
    codigoExterno: `OTHER-${i}`,
    precoDiaria: 120,
    capacidadeMax: 5,
  }),
);

const kn39h = disp({
  id: 27,
  codigoExterno: 'KN39H',
  titulo: 'Lacqua diRoma IV Apto 196',
  precoDiaria: 200,
  capacidadeMax: 5,
  configBanheiro: 'so_suite',
  configSala: 'cama_na_sala',
});

describe('mergeDisponiveisParaCards', () => {
  it('inclui pin fora da pagina sem duplicar id', () => {
    const pagina = [disp({ id: 1, precoDiaria: 200 }), disp({ id: 2 })];
    const pins = [kn39h, disp({ id: 1, precoDiaria: 999 })];
    const merged = mergeDisponiveisParaCards(pagina, pins);
    expect(merged).toHaveLength(3);
    expect(merged.find((u) => u.id === 27)?.precoDiaria).toBe(200);
    expect(merged.find((u) => u.id === 1)?.precoDiaria).toBe(200);
  });
});

describe('resolverCardsEtapaA — pin fora da pagina (lacqua)', () => {
  it('casal @ lacqua-diroma com KN39H apenas no merge => Entrada R$200', () => {
    const cardInput = mergeDisponiveisParaCards(paginaSemKn39h, [kn39h]);
    const cards = resolverCardsEtapaA('lacqua-diroma', 'casal', 2, 0, cardInput);
    expect(cards[0].acomodacao.codigoExterno).toBe('KN39H');
    expect(cards[0].acomodacao.precoDiaria).toBe(200);
    expect(cards[0].arquetipo.label).toBe('Entrada');
  });

  it('pin reprovado no filtro (capacidade) => fallback sem erro', () => {
    const cards = resolverCardsEtapaA('lacqua-diroma', 'casal', 2, 0, paginaSemKn39h);
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].acomodacao.codigoExterno).not.toBe('KN39H');
  });

  it('hotel nao-ancora => montarCardsPasso2 identico ao legado', () => {
    const disponiveis = [disp({ id: 1, hotelId: 'hotel-generico', precoDiaria: 300 })];
    const withHotel = montarCardsPasso2('casal', 2, 0, disponiveis, 'hotel-generico');
    const withoutHotel = montarCardsPasso2('casal', 2, 0, disponiveis);
    expect(withHotel).toEqual(withoutHotel);
  });
});

describe('GET /api/v1/acomodacoes/disponiveis — pins Etapa A x paginacao', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListarPins.mockResolvedValue([kn39h]);
  });

  it('lacqua pagina 1: cards KN39H Entrada 200; listagem paginada inalterada', async () => {
    mockListar.mockResolvedValue({
      items: paginaSemKn39h,
      total: 54,
      page: 1,
      pageSize: 20,
    });

    const app = express();
    registerAcomodacoesModule(app);

    const res = await request(app).get(
      '/api/v1/acomodacoes/disponiveis?hotelId=lacqua-diroma&hospedes=2&adults=2&children=0&perfil=casal&page=1',
    );

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(20);
    expect(res.body.data.total).toBe(54);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.cards[0].acomodacao.codigoExterno).toBe('KN39H');
    expect(res.body.data.cards[0].acomodacao.precoDiaria).toBe(200);
    expect(res.body.data.cards[0].arquetipo.label).toBe('Entrada');
    expect(mockListarPins).toHaveBeenCalledWith(
      expect.objectContaining({
        hotelId: 'lacqua-diroma',
        codigosExternos: ['KN39H'],
        hospedes: 2,
      }),
    );
  });

  it('hotel nao-ancora nao chama listarPinsPublicadosPorCodigo', async () => {
    mockListar.mockResolvedValue({
      items: [disp({ id: 1, hotelId: 'hotel-generico' })],
      total: 1,
      page: 1,
      pageSize: 20,
    });

    const app = express();
    registerAcomodacoesModule(app);

    const res = await request(app).get(
      '/api/v1/acomodacoes/disponiveis?hotelId=hotel-generico&adults=2&children=0&perfil=casal',
    );

    expect(res.status).toBe(200);
    expect(mockListarPins).not.toHaveBeenCalled();
  });

  it('pin ausente na query => fallback por relevancia', async () => {
    mockListar.mockResolvedValue({
      items: paginaSemKn39h,
      total: 54,
      page: 1,
      pageSize: 20,
    });
    mockListarPins.mockResolvedValueOnce([]);

    const app = express();
    registerAcomodacoesModule(app);

    const res = await request(app).get(
      '/api/v1/acomodacoes/disponiveis?hotelId=lacqua-diroma&adults=2&children=0&perfil=casal',
    );

    expect(res.status).toBe(200);
    expect(res.body.data.cards.length).toBeGreaterThan(0);
    expect(res.body.data.cards[0].acomodacao.codigoExterno).not.toBe('KN39H');
  });
});
