import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';

type AuthedRequest = {
  user?: { id?: number };
  ip?: string;
};

/** 10 req / minuto / usuário autenticado (fallback IP). */
export const instrutorRateLimit: RequestHandler = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Chave por user id (principal); IP só como fallback — validação IPv6 off (não é IP-first).
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    const r = req as AuthedRequest;
    const uid = r.user?.id;
    if (uid != null) return `instrutor:user:${uid}`;
    return `instrutor:ip:${r.ip || 'unknown'}`;
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Muitas solicitações. Tente novamente em instantes.',
    });
  },
});
