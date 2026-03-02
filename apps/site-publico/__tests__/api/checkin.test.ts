/**
 * Testes de API para Endpoints de Check-in
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST as createCheckinRequest } from '@/app/api/checkin/request/route';
import { GET as getCheckin, PUT as updateCheckin } from '@/app/api/checkin/[id]/route';
import { POST as scanQRCode } from '@/app/api/checkin/scan/route';

// Mock do módulo advanced-auth
jest.mock('@/lib/advanced-auth', () => ({
  advancedAuthMiddleware: jest.fn((req) => {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer valid-token')) {
      return Promise.resolve({
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'customer'
        }
      });
    }
    return Promise.resolve({ user: null });
  })
}));

// Mock do módulo checkin-service
jest.mock('@/lib/checkin-service', () => ({
  createCheckinRequest: jest.fn(),
  getCheckinById: jest.fn(),
  updateCheckin: jest.fn(),
  generateQRCodeForCheckin: jest.fn(),
  scanQRCode: jest.fn()
}));

// Mock do módulo db
jest.mock('@/lib/db', () => ({
  queryDatabase: jest.fn()
}));

describe('API Check-in Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/checkin/request', () => {
    it('deve criar check-in com token válido', async () => {
      const { createCheckinRequest } = require('@/lib/checkin-service');
      const { generateQRCodeForCheckin } = require('@/lib/checkin-service');

      createCheckinRequest.mockResolvedValue({
        id: 1,
        booking_id: 100,
        property_id: 50,
        user_id: 1,
        check_in_code: 'CHK-ABC123',
        status: 'pending'
      });

      generateQRCodeForCheckin.mockResolvedValue({
        qrCode: 'data:image/png;base64,mock',
        qrCodeUrl: 'https://example.com/qr.png'
      });

      const request = new NextRequest('http://localhost:3000/api/checkin/request', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          booking_id: 100,
          property_id: 50
          // user_id será adicionado automaticamente pelo middleware de autenticação
        })
      });

      const response = await createCheckinRequest(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(1);
    });

    it('deve retornar 401 sem token', async () => {
      const request = new NextRequest('http://localhost:3000/api/checkin/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          booking_id: 100,
          property_id: 50
        })
      });

      const response = await createCheckinRequest(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Não autorizado');
    });

    it('deve retornar 400 com dados inválidos', async () => {
      const request = new NextRequest('http://localhost:3000/api/checkin/request', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Dados inválidos - falta booking_id
          property_id: 50
        })
      });

      const response = await createCheckinRequest(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos');
    });
  });

  describe('GET /api/checkin/[id]', () => {
    it('deve retornar check-in existente', async () => {
      const { getCheckinById } = require('@/lib/checkin-service');
      const { queryDatabase } = require('@/lib/db');

      getCheckinById.mockResolvedValue({
        id: 1,
        booking_id: 100,
        property_id: 50,
        user_id: 1,
        status: 'pending'
      });

      queryDatabase
        .mockResolvedValueOnce([]) // documents
        .mockResolvedValueOnce([]) // access_codes
        .mockResolvedValueOnce([]); // inspections

      const request = new NextRequest('http://localhost:3000/api/checkin/1', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const response = await getCheckin(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(1);
    });

    it('deve retornar 404 se check-in não existir', async () => {
      const { getCheckinById } = require('@/lib/checkin-service');

      getCheckinById.mockRejectedValue(new Error('Check-in não encontrado'));

      const request = new NextRequest('http://localhost:3000/api/checkin/999', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const response = await getCheckin(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Check-in não encontrado');
    });
  });

  describe('PUT /api/checkin/[id]', () => {
    it('deve atualizar check-in com sucesso', async () => {
      const { getCheckinById, updateCheckin } = require('@/lib/checkin-service');

      getCheckinById.mockResolvedValue({
        id: 1,
        user_id: 1,
        status: 'pending'
      });

      updateCheckin.mockResolvedValue({
        id: 1,
        status: 'documents_pending'
      });

      const request = new NextRequest('http://localhost:3000/api/checkin/1', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'documents_pending'
        })
      });

      const response = await updateCheckin(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('documents_pending');
    });
  });

  describe('POST /api/checkin/scan', () => {
    it('deve escanear QR code com sucesso (staff)', async () => {
      const { advancedAuthMiddleware } = require('@/lib/advanced-auth');
      const { scanQRCode: scanService } = require('@/lib/checkin-service');
      const { queryDatabase } = require('@/lib/db');

      advancedAuthMiddleware.mockResolvedValue({
        user: {
          id: 2,
          role: 'staff'
        }
      });

      scanService.mockResolvedValue({
        checkin: {
          id: 1,
          booking_id: 100,
          property_id: 50,
          user_id: 1,
          status: 'pending'
        },
        type: 'checkin'
      });

      queryDatabase
        .mockResolvedValueOnce([{ id: 100 }]) // booking
        .mockResolvedValueOnce([{ id: 50 }]) // property
        .mockResolvedValueOnce([{ id: 1, name: 'Test User' }]) // user
        .mockResolvedValueOnce([]) // documents
        .mockResolvedValueOnce([]); // access_codes

      const request = new NextRequest('http://localhost:3000/api/checkin/scan', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: 'CHK-ABC123'
        })
      });

      const response = await scanQRCode(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.checkin.id).toBe(1);
    });

    it('deve retornar 403 para usuário sem permissão', async () => {
      const { advancedAuthMiddleware } = require('@/lib/advanced-auth');

      advancedAuthMiddleware.mockResolvedValue({
        user: {
          id: 1,
          role: 'customer' // Não é staff/admin
        }
      });

      const request = new NextRequest('http://localhost:3000/api/checkin/scan', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: 'CHK-ABC123'
        })
      });

      const response = await scanQRCode(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('staff e administradores');
    });
  });
});

