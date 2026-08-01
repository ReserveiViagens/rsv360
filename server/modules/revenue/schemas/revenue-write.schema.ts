import { z } from 'zod';

export const PositiveIntIdParamSchema = z
  .object({
    id: z.coerce.number().int().positive().finite(),
  })
  .strict();

export function parsePositiveIntId(raw: unknown): number {
  const parsed = PositiveIntIdParamSchema.safeParse({ id: raw });
  if (!parsed.success) throw parsed.error;
  return parsed.data.id;
}

const ruleConditionSchema = z
  .object({
    occupancy_min: z.coerce.number().optional(),
    occupancy_max: z.coerce.number().optional(),
    days: z.array(z.coerce.number().int().min(0).max(6)).optional(),
    season_name: z.string().max(255).optional(),
    date_ranges: z
      .array(
        z
          .object({
            start: z.string().min(1),
            end: z.string().min(1),
          })
          .strict(),
      )
      .optional(),
    min_advance_days: z.coerce.number().int().optional(),
    max_advance_days: z.coerce.number().int().optional(),
    min_nights: z.coerce.number().int().optional(),
    max_nights: z.coerce.number().int().optional(),
    event_name: z.string().max(255).optional(),
  })
  .strict();

const ruleType = z.enum([
  'OCCUPANCY',
  'DAY_OF_WEEK',
  'SEASONAL',
  'ADVANCE',
  'LENGTH_OF_STAY',
  'LAST_MINUTE',
  'EVENT',
]);

export const PricingRuleWriteSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(5000).optional(),
    rule_type: ruleType.optional(),
    conditions: ruleConditionSchema.optional(),
    adjustment_type: z.enum(['percentage', 'fixed']).optional(),
    adjustment_value: z.coerce.number().optional(),
    priority: z.coerce.number().int().optional(),
    is_active: z.boolean().optional(),
    room_type_id: z.coerce.number().int().positive().optional(),
    channel: z.string().max(100).optional(),
    valid_from: z.string().max(40).optional(),
    valid_until: z.string().max(40).optional(),
    property_id: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const PricingRuleCreateSchema = PricingRuleWriteSchema.extend({
  name: z.string().min(1).max(255),
  rule_type: ruleType,
  adjustment_type: z.enum(['percentage', 'fixed']),
  adjustment_value: z.coerce.number(),
}).strict();

export const PricingRuleUpdateSchema = PricingRuleWriteSchema;

export const PricingRuleToggleSchema = z
  .object({
    isActive: z.boolean().optional(),
    is_active: z.boolean().optional(),
  })
  .strict();

export const PricingRuleReorderSchema = z
  .object({
    ruleIds: z.array(z.coerce.number().int().positive()).optional(),
    rule_ids: z.array(z.coerce.number().int().positive()).optional(),
  })
  .strict()
  .refine((d) => (d.ruleIds?.length ?? 0) > 0 || (d.rule_ids?.length ?? 0) > 0, {
    message: 'ruleIds is required',
  });

export const CompetitorRateWriteSchema = z
  .object({
    competitor_name: z.string().min(1).max(255).optional(),
    room_type_equivalent: z.string().max(255).optional(),
    date: z.string().min(1).max(40).optional(),
    price: z.coerce.number().nonnegative().optional(),
    currency: z.string().max(10).optional(),
    source: z.enum(['manual', 'scraping', 'api']).optional(),
    url: z.string().max(2000).optional(),
    notes: z.string().max(5000).optional(),
    property_id: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const CompetitorRateCreateSchema = CompetitorRateWriteSchema.extend({
  competitor_name: z.string().min(1).max(255),
  date: z.string().min(1).max(40),
  price: z.coerce.number().nonnegative(),
}).strict();

export const CompetitorRateUpdateSchema = CompetitorRateWriteSchema;

export const CompetitorBulkSchema = z
  .object({
    entries: z.array(CompetitorRateCreateSchema).min(1),
  })
  .strict();

export const DateRangeBodySchema = z
  .object({
    startDate: z.string().min(1).max(40).optional(),
    start: z.string().min(1).max(40).optional(),
    endDate: z.string().min(1).max(40).optional(),
    end: z.string().min(1).max(40).optional(),
    roomTypeId: z.coerce.number().int().positive().optional(),
    property_id: z.coerce.number().int().positive().optional(),
  })
  .strict()
  .refine((d) => Boolean(d.startDate || d.start), { message: 'startDate is required' })
  .refine((d) => Boolean(d.endDate || d.end), { message: 'endDate is required' });

export const RateOverrideSchema = z
  .object({
    roomTypeId: z.coerce.number().int().positive(),
    date: z.string().min(1).max(40),
    price: z.coerce.number().nonnegative(),
    property_id: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const RateOverrideRemoveSchema = z
  .object({
    roomTypeId: z.coerce.number().int().positive(),
    date: z.string().min(1).max(40),
    property_id: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const RateBulkOverrideSchema = z
  .object({
    updates: z
      .array(
        z
          .object({
            roomTypeId: z.coerce.number().int().positive(),
            date: z.string().min(1).max(40),
            price: z.coerce.number().nonnegative(),
          })
          .strict(),
      )
      .min(1),
    property_id: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const EngineCalculateSchema = z
  .object({
    roomTypeId: z.coerce.number().int().positive(),
    date: z.string().min(1).max(40),
    channel: z.string().max(100).optional(),
    nights: z.coerce.number().int().nonnegative().optional(),
    basePrice: z.coerce.number().nonnegative().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    occupancyRate: z.coerce.number().min(0).max(100).optional(),
    events: z.array(z.string().max(255)).optional(),
    property_id: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const EngineCalculateStaySchema = z
  .object({
    roomTypeId: z.coerce.number().int().positive(),
    checkIn: z.string().min(1).max(40),
    checkOut: z.string().min(1).max(40),
    channel: z.string().max(100).optional(),
    nights: z.coerce.number().int().nonnegative().optional(),
    basePrice: z.coerce.number().nonnegative().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    occupancyRate: z.coerce.number().min(0).max(100).optional(),
    events: z.array(z.string().max(255)).optional(),
    property_id: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const EngineOptimalSchema = z
  .object({
    roomTypeId: z.coerce.number().int().positive(),
    date: z.string().min(1).max(40),
    property_id: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const EngineSimulateSchema = z
  .object({
    roomTypeId: z.coerce.number().int().positive(),
    date: z.string().min(1).max(40),
    rules: z.array(PricingRuleWriteSchema).optional(),
    property_id: z.coerce.number().int().positive().optional(),
  })
  .strict();
