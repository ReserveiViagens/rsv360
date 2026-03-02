/**
 * ✅ FASE 5 - ETAPA 5.3: Testes Frontend - useSplitPayment Hook
 * Testes para o hook de divisão de pagamentos
 * 
 * @module __tests__/hooks/useSplitPayment.test
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSplitPayment } from '@/hooks/useSplitPayment';
import splitPaymentService from '@/lib/group-travel/api/split-payment.service';

// Mock do service frontend
jest.mock('@/lib/group-travel/api/split-payment.service');

const mockSplitPaymentService = splitPaymentService as jest.Mocked<typeof splitPaymentService>;

describe('useSplitPayment', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('bookingSplits query', () => {
    it('should fetch splits for a booking', async () => {
      // Arrange
      const bookingId = 'booking-123';
      const mockSplits = {
        id: 'split-payment-123',
        bookingId,
        status: 'pending',
        splits: [
          { id: 'split-1', userId: 'user-1', amount: 100, status: 'pending' },
          { id: 'split-2', userId: 'user-2', amount: 100, status: 'pending' }
        ]
      };

      mockSplitPaymentService.getBookingSplits = jest.fn().mockResolvedValue(mockSplits);

      // Act
      const { result } = renderHook(() => useSplitPayment({ bookingId }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.splitPayment).toBeDefined();
      });

      expect(result.current.splitPayment).toEqual(mockSplits);
      expect(mockSplitPaymentService.getBookingSplits).toHaveBeenCalledWith(bookingId);
    });
  });

  describe('createSplitPayment mutation', () => {
    it('should create split payment successfully', async () => {
      // Arrange
      const bookingId = 'booking-123';
      const createData = {
        bookingId,
        splits: [
          { userId: 'user-1', amount: 100 },
          { userId: 'user-2', amount: 100 }
        ],
        currency: 'BRL'
      };

      const mockSplitPayment = {
        id: 'split-payment-123',
        bookingId,
        ...createData
      };

      mockSplitPaymentService.createSplit = jest.fn().mockResolvedValue(mockSplitPayment);

      // Act
      const { result } = renderHook(() => useSplitPayment({ bookingId }), { wrapper });

      result.current.createSplit({ bookingId, data: createData });

      // Assert
      await waitFor(() => {
        expect(mockSplitPaymentService.createSplit).toHaveBeenCalledWith(bookingId, createData);
      });
    });
  });

  describe('markAsPaid mutation', () => {
    it('should mark split as paid', async () => {
      // Arrange
      const splitId = 'split-123';
      const paymentData = {
        method: 'credit_card',
        transactionId: 'txn-456'
      };

      const mockUpdated = {
        id: splitId,
        status: 'paid',
        paidAt: new Date()
      };

      mockSplitPaymentService.markAsPaid = jest.fn().mockResolvedValue(mockUpdated);

      // Act
      const { result } = renderHook(() => useSplitPayment(), { wrapper });

      result.current.markAsPaid({ splitId, paymentData });

      // Assert
      await waitFor(() => {
        expect(mockSplitPaymentService.markAsPaid).toHaveBeenCalledWith(splitId, paymentData);
      });
    });
  });

  describe('sendReminder mutation', () => {
    it('should send reminder successfully', async () => {
      // Arrange
      const splitId = 'split-123';
      mockSplitPaymentService.sendReminder = jest.fn().mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useSplitPayment(), { wrapper });

      result.current.sendReminder(splitId);

      // Assert
      await waitFor(() => {
        expect(mockSplitPaymentService.sendReminder).toHaveBeenCalledWith(splitId);
      });
    });
  });

  describe('getSplitStatus', () => {
    it('should calculate split status correctly', async () => {
      // Arrange
      const bookingId = 'booking-123';
      const mockSplits = {
        splits: [
          { amount: 100, status: 'paid' },
          { amount: 100, status: 'paid' },
          { amount: 100, status: 'pending' }
        ],
        totalAmount: 300
      };

      mockSplitPaymentService.getSplitStatus = jest.fn().mockResolvedValue({
        total: 300,
        paid: 200,
        pending: 100,
        percentage: 66.67
      });

      // Act
      const { result } = renderHook(() => useSplitPayment({ bookingId }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.splitStatus).toBeDefined();
      });

      const status = result.current.splitStatus;
      expect(status?.paid).toBe(200);
      expect(status?.pending).toBe(100);
      expect(status?.percentage).toBeCloseTo(66.67, 1);
    });
  });
});

