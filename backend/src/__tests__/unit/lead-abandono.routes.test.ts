const mockRegistrar = jest.fn();

jest.mock('../../../../server/modules/cotacao-publica/services/lead-abandono.service', () => ({
  registrarLeadAbandono: (...args: unknown[]) => mockRegistrar(...args),
}));

jest.mock('../../../../server/middleware/public-limiter', () => ({
  publicLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import express from 'express';
import request from 'supertest';
import { registerCotacaoPublicaModule } from '../../../../server/modules/cotacao-publica/index';

describe('POST /api/v1/cotacao-publica/lead-abandono', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegistrar.mockResolvedValue({
      id: 7,
      enviadoWhatsapp: false,
      analyticsOnly: true,
    });
  });

  it('aceita payload de abandono antes do passo 8', async () => {
    const app = express();
    app.use(express.json());
    registerCotacaoPublicaModule(app);

    const res = await request(app)
      .post('/api/v1/cotacao-publica/lead-abandono')
      .send({
        passo: 2,
        passoNome: 'Hotel',
        consentimentoLgpd: false,
        variant: 'contextual',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockRegistrar).toHaveBeenCalledWith(
      expect.objectContaining({
        passo: 2,
        consentimentoLgpd: false,
      }),
    );
  });

  it('rejeita passo inválido', async () => {
    const app = express();
    app.use(express.json());
    registerCotacaoPublicaModule(app);

    const res = await request(app)
      .post('/api/v1/cotacao-publica/lead-abandono')
      .send({ passo: 99 });

    expect(res.status).toBe(400);
  });
});
