/**
 * Testes de integração - APIs do Proprietário
 * Valida GET /api/v1/proprietor/* com token de autenticação.
 */
const request = require('supertest');
const { app } = require('../../src/server');

const LOGIN_EMAIL = process.env.TEST_LOGIN_EMAIL || 'admin@test.com';
const LOGIN_PASSWORD = process.env.TEST_LOGIN_PASSWORD || 'password123';

describe('Proprietor API Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    authToken = 'admin-token';
    try {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD });
      if (loginRes.status === 200 && loginRes.body) {
        const tok = loginRes.body.token || loginRes.body.access_token;
        if (tok) authToken = tok;
      }
    } catch (_) {
      // keep admin-token when running without DB or wrong credentials
    }
  });

  const authGet = (path) =>
    request(app)
      .get(path)
      .set('Authorization', `Bearer ${authToken}`);

  describe('GET /api/v1/proprietor/dashboard/stats', () => {
    it('deve retornar 200 e estrutura de stats', async () => {
      const res = await authGet('/api/v1/proprietor/dashboard/stats')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');

      const d = res.body.data;
      expect(typeof d.occupancyRate).toBe('number');
      expect(typeof d.revenueToday).toBe('number');
      expect(typeof d.activeAuctions).toBe('number');
      expect(typeof d.wonAuctions).toBe('number');
      expect(typeof d.totalRevenue).toBe('number');
      expect(typeof d.averageBidValue).toBe('number');
      expect(typeof d.conversionRate).toBe('number');
    });

    it('deve retornar 401 sem token', async () => {
      await request(app)
        .get('/api/v1/proprietor/dashboard/stats')
        .expect(401);
    });
  });

  describe('GET /api/v1/proprietor/auctions', () => {
    it('deve retornar 200 e data array (com paginação quando houver)', async () => {
      const res = await authGet('/api/v1/proprietor/auctions')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');

      const data = res.body.data;
      if (typeof data === 'object' && !Array.isArray(data) && data.data) {
        expect(Array.isArray(data.data)).toBe(true);
        if (data.pagination) {
          expect(typeof data.pagination.page).toBe('number');
          expect(typeof data.pagination.total).toBe('number');
        }
      } else if (Array.isArray(data)) {
        expect(Array.isArray(data)).toBe(true);
      }
    });

    it('deve aceitar query status', async () => {
      const res = await authGet('/api/v1/proprietor/auctions?status=active')
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/proprietor/revenue', () => {
    it('deve retornar 200 e total + byDay', async () => {
      const res = await authGet('/api/v1/proprietor/revenue?period=30d')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      const d = res.body.data;
      expect(typeof d.total).toBe('number');
      expect(Array.isArray(d.byDay)).toBe(true);
    });
  });

  describe('GET /api/v1/proprietor/occupancy', () => {
    it('deve retornar 200 e rate + byDay', async () => {
      const res = await authGet('/api/v1/proprietor/occupancy?period=30d')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      const d = res.body.data;
      expect(typeof d.rate).toBe('number');
      expect(Array.isArray(d.byDay)).toBe(true);
    });
  });

  describe('GET /api/v1/proprietor/revenue/trends', () => {
    it('deve retornar 200 e array', async () => {
      const res = await authGet('/api/v1/proprietor/revenue/trends?period=30d')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/proprietor/occupancy/trends', () => {
    it('deve retornar 200 e array', async () => {
      const res = await authGet('/api/v1/proprietor/occupancy/trends?period=30d')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/proprietor/auctions/performance', () => {
    it('deve retornar 200 e byStatus + wonVsLost', async () => {
      const res = await authGet('/api/v1/proprietor/auctions/performance')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      const d = res.body.data;
      expect(Array.isArray(d.byStatus)).toBe(true);
      expect(d).toHaveProperty('wonVsLost');
      expect(typeof d.wonVsLost.won).toBe('number');
      expect(typeof d.wonVsLost.lost).toBe('number');
    });
  });
});
