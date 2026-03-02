/**
 * Testes Unitários: Ticket Service
 * Testa as funções principais do serviço de tickets
 * 
 * ✅ Usa injeção de dependência para mockar o pool do banco
 * A função __setMockPool permite injetar um pool mockado antes
 * que o código tente criar uma conexão real.
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';
import { Pool } from 'pg';
import { __setMockPool, closeDbPool } from '@/lib/db';

// Mock do socket.io usando manual mock
jest.mock('socket.io');

// Mock do nodemailer usando manual mock
jest.mock('nodemailer');

// Mock do WebSocket (deve vir antes do import do ticket-service)
jest.mock('@/lib/websocket-server', () => ({
  sendNotificationToUser: jest.fn(),
  sendNotificationToRole: jest.fn(),
}));

// Mock de notificações
jest.mock('@/lib/ticket-notifications', () => ({
  notifyTicketCreated: jest.fn(),
  notifyTicketUpdated: jest.fn(),
  notifyTicketComment: jest.fn(),
  notifyTicketResolved: jest.fn(),
  notifyTicketAssigned: jest.fn(),
}));

// Importar após os mocks
import {
  createTicket,
  getTicketById,
  getTicketByNumber,
  listTickets,
  updateTicket,
  addComment,
  assignTicket,
  changeTicketStatus,
  closeTicket,
  reopenTicket
} from '@/lib/ticket-service';

describe('Ticket Service', () => {
  let mockPool: jest.Mocked<Pool>;
  let mockQuery: jest.Mock;

  beforeAll(() => {
    // Criar mock do Pool
    mockQuery = jest.fn();
    mockPool = {
      query: mockQuery,
      connect: jest.fn().mockResolvedValue({
        query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
        release: jest.fn(),
      }),
      end: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    } as any;

    // Injetar mock no sistema
    __setMockPool(mockPool);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Resetar mockQuery para retornar array vazio por padrão
    // IMPORTANTE: Não usar mockImplementation aqui, pois sobrescreve os mocks específicos dos testes
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterAll(async () => {
    await closeDbPool();
  });

  describe('createTicket', () => {
    it('deve criar um ticket com sucesso', async () => {
      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-20250101-ABC123',
        user_id: 1,
        category: 'technical',
        priority: 'high',
        status: 'open',
        subject: 'Problema técnico',
        description: 'Descrição do problema',
        source: 'web',
        tags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ generate_ticket_number: 'TKT-20250101-ABC123' }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [mockTicket], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // openTickets query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // breachedTickets query

      const result = await createTicket({
        user_id: 1,
        category: 'technical',
        priority: 'high',
        subject: 'Problema técnico',
        description: 'Descrição do problema',
        source: 'web',
      });

      expect(result).toEqual(mockTicket);
      expect(mockQuery).toHaveBeenCalled();
    });

    it('deve lançar erro se dados inválidos', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        createTicket({
          user_id: 1,
          category: 'technical',
          priority: 'high',
          subject: 'Test',
          description: 'Test',
          source: 'web',
        })
      ).rejects.toThrow();
    });
  });

  describe('getTicketById', () => {
    it('deve retornar ticket quando encontrado', async () => {
      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-001',
        user_id: 1,
        category: 'technical',
        priority: 'high',
        status: 'open',
        subject: 'Test',
        description: 'Test',
        source: 'web',
        tags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockTicket], rowCount: 1 });

      const result = await getTicketById(1);

      expect(result).toEqual(mockTicket);
    });

    it('deve retornar null quando ticket não encontrado', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await getTicketById(999);

      expect(result).toBeNull();
    });
  });

  describe('listTickets', () => {
    it('deve listar tickets com filtros', async () => {
      const mockTickets = [
        {
          id: 1,
          ticket_number: 'TKT-001',
          user_id: 1,
          category: 'technical',
          priority: 'high',
          status: 'open',
          subject: 'Test',
          description: 'Test',
          source: 'web',
          tags: [],
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], rowCount: 1 }) // total count query (primeiro)
        .mockResolvedValueOnce({ rows: mockTickets, rowCount: mockTickets.length }); // tickets query (segundo)

      const result = await listTickets({ 
        status: 'open',
        page: 1,
        page_size: 10,
        sort_by: 'created_at',
        sort_order: 'DESC',
        limit: 10,
        offset: 0
      });

      expect(result).toHaveProperty('tickets');
      expect(result).toHaveProperty('total');
      expect(result.tickets).toEqual(mockTickets);
      expect(result.total).toBe(1);
    });
  });

  describe('updateTicket', () => {
    it('deve atualizar ticket com sucesso', async () => {
      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-001',
        user_id: 1,
        category: 'technical',
        priority: 'high',
        status: 'open',
        subject: 'Test',
        description: 'Test',
        source: 'web',
        tags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockUpdatedTicket = {
        ...mockTicket,
        subject: 'Updated Test',
        updated_at: new Date(),
      };

      // updateTicket faz UPDATE ... RETURNING *, então retorna diretamente o ticket atualizado
      mockQuery
        .mockResolvedValueOnce({ rows: [mockUpdatedTicket], rowCount: 1 }) // UPDATE ... RETURNING * retorna o ticket atualizado
        .mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 }) // openTickets query (se status mudou)
        .mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 }); // breachedTickets query (se houver)

      const result = await updateTicket(1, { subject: 'Updated Test' });

      expect(result.subject).toBe('Updated Test');
    });
  });

  describe('addComment', () => {
    it('deve adicionar comentário com sucesso', async () => {
      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-001',
        user_id: 2, // Diferente de data.user_id para que a notificação seja enviada
        status: 'open',
        first_response_at: null, // Não tem primeira resposta ainda
        assigned_to: null,
        category: 'technical',
        priority: 'high',
        subject: 'Test',
        description: 'Test',
        source: 'web',
        tags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
        last_activity_at: new Date(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        closed_at: null,
        closed_by: null,
        sla_due_at: null,
        sla_breached: false,
        first_response_by: null,
      };

      const mockComment = {
        id: 1,
        ticket_id: 1,
        user_id: 1,
        comment: 'Comentário de teste',
        is_internal: false,
        is_system: false,
        attachments: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      // addComment faz: getTicketById (SELECT) -> INSERT comentário -> possivelmente UPDATE ticket
      // getTicketById faz uma query SELECT (via queryDatabase através de pool.query)
      // INSERT comentário faz uma query INSERT com RETURNING * (através de pool.query)
      // Se for primeiro comentário do staff (first_response_at é null e não é interno), faz UPDATE do ticket (sem RETURNING *)
      // Como ticket.user_id !== data.user_id (2 !== 1) e first_response_at é null e não é interno, vai fazer UPDATE
      // O UPDATE não retorna dados (sem RETURNING *), então não precisa mockar o resultado
      mockQuery
        .mockResolvedValueOnce({ rows: [mockTicket], rowCount: 1 }) // getTicketById (SELECT)
        .mockResolvedValueOnce({ rows: [mockComment], rowCount: 1 }) // INSERT comentário (RETURNING *)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE ticket (sem RETURNING *, não retorna dados)

      const result = await addComment({
        ticket_id: 1,
        user_id: 1,
        comment: 'Comentário de teste',
        is_internal: false,
      });

      expect(result).toEqual(mockComment);
    });
  });

  describe('assignTicket', () => {
    it('deve atribuir ticket com sucesso', async () => {
      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-001',
        user_id: 1,
        assigned_to: null,
        status: 'open',
        category: 'technical',
        priority: 'high',
        subject: 'Test',
        description: 'Test',
        source: 'web',
        tags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
        last_activity_at: new Date(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        closed_at: null,
        closed_by: null,
        sla_due_at: null,
        sla_breached: false,
        first_response_at: null,
        first_response_by: null,
      };

      const mockAssignedTicket = {
        ...mockTicket,
        assigned_to: 2,
        status: 'in_progress', // Status muda para in_progress quando atribuído
        updated_at: new Date(),
      };

      // assignTicket faz: getTicketById (SELECT) -> UPDATE ticket (RETURNING *)
      mockQuery
        .mockResolvedValueOnce({ rows: [mockTicket], rowCount: 1 }) // getTicketById
        .mockResolvedValueOnce({ rows: [mockAssignedTicket], rowCount: 1 }); // UPDATE ticket

      const result = await assignTicket({
        ticket_id: 1,
        assigned_to: 2,
        assigned_by: 1,
      });

      expect(result.assigned_to).toBe(2);
      expect(result.status).toBe('in_progress');
    });
  });

  describe('changeTicketStatus', () => {
    it('deve mudar status para resolved', async () => {
      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-001',
        user_id: 1,
        status: 'open',
        category: 'technical',
        priority: 'high',
        subject: 'Test',
        description: 'Test',
        source: 'web',
        tags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
        last_activity_at: new Date(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        closed_at: null,
        closed_by: null,
        sla_due_at: null,
        sla_breached: false,
        first_response_at: null,
        first_response_by: null,
        assigned_to: null,
      };

      const mockResolvedTicket = {
        ...mockTicket,
        status: 'resolved',
        resolved_at: new Date(),
        resolved_by: 1,
        resolution_notes: 'Problema resolvido',
        updated_at: new Date(),
      };

      // changeTicketStatus faz: getTicketById -> UPDATE -> possivelmente 2 queries de métricas
      // Quando status muda para resolved E não era resolved antes:
      // 1. getTicketById (SELECT)
      // 2. UPDATE ticket (RETURNING *)
      // 3. openTickets query (quando status muda para resolved) - dentro do if (result[0].status === 'resolved' && ticket.status !== 'resolved')
      // 4. openTickets query (quando status muda) - dentro do if (ticket.status !== result[0].status)
      // 5. breachedTickets query (sempre)
      mockQuery
        .mockResolvedValueOnce({ rows: [mockTicket], rowCount: 1 }) // getTicketById
        .mockResolvedValueOnce({ rows: [mockResolvedTicket], rowCount: 1 }) // UPDATE ticket
        .mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 }) // openTickets query (quando status muda para resolved)
        .mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 }) // openTickets query (quando status muda)
        .mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 }); // breachedTickets query

      const result = await changeTicketStatus({
        ticket_id: 1,
        status: 'resolved',
        changed_by: 1,
        resolution_notes: 'Problema resolvido',
      });

      expect(result.status).toBe('resolved');
      expect(result.resolved_at).toBeDefined();
    });
  });

  describe('closeTicket', () => {
    it('deve fechar ticket com sucesso', async () => {
      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-001',
        user_id: 1,
        status: 'open',
        category: 'technical',
        priority: 'high',
        subject: 'Test',
        description: 'Test',
        source: 'web',
        tags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
        last_activity_at: new Date(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        closed_at: null,
        closed_by: null,
        sla_due_at: null,
        sla_breached: false,
        first_response_at: null,
        first_response_by: null,
        assigned_to: null,
      };

      const mockClosedTicket = {
        ...mockTicket,
        status: 'closed',
        closed_at: new Date(),
        closed_by: 1,
        updated_at: new Date(),
      };

      // closeTicket chama changeTicketStatus, que faz: getTicketById -> UPDATE -> métricas
      // Quando status muda para closed (não é resolved):
      // 1. getTicketById (SELECT)
      // 2. UPDATE ticket (RETURNING *)
      // 3. openTickets query (quando status muda) - dentro do if (ticket.status !== result[0].status)
      // 4. breachedTickets query (sempre)
      mockQuery
        .mockResolvedValueOnce({ rows: [mockTicket], rowCount: 1 }) // getTicketById
        .mockResolvedValueOnce({ rows: [mockClosedTicket], rowCount: 1 }) // UPDATE ticket
        .mockResolvedValueOnce({ rows: [{ count: '4' }], rowCount: 1 }) // openTickets query (quando status muda)
        .mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 }); // breachedTickets query

      const result = await closeTicket(1, 1, 'Ticket fechado');

      expect(result.status).toBe('closed');
      expect(result.closed_at).toBeDefined();
    });
  });

  describe('reopenTicket', () => {
    it('deve reabrir ticket com sucesso', async () => {
      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-001',
        user_id: 1,
        status: 'closed',
        category: 'technical',
        priority: 'high',
        subject: 'Test',
        description: 'Test',
        source: 'web',
        tags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
        last_activity_at: new Date(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        closed_at: new Date(),
        closed_by: 1,
        sla_due_at: null,
        sla_breached: false,
        first_response_at: null,
        first_response_by: null,
        assigned_to: null,
      };

      const mockReopenedTicket = {
        ...mockTicket,
        status: 'open',
        updated_at: new Date(),
      };

      // reopenTicket chama changeTicketStatus, que faz: getTicketById -> UPDATE -> métricas
      // Quando status muda de closed para open:
      // 1. getTicketById (SELECT)
      // 2. UPDATE ticket (RETURNING *)
      // 3. openTickets query (quando status muda) - dentro do if (ticket.status !== result[0].status)
      // 4. breachedTickets query (sempre)
      mockQuery
        .mockResolvedValueOnce({ rows: [mockTicket], rowCount: 1 }) // getTicketById
        .mockResolvedValueOnce({ rows: [mockReopenedTicket], rowCount: 1 }) // UPDATE ticket
        .mockResolvedValueOnce({ rows: [{ count: '6' }], rowCount: 1 }) // openTickets query (quando status muda)
        .mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 }); // breachedTickets query

      const result = await reopenTicket(1, 1);

      expect(result.status).toBe('open');
    });
  });
});
