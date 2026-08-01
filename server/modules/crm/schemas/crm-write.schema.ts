import { z } from 'zod';

export { PositiveIntIdParamSchema, parsePositiveIntId } from '../../../lib/parse-id';

const PRIVILEGED_KEYS = new Set(['isAdmin', 'role', 'password', 'password_hash', 'permissions']);

function rejectPrivilegedKeys(val: Record<string, unknown>, ctx: z.RefinementCtx) {
  for (const key of Object.keys(val)) {
    if (PRIVILEGED_KEYS.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unexpected key: ${key}`,
        path: [key],
      });
    }
  }
}

const lifecycle = z.enum([
  'prospect',
  'first_stay',
  'repeat',
  'loyal',
  'advocate',
  'at_risk',
  'lost',
]);

export const GuestProfileWriteSchema = z
  .object({
    user_id: z.coerce.number().int().positive().optional(),
    property_id: z.coerce.number().int().positive().optional(),
    first_name: z.string().min(1).max(255).optional(),
    last_name: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional().nullable(),
    phone: z.string().max(50).optional().nullable(),
    document_type: z.string().max(30).optional().nullable(),
    document_number: z.string().max(50).optional().nullable(),
    nationality: z.string().max(100).optional().nullable(),
    date_of_birth: z.string().max(40).optional().nullable(),
    gender: z.string().max(40).optional().nullable(),
    address_street: z.string().max(255).optional().nullable(),
    address_city: z.string().max(100).optional().nullable(),
    address_state: z.string().max(100).optional().nullable(),
    address_zip: z.string().max(30).optional().nullable(),
    address_country: z.string().max(100).optional().nullable(),
    preferred_language: z.string().max(20).optional().nullable(),
    preferred_room_type: z.string().max(100).optional().nullable(),
    preferred_floor: z.string().max(40).optional().nullable(),
    dietary_restrictions: z.string().max(1000).optional().nullable(),
    special_requests: z.string().max(2000).optional().nullable(),
    tags: z.array(z.string().max(100)).optional(),
    source: z.string().max(100).optional().nullable(),
    lifecycle_stage: lifecycle.optional(),
    notes: z.string().max(5000).optional().nullable(),
    is_vip: z.boolean().optional(),
    is_blacklisted: z.boolean().optional(),
    blacklist_reason: z.string().max(2000).optional().nullable(),
  })
  .strict();

export const GuestProfileUpdateSchema = GuestProfileWriteSchema;

export const GuestProfileCreateSchema = GuestProfileWriteSchema.extend({
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
}).strict();

export const GuestMergeSchema = z
  .object({
    keepId: z.coerce.number().int().positive(),
    mergeId: z.coerce.number().int().positive(),
  })
  .strict();

export const GuestVipSchema = z
  .object({
    is_vip: z.boolean().optional(),
  })
  .strict();

export const GuestBlacklistSchema = z
  .object({
    is_blacklisted: z.boolean().optional(),
    blacklist_reason: z.string().max(2000).optional(),
    reason: z.string().max(2000).optional(),
  })
  .strict();

const campaignStatus = z.enum(['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled']);

export const CampaignWriteSchema = z
  .object({
    userId: z.coerce.number().int().positive().optional(),
    user_id: z.coerce.number().int().positive().optional(),
    property_id: z.coerce.number().int().positive().optional(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(5000).optional().nullable(),
    type: z.string().max(100).optional().nullable(),
    channel: z.string().max(100).optional().nullable(),
    status: campaignStatus.optional(),
    segment_filter: z.record(z.unknown()).optional(),
    template_id: z.coerce.number().int().positive().optional().nullable(),
    subject: z.string().max(500).optional().nullable(),
    body: z.string().max(50000).optional().nullable(),
    scheduled_at: z.string().max(64).optional().nullable(),
  })
  .strict();

export const CampaignCreateSchema = CampaignWriteSchema.extend({
  name: z.string().min(1).max(255),
}).strict();

export const CampaignUpdateSchema = CampaignWriteSchema;

export const CampaignAudienceSchema = z
  .object({
    filter: z.record(z.unknown()).optional(),
  })
  .strict();

export const CampaignScheduleSchema = z
  .object({
    scheduledAt: z.string().min(1).max(64).optional(),
    scheduled_at: z.string().min(1).max(64).optional(),
  })
  .strict()
  .refine((d) => Boolean(d.scheduledAt || d.scheduled_at), {
    message: 'scheduledAt is required',
  });

export const SegmentWriteSchema = z
  .object({
    userId: z.coerce.number().int().positive().optional(),
    user_id: z.coerce.number().int().positive().optional(),
    property_id: z.coerce.number().int().positive().optional(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional().nullable(),
    filter_criteria: z.record(z.unknown()).optional(),
    is_dynamic: z.boolean().optional(),
  })
  .strict();

export const SegmentCreateSchema = SegmentWriteSchema.extend({
  name: z.string().min(1).max(255),
}).strict();

export const SegmentUpdateSchema = SegmentWriteSchema;

/** Accepts `{ filter }` or flat filter object; rejects privileged keys. */
export const SegmentPreviewBodySchema = z
  .record(z.unknown())
  .superRefine(rejectPrivilegedKeys)
  .transform((body) => {
    if (body.filter && typeof body.filter === 'object' && !Array.isArray(body.filter)) {
      return body.filter as Record<string, unknown>;
    }
    return body;
  });

export const LoyaltyProgramWriteSchema = z
  .object({
    userId: z.coerce.number().int().positive().optional(),
    user_id: z.coerce.number().int().positive().optional(),
    property_id: z.coerce.number().int().positive().optional(),
    name: z.string().min(1).max(255).optional(),
    points_per_brl: z.coerce.number().positive().optional(),
    points_expiry_days: z.coerce.number().int().nonnegative().optional(),
    is_active: z.boolean().optional(),
    tiers: z
      .array(
        z
          .object({
            name: z.string(),
            min_points: z.number(),
            benefits: z.array(z.string()),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();

export const LoyaltyEnrollSchema = z
  .object({
    guestProfileId: z.coerce.number().int().positive(),
    userId: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const LoyaltyEarnSchema = z
  .object({
    amount: z.coerce.number().positive(),
    bookingId: z.coerce.number().int().positive().optional(),
    description: z.string().max(500).optional(),
  })
  .strict();

export const LoyaltyRedeemSchema = z
  .object({
    points: z.coerce.number().positive(),
    description: z.string().max(500).optional(),
  })
  .strict();

export const LoyaltyBonusSchema = z
  .object({
    points: z.coerce.number().positive(),
    description: z.string().max(500).optional(),
  })
  .strict();
