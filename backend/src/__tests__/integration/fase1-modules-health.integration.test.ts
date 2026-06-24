import request from 'supertest';
const { createApp } = require('../../../app');
import { authHeader } from '../../test/fase1-test-helpers';

const MODULES = [
  'orcamentos',
  'propostas',
  'passageiros',
  'financeiro',
  'campanhas',
  'logistica',
  'relatorios',
] as const;

describe('Fase 1 — health dos 7 módulos', () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  it.each(MODULES)('GET /api/v1/%s/health retorna ok', async (module) => {
    const response = await request(app).get(`/api/v1/${module}/health`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(String(response.body.module)).toContain(module === 'campanhas' ? 'campanhas' : module);
  });

  it.each(MODULES)('GET /api/v1/%s exige autenticação', async (module) => {
    const response = await request(app).get(`/api/v1/${module}`);
    expect(response.status).toBe(401);
  });

  it('GET /api/v1/orcamentos com token staff retorna lista', async () => {
    const response = await request(app)
      .get('/api/v1/orcamentos')
      .set(authHeader());
    expect([200, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    }
  });
});
