import type { Express } from 'express';
import financeiroRouter from './routes/index';

export function registerFinanceiroModule(app: Express) {
  app.use('/api/v1/financeiro', financeiroRouter);
  console.log('[MODULE] Financeiro (Fase 1) registrado ✓');
}

export default financeiroRouter;
module.exports = { registerFinanceiroModule, financeiroRouter };
