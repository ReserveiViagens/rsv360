import { z } from 'zod';

const disputeStatus = z.enum(['opened', 'in_review', 'won', 'lost', 'accepted']);

/** Writable dispute fields — never id / paymentId / createdAt (PR-07b). */
export const DisputeUpdateSchema = z
  .object({
    reason: z.string().max(2000).optional(),
    status: disputeStatus.optional(),
    amount: z.union([z.string(), z.number()]).optional(),
    evidence: z.record(z.unknown()).optional(),
    deadline: z.coerce.date().optional(),
    resolvedAt: z.coerce.date().nullable().optional(),
    externalId: z.string().max(255).optional(),
  })
  .strict();

export type DisputeUpdateInput = z.infer<typeof DisputeUpdateSchema>;

export const DisputeEvidenceSchema = z
  .object({
    evidence: z.record(z.unknown()),
  })
  .strict();
