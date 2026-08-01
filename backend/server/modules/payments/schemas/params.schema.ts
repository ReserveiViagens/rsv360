import { z } from 'zod';

/** UUID path params for payments dispute/subscription resources (I2). */
export const PaymentUuidParamSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export type PaymentUuidParam = z.infer<typeof PaymentUuidParamSchema>;

export function parsePaymentUuidParam(id: unknown): string {
  const parsed = PaymentUuidParamSchema.safeParse({ id });
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data.id;
}
