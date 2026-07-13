import type { RequestHandler } from 'express';
import { AgentesConfigService } from '../config.service';

/** Rotas /api/v1/agentes/* — 404 genérico quando flag OFF (fail-safe). */
export const requireAgentesAtivo: RequestHandler = async (_req, res, next) => {
  try {
    const ativo = await AgentesConfigService.isModuloAtivo();
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
