import type { Express } from 'express';
import comissoesRouter from './routes/index';

export function registerComissoesModule(app: Express) {
  app.use('/api/v1/comissoes', comissoesRouter);
  console.log('[MODULE] Comissões (MVP-A) registrado ✓');
}

export default comissoesRouter;
module.exports = { registerComissoesModule, comissoesRouter };
