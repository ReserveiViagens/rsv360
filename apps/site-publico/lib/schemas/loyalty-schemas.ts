/**
 * Schemas Zod para Loyalty (Fidelidade)
 * Validação de dados de entrada para APIs de Loyalty
 */

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const LoyaltyTierSchema = z.enum([
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond'
]);

export const LoyaltyTransactionTypeSchema = z.enum([
  'earned',
  'redeemed',
  'expired',
  'adjusted',
  'bonus',
  'refund'
]);

export const LoyaltyRewardTypeSchema = z.enum([
  'discount',
  'free_night',
  'upgrade',
  'cashback',
  'gift',
  'voucher'
]);

export const LoyaltyRedemptionStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'used',
  'expired'
]);

export const LoyaltyApplicableToSchema = z.enum([
  'all',
  'properties',
  'categories'
]);

// ============================================
// LOYALTY TIER SCHEMAS
// ============================================

export const LoyaltyTierFullSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  min_points: z.number().int().nonnegative().default(0),
  max_points: z.number().int().positive().nullable().optional(),
  benefits: z.record(z.unknown()).optional().default({}),
  discount_percentage: z.number().min(0).max(100).default(0),
  free_shipping: z.boolean().optional().default(false),
  priority_support: z.boolean().optional().default(false),
  exclusive_offers: z.boolean().optional().default(false),
  bonus_points_multiplier: z.number().positive().default(1.0),
  tier_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().optional().default(true),
  icon: z.string().max(255).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateLoyaltyTierSchema = LoyaltyTierFullSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const UpdateLoyaltyTierSchema = LoyaltyTierFullSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
});

// ============================================
// LOYALTY POINTS SCHEMAS
// ============================================

export const LoyaltyPointsSchema = z.object({
  id: z.number().int().positive().optional(),
  user_id: z.number().int().positive(),
  current_points: z.number().int().nonnegative().default(0),
  lifetime_points: z.number().int().nonnegative().default(0),
  points_redeemed: z.number().int().nonnegative().default(0),
  tier: LoyaltyTierSchema.optional().default('bronze'),
  tier_points_required: z.number().int().nonnegative().default(0),
  last_activity_at: z.string().datetime().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateLoyaltyPointsSchema = LoyaltyPointsSchema.omit({
  id: true,
  current_points: true,
  lifetime_points: true,
  points_redeemed: true,
  last_activity_at: true,
  created_at: true,
  updated_at: true
}).partial({
  tier: true,
  tier_points_required: true,
  metadata: true
});

export const UpdateLoyaltyPointsSchema = LoyaltyPointsSchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true
});

// ============================================
// LOYALTY TRANSACTION SCHEMAS
// ============================================

export const LoyaltyTransactionSchema = z.object({
  id: z.number().int().positive().optional(),
  user_id: z.number().int().positive(),
  loyalty_points_id: z.number().int().positive(),
  transaction_type: LoyaltyTransactionTypeSchema,
  points: z.number().int(), // Positivo para ganho, negativo para uso
  points_before: z.number().int(),
  points_after: z.number().int(),
  reference_type: z.string().max(50).optional().nullable(), // 'booking', 'review', 'referral', etc.
  reference_id: z.number().int().positive().optional().nullable(),
  description: z.string().optional().nullable(),
  expires_at: z.string().date().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
  created_at: z.string().datetime().optional()
});

export const CreateLoyaltyTransactionSchema = LoyaltyTransactionSchema.omit({
  id: true,
  points_before: true,
  points_after: true,
  created_at: true
}).extend({
  points: z.number().int().refine(
    (val) => {
      // Para 'earned', 'bonus' -> positivo
      // Para 'redeemed' -> negativo
      // Para outros tipos, pode ser positivo ou negativo
      return true; // Validação mais específica pode ser feita no service
    },
    { message: 'Pontos inválidos para o tipo de transação' }
  )
});

export const UpdateLoyaltyTransactionSchema = LoyaltyTransactionSchema.partial().omit({
  id: true,
  user_id: true,
  loyalty_points_id: true,
  created_at: true
});

// ============================================
// LOYALTY REWARD SCHEMAS
// ============================================

export const LoyaltyRewardSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  points_required: z.number().int().positive(),
  reward_type: LoyaltyRewardTypeSchema,
  reward_value: z.number().nonnegative().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  stock_quantity: z.number().int().positive().nullable().optional(), // NULL = ilimitado
  valid_from: z.string().date().optional().nullable(),
  valid_until: z.string().date().optional().nullable(),
  applicable_to: LoyaltyApplicableToSchema.optional().nullable(),
  applicable_properties: z.array(z.number().int().positive()).optional().nullable(),
  applicable_categories: z.array(z.string()).optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
}).refine(
  (data) => {
    // Se valid_from e valid_until estão definidos, valid_until deve ser >= valid_from
    if (data.valid_from && data.valid_until) {
      return new Date(data.valid_until) >= new Date(data.valid_from);
    }
    return true;
  },
  {
    message: 'Data de término deve ser maior ou igual à data de início',
    path: ['valid_until']
  }
);

export const CreateLoyaltyRewardSchema = LoyaltyRewardSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const UpdateLoyaltyRewardSchema = LoyaltyRewardSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
});

// ============================================
// LOYALTY REDEMPTION SCHEMAS
// ============================================

export const LoyaltyRedemptionSchema = z.object({
  id: z.number().int().positive().optional(),
  user_id: z.number().int().positive(),
  loyalty_points_id: z.number().int().positive(),
  reward_id: z.number().int().positive(),
  booking_id: z.number().int().positive().optional().nullable(),
  points_used: z.number().int().positive(),
  reward_value: z.number().nonnegative().optional().nullable(),
  status: LoyaltyRedemptionStatusSchema.optional().default('pending'),
  applied_at: z.string().datetime().optional().nullable(),
  expires_at: z.string().date().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateLoyaltyRedemptionSchema = LoyaltyRedemptionSchema.omit({
  id: true,
  status: true,
  applied_at: true,
  created_at: true,
  updated_at: true
}).partial({
  booking_id: true,
  reward_value: true,
  expires_at: true,
  metadata: true
});

export const UpdateLoyaltyRedemptionSchema = LoyaltyRedemptionSchema.partial().omit({
  id: true,
  user_id: true,
  loyalty_points_id: true,
  reward_id: true,
  points_used: true,
  created_at: true,
  updated_at: true
});

// ============================================
// QUERY/FILTER SCHEMAS
// ============================================

export const LoyaltyPointsQuerySchema = z.object({
  user_id: z.number().int().positive().optional(),
  tier: LoyaltyTierSchema.optional(),
  min_points: z.number().int().nonnegative().optional(),
  max_points: z.number().int().positive().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sort_by: z.enum(['current_points', 'lifetime_points', 'tier', 'last_activity_at']).optional().default('current_points'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});

export const LoyaltyTransactionQuerySchema = z.object({
  user_id: z.number().int().positive().optional(),
  loyalty_points_id: z.number().int().positive().optional(),
  transaction_type: LoyaltyTransactionTypeSchema.optional(),
  reference_type: z.string().optional(),
  reference_id: z.number().int().positive().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sort_by: z.enum(['created_at', 'points', 'transaction_type']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});

export const LoyaltyRewardQuerySchema = z.object({
  reward_type: LoyaltyRewardTypeSchema.optional(),
  is_active: z.boolean().optional(),
  min_points: z.number().int().nonnegative().optional(),
  max_points: z.number().int().positive().optional(),
  applicable_to: LoyaltyApplicableToSchema.optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sort_by: z.enum(['points_required', 'name', 'created_at']).optional().default('points_required'),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc')
});

export const LoyaltyRedemptionQuerySchema = z.object({
  user_id: z.number().int().positive().optional(),
  reward_id: z.number().int().positive().optional(),
  status: LoyaltyRedemptionStatusSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sort_by: z.enum(['created_at', 'points_used', 'status']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});

// ============================================
// BULK OPERATIONS SCHEMAS
// ============================================

export const BulkEarnPointsSchema = z.object({
  user_id: z.number().int().positive(),
  points: z.number().int().positive(),
  transaction_type: z.enum(['earned', 'bonus']).default('earned'),
  reference_type: z.string().max(50).optional(),
  reference_id: z.number().int().positive().optional(),
  description: z.string().optional(),
  expires_at: z.string().date().optional()
});

export const BulkRedeemPointsSchema = z.object({
  user_id: z.number().int().positive(),
  points: z.number().int().positive(),
  reward_id: z.number().int().positive(),
  booking_id: z.number().int().positive().optional(),
  description: z.string().optional()
});

// ============================================
// TYPE EXPORTS (para uso em TypeScript)
// ============================================

export type LoyaltyTier = z.infer<typeof LoyaltyTierFullSchema>;
export type CreateLoyaltyTier = z.infer<typeof CreateLoyaltyTierSchema>;
export type UpdateLoyaltyTier = z.infer<typeof UpdateLoyaltyTierSchema>;

export type LoyaltyPoints = z.infer<typeof LoyaltyPointsSchema>;
export type CreateLoyaltyPoints = z.infer<typeof CreateLoyaltyPointsSchema>;
export type UpdateLoyaltyPoints = z.infer<typeof UpdateLoyaltyPointsSchema>;

export type LoyaltyTransaction = z.infer<typeof LoyaltyTransactionSchema>;
export type CreateLoyaltyTransaction = z.infer<typeof CreateLoyaltyTransactionSchema>;
export type UpdateLoyaltyTransaction = z.infer<typeof UpdateLoyaltyTransactionSchema>;

export type LoyaltyReward = z.infer<typeof LoyaltyRewardSchema>;
export type CreateLoyaltyReward = z.infer<typeof CreateLoyaltyRewardSchema>;
export type UpdateLoyaltyReward = z.infer<typeof UpdateLoyaltyRewardSchema>;

export type LoyaltyRedemption = z.infer<typeof LoyaltyRedemptionSchema>;
export type CreateLoyaltyRedemption = z.infer<typeof CreateLoyaltyRedemptionSchema>;
export type UpdateLoyaltyRedemption = z.infer<typeof UpdateLoyaltyRedemptionSchema>;

export type LoyaltyPointsQuery = z.infer<typeof LoyaltyPointsQuerySchema>;
export type LoyaltyTransactionQuery = z.infer<typeof LoyaltyTransactionQuerySchema>;
export type LoyaltyRewardQuery = z.infer<typeof LoyaltyRewardQuerySchema>;
export type LoyaltyRedemptionQuery = z.infer<typeof LoyaltyRedemptionQuerySchema>;

export type BulkEarnPoints = z.infer<typeof BulkEarnPointsSchema>;
export type BulkRedeemPoints = z.infer<typeof BulkRedeemPointsSchema>;

