/**
 * Testes Unitários para Check-in Service
 * 
 * ✅ Usa injeção de dependência para mockar o pool do banco
 * A função __setMockPool permite injetar um pool mockado antes
 * que o código tente criar uma conexão real.
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';
import { Pool } from 'pg';
import { __setMockPool, closeDbPool } from '@/lib/db';
import {
  createCheckinRequest,
  getCheckinById,
  updateCheckin,
  processCheckIn,
  processCheckOut
} from '@/lib/checkin-service';

// Mock do módulo qr-code-generator
jest.mock('@/lib/qr-code-generator', () => ({
  generateCheckinQRCode: jest.fn(() => Promise.resolve({
    qrCode: 'data:image/png;base64,mockqr',
    qrCodeUrl: 'https://example.com/qr.png'
  }))
}));

// Mock do módulo document-verification-service
jest.mock('@/lib/document-verification-service', () => ({
  verifyMultipleDocuments: jest.fn(() => Promise.resolve({
    verified: true,
    confidence: 95
  }))
}));

// Mock do módulo smart-lock-service
jest.mock('@/lib/smart-lock-service', () => ({
  generateAccessCode: jest.fn(() => Promise.resolve({
    code: '123456',
    valid_from: new Date(),
    valid_until: new Date(Date.now() + 86400000)
  }))
}));

describe('Check-in Service', () => {
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
    // Garantir que o mock retorna array vazio por padrão
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterAll(async () => {
    await closeDbPool();
  });

  describe('createCheckinRequest', () => {
    it('deve criar uma solicitação de check-in com sucesso', async () => {
      const mockCheckin = {
        id: 1,
        booking_id: 100,
        property_id: 50,
        user_id: 10,
        check_in_code: 'CHK-ABC123',
        qr_code: null,
        qr_code_url: null,
        status: 'pending',
        check_in_at: null,
        check_out_at: null,
        documents_verified: false,
        documents_verified_at: null,
        documents_verified_by: null,
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      // Primeira chamada: verificar se já existe check-in (retorna vazio)
      // Segunda chamada: criar check-in (retorna mockCheckin)
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Não existe check-in ainda
        .mockResolvedValueOnce({ rows: [mockCheckin], rowCount: 1 }); // Criar check-in

      const result = await createCheckinRequest({
        booking_id: 100,
        property_id: 50,
        user_id: 10,
        scheduled_checkin_date: '2024-12-25',
        scheduled_checkin_time: '14:00',
        guest_notes: 'Chegarei às 14h'
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.booking_id).toBe(100);
      expect(mockQuery).toHaveBeenCalled();
    });

    it('deve lançar erro se não conseguir criar check-in', async () => {
      // Primeira chamada: verificar se já existe check-in (retorna vazio)
      // Segunda chamada: tentar criar check-in (retorna vazio - falha)
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Não existe check-in ainda
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Falha ao criar (retorna vazio)

      await expect(
        createCheckinRequest({
          booking_id: 999,
          property_id: 50,
          user_id: 10,
          scheduled_checkin_date: '2024-12-25'
        })
      ).rejects.toThrow('Erro ao criar check-in');
    });
  });

  describe('getCheckinById', () => {
    it('deve retornar check-in existente', async () => {
      const mockCheckin = {
        id: 1,
        booking_id: 100,
        status: 'pending'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCheckin], rowCount: 1 });

      const result = await getCheckinById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('deve lançar erro se check-in não existir', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await expect(getCheckinById(999)).rejects.toThrow('Check-in não encontrado');
    });
  });

  describe('updateCheckin', () => {
    it('deve atualizar check-in com sucesso', async () => {
      const updatedCheckin = {
        id: 1,
        status: 'documents_pending',
        booking_id: 100,
        property_id: 50,
        user_id: 10,
        check_in_code: 'CHK-ABC123',
        qr_code: null,
        qr_code_url: null,
        check_in_at: null,
        check_out_at: null,
        documents_verified: false,
        documents_verified_at: null,
        documents_verified_by: null,
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      // updateCheckin faz apenas UPDATE com RETURNING *, não faz SELECT antes
      mockQuery.mockResolvedValueOnce({ rows: [updatedCheckin], rowCount: 1 });

      const result = await updateCheckin(1, {
        status: 'documents_pending'
      });

      expect(result.status).toBe('documents_pending');
    });
  });

  describe('processCheckIn', () => {
    it('deve processar check-in com sucesso', async () => {
      const mockCheckin = {
        id: 1,
        booking_id: 100,
        property_id: 50,
        user_id: 10,
        status: 'verified',
        check_in_code: 'CHK-ABC123',
        documents_verified: true,
        created_at: new Date().toISOString(), // Necessário para cálculo de duração
        check_in_at: null,
        check_out_at: null,
        qr_code: null,
        qr_code_url: null,
        documents_verified_at: null,
        documents_verified_by: null,
        metadata: {},
        updated_at: new Date()
      };

      const updatedCheckin = {
        ...mockCheckin,
        status: 'checked_in',
        check_in_at: new Date(),
        updated_at: new Date()
      };

      // Sequência de queries em processCheckIn:
      // 1. getCheckinById (SELECT)
      // 2. verifyCheckinDocuments pode fazer queries adicionais, mas como documents_verified já é true, não executa
      // 3. getCheckinById novamente (após verify_documents, se necessário)
      // 4. SELECT smart_locks (se generate_access_codes for true)
      // 5. UPDATE digital_checkins (final)
      mockQuery
        .mockResolvedValueOnce({ rows: [mockCheckin], rowCount: 1 }) // getCheckinById inicial
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // SELECT smart_locks (nenhuma fechadura)
        .mockResolvedValueOnce({ rows: [updatedCheckin], rowCount: 1 }); // UPDATE digital_checkins

      const result = await processCheckIn({
        checkin_id: 1,
        verify_documents: true,
        generate_access_codes: true
      });

      expect(result.status).toBe('checked_in');
      expect(result.check_in_at).toBeDefined();
    });

    it('deve lançar erro se check-in já foi realizado', async () => {
      const mockCheckin = {
        id: 1,
        status: 'checked_in'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCheckin], rowCount: 1 });

      await expect(
        processCheckIn({
          checkin_id: 1,
          verify_documents: false
        })
      ).rejects.toThrow('já foi realizado');
    });
  });

  describe('processCheckOut', () => {
    it('deve processar check-out com sucesso', async () => {
      const mockCheckin = {
        id: 1,
        booking_id: 100,
        property_id: 50,
        user_id: 10,
        status: 'checked_in',
        check_in_code: 'CHK-ABC123',
        check_in_at: new Date('2024-12-25'),
        check_out_at: null,
        documents_verified: true,
        documents_verified_at: null,
        documents_verified_by: null,
        qr_code: null,
        qr_code_url: null,
        metadata: {},
        created_at: new Date('2024-12-24').toISOString(), // Necessário para cálculo de duração
        updated_at: new Date()
      };

      const updatedCheckin = {
        ...mockCheckin,
        status: 'checked_out',
        check_out_at: new Date(),
        updated_at: new Date()
      };

      // Sequência de queries em processCheckOut:
      // 1. getCheckinById (SELECT)
      // 2. UPDATE checkin_access_codes (revogar códigos)
      // 3. UPDATE digital_checkins (final)
      mockQuery
        .mockResolvedValueOnce({ rows: [mockCheckin], rowCount: 1 }) // getCheckinById
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE checkin_access_codes
        .mockResolvedValueOnce({ rows: [updatedCheckin], rowCount: 1 }); // UPDATE digital_checkins

      const result = await processCheckOut({
        checkin_id: 1,
        condition: 'good',
        notes: 'Tudo em ordem'
      });

      expect(result.status).toBe('checked_out');
      expect(result.check_out_at).toBeDefined();
    });

    it('deve lançar erro se check-in não foi realizado ainda', async () => {
      const mockCheckin = {
        id: 1,
        status: 'pending'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCheckin], rowCount: 1 });

      await expect(
        processCheckOut({
          checkin_id: 1,
          condition: 'good',
          notes: 'Teste'
        })
      ).rejects.toThrow('não foi realizado ainda');
    });
  });
});
