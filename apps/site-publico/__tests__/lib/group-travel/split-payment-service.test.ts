/**
 * ✅ FASE 5 - ETAPA 5.1: Testes Unitários - Split Payment Service
 * Testes para o serviço de divisão de pagamentos
 * 
 * @module __tests__/lib/group-travel/split-payment-service.test
 */

import SplitPaymentService from '@/lib/group-travel/split-payment-service';
import { queryDatabase, getDbPool } from '@/lib/db';
import { redisCache } from '@/lib/redis-cache';
import type { CreateSplitPaymentDTO, SplitPayment } from '@/lib/group-travel/types';
import { v4 as uuidv4 } from 'uuid';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/redis-cache');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;
const mockGetDbPool = getDbPool as jest.MockedFunction<typeof getDbPool>;
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

// Mock do client do pool
const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

describe('SplitPaymentService', () => {
  const bookingId = '123'; // Número como string para parseInt funcionar
  const userId1 = '1'; // Número como string
  const userId2 = '2';
  const userId3 = '3';

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.get = jest.fn();
    mockRedisCache.set = jest.fn();
    mockRedisCache.del = jest.fn();
    
    // Mock do pool
    mockGetDbPool.mockReturnValue({
      connect: jest.fn().mockResolvedValue(mockClient)
    } as any);
    
    // Reset client mocks
    mockClient.query.mockReset();
    mockClient.release.mockReset();
    mockClient.query.mockResolvedValue({ rows: [] });
    mockClient.release.mockResolvedValue(undefined);
  });

  describe('createSplitPayment', () => {
    it('should create split payment with equal division', async () => {
      // Arrange
      const totalAmount = 300;
      const createDTO: CreateSplitPaymentDTO = {
        bookingId,
        splits: [
          { userId: userId1, amount: 100 },
          { userId: userId2, amount: 100 },
          { userId: userId3, amount: 100 }
        ],
        currency: 'BRL'
      };

      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - buscar booking
      // 2. getBookingSplits é chamado internamente:
      //    - redisCache.get (cache miss)
      //    - queryDatabase - buscar split_payments (retorna [] = não existe)
      // 3. client.query - transação (BEGIN, INSERTs, COMMIT)

      // Mock 1: Buscar booking
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([{
        id: parseInt(bookingId),
        total_amount: totalAmount,
        currency: 'BRL'
      }]);

      // Mock 2: getBookingSplits - cache miss
      mockRedisCache.get = jest.fn().mockResolvedValue(null);

      // Mock 3: getBookingSplits - buscar split_payments (não existe = retorna [])
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([]);

      // Mock transação com client.query
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({
          rows: [{
            id: 456,
            booking_id: parseInt(bookingId),
            total_amount: totalAmount,
            split_type: 'custom',
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
          }]
        }) // INSERT split_payments
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            split_payment_id: 456,
            user_id: parseInt(userId1),
            amount: 100,
            percentage: 33.33,
            status: 'pending',
            paid_at: null,
            payment_method: null
          }]
        }) // INSERT participant 1
        .mockResolvedValueOnce({
          rows: [{
            id: 2,
            split_payment_id: 456,
            user_id: parseInt(userId2),
            amount: 100,
            percentage: 33.33,
            status: 'pending',
            paid_at: null,
            payment_method: null
          }]
        }) // INSERT participant 2
        .mockResolvedValueOnce({
          rows: [{
            id: 3,
            split_payment_id: 456,
            user_id: parseInt(userId3),
            amount: 100,
            percentage: 33.33,
            status: 'pending',
            paid_at: null,
            payment_method: null
          }]
        }) // INSERT participant 3
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const result = await SplitPaymentService.createSplitPayment(bookingId, createDTO);

      // Assert
      expect(result).toBeDefined();
      expect(result.bookingId).toBe(bookingId);
      expect(result.splits).toHaveLength(3);
      expect(mockQueryDatabase).toHaveBeenCalled();
    });

    it('should validate that splits sum equals total amount', async () => {
      // Arrange
      const createDTO: CreateSplitPaymentDTO = {
        bookingId,
        splits: [
          { userId: userId1, amount: 100 },
          { userId: userId2, amount: 100 },
          { userId: userId3, amount: 50 } // Total = 250, but booking = 300
        ],
        currency: 'BRL'
      };

      // SEQUÊNCIA DE CHAMADAS (mesma do teste anterior):
      // 1. queryDatabase - buscar booking
      // 2. getBookingSplits (cache miss + query split_payments vazio)
      // 3. Validação de soma (não chega na transação)

      // Mock 1: Buscar booking
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([{
        id: parseInt(bookingId),
        total_amount: 300,
        currency: 'BRL'
      }]);

      // Mock 2: getBookingSplits - cache miss
      mockRedisCache.get = jest.fn().mockResolvedValue(null);

      // Mock 3: getBookingSplits - buscar split_payments (não existe = retorna [])
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([]);

      // Act & Assert
      await expect(
        SplitPaymentService.createSplitPayment(bookingId, createDTO)
      ).rejects.toThrow('Soma dos splits');
    });

    it('should throw error if booking does not exist', async () => {
      // Arrange
      const createDTO: CreateSplitPaymentDTO = {
        bookingId: 'invalid-booking',
        splits: [{ userId: userId1, amount: 100 }],
        currency: 'BRL'
      };

      // Mock queryDatabase retornando array vazio (booking não existe)
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([]);

      // Act & Assert
      await expect(
        SplitPaymentService.createSplitPayment('invalid-booking', createDTO)
      ).rejects.toThrow('Reserva não encontrada');
    });
  });

  describe('calculateSplits', () => {
    it('should calculate equal splits correctly', async () => {
      // Arrange
      const totalAmount = 300;
      const userIds = [userId1, userId2, userId3];

      // Act
      const splits = SplitPaymentService.calculateSplits(totalAmount, userIds);

      // Assert
      expect(splits).toHaveLength(3);
      expect(splits[0].amount).toBe(100);
      expect(splits[1].amount).toBe(100);
      expect(splits[2].amount).toBe(100);
      expect(splits.reduce((sum, s) => sum + s.amount, 0)).toBe(300);
    });

    it('should handle rounding correctly', async () => {
      // Arrange
      const totalAmount = 100;
      const userIds = [userId1, userId2, userId3]; // 100 / 3 = 33.33...

      // Act
      const splits = SplitPaymentService.calculateSplits(totalAmount, userIds);

      // Assert
      const sum = splits.reduce((sum, s) => sum + s.amount, 0);
      expect(sum).toBe(100); // Should still sum to total
      // Two splits should be 33.34 and one 33.32 (or similar)
      expect(splits.every(s => s.amount >= 33 && s.amount <= 34)).toBe(true);
    });
  });

  describe('markAsPaid', () => {
    it('should mark split as paid successfully', async () => {
      // Arrange
      const splitId = '123';
      const paymentData = {
        method: 'credit_card',
        transactionId: 'txn-456'
      };

      // Mock transação
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({
          rows: [{
            id: parseInt(splitId),
            status: 'pending',
            user_id: parseInt(userId1),
            split_payment_id: 456
          }]
        }) // SELECT split
        .mockResolvedValueOnce({
          rows: [{
            id: parseInt(splitId),
            status: 'paid',
            paid_at: new Date()
          }]
        }) // UPDATE split
        .mockResolvedValueOnce({
          rows: [{ id: 789, status: 'pending' }]
        }) // Check other splits (still pending)
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const result = await SplitPaymentService.markAsPaid(splitId, paymentData);

      // Assert
      expect(result.status).toBe('paid');
      expect(result.paidAt).toBeDefined();
      expect(mockClient.query).toHaveBeenCalledTimes(5);
    });

    it('should update split payment status to completed when all splits are paid', async () => {
      // Arrange
      const splitId = '123';
      const paymentData = { method: 'credit_card' };

      // Mock transação
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({
          rows: [{
            id: parseInt(splitId),
            status: 'pending',
            user_id: parseInt(userId1),
            split_payment_id: 456
          }]
        }) // SELECT split
        .mockResolvedValueOnce({
          rows: [{
            id: parseInt(splitId),
            status: 'paid',
            paid_at: new Date()
          }]
        }) // UPDATE split
        .mockResolvedValueOnce({
          rows: [
            { id: 789, status: 'paid' },
            { id: 790, status: 'paid' }
          ]
        }) // Check other splits (all paid)
        .mockResolvedValueOnce({ rows: [] }) // UPDATE parent to completed
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const result = await SplitPaymentService.markAsPaid(splitId, paymentData);

      // Assert
      expect(result.status).toBe('paid');
      expect(mockClient.query).toHaveBeenCalledTimes(6);
    });

    it('should throw error if split does not exist', async () => {
      // Arrange
      // Mock transação
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // SELECT split (não encontrado)
        .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

      // Act & Assert
      await expect(
        SplitPaymentService.markAsPaid('999', { method: 'credit_card' })
      ).rejects.toThrow('Split não encontrado');
    });
  });

  describe('getBookingSplits', () => {
    it('should return splits for a booking', async () => {
      // Arrange
      mockRedisCache.get = jest.fn().mockResolvedValue(null);
      
      // Mock queryDatabase para buscar split payment
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: 456,
          booking_id: parseInt(bookingId),
          total_amount: 200,
          split_type: 'custom',
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        }])
        .mockResolvedValueOnce([
          {
            id: 1,
            split_payment_id: 456,
            user_id: parseInt(userId1),
            amount: 100,
            percentage: 50,
            status: 'pending',
            paid_at: null,
            payment_method: null,
            user_name: 'User 1',
            user_email: 'user1@test.com'
          },
          {
            id: 2,
            split_payment_id: 456,
            user_id: parseInt(userId2),
            amount: 100,
            percentage: 50,
            status: 'pending',
            paid_at: null,
            payment_method: null,
            user_name: 'User 2',
            user_email: 'user2@test.com'
          }
        ]); // Participants
      
      mockRedisCache.set = jest.fn();

      // Act
      const result = await SplitPaymentService.getBookingSplits(bookingId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.splits).toHaveLength(2);
      expect(mockRedisCache.set).toHaveBeenCalled();
    });

    it('should return cached splits if available', async () => {
      // Arrange
      const cachedSplits = {
        id: 'split-payment-123',
        bookingId,
        status: 'pending',
        splits: []
      };

      mockRedisCache.get = jest.fn().mockResolvedValue(JSON.stringify(cachedSplits));

      // Act
      const result = await SplitPaymentService.getBookingSplits(bookingId);

      // Assert
      expect(result).toBeDefined();
      expect(mockQueryDatabase).not.toHaveBeenCalled();
    });
  });

  describe('getUserSplits', () => {
    it('should return all splits for a user', async () => {
      // Arrange
      const mockSplits = [
        {
          id: 1,
          split_payment_id: 456,
          user_id: parseInt(userId1),
          amount: 100,
          percentage: 50,
          status: 'pending',
          paid_at: null,
          payment_method: null,
          invitation_token: 'token1',
          invitation_expires_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          split_payment_id: 457,
          user_id: parseInt(userId1),
          amount: 150,
          percentage: 50,
          status: 'paid',
          paid_at: new Date(),
          payment_method: 'credit_card',
          invitation_token: 'token2',
          invitation_expires_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce(mockSplits);

      // Act
      const result = await SplitPaymentService.getUserSplits(userId1, {
        status: 'pending',
        limit: 10,
        offset: 0
      });

      // Assert
      expect(result).toHaveLength(2);
      expect(result.filter(s => s.status === 'pending')).toHaveLength(1);
    });
  });

  describe('getSplitStatus', () => {
    it('should calculate split payment status correctly', async () => {
      // Arrange
      // getSplitStatus chama getBookingSplits internamente
      mockRedisCache.get = jest.fn().mockResolvedValue(null);
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: 456,
          booking_id: parseInt(bookingId),
          total_amount: 300,
          split_type: 'custom',
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        }])
        .mockResolvedValueOnce([
          {
            id: 1,
            split_payment_id: 456,
            user_id: parseInt(userId1),
            amount: 100,
            percentage: 33.33,
            status: 'paid',
            paid_at: new Date(),
            payment_method: 'credit_card',
            user_name: 'User 1',
            user_email: 'user1@test.com'
          },
          {
            id: 2,
            split_payment_id: 456,
            user_id: parseInt(userId2),
            amount: 100,
            percentage: 33.33,
            status: 'paid',
            paid_at: new Date(),
            payment_method: 'credit_card',
            user_name: 'User 2',
            user_email: 'user2@test.com'
          },
          {
            id: 3,
            split_payment_id: 456,
            user_id: parseInt(userId3),
            amount: 100,
            percentage: 33.33,
            status: 'pending',
            paid_at: null,
            payment_method: null,
            user_name: 'User 3',
            user_email: 'user3@test.com'
          }
        ]);

      // Act
      const status = await SplitPaymentService.getSplitStatus(bookingId);

      // Assert
      expect(status.total).toBe(300);
      expect(status.paid).toBe(200);
      expect(status.pending).toBe(100);
      expect(status.percentage).toBeCloseTo(66.67, 1);
    });
  });

  describe('sendReminder', () => {
    it('should send reminder successfully', async () => {
      // Arrange
      const splitId = '123';
      
      // sendReminder usa queryDatabase, não client.query
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([{
        id: parseInt(splitId),
        user_id: parseInt(userId1),
        status: 'pending',
        last_reminder_at: null
      }]); // SELECT split

      mockRedisCache.get = jest.fn().mockResolvedValue(null); // No reminder sent today
      mockRedisCache.set = jest.fn(); // Para salvar reminder

      // Act
      await SplitPaymentService.sendReminder(splitId);

      // Assert
      expect(mockQueryDatabase).toHaveBeenCalled();
      expect(mockRedisCache.set).toHaveBeenCalled();
    });

    it('should not send reminder if already sent today', async () => {
      // Arrange
      const splitId = '123';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // sendReminder usa queryDatabase
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([{
        id: parseInt(splitId),
        user_id: parseInt(userId1),
        status: 'pending',
        last_reminder_at: today
      }]); // SELECT split

      // Mock cache indicando que lembrete já foi enviado nas últimas 24h
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 12); // 12 horas atrás (menos de 24h)
      mockRedisCache.get = jest.fn().mockResolvedValue(JSON.stringify(yesterday));

      // Act & Assert
      await expect(SplitPaymentService.sendReminder(splitId)).rejects.toThrow(
        'Lembrete já enviado nas últimas 24 horas'
      );
    });
  });
});

