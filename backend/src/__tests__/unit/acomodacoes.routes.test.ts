const mockListar = jest.fn();
const mockAddons = jest.fn();

jest.mock('../../../../server/modules/acomodacoes/services/acomodacoes.service', () => ({
  acomodacoesService: {
    listarDisponiveis: (...args: unknown[]) => mockListar(...args),
    listarAddons: (...args: unknown[]) => mockAddons(...args),
  },
}));

jest.mock('../../../../server/middleware/public-limiter', () => ({
  publicLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import express from 'express';
import request from 'supertest';
import { registerAcomodacoesModule } from '../../../../server/modules/acomodacoes/index';

describe('GET /api/v1/acomodacoes/disponiveis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListar.mockResolvedValue({
      items: [
        {
          id: 1,
          titulo: 'Apto',
          quartos: 2,
          configSala: 'nenhum',
          configBanheiro: 'so_wc_social',
          capacidadeMax: 4,
          precoDiaria: 200,
          disponivel: true,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    mockAddons.mockResolvedValue([]);
  });

  it('retorna fallbackHotelUnico quando sem acomodações', async () => {
    mockListar.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 20 });
    const app = express();
    registerAcomodacoesModule(app);

    const res = await request(app).get(
      '/api/v1/acomodacoes/disponiveis?hotelId=h1&adults=2&children=0&perfil=casal',
    );

    expect(res.status).toBe(200);
    expect(res.body.data.fallbackHotelUnico).toBe(true);
    expect(res.body.data.cards).toEqual([]);
  });

  it('monta cards quando há acomodações completas', async () => {
    const app = express();
    registerAcomodacoesModule(app);

    const res = await request(app).get(
      '/api/v1/acomodacoes/disponiveis?hotelId=h1&adults=2&children=1&perfil=familia',
    );

    expect(res.status).toBe(200);
    expect(res.body.data.fallbackHotelUnico).toBe(false);
    expect(res.body.data.cards.length).toBeGreaterThan(0);
  });
});
