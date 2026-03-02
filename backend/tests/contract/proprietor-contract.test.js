const request = require('supertest');
const { app } = require('../../src/server');

describe('Proprietor API Contract Tests', () => {
  const authHeader = { Authorization: 'Bearer admin-token' };

  it('GET /api/v1/proprietor/dashboard/stats mantém contrato esperado', async () => {
    const res = await request(app)
      .get('/api/v1/proprietor/dashboard/stats')
      .set(authHeader)
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          occupancyRate: expect.any(Number),
          revenueToday: expect.any(Number),
          activeAuctions: expect.any(Number),
          wonAuctions: expect.any(Number),
          totalRevenue: expect.any(Number),
          averageBidValue: expect.any(Number),
          conversionRate: expect.any(Number),
        }),
      })
    );
  });

  it('GET /api/v1/proprietor/revenue/trends mantém contrato esperado', async () => {
    const res = await request(app)
      .get('/api/v1/proprietor/revenue/trends?period=30d')
      .set(authHeader)
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.any(Array),
      })
    );

    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          date: expect.anything(),
          revenue: expect.any(Number),
        })
      );
    }
  });
});
