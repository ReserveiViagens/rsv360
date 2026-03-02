/**
 * Testes de API - CRM Segments Endpoints
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../segments/route';

// Mock das dependências
jest.mock('@/lib/db', () => ({
  queryDatabase: jest.fn(),
}));

jest.mock('@/lib/advanced-auth', () => ({
  advancedAuthMiddleware: jest.fn(),
}));

import { queryDatabase } from '@/lib/db';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

describe('API /api/crm/segments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (advancedAuthMiddleware as jest.Mock).mockResolvedValue({
      user: { id: 1, email: 'admin@example.com' },
      error: null,
    });
  });

  describe('GET /api/crm/segments', () => {
    it('deve retornar lista de segmentos com sucesso', async () => {
      const mockSegments = [
        {
          id: 1,
          name: 'VIP',
          customer_count: 10,
          is_active: true,
        },
      ];

      (queryDatabase as jest.Mock).mockResolvedValueOnce(mockSegments);

      const request = new NextRequest('http://localhost:3000/api/crm/segments');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });
  });

  describe('POST /api/crm/segments', () => {
    it('deve criar segmento com sucesso', async () => {
      const mockSegment = {
        id: 1,
        name: 'VIP',
        criteria: { min_bookings: 5 },
        customer_count: 0,
      };

      (queryDatabase as jest.Mock).mockResolvedValueOnce([mockSegment]);

      const request = new NextRequest('http://localhost:3000/api/crm/segments', {
        method: 'POST',
        body: JSON.stringify({
          name: 'VIP',
          criteria: { min_bookings: 5 },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('deve validar schema Zod corretamente', async () => {
      const request = new NextRequest('http://localhost:3000/api/crm/segments', {
        method: 'POST',
        body: JSON.stringify({
          // Dados inválidos - falta 'name'
          criteria: {},
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});

