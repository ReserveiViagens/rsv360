import request from 'supertest';
import express from 'express';
import { enterpriseContextMiddleware } from '../../middleware/enterprise-context';
import { tenantRouter } from '../../api/v1/tenant/routes';

function buildTenantApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', enterpriseContextMiddleware);
  app.use('/api/v1/tenant', tenantRouter);
  return app;
}

describe('tenant v1 context', () => {
  const app = buildTenantApp();

  it('returns default enterpriseId', async () => {
    const response = await request(app).get('/api/v1/tenant/context');
    expect(response.status).toBe(200);
    expect(response.body.enterpriseId).toBe('ent_1');
  });

  it('reads X-Enterprise-Id header', async () => {
    const response = await request(app)
      .get('/api/v1/tenant/context')
      .set('X-Enterprise-Id', 'ent_42');
    expect(response.body.enterpriseId).toBe('ent_42');
  });
});
