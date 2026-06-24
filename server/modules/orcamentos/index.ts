import type { Express } from 'express';
import orcamentosRouter from './routes/index';

export function registerOrcamentosModule(app: Express) {
  app.use('/api/v1/orcamentos', orcamentosRouter);
  console.log('[MODULE] Orçamentos (Fase 1) registrado ✓');
}

export default orcamentosRouter;

module.exports = { registerOrcamentosModule, orcamentosRouter: orcamentosRouter };
