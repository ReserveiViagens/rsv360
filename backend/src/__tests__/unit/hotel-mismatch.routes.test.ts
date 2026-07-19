jest.mock('../../../../server/modules/cotacao-publica/services/cotacao-publica.service', () => ({
  cotacaoPublicaService: {
    gerarProposta: jest.fn(),
  },
}));

jest.mock('../../../../server/middleware/turnstile.middleware', () => ({
  requireTurnstile: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock('../../../../server/middleware/public-limiter', () => ({
  publicLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import express from 'express';
import request from 'supertest';
import cotacaoRouter from '../../../../server/modules/cotacao-publica/routes';
import { cotacaoPublicaService } from '../../../../server/modules/cotacao-publica/services/cotacao-publica.service';
import { HotelMismatchError } from '../../../../server/modules/cotacao-publica/services/assert-hotel-match-proposta';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/cotacao', cotacaoRouter);
  return app;
}

const validBody = {
  checkIn: '2026-09-01',
  checkOut: '2026-09-04',
  adults: 2,
  children: 0,
  name: 'Cliente Teste',
  phone: '62999999999',
  email: 'cliente@example.com',
  hotelId: 'piazza-diroma',
  selectedAcomodacaoId: 12,
};

describe('E2 — POST /gerar-proposta HOTEL_MISMATCH → 422', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mismatch → 422 + code HOTEL_MISMATCH', async () => {
    (cotacaoPublicaService.gerarProposta as jest.Mock).mockRejectedValueOnce(
      new HotelMismatchError(),
    );

    const res = await request(buildApp())
      .post('/api/v1/cotacao/gerar-proposta')
      .send(validBody);

    expect(res.status).toBe(422);
    expect(res.body).toMatchObject({
      success: false,
      code: 'HOTEL_MISMATCH',
      error: expect.stringMatching(/hotel/i),
    });
  });

  it('caminho feliz permanece 201', async () => {
    (cotacaoPublicaService.gerarProposta as jest.Mock).mockResolvedValueOnce({
      propostaId: 1,
      tokenPublico: 'tok',
    });

    const res = await request(buildApp())
      .post('/api/v1/cotacao/gerar-proposta')
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
