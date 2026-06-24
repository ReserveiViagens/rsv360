import type { Express } from 'express';
import relatoriosRouter from './routes/index';

export function registerRelatoriosModule(app: Express) {
  app.use('/api/v1/relatorios', relatoriosRouter);
  console.log('[MODULE] Relatórios (Fase 1) registrado ✓');
}

export default relatoriosRouter;
module.exports = { registerRelatoriosModule, relatoriosRouter };
