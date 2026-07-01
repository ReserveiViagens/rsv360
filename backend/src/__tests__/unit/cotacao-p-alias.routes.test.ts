const mockGetProposta = jest.fn();

jest.mock('../../../../server/modules/cotacao-publica/services/cotacao-publica.service', () => ({
  cotacaoPublicaService: {
    getPropostaByToken: (...args: unknown[]) => mockGetProposta(...args),
  },
}));

jest.mock('../../../../server/middleware/public-limiter', () => ({
  publicLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import express from 'express';
import request from 'supertest';
import { registerCotacaoPublicaModule } from '../../../../server/modules/cotacao-publica/index';

describe('GET /api/v1/p/:token', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProposta.mockResolvedValue({
      id: 26,
      titulo: 'Teste',
      status: 'sent',
      tokenPublico: 'rt-abc',
    });
  });

  it('retorna proposta pelo alias curto /p', async () => {
    const app = express();
    registerCotacaoPublicaModule(app);

    const res = await request(app).get('/api/v1/p/rt-abc');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(26);
    expect(mockGetProposta).toHaveBeenCalledWith('rt-abc');
  });
});
