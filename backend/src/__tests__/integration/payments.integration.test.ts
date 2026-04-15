import request from 'supertest';
const { createApp } = require('../../../app');

describe('Payments Integration', () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  it('cria e consulta pagamento', async () => {
    const createResponse = await request(app)
      .post('/api/v1/payments/payments')
      .send({
        enterpriseId: 'ent_1',
        amount: 150,
        currency: 'BRL',
        customerId: 'cus_1',
        paymentMethod: 'pix',
      });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.id).toContain('pay_mock_');

    const getResponse = await request(app)
      .get(`/api/v1/payments/payments/${createResponse.body.id}`)
      .query({ enterpriseId: 'ent_1' });

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(createResponse.body.id);
  });

  it('lista pagamentos e pix', async () => {
    const paymentsResponse = await request(app)
      .get('/api/v1/payments/payments')
      .query({ enterpriseId: 'ent_1' });

    expect(paymentsResponse.status).toBe(200);
    expect(Array.isArray(paymentsResponse.body.data)).toBe(true);

    const pixResponse = await request(app).get('/api/v1/payments/pix');
    expect(pixResponse.status).toBe(200);
    expect(Array.isArray(pixResponse.body)).toBe(true);
  });

  it('cria e atualiza cliente', async () => {
    const createResponse = await request(app)
      .post('/api/v1/payments/customers')
      .send({ enterpriseId: 'ent_1', email: 'test@rsv360.com', name: 'Tester' });

    expect(createResponse.status).toBe(200);

    const updateResponse = await request(app)
      .put(`/api/v1/payments/customers/${createResponse.body.id}`)
      .send({ name: 'Tester Updated' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('Tester Updated');
  });
});
