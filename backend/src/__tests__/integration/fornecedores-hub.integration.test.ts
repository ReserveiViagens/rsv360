import request from 'supertest';
const { createApp } = require('../../../app');
import { applyTestMigrations, hasDatabase } from '../../test/fase1-db-setup';
import { authHeader, signStaffToken } from '../../test/fase1-test-helpers';

const describeDb = hasDatabase() ? describe : describe.skip;

describeDb('Fornecedores Hub — CRUD admin', () => {
  let app: any;
  let fornecedorId: string;

  beforeAll(async () => {
    process.env.FORNECEDORES_ENCRYPTION_KEY =
      process.env.FORNECEDORES_ENCRYPTION_KEY || 'integration-test-key-32-chars-min!!';
    process.env.REDIS_DISABLED = process.env.REDIS_DISABLED ?? 'true';
    applyTestMigrations();
    app = await createApp();
  });

  afterAll(async () => {
    const { disconnectRedisCache } = await import(
      '../../../../server/modules/fornecedores-hub/cache'
    );
    const { disconnectRedisConnection } = await import(
      '../../../../server/modules/fornecedores-hub/redis-connection'
    );
    const { closeReservasQueue } = await import(
      '../../../../server/modules/fornecedores-hub/reservas.queue'
    );
    const { closeDbPool } = await import('../../db/drizzle');
    await disconnectRedisCache();
    await disconnectRedisConnection().catch(() => undefined);
    await closeReservasQueue().catch(() => undefined);
    await closeDbPool();
  });

  it('GET /health sem auth', async () => {
    const res = await request(app).get('/api/v1/fornecedores-api/health');
    expect(res.status).toBe(200);
    expect(res.body.module).toBe('fornecedores-hub');
  });

  it('nega listagem sem role admin', async () => {
    const res = await request(app)
      .get('/api/v1/fornecedores-api')
      .set(authHeader(signStaffToken({ role: 'user' })));
    expect(res.status).toBe(403);
  });

  it('cria e lista fornecedor API (admin)', async () => {
    const create = await request(app)
      .post('/api/v1/fornecedores-api')
      .set(authHeader())
      .send({
        nome: 'Trend Test',
        tipo: 'hospedagem',
        endpoint: 'https://api.example.test',
        apiKey: 'test-key',
        adapter: 'generic-hotel',
        prioridade: 10,
        timeoutMs: 3000,
        ativo: true,
      });
    expect(create.status).toBe(201);
    fornecedorId = create.body.data.id;
    expect(fornecedorId).toBeTruthy();
    expect(create.body.data.apiKey).toBeUndefined();
    expect(create.body.data.hasApiKey).toBe(true);

    const list = await request(app).get('/api/v1/fornecedores-api').set(authHeader());
    expect(list.status).toBe(200);
    const found = list.body.data.find((f: { id: string }) => f.id === fornecedorId);
    expect(found).toBeTruthy();
    expect(found.apiKey).toBeUndefined();
    expect(found.hasApiKey).toBe(true);
  });

  it('PATCH atualiza fornecedor API', async () => {
    const patch = await request(app)
      .patch(`/api/v1/fornecedores-api/${fornecedorId}`)
      .set(authHeader())
      .send({ ativo: false, prioridade: 99 });
    expect(patch.status).toBe(200);
    expect(patch.body.data.ativo).toBe(false);
    expect(patch.body.data.prioridade).toBe(99);
  });
});
