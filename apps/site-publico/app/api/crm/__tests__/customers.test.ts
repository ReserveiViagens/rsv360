/**
 * Testes de API - CRM Customers Endpoints
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../customers/route';

// Mock das dependências
jest.mock('@/lib/db', () => ({
  queryDatabase: jest.fn(),
}));

jest.mock('@/lib/advanced-auth', () => ({
  advancedAuthMiddleware: jest.fn(),
}));

import { queryDatabase } from '@/lib/db';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

describe('API /api/crm/customers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (advancedAuthMiddleware as jest.Mock).mockResolvedValue({
      user: { id: 1, email: 'admin@example.com' },
      error: null,
    });
  });

  describe('GET /api/crm/customers', () => {
    it('deve retornar lista de clientes com sucesso', async () => {
      const mockCustomers = [
        {
          id: 1,
          user_name: 'João Silva',
          loyalty_tier: 'gold',
          total_spent: 5000,
        },
      ];

      (queryDatabase as jest.Mock).mockResolvedValueOnce(mockCustomers);
      (queryDatabase as jest.Mock).mockResolvedValueOnce([{ count: '1' }]);

      const request = new NextRequest('http://localhost:3000/api/crm/customers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('deve retornar erro 401 quando não autenticado', async () => {
      (advancedAuthMiddleware as jest.Mock).mockResolvedValueOnce({
        user: null,
        error: 'Não autenticado',
      });

      const request = new NextRequest('http://localhost:3000/api/crm/customers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('deve aplicar filtros corretamente', async () => {
      (queryDatabase as jest.Mock).mockResolvedValueOnce([]);
      (queryDatabase as jest.Mock).mockResolvedValueOnce([{ count: '0' }]);

      const request = new NextRequest(
        'http://localhost:3000/api/crm/customers?loyalty_tier=gold&min_total_spent=1000'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(queryDatabase).toHaveBeenCalled();
    });
  });

  describe('POST /api/crm/customers', () => {
    it('deve criar cliente com sucesso', async () => {
      const mockCustomer = {
        id: 1,
        user_id: 1,
        loyalty_tier: 'bronze',
        total_spent: 0,
      };

      (queryDatabase as jest.Mock).mockResolvedValueOnce([mockCustomer]);

      const request = new NextRequest('http://localhost:3000/api/crm/customers', {
        method: 'POST',
        body: JSON.stringify({
          user_id: 1,
          loyalty_tier: 'bronze',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('deve retornar erro 400 quando dados inválidos', async () => {
      const request = new NextRequest('http://localhost:3000/api/crm/customers', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});

