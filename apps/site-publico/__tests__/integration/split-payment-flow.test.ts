/**
 * ✅ FASE 5 - ETAPA 5.2: Testes de Integração E2E - Fluxo Completo de Split Payment
 * Testa o fluxo completo de criação, divisão e pagamento de split payments
 * 
 * @module __tests__/integration/split-payment-flow.test
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import SplitPaymentService from '@/lib/group-travel/split-payment-service';
import { queryDatabase, getDbPool } from '@/lib/db';
import { redisCache } from '@/lib/redis-cache';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/redis-cache');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;
const mockGetDbPool = getDbPool as jest.MockedFunction<typeof getDbPool>;
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

describe('Split Payment Complete Flow E2E', () => {
  const bookingId = 'booking-123';
  const totalAmount = 300;
  const user1 = 'user-1';
  const user2 = 'user-2';
  const user3 = 'user-3';

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.get = jest.fn().mockResolvedValue(null);
    mockRedisCache.set = jest.fn().mockResolvedValue(undefined);
    mockRedisCache.delete = jest.fn().mockResolvedValue(true);
  });

  it('should handle complete split payment flow: create, pay, complete', async () => {
    // Setup mocks para transação de criação
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    const mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    };
    mockGetDbPool.mockReturnValue(mockPool as any);

    // 1. Mock para verificar booking existe (queryDatabase)
    (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([{
      id: bookingId,
      total_amount: totalAmount,
      user_id: user1
    }]);

    // 2. Mock para getBookingSplits (queryDatabase - não existe ainda)
    (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([]);

    // 3. Mock para transação: BEGIN
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    
    // 4. Mock para transação: INSERT split_payments
    mockClient.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        booking_id: parseInt(bookingId) || 123,
        total_amount: totalAmount,
        split_type: 'custom',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      }]
    });

    // 5. Mock para transação: INSERT participantes (3 inserts)
    mockClient.query
      .mockResolvedValueOnce({
        rows: [{
          id: 1,
          split_payment_id: 1,
          user_id: user1,
          amount: 100,
          percentage: 33.33,
          status: 'pending',
          paid_at: null,
          payment_method: null
        }]
      })
      .mockResolvedValueOnce({
        rows: [{
          id: 2,
          split_payment_id: 1,
          user_id: user2,
          amount: 100,
          percentage: 33.33,
          status: 'pending',
          paid_at: null,
          payment_method: null
        }]
      })
      .mockResolvedValueOnce({
        rows: [{
          id: 3,
          split_payment_id: 1,
          user_id: user3,
          amount: 100,
          percentage: 33.33,
          status: 'pending',
          paid_at: null,
          payment_method: null
        }]
      });

    // 6. Mock para transação: COMMIT
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    // 7. Create split payment (3 people, equal split)
    const createDTO = {
      bookingId,
      splits: [
        { userId: user1, amount: 100 },
        { userId: user2, amount: 100 },
        { userId: user3, amount: 100 }
      ],
      currency: 'BRL'
    };

    const splitPayment = await SplitPaymentService.createSplitPayment(bookingId, createDTO);
    expect(splitPayment.splits).toHaveLength(3);
    expect(splitPayment.status).toBe('pending');

    // 8. User 1 pays their split - Setup mocks para transação de pagamento
    const mockClient2 = {
      query: jest.fn(),
      release: jest.fn(),
    };
    const mockPool2 = {
      connect: jest.fn().mockResolvedValue(mockClient2),
    };
    mockGetDbPool.mockReturnValue(mockPool2 as any);

    // Mock para transação de pagamento
    mockClient2.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({
        rows: [{
          id: 1,
          split_payment_id: 1,
          user_id: user1,
          status: 'pending', // Primeiro busca - ainda está pending
          amount: 100,
          percentage: 33.33
        }]
      })
      .mockResolvedValueOnce({
        rows: [{
          id: 1,
          split_payment_id: 1,
          user_id: user1,
          status: 'paid', // Após update
          paid_at: new Date(),
          payment_method: 'credit_card',
          amount: 100,
          percentage: 33.33
        }]
      })
      .mockResolvedValueOnce({
        rows: [
          { status: 'paid' },
          { status: 'pending' },
          { status: 'pending' }
        ]
      })
      .mockResolvedValueOnce({ rows: [] }) // UPDATE split_payments
      .mockResolvedValueOnce({ rows: [] }); // COMMIT

    const paid1 = await SplitPaymentService.markAsPaid('1', {
      method: 'credit_card',
      transactionId: 'txn-1'
    });
    expect(paid1.status).toBe('paid');
  });

  it('should handle custom split percentages', async () => {
    // Setup mocks para transação
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    const mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    };
    mockGetDbPool.mockReturnValue(mockPool as any);

    // Arrange
    const customSplits = {
      bookingId,
      splits: [
        { userId: user1, amount: 150, percentage: 50 },
        { userId: user2, amount: 100, percentage: 33.33 },
        { userId: user3, amount: 50, percentage: 16.67 }
      ],
      currency: 'BRL'
    };

    // Mock para verificar booking existe
    (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([{ id: bookingId, total_amount: 300 }]);
    
    // Mock para getBookingSplits (não existe ainda) - primeira query retorna vazio
    (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([]);
    // Segunda query (participants) não será chamada se primeira retornar vazio

    // Mock para transação
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({
        rows: [{
          id: 2,
          booking_id: parseInt(bookingId) || 123,
          total_amount: 300,
          split_type: 'custom',
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: 4, split_payment_id: 2, user_id: user1, amount: 150, percentage: 50, status: 'pending', paid_at: null, payment_method: null }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: 5, split_payment_id: 2, user_id: user2, amount: 100, percentage: 33.33, status: 'pending', paid_at: null, payment_method: null }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: 6, split_payment_id: 2, user_id: user3, amount: 50, percentage: 16.67, status: 'pending', paid_at: null, payment_method: null }]
      })
      .mockResolvedValueOnce({ rows: [] }); // COMMIT

    // Act
    const result = await SplitPaymentService.createSplitPayment(bookingId, customSplits);

    // Assert
    expect(result.splits[0].amount).toBe(150);
    expect(result.splits[1].amount).toBe(100);
    expect(result.splits[2].amount).toBe(50);
  });

  it('should send reminders for unpaid splits', async () => {
    // Arrange
    const splitId = '2';
    (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([{
      id: parseInt(splitId),
      user_id: user2,
      status: 'pending',
      split_payment_id: 1,
      last_reminder_at: null
    }]);

    // Act
    await SplitPaymentService.sendReminder(splitId);

    // Assert
    expect(mockQueryDatabase).toHaveBeenCalledTimes(1);
    expect(mockRedisCache.set).toHaveBeenCalled();
  });
});
