/**
 * ✅ FASE 4: Validações de Dados com Zod
 * Validações para todas as entidades de Group Travel
 * 
 * @module lib/group-travel/validations
 */

import { z } from 'zod';

// ============================================
// WISHLIST VALIDATIONS
// ============================================

export const CreateWishlistSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  tripDate: z.string().datetime().optional(),
  destination: z.string().min(2, 'Destino inválido').max(200).optional(),
  isPublic: z.boolean().default(false),
  maxMembers: z.number().int().min(2).max(50).optional()
});

export const UpdateWishlistSchema = CreateWishlistSchema.partial();

export const AddItemSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  price: z.number().min(0, 'Preço não pode ser negativo').max(1000000),
  currency: z.string().length(3, 'Código de moeda inválido').default('BRL'),
  category: z.string().max(50).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  link: z.string().url('URL inválida').optional().or(z.literal('')),
  imageUrl: z.string().url('URL de imagem inválida').optional().or(z.literal(''))
});

export const UpdateItemSchema = AddItemSchema.partial();

export const InviteMemberSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['viewer', 'editor']).default('viewer')
});

// ============================================
// VOTE VALIDATIONS
// ============================================

export const VoteSchema = z.object({
  itemId: z.string().uuid('ID do item inválido'),
  type: z.enum(['up', 'down']),
  comment: z.string().max(500).optional()
});

// ============================================
// SPLIT PAYMENT VALIDATIONS
// ============================================

export const CreateSplitPaymentSchema = z.object({
  bookingId: z.string().uuid('ID da reserva inválido'),
  splits: z.array(z.object({
    userId: z.string().uuid('ID do usuário inválido'),
    amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
    percentage: z.number().min(0).max(100).optional()
  })).min(1, 'Deve ter pelo menos uma divisão'),
  currency: z.string().length(3).default('BRL'),
  dueDate: z.string().datetime().optional(),
  description: z.string().max(500).optional()
}).refine(
  (data) => {
    const total = data.splits.reduce((sum, split) => sum + split.amount, 0);
    return total > 0;
  },
  { message: 'Total dos splits deve ser maior que zero' }
);

export const MarkAsPaidSchema = z.object({
  splitId: z.string().uuid('ID do split inválido'),
  method: z.string().min(1, 'Método de pagamento é obrigatório'),
  transactionId: z.string().max(200).optional(),
  paidAt: z.string().datetime().optional()
});

export const SendReminderSchema = z.object({
  splitId: z.string().uuid('ID do split inválido'),
  message: z.string().max(500).optional()
});

// ============================================
// GROUP CHAT VALIDATIONS
// ============================================

export const CreateChatSchema = z.object({
  wishlistId: z.string().uuid('ID da wishlist inválido'),
  name: z.string().min(3).max(100).optional(),
  isPublic: z.boolean().default(false)
});

export const SendMessageSchema = z.object({
  chatId: z.string().uuid('ID do chat inválido'),
  content: z.string().min(1, 'Mensagem não pode estar vazia').max(2000, 'Mensagem muito longa'),
  attachments: z.array(z.object({
    type: z.enum(['image', 'file', 'link']),
    url: z.string().url(),
    name: z.string().max(200).optional()
  })).max(5, 'Máximo de 5 anexos').optional()
});

export const UpdateMessageSchema = z.object({
  messageId: z.string().uuid('ID da mensagem inválido'),
  content: z.string().min(1).max(2000)
});

export const AddCommentSchema = z.object({
  messageId: z.string().uuid('ID da mensagem inválido'),
  content: z.string().min(1, 'Comentário não pode estar vazio').max(500, 'Comentário muito longo')
});

// ============================================
// QUERY VALIDATIONS
// ============================================

export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

export const SortOptionsSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('desc')
});

export const WishlistQuerySchema = PaginationSchema.extend({
  search: z.string().max(200).optional(),
  category: z.string().max(50).optional(),
  sortBy: z.enum(['createdAt', 'name', 'tripDate', 'memberCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Valida dados usando um schema Zod
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

/**
 * Valida e sanitiza dados
 */
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Valida query parameters
 */
export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: Record<string, unknown>): T {
  return schema.parse(params);
}

