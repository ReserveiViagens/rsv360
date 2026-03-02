/**
 * Testes de API para Revenue Forecast
 */

import { NextRequest } from 'next/server';
import { GET } from '../revenue-forecast/route';

jest.mock('@/lib/advanced-auth', () => ({
  advancedAuthMiddleware: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  queryDatabase: jest.fn(),
}));

import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { queryDatabase } from '@/lib/db';

describe('GET /api/analytics/revenue-forecast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar previsão de receita', async () => {
    (advancedAuthMiddleware as jest.Mock).mockResolvedValue({
      user: { id: 1, role: 'user' },
      error: null,
    });

    (queryDatabase as jest.Mock).mockResolvedValue([
      { month: '2024-01-01', revenue: '1000', bookings_count: '10' },
      { month: '2024-02-01', revenue: '1200', bookings_count: '12' },
    ]);

    const request = new NextRequest('http://localhost/api/analytics/revenue-forecast?months=12');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.forecasts).toBeDefined();
  });

  it('deve retornar 401 se não autenticado', async () => {
    (advancedAuthMiddleware as jest.Mock).mockResolvedValue({
      user: null,
      error: 'Não autenticado',
    });

    const request = new NextRequest('http://localhost/api/analytics/revenue-forecast');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });
});

