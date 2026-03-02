/**
 * Testes de API: Tickets
 * Testa os endpoints da API de tickets
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/tickets/route';
import { GET as GET_TICKET, PUT, DELETE } from '@/app/api/tickets/[id]/route';
import { GET as GET_COMMENTS, POST as POST_COMMENT } from '@/app/api/tickets/[id]/comments/route';
import { POST as POST_ASSIGN } from '@/app/api/tickets/[id]/assign/route';
import { POST as POST_STATUS } from '@/app/api/tickets/[id]/status/route';
import { GET as GET_STATS } from '@/app/api/tickets/stats/route';

// Mock do banco de dados
jest.mock('@/lib/db', () => ({
  queryDatabase: jest.fn(),
}));

// Mock do serviço de tickets
jest.mock('@/lib/ticket-service', () => ({
  createTicket: jest.fn(),
  getTicketById: jest.fn(),
  listTickets: jest.fn(),
  updateTicket: jest.fn(),
  addComment: jest.fn(),
  getTicketComments: jest.fn(),
  assignTicket: jest.fn(),
  changeTicketStatus: jest.fn(),
  closeTicket: jest.fn(),
  reopenTicket: jest.fn(),
}));

// Mock de autenticação
jest.mock('@/lib/advanced-auth', () => ({
  advancedAuthMiddleware: jest.fn(),
}));

// Mock de SLA
jest.mock('@/lib/sla-service', () => ({
  calculateSLAMetrics: jest.fn(),
}));

import { queryDatabase } from '@/lib/db';
import * as ticketService from '@/lib/ticket-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { calculateSLAMetrics } from '@/lib/sla-service';

describe('API Tickets', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'user',
  };

  const mockAdmin = {
    id: 2,
    email: 'admin@example.com',
    role: 'admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (advancedAuthMiddleware as jest.Mock).mockResolvedValue({
      user: mockUser,
    });
  });

  describe('POST /api/tickets', () => {
    it('deve criar ticket com sucesso', async () => {
      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-001',
        user_id: 1,
        category: 'technical',
        priority: 'high',
        status: 'open',
        subject: 'Test',
        description: 'Test description',
        source: 'web',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (ticketService.createTicket as jest.Mock).mockResolvedValue(mockTicket);

      const request = new NextRequest('http://localhost:3000/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          category: 'technical',
          priority: 'high',
          subject: 'Test',
          description: 'Test description',
          source: 'web',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTicket);
    });

    it('deve retornar erro se não autenticado', async () => {
      (advancedAuthMiddleware as jest.Mock).mockResolvedValue({
        user: null,
      });

      const request = new NextRequest('http://localhost:3000/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: 'Test',
          description: 'Test',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('deve retornar erro se dados inválidos', async () => {
      const request = new NextRequest('http://localhost:3000/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: 'AB', // Muito curto
          description: 'Test',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/tickets', () => {
    it('deve listar tickets com sucesso', async () => {
      const mockTickets = [
        {
          id: 1,
          ticket_number: 'TKT-001',
          user_id: 1,
          status: 'open',
          priority: 'high',
          category: 'technical',
          subject: 'Test',
          description: 'Test',
          source: 'web',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (ticketService.listTickets as jest.Mock).mockResolvedValue({
        tickets: mockTickets,
        total: 1,
      });

      const request = new NextRequest('http://localhost:3000/api/tickets?status=open');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTickets);
      expect(data.pagination.total).toBe(1);
    });

    it('deve filtrar apenas tickets do próprio usuário para usuários normais', async () => {
      (ticketService.listTickets as jest.Mock).mockResolvedValue({
        tickets: [],
        total: 0,
      });

      const request = new NextRequest('http://localhost:3000/api/tickets');

      await GET(request);

      expect(ticketService.listTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
        })
      );
    });
  });

  describe('GET /api/tickets/[id]', () => {
    it('deve retornar ticket com sucesso', async () => {
      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-001',
        user_id: 1,
        status: 'open',
        priority: 'high',
        category: 'technical',
        subject: 'Test',
        description: 'Test',
        source: 'web',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (ticketService.getTicketById as jest.Mock).mockResolvedValue(mockTicket);
      (ticketService.getTicketComments as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/tickets/1');

      const response = await GET_TICKET(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('comments');
    });

    it('deve retornar 404 se ticket não encontrado', async () => {
      (ticketService.getTicketById as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/tickets/999');

      const response = await GET_TICKET(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/tickets/[id]/comments', () => {
    it('deve adicionar comentário com sucesso', async () => {
      const mockTicket = {
        id: 1,
        user_id: 1,
        assigned_to: null,
      };

      const mockComment = {
        id: 1,
        ticket_id: 1,
        user_id: 1,
        comment: 'Novo comentário',
        is_internal: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (ticketService.getTicketById as jest.Mock).mockResolvedValue(mockTicket);
      (ticketService.addComment as jest.Mock).mockResolvedValue(mockComment);

      const request = new NextRequest('http://localhost:3000/api/tickets/1/comments', {
        method: 'POST',
        body: JSON.stringify({
          comment: 'Novo comentário',
          is_internal: false,
        }),
      });

      const response = await POST_COMMENT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockComment);
    });
  });

  describe('POST /api/tickets/[id]/assign', () => {
    it('deve atribuir ticket com sucesso (admin)', async () => {
      (advancedAuthMiddleware as jest.Mock).mockResolvedValue({
        user: mockAdmin,
      });

      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-001',
        assigned_to: 3,
        status: 'in_progress',
      };

      (ticketService.getTicketById as jest.Mock).mockResolvedValue(mockTicket);
      (ticketService.assignTicket as jest.Mock).mockResolvedValue(mockTicket);

      const request = new NextRequest('http://localhost:3000/api/tickets/1/assign', {
        method: 'POST',
        body: JSON.stringify({
          assigned_to: 3,
        }),
      });

      const response = await POST_ASSIGN(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('deve retornar 403 se usuário não for admin/staff', async () => {
      const request = new NextRequest('http://localhost:3000/api/tickets/1/assign', {
        method: 'POST',
        body: JSON.stringify({
          assigned_to: 3,
        }),
      });

      const response = await POST_ASSIGN(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/tickets/[id]/status', () => {
    it('deve mudar status com sucesso', async () => {
      const mockTicket = {
        id: 1,
        user_id: 1,
        status: 'open',
      };

      const mockUpdatedTicket = {
        ...mockTicket,
        status: 'resolved',
      };

      (ticketService.getTicketById as jest.Mock).mockResolvedValue(mockTicket);
      (ticketService.changeTicketStatus as jest.Mock).mockResolvedValue(mockUpdatedTicket);

      const request = new NextRequest('http://localhost:3000/api/tickets/1/status', {
        method: 'POST',
        body: JSON.stringify({
          status: 'resolved',
          resolution_notes: 'Resolvido',
        }),
      });

      const response = await POST_STATUS(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/tickets/stats', () => {
    it('deve retornar estatísticas (admin)', async () => {
      (advancedAuthMiddleware as jest.Mock).mockResolvedValue({
        user: mockAdmin,
      });

      const mockStats = {
        overview: {
          total: 10,
          open: 5,
          resolved: 3,
          closed: 2,
          unassigned: 1,
          sla_breached: 0,
        },
        by_priority: [],
        by_category: [],
        by_status: [],
        metrics: {
          avg_resolution_hours: 24,
          sla: {
            total_tickets: 10,
            sla_compliance_rate: 95,
          },
        },
        top_users: [],
        top_staff: [],
      };

      (queryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ total: '10' }])
        .mockResolvedValueOnce([{ total: '5' }])
        .mockResolvedValueOnce([{ total: '3' }])
        .mockResolvedValueOnce([{ total: '2' }])
        .mockResolvedValueOnce([{ total: '1' }])
        .mockResolvedValueOnce([{ total: '0' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ avg_hours: '24' }])
        .mockResolvedValueOnce([{ total: '1' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      (calculateSLAMetrics as jest.Mock).mockResolvedValue({
        total_tickets: 10,
        sla_compliance_rate: 95,
      });

      const request = new NextRequest('http://localhost:3000/api/tickets/stats');

      const response = await GET_STATS(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.overview.total).toBe(10);
    });

    it('deve retornar 403 se não for admin/staff', async () => {
      const request = new NextRequest('http://localhost:3000/api/tickets/stats');

      const response = await GET_STATS(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });
});

