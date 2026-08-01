import { z } from 'zod';

/**
 * Stripe event shape after HMAC (I4).
 * Allowlist of known top-level keys + .strict() rejects mass-assign extras (isAdmin, …).
 * Expand allowlist if Stripe adds documented fields (PARAR if legitimate events 400).
 */
export const StripeWebhookEventSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    object: z.string().optional(),
    api_version: z.string().optional().nullable(),
    created: z.number().optional(),
    data: z.unknown().optional(),
    livemode: z.boolean().optional(),
    pending_webhooks: z.number().optional(),
    request: z.unknown().optional().nullable(),
  })
  .strict();

/**
 * Mercado Pago notification body after HMAC (I4).
 * Requires resolvable event id (body.id or data.id).
 */
export const MpWebhookBodySchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    type: z.string().optional(),
    action: z.string().optional(),
    data: z
      .object({
        id: z.union([z.string(), z.number()]).optional(),
      })
      .catchall(z.unknown())
      .optional(),
    live_mode: z.boolean().optional(),
    date_created: z.string().optional(),
    user_id: z.union([z.string(), z.number()]).optional(),
    api_version: z.string().optional(),
  })
  .strict()
  .refine((d) => d.id != null || d.data?.id != null, {
    message: 'Missing Mercado Pago event id',
  });

export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>;
export type MpWebhookBody = z.infer<typeof MpWebhookBodySchema>;
