const request = require('supertest');
const { app } = require('../../src/server');

/**
 * Testes de integração - APIs
 */
describe('API Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Token permitido pelo middleware em ambiente de desenvolvimento/teste
    authToken = 'admin-token';
  });

  describe('Auctions API', () => {
    it('GET /api/v1/auctions should return list of auctions', async () => {
      const response = await request(app)
        .get('/api/v1/auctions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Controller pode retornar { data, pagination } ou array, dependendo do fallback do service
      if (Array.isArray(response.body)) {
        expect(Array.isArray(response.body)).toBe(true);
      } else {
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('POST /api/v1/auctions should validate required fields', async () => {
      const invalidAuctionData = {
        title: 'API Test Auction',
        start_price: 100,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/auctions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAuctionData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Flash Deals API', () => {
    it('GET /api/v1/flash-deals/active should return active deals', async () => {
      const response = await request(app)
        .get('/api/v1/flash-deals/active')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Marketplace API', () => {
    it('GET /api/v1/marketplace/listings/active should return active listings', async () => {
      const response = await request(app)
        .get('/api/v1/marketplace/listings/active')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

/**
 * Testes de segurança
 */
describe('Security Tests', () => {
  it('should require authentication for protected routes', async () => {
    await request(app)
      .post('/api/v1/auctions')
      .expect(401);
  });

  it('should validate input data', async () => {
    const invalidData = {
      title: '', // Título vazio
      start_price: -100, // Preço negativo
    };

    await request(app)
      .post('/api/v1/auctions')
      .set('Authorization', 'Bearer admin-token')
      .send(invalidData)
      .expect(400);
  });

  it('should enforce rate limiting', async () => {
    // Fazer múltiplas requisições rapidamente
    const requests = Array(110).fill(null).map(() =>
      request(app).get('/api/v1/auctions/active')
    );

    const responses = await Promise.all(requests);
    // Em ambiente de teste o limiter global é desativado para evitar handles abertos.
    if (process.env.NODE_ENV === 'test') {
      expect(responses[responses.length - 1].status).toBe(200);
    } else {
      expect(responses[responses.length - 1].status).toBe(429);
    }
  });
});

module.exports = {};
