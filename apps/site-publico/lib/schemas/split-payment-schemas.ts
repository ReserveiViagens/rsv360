/**
 * ✅ SCHEMAS ZOD PARA SPLIT PAYMENTS
 * Validação robusta com Zod para todas as operações de split payment
 */

import { z } from 'zod';

// Schema para participante do split payment
export const splitPaymentParticipantSchema = z.object({
  user_id: z.number().int().positive().optional().nullable(),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .optional()
    .nullable(),
  amount: z.number()
    .positive('Valor deve ser positivo')
    .optional(),
  percentage: z.number()
    .min(0, 'Percentual deve ser no mínimo 0')
    .max(100, 'Percentual deve ser no máximo 100')
    .optional(),
}).refine(
  (data) => data.user_id || data.email,
  {
    message: 'user_id ou email é obrigatório',
    path: ['email'],
  }
).refine(
  (data) => data.amount !== undefined || data.percentage !== undefined,
  {
    message: 'amount ou percentage é obrigatório',
    path: ['amount'],
  }
);

// Schema para criar split payment
export const createSplitPaymentSchema = z.object({
  booking_id: z.number().int().positive('ID da reserva é obrigatório'),
  total_amount: z.number()
    .positive('Valor total deve ser positivo')
    .refine((val) => val > 0, {
      message: 'Valor total deve ser maior que zero',
    }),
  split_type: z.enum(['equal', 'percentage', 'custom']).default('equal'),
  participants: z.array(splitPaymentParticipantSchema)
    .min(1, 'Deve haver pelo menos um participante')
    .max(20, 'Máximo de 20 participantes'),
  created_by: z.number().int().positive().optional().nullable(),
}).refine(
  (data) => {
    if (data.split_type === 'equal') {
      // Para split igual, não precisa de amount ou percentage
      return true;
    }
    if (data.split_type === 'percentage') {
      // Para split por percentual, soma deve ser 100
      const totalPercentage = data.participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
      return Math.abs(totalPercentage - 100) < 0.01; // Tolerância para erros de ponto flutuante
    }
    if (data.split_type === 'custom') {
      // Para split customizado, soma dos amounts deve ser igual ao total_amount
      const totalAmount = data.participants.reduce((sum, p) => sum + (p.amount || 0), 0);
      return Math.abs(totalAmount - data.total_amount) < 0.01;
    }
    return true;
  },
  {
    message: 'Soma dos valores/percentuais não corresponde ao total',
    path: ['participants'],
  }
);

// Schema para atualizar participante
export const updateParticipantSchema = z.object({
  amount: z.number().positive().optional(),
  percentage: z.number().min(0).max(100).optional(),
  status: z.enum(['pending', 'invited', 'paid', 'cancelled']).optional(),
  payment_method: z.string().max(50).optional().nullable(),
});

// Schema para query params
export const getSplitPaymentQuerySchema = z.object({
  booking_id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
}).refine(
  (data) => data.booking_id || data.id,
  {
    message: 'booking_id ou id é obrigatório',
    path: ['booking_id'],
  }
);

