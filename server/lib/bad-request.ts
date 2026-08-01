import type { Response } from 'express';
import { ZodError } from 'zod';

export type BadRequestOptions = {
  /** When true, wrap CRM/revenue-style `{ success: false, error, details? }`. */
  successEnvelope?: boolean;
  /** HTTP status for non-Zod errors (default 400). Payments 07b used 500. */
  nonZodStatus?: number;
};

/**
 * Shared Zod/validation error response (PR-07c3).
 * Replaces per-route `badRequest` copies from 07b/07c1/07c2.
 */
export function badRequest(res: Response, error: unknown, options: BadRequestOptions = {}) {
  const envelope = options.successEnvelope === true;
  if (error instanceof ZodError) {
    const payload = envelope
      ? { success: false as const, error: 'Validation failed', details: error.flatten() }
      : { error: 'Validation failed', details: error.flatten() };
    return res.status(400).json(payload);
  }
  const message = (error as Error)?.message || 'Bad request';
  const payload = envelope
    ? { success: false as const, error: message }
    : { error: message };
  return res.status(options.nonZodStatus ?? 400).json(payload);
}
