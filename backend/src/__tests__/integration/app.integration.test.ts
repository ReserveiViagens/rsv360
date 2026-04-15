import request from 'supertest';
const { createApp } = require('../../../app');

describe('App Integration', () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  it('retorna health check ativo', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('retorna 404 em rota inexistente', async () => {
    const response = await request(app).get('/rota/inexistente');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Route not found');
  });
});
