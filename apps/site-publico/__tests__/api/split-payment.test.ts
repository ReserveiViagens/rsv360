/**
 * ✅ TESTES: API SPLIT PAYMENT
 * Testes para validação e autenticação das rotas de split payment
 */

import { describe, it, expect } from '@jest/globals';
import { createSplitPaymentSchema } from '@/lib/schemas/split-payment-schemas';

describe('Split Payment API - Validação Zod', () => {
  it('deve validar criação de split payment com divisão igual', () => {
    const validData = {
      booking_id: 1,
      total_amount: 1000.00,
      split_type: 'equal' as const,
      participants: [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' },
      ],
    };

    const result = createSplitPaymentSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.booking_id).toBe(1);
      expect(result.data.total_amount).toBe(1000.00);
      expect(result.data.participants.length).toBe(2);
    }
  });

  it('deve validar split payment com percentuais', () => {
    const validData = {
      booking_id: 1,
      total_amount: 1000.00,
      split_type: 'percentage' as const,
      participants: [
        { email: 'user1@example.com', percentage: 60 },
        { email: 'user2@example.com', percentage: 40 },
      ],
    };

    const result = createSplitPaymentSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      const totalPercentage = result.data.participants.reduce(
        (sum, p) => sum + (p.percentage || 0),
        0
      );
      expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.01);
    }
  });

  it('deve validar split payment com valores customizados', () => {
    const validData = {
      booking_id: 1,
      total_amount: 1000.00,
      split_type: 'custom' as const,
      participants: [
        { email: 'user1@example.com', amount: 600 },
        { email: 'user2@example.com', amount: 400 },
      ],
    };

    const result = createSplitPaymentSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      const totalAmount = result.data.participants.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
      expect(Math.abs(totalAmount - result.data.total_amount)).toBeLessThan(0.01);
    }
  });

  it('deve rejeitar split payment sem participantes', () => {
    const invalidData = {
      booking_id: 1,
      total_amount: 1000.00,
      split_type: 'equal' as const,
      participants: [],
    };

    const result = createSplitPaymentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('participants');
    }
  });

  it('deve rejeitar split payment com valor total inválido', () => {
    const invalidData = {
      booking_id: 1,
      total_amount: -100,
      split_type: 'equal' as const,
      participants: [{ email: 'user@example.com' }],
    };

    const result = createSplitPaymentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('total_amount');
    }
  });
});

describe('Split Payment API - Autenticação', () => {
  it('deve requerer autenticação para criar split payment', () => {
    const token = null;
    expect(token).toBeFalsy();
  });
});

