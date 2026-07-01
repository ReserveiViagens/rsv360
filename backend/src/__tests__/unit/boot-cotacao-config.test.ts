import express from 'express';
import request from 'supertest';
import { registerCotacaoPublicaModule } from '../../../../server/modules/cotacao-publica/index';
import { registerConfiguracoesModule } from '../../../../server/modules/configuracoes/index';

describe('PR 21.0 — boot cotacao-publica + configuracoes', () => {
  it('GET /api/v1/cotacao-publica/health retorna 200', async () => {
    const app = express();
    registerCotacaoPublicaModule(app);

    const res = await request(app).get('/api/v1/cotacao-publica/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ module: 'cotacao-publica', status: 'ok' });
  });

  it('registerConfiguracoesModule monta rota /api/v1/configuracoes/health', async () => {
    const app = express();
    registerConfiguracoesModule(app);

    const res = await request(app).get('/api/v1/configuracoes/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ module: 'configuracoes', status: 'ok' });
  });
});
