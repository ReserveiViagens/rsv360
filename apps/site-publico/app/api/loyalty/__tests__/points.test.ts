/**
 * Testes de API para endpoints de Loyalty Points
 */

import { NextRequest } from 'next/server';
import { GET } from '../points/route';

// Mock do advancedAuthMiddleware
jest.mock('@/lib/advanced-auth', () => ({
  advancedAuthMiddleware: jest.fn(),
}));

// Mock do loyalty-service
jest.mock('@/lib/loyalty-service', () => ({
  getOrCreateLoyaltyPoints: jest.fn(),
}));

import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { getOrCreateLoyaltyPoints } from '@/lib/loyalty-service';

describe('GET /api/loyalty/points', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar pontos do usuário autenticado', async () => {
    (advancedAuthMiddleware as jest.Mock).mockResolvedValue({
      user: { id: 1, role: 'user' },
      error: null,
    });

    (getOrCreateLoyaltyPoints as jest.Mock).mockResolvedValue({
      id: 1,
      user_id: 1,
      current_points: 5000,
      tier: 'gold',
    });

    const request = new NextRequest('http://localhost/api/loyalty/points');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.current_points).toBe(5000);
  });

  it('deve retornar 401 se não autenticado', async () => {
    (advancedAuthMiddleware as jest.Mock).mockResolvedValue({
      user: null,
      error: 'Não autenticado',
    });

    const request = new NextRequest('http://localhost/api/loyalty/points');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });
});

