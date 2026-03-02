/**
 * Testes de API para endpoints de Tickets
 */

import { NextRequest } from 'next/server';
import { GET as listTickets, POST as createTicket } from '../route';
import { GET as getTicket } from '../[id]/route';

// Mock do advancedAuthMiddleware
jest.mock('@/lib/advanced-auth', () => ({
  advancedAuthMiddleware: jest.fn().mockResolvedValue({
    user: { id: 1, email: 'test@example.com' }
  })
}));

// Mock do ticket-service
jest.mock('@/lib/ticket-service', () => ({
  listTickets: jest.fn(),
  createTicket: jest.fn(),
  getTicketById: jest.fn()
}));

// Mock do schemas
jest.mock('@/lib/schemas/ticket-schemas', () => ({
  CreateTicketSchema: {
    safeParse: jest.fn()
  }
}));

describe('Tickets API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tickets', () => {
    it('deve listar tickets com filtros', async () => {
      const { listTickets: listService } = require('@/lib/ticket-service');
      listService.mockResolvedValue({
        tickets: [
          {
            id: 1,
            ticket_number: 'TKT-001',
            subject: 'Test Ticket',
            status: 'open'
          }
        ],
        pagination: {
          total: 1,
          limit: 20,
          offset: 0
        }
      });

      const request = new NextRequest('http://localhost/api/tickets?status=open');

      const response = await listTickets(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
    });
  });

  describe('POST /api/tickets', () => {
    it('deve criar ticket com dados válidos', async () => {
      const { CreateTicketSchema } = require('@/lib/schemas/ticket-schemas');
      const { createTicket: createService } = require('@/lib/ticket-service');

      CreateTicketSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          subject: 'Test Ticket',
          description: 'Test Description',
          category: 'technical',
          priority: 'high'
        }
      });

      createService.mockResolvedValue({
        id: 1,
        ticket_number: 'TKT-001',
        subject: 'Test Ticket',
        status: 'open'
      });

      const request = new NextRequest('http://localhost/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: 'Test Ticket',
          description: 'Test Description',
          category: 'technical',
          priority: 'high'
        })
      });

      const response = await createTicket(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(1);
    });

    it('deve retornar erro 400 quando dados inválidos', async () => {
      const { CreateTicketSchema } = require('@/lib/schemas/ticket-schemas');
      CreateTicketSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          errors: [{ path: ['subject'], message: 'Required' }]
        }
      });

      const request = new NextRequest('http://localhost/api/tickets', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await createTicket(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos');
    });
  });

  describe('GET /api/tickets/[id]', () => {
    it('deve retornar ticket quando encontrado', async () => {
      const { getTicketById } = require('@/lib/ticket-service');
      getTicketById.mockResolvedValue({
        id: 1,
        ticket_number: 'TKT-001',
        subject: 'Test Ticket',
        status: 'open'
      });

      const request = new NextRequest('http://localhost/api/tickets/1');

      const response = await getTicket(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(1);
    });

    it('deve retornar erro 404 quando ticket não encontrado', async () => {
      const { getTicketById } = require('@/lib/ticket-service');
      getTicketById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/tickets/999');

      const response = await getTicket(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Ticket não encontrado');
    });
  });
});

