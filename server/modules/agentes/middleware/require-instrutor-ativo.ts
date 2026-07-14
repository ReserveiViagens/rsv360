import type { RequestHandler } from 'express';
import { AgentesConfigService } from '../config.service';

/**
 * Dupla flag: agentes_modulo_ativo E agente_instrutor_ativo.
 * Qualquer OFF → 404 genérico (fail-safe).
 */
export const requireInstrutorAtivo: RequestHandler = async (_req, res, next) => {
  try {
    const ativo = await AgentesConfigService.isInstrutorAtivo();
    if (!ativo) {
      return res.status(404).json({
        success: false,
        error: 'Módulo agentes desligado',
      });
    }
    return next();
  } catch {
    return res.status(404).json({
      success: false,
      error: 'Módulo agentes desligado',
    });
  }
};
