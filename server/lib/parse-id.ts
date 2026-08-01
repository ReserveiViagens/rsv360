import { z } from 'zod';

/** Numeric path id (I2) — shared across HK/CRM/revenue/financeiro (PR-07c3). */
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
