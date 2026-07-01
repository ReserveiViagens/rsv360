const mockResolve = jest.fn();
const mockRegistrar = jest.fn();

jest.mock('../../../../server/modules/propostas/services/proposta-cinematic-events.service', () => ({
  resolvePropostaPublicaByToken: (...args: unknown[]) => mockResolve(...args),
  registrarEventosCinematicos: (...args: unknown[]) => mockRegistrar(...args),
}));

jest.mock('../../../../server/middleware/public-limiter', () => ({
  publicLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import express from 'express';
import request from 'supertest';
import { registerPropostasModule } from '../../../../server/modules/propostas/index';

describe('POST /api/v1/propostas/:token/eventos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegistrar.mockResolvedValue({ propostaId: 7, eventos: ['tempo_pagina'] });
  });

  it('retorna 404 para token inválido', async () => {
    mockResolve.mockResolvedValue({ kind: 'not_found' });

    const app = express();
    app.use(express.json());
    registerPropostasModule(app);

    const res = await request(app)
      .post('/api/v1/propostas/rt-missing/eventos')
      .send({ session_id: 's1', tempo_pagina_segundos: 10 });

    expect(res.status).toBe(404);
    expect(mockRegistrar).not.toHaveBeenCalled();
  });

  it('retorna 403 quando proposta não é pública', async () => {
    mockResolve.mockResolvedValue({ kind: 'forbidden' });

    const app = express();
    app.use(express.json());
    registerPropostasModule(app);

    const res = await request(app)
      .post('/api/v1/propostas/rt-private/eventos')
      .send({ session_id: 's1' });

    expect(res.status).toBe(403);
  });

  it('grava eventos para token válido', async () => {
    mockResolve.mockResolvedValue({ kind: 'ok', propostaId: 7 });

    const app = express();
    app.use(express.json());
    registerPropostasModule(app);

    const res = await request(app)
      .post('/api/v1/propostas/rt-valid/eventos')
      .send({
        session_id: 'sess-1',
        tempo_pagina_segundos: 18,
        scroll: { percentual_max: 50, marcos: [25, 50] },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockRegistrar).toHaveBeenCalledWith(7, {
      session_id: 'sess-1',
      tempo_pagina_segundos: 18,
      scroll: { percentual_max: 50, marcos: [25, 50] },
    });
  });

  it('rejeita id numérico como token', async () => {
    const app = express();
    app.use(express.json());
    registerPropostasModule(app);

    const res = await request(app)
      .post('/api/v1/propostas/42/eventos')
      .send({ session_id: 's1' });

    expect(res.status).toBe(400);
    expect(mockResolve).not.toHaveBeenCalled();
  });
});
