const mockIsAtivo = jest.fn();
const mockObterConfig = jest.fn();

jest.mock('../../../../server/modules/agentes/config.service', () => ({
  AgentesConfigService: {
    isModuloAtivo: () => mockIsAtivo(),
    obterConfig: () => mockObterConfig(),
  },
}));

import express from 'express';
import request from 'supertest';
import agentesRouter from '../../../../server/modules/agentes/routes/index';

describe('Agentes routes — flag gate', () => {
  const app = express();
  app.use('/api/v1/agentes', agentesRouter);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('flag OFF: /health e /config respondem 404 desligado', async () => {
    mockIsAtivo.mockResolvedValue(false);

    const health = await request(app).get('/api/v1/agentes/health');
    expect(health.status).toBe(404);
    expect(health.body.error).toMatch(/desligado/i);

    const config = await request(app).get('/api/v1/agentes/config');
    expect(config.status).toBe(404);
  });

  it('flag ON: health/config respondem', async () => {
    mockIsAtivo.mockResolvedValue(true);
    mockObterConfig.mockResolvedValue({
      agentesModuloAtivo: true,
      agenteInstrutorAtivo: false,
      limiarSemanticoHit: 0.92,
      limiarSemanticoVerificar: 0.85,
      ttlCacheInstitucionalDias: 7,
      ttlCacheCatalogoHoras: 24,
      modeloT1: 'gpt-4o-mini',
      modeloEmbedding: 'text-embedding-3-small',
      ragTopK: 4,
    });

    const health = await request(app).get('/api/v1/agentes/health');
    expect(health.status).toBe(200);
    expect(health.body).toEqual({ module: 'agentes', status: 'ok' });

    const config = await request(app).get('/api/v1/agentes/config');
    expect(config.status).toBe(200);
    expect(config.body.success).toBe(true);
    expect(config.body.data.agentes_modulo_ativo).toBe(true);
    expect(config.body.data.limiar_semantico_hit).toBe(0.92);
  });
});
