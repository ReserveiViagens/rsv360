import type { RequestHandler } from 'express';
import { getClientIp } from './get-client-ip';
import { verificarTurnstile } from '../lib/turnstile';

/** Exige `turnstileToken` no body JSON em ações sensíveis públicas. */
export const requireTurnstile: RequestHandler = async (req, res, next) => {
  try {
    const token =
      (req.body?.turnstileToken as string | undefined) ??
      (req.body?.cfTurnstileResponse as string | undefined);
    const result = await verificarTurnstile(token, getClientIp(req));
    if (!result.ok) {
      return res.status(403).json({ success: false, error: result.error ?? 'Turnstile inválido' });
    }
    return next();
  } catch (error) {
    return res.status(403).json({ success: false, error: (error as Error).message });
  }
};

module.exports = { requireTurnstile };
