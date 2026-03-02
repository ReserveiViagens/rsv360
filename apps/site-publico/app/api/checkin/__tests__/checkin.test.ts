/**
 * Testes de API para endpoints de Check-in
 */

import { NextRequest } from 'next/server';
import { POST as createCheckinRequest } from '../request/route';
import { GET as getCheckin } from '../[id]/route';

// Mock do advancedAuthMiddleware
jest.mock('@/lib/advanced-auth', () => ({
  advancedAuthMiddleware: jest.fn().mockResolvedValue({
    user: { id: 1, email: 'test@example.com' }
  })
}));

// Mock do checkin-service
jest.mock('@/lib/checkin-service', () => ({
  createCheckinRequest: jest.fn(),
  getCheckinById: jest.fn(),
  generateQRCodeForCheckin: jest.fn()
}));

// Mock do schemas
jest.mock('@/lib/schemas/checkin-schemas', () => ({
  CheckinRequestSchema: {
    safeParse: jest.fn()
  }
}));

describe('Check-in API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/checkin/request', () => {
    it('deve criar check-in com dados válidos', async () => {
      const { CheckinRequestSchema } = require('@/lib/schemas/checkin-schemas');
      const { createCheckinRequest: createService } = require('@/lib/checkin-service');
      const { generateQRCodeForCheckin } = require('@/lib/checkin-service');

      CheckinRequestSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          booking_id: 1,
          user_id: 1,
          property_id: 1
        }
      });

      createService.mockResolvedValue({
        id: 1,
        booking_id: 1,
        user_id: 1,
        property_id: 1,
        check_in_code: 'CHK-123456',
        status: 'pending'
      });

      generateQRCodeForCheckin.mockResolvedValue({
        qr_code: 'data:image/png;base64,...',
        qr_code_url: 'data:image/svg+xml;base64,...'
      });

      const request = new NextRequest('http://localhost/api/checkin/request', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: 1,
          user_id: 1,
          property_id: 1
        })
      });

      const response = await createCheckinRequest(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(1);
    });

    it('deve retornar erro 401 quando não autenticado', async () => {
      const { advancedAuthMiddleware } = require('@/lib/advanced-auth');
      advancedAuthMiddleware.mockResolvedValueOnce({ user: null });

      const request = new NextRequest('http://localhost/api/checkin/request', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: 1,
          user_id: 1,
          property_id: 1
        })
      });

      const response = await createCheckinRequest(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Não autorizado');
    });

    it('deve retornar erro 400 quando dados inválidos', async () => {
      const { CheckinRequestSchema } = require('@/lib/schemas/checkin-schemas');
      CheckinRequestSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          errors: [{ path: ['booking_id'], message: 'Required' }]
        }
      });

      const request = new NextRequest('http://localhost/api/checkin/request', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await createCheckinRequest(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos');
    });
  });

  describe('GET /api/checkin/[id]', () => {
    it('deve retornar check-in quando encontrado', async () => {
      const { getCheckinById } = require('@/lib/checkin-service');
      getCheckinById.mockResolvedValue({
        id: 1,
        booking_id: 1,
        user_id: 1,
        property_id: 1,
        check_in_code: 'CHK-123456',
        status: 'pending'
      });

      const request = new NextRequest('http://localhost/api/checkin/1');

      const response = await getCheckin(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(1);
    });

    it('deve retornar erro 404 quando check-in não encontrado', async () => {
      const { getCheckinById } = require('@/lib/checkin-service');
      getCheckinById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/checkin/999');

      const response = await getCheckin(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Check-in não encontrado');
    });
  });
});

