import { z } from 'zod';

const interval = z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual']);

export const SubscriptionPlanCreateSchema = z
  .object({
    enterpriseId: z.string().uuid(),
    name: z.string().min(1).max(255),
    description: z.string().max(5000).optional(),
    amount: z.number().finite(),
    currency: z.string().length(3).default('BRL'),
    interval,
    intervalCount: z.number().int().positive().optional(),
    trialDays: z.number().int().nonnegative().optional(),
    features: z.record(z.unknown()).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

/** Align with UpdatePlanDTO + safe plan columns (no stripe/mp ids / enterpriseId). */
export const SubscriptionPlanUpdateSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(5000).optional(),
    amount: z.number().finite().optional(),
    features: z.record(z.unknown()).optional(),
    metadata: z.record(z.unknown()).optional(),
    isActive: z.boolean().optional(),
    currency: z.string().length(3).optional(),
    interval: interval.optional(),
    intervalCount: z.number().int().positive().optional(),
    trialDays: z.number().int().nonnegative().optional(),
  })
  .strict();

export const SubscriptionCreateSchema = z
  .object({
    enterpriseId: z.string().uuid(),
    customerId: z.string().uuid(),
    planId: z.string().uuid(),
    trialEnd: z.coerce.date().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const SubscriptionCancelSchema = z
  .object({
    atPeriodEnd: z.boolean().optional(),
  })
  .strict();

export const SubscriptionChangePlanSchema = z
  .object({
    newPlanId: z.string().uuid(),
  })
  .strict();

export type SubscriptionPlanUpdateInput = z.infer<typeof SubscriptionPlanUpdateSchema>;
