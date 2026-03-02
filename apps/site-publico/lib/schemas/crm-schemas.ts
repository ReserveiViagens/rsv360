/**
 * Schemas Zod para CRM
 * Validação de dados de entrada para APIs de CRM
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

export const InteractionTypeSchema = z.enum([
  'call',
  'email',
  'meeting',
  'chat',
  'ticket',
  'booking',
  'payment',
  'support',
  'feedback',
  'other'
]);

export const InteractionChannelSchema = z.enum([
  'phone',
  'email',
  'whatsapp',
  'web',
  'app',
  'in_person',
  'sms',
  'social_media',
  'other'
]);

export const InteractionPrioritySchema = z.enum([
  'low',
  'normal',
  'high',
  'urgent'
]);

export const InteractionSentimentSchema = z.enum([
  'positive',
  'neutral',
  'negative'
]);

export const CampaignTypeSchema = z.enum([
  'email',
  'sms',
  'push',
  'whatsapp',
  'social',
  'display',
  'retargeting',
  'other'
]);

export const CampaignStatusSchema = z.enum([
  'draft',
  'scheduled',
  'running',
  'paused',
  'completed',
  'cancelled'
]);

export const CampaignRecipientStatusSchema = z.enum([
  'pending',
  'sent',
  'delivered',
  'opened',
  'clicked',
  'converted',
  'bounced',
  'unsubscribed',
  'failed'
]);

export const PreferenceTypeSchema = z.enum([
  'string',
  'boolean',
  'number',
  'json'
]);

export const PreferenceCategorySchema = z.enum([
  'accommodation',
  'services',
  'communication',
  'marketing',
  'payment',
  'other'
]);

export const PreferenceSourceSchema = z.enum([
  'explicit',
  'inferred',
  'behavioral',
  'default'
]);

// ============================================
// CUSTOMER PROFILE SCHEMAS
// ============================================

export const CustomerProfileSchema = z.object({
  id: z.number().int().positive().optional(),
  user_id: z.number().int().positive().optional(),
  customer_id: z.number().int().positive().optional(),
  preferences: z.record(z.unknown()).optional().default({}),
  loyalty_tier: LoyaltyTierSchema.optional().default('bronze'),
  total_spent: z.number().nonnegative().optional().default(0),
  total_bookings: z.number().int().nonnegative().optional().default(0),
  last_booking_at: z.string().datetime().optional().nullable(),
  first_booking_at: z.string().datetime().optional().nullable(),
  average_booking_value: z.number().nonnegative().optional().default(0),
  lifetime_value: z.number().nonnegative().optional().default(0),
  churn_risk_score: z.number().min(0).max(100).optional().default(0),
  engagement_score: z.number().min(0).max(100).optional().default(0),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({})
});

export const CreateCustomerProfileSchema = CustomerProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).partial({
  preferences: true,
  metadata: true
});

export const UpdateCustomerProfileSchema = CustomerProfileSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
});

// ============================================
// SEGMENT SCHEMAS
// ============================================

export const SegmentCriteriaSchema = z.object({
  min_bookings: z.number().int().nonnegative().optional(),
  min_total_spent: z.number().nonnegative().optional(),
  loyalty_tier: z.array(LoyaltyTierSchema).optional(),
  tags: z.array(z.string()).optional(),
  last_booking_days: z.number().int().nonnegative().optional(),
  engagement_score_min: z.number().min(0).max(100).optional(),
  churn_risk_max: z.number().min(0).max(100).optional(),
  customer_type: z.array(z.string()).optional(),
  // Adicionar mais critérios conforme necessário
}).passthrough(); // Permite campos adicionais

export const SegmentSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  criteria: SegmentCriteriaSchema,
  is_active: z.boolean().optional().default(true),
  is_auto_update: z.boolean().optional().default(true),
  customer_count: z.number().int().nonnegative().optional().default(0),
  last_calculated_at: z.string().datetime().optional().nullable(),
  created_by: z.number().int().positive().optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateSegmentSchema = SegmentSchema.omit({
  id: true,
  customer_count: true,
  last_calculated_at: true,
  created_at: true,
  updated_at: true
});

export const UpdateSegmentSchema = SegmentSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
});

// ============================================
// INTERACTION SCHEMAS
// ============================================

export const InteractionSchema = z.object({
  id: z.number().int().positive().optional(),
  customer_id: z.number().int().positive().optional().nullable(),
  user_id: z.number().int().positive().optional().nullable(),
  interaction_type: InteractionTypeSchema,
  channel: InteractionChannelSchema,
  subject: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  outcome: z.string().max(100).optional().nullable(),
  duration_minutes: z.number().int().nonnegative().optional().nullable(),
  sentiment: InteractionSentimentSchema.optional().nullable(),
  priority: InteractionPrioritySchema.optional().default('normal'),
  related_booking_id: z.number().int().positive().optional().nullable(),
  related_property_id: z.number().int().positive().optional().nullable(),
  related_campaign_id: z.number().int().positive().optional().nullable(),
  interaction_date: z.string().datetime(),
  scheduled_at: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateInteractionSchema = InteractionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  interaction_date: z.string().datetime().optional() // Opcional, usa CURRENT_TIMESTAMP se não fornecido
});

export const UpdateInteractionSchema = InteractionSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
});

// ============================================
// CUSTOMER PREFERENCE SCHEMAS
// ============================================

export const CustomerPreferenceSchema = z.object({
  id: z.number().int().positive().optional(),
  customer_id: z.number().int().positive().optional().nullable(),
  user_id: z.number().int().positive().optional().nullable(),
  preference_key: z.string().min(1).max(100),
  preference_value: z.string(),
  preference_type: PreferenceTypeSchema.optional().default('string'),
  category: PreferenceCategorySchema.optional().nullable(),
  is_active: z.boolean().optional().default(true),
  source: PreferenceSourceSchema.optional().nullable(),
  confidence: z.number().min(0).max(100).optional().default(100),
  metadata: z.record(z.unknown()).optional().default({}),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateCustomerPreferenceSchema = CustomerPreferenceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const UpdateCustomerPreferenceSchema = CustomerPreferenceSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const BulkUpdatePreferencesSchema = z.object({
  preferences: z.array(CreateCustomerPreferenceSchema)
});

// ============================================
// CAMPAIGN SCHEMAS
// ============================================

export const CampaignTargetCriteriaSchema = z.object({
  loyalty_tier: z.array(LoyaltyTierSchema).optional(),
  tags: z.array(z.string()).optional(),
  min_total_spent: z.number().nonnegative().optional(),
  min_bookings: z.number().int().nonnegative().optional(),
  // Adicionar mais critérios conforme necessário
}).passthrough();

export const CampaignContentSchema = z.object({
  images: z.array(z.string().url()).optional(),
  links: z.array(z.object({
    url: z.string().url(),
    text: z.string().optional()
  })).optional(),
  buttons: z.array(z.object({
    text: z.string(),
    url: z.string().url().optional(),
    action: z.string().optional()
  })).optional(),
  // Adicionar mais campos conforme necessário
}).passthrough();

export const CampaignSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  campaign_type: CampaignTypeSchema,
  channel: z.string().min(1).max(50),
  target_segment_id: z.number().int().positive().optional().nullable(),
  target_criteria: CampaignTargetCriteriaSchema.optional().nullable(),
  subject: z.string().max(255).optional().nullable(),
  message: z.string().min(1),
  template_id: z.string().max(100).optional().nullable(),
  content: CampaignContentSchema.optional().nullable(),
  status: CampaignStatusSchema.optional().default('draft'),
  scheduled_at: z.string().datetime().optional().nullable(),
  started_at: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
  total_recipients: z.number().int().nonnegative().optional().default(0),
  sent_count: z.number().int().nonnegative().optional().default(0),
  delivered_count: z.number().int().nonnegative().optional().default(0),
  opened_count: z.number().int().nonnegative().optional().default(0),
  clicked_count: z.number().int().nonnegative().optional().default(0),
  converted_count: z.number().int().nonnegative().optional().default(0),
  bounce_count: z.number().int().nonnegative().optional().default(0),
  unsubscribe_count: z.number().int().nonnegative().optional().default(0),
  budget: z.number().nonnegative().optional().nullable(),
  cost_per_click: z.number().nonnegative().optional().nullable(),
  cost_per_conversion: z.number().nonnegative().optional().nullable(),
  created_by: z.number().int().positive().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateCampaignSchema = CampaignSchema.omit({
  id: true,
  sent_count: true,
  delivered_count: true,
  opened_count: true,
  clicked_count: true,
  converted_count: true,
  bounce_count: true,
  unsubscribe_count: true,
  started_at: true,
  completed_at: true,
  created_at: true,
  updated_at: true
});

export const UpdateCampaignSchema = CampaignSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
});

// ============================================
// CAMPAIGN RECIPIENT SCHEMAS
// ============================================

export const CampaignRecipientSchema = z.object({
  id: z.number().int().positive().optional(),
  campaign_id: z.number().int().positive(),
  customer_id: z.number().int().positive().optional().nullable(),
  user_id: z.number().int().positive().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  status: CampaignRecipientStatusSchema.optional().default('pending'),
  sent_at: z.string().datetime().optional().nullable(),
  delivered_at: z.string().datetime().optional().nullable(),
  opened_at: z.string().datetime().optional().nullable(),
  clicked_at: z.string().datetime().optional().nullable(),
  converted_at: z.string().datetime().optional().nullable(),
  bounced_at: z.string().datetime().optional().nullable(),
  unsubscribed_at: z.string().datetime().optional().nullable(),
  error_message: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateCampaignRecipientSchema = CampaignRecipientSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const BulkCreateCampaignRecipientsSchema = z.object({
  recipients: z.array(CreateCampaignRecipientSchema)
});

// ============================================
// QUERY/FILTER SCHEMAS
// ============================================

export const CustomerProfileQuerySchema = z.object({
  user_id: z.number().int().positive().optional(),
  customer_id: z.number().int().positive().optional(),
  loyalty_tier: LoyaltyTierSchema.optional(),
  min_total_spent: z.number().nonnegative().optional(),
  max_total_spent: z.number().nonnegative().optional(),
  min_bookings: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sort_by: z.enum(['total_spent', 'total_bookings', 'last_booking_at', 'created_at']).optional().default('total_spent'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});

export const InteractionQuerySchema = z.object({
  customer_id: z.number().int().positive().optional(),
  user_id: z.number().int().positive().optional(),
  interaction_type: InteractionTypeSchema.optional(),
  channel: InteractionChannelSchema.optional(),
  priority: InteractionPrioritySchema.optional(),
  sentiment: InteractionSentimentSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  related_booking_id: z.number().int().positive().optional(),
  related_campaign_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sort_by: z.enum(['interaction_date', 'created_at', 'priority']).optional().default('interaction_date'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});

export const SegmentQuerySchema = z.object({
  is_active: z.boolean().optional(),
  is_auto_update: z.boolean().optional(),
  created_by: z.number().int().positive().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sort_by: z.enum(['name', 'customer_count', 'created_at']).optional().default('name'),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc')
});

export const CampaignQuerySchema = z.object({
  campaign_type: CampaignTypeSchema.optional(),
  channel: z.string().optional(),
  status: CampaignStatusSchema.optional(),
  target_segment_id: z.number().int().positive().optional(),
  created_by: z.number().int().positive().optional(),
  scheduled_from: z.string().datetime().optional(),
  scheduled_to: z.string().datetime().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sort_by: z.enum(['name', 'created_at', 'scheduled_at', 'status']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});

export const CustomerPreferenceQuerySchema = z.object({
  customer_id: z.number().int().positive().optional(),
  user_id: z.number().int().positive().optional(),
  preference_key: z.string().optional(),
  category: PreferenceCategorySchema.optional(),
  is_active: z.boolean().optional(),
  source: PreferenceSourceSchema.optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20)
});

// ============================================
// EXPORT TYPES
// ============================================

export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;
export type CreateCustomerProfile = z.infer<typeof CreateCustomerProfileSchema>;
export type UpdateCustomerProfile = z.infer<typeof UpdateCustomerProfileSchema>;

export type Segment = z.infer<typeof SegmentSchema>;
export type CreateSegment = z.infer<typeof CreateSegmentSchema>;
export type UpdateSegment = z.infer<typeof UpdateSegmentSchema>;
export type SegmentCriteria = z.infer<typeof SegmentCriteriaSchema>;

export type Interaction = z.infer<typeof InteractionSchema>;
export type CreateInteraction = z.infer<typeof CreateInteractionSchema>;
export type UpdateInteraction = z.infer<typeof UpdateInteractionSchema>;

export type CustomerPreference = z.infer<typeof CustomerPreferenceSchema>;
export type CreateCustomerPreference = z.infer<typeof CreateCustomerPreferenceSchema>;
export type UpdateCustomerPreference = z.infer<typeof UpdateCustomerPreferenceSchema>;

export type Campaign = z.infer<typeof CampaignSchema>;
export type CreateCampaign = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaign = z.infer<typeof UpdateCampaignSchema>;

export type CampaignRecipient = z.infer<typeof CampaignRecipientSchema>;
export type CreateCampaignRecipient = z.infer<typeof CreateCampaignRecipientSchema>;

