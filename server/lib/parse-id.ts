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

/** Named path params (itemId, fnrhId, uid, …) — PR-07c4. */
export function parsePositiveIntParam(raw: unknown, field: string): number {
  const schema = z
    .object({
      [field]: z.coerce.number().int().positive().finite(),
    })
    .strict();
  const parsed = schema.safeParse({ [field]: raw });
  if (!parsed.success) throw parsed.error;
  return parsed.data[field] as number;
}

/** Zero-based indexes (e.g. documentos/:index) — PR-07c4. */
export function parseNonNegativeIntParam(raw: unknown, field: string): number {
  const schema = z
    .object({
      [field]: z.coerce.number().int().nonnegative().finite(),
    })
    .strict();
  const parsed = schema.safeParse({ [field]: raw });
  if (!parsed.success) throw parsed.error;
  return parsed.data[field] as number;
}
