import type { Express } from 'express';
import passageirosRouter from './routes/index';

export function registerPassageirosModule(app: Express) {
  app.use('/api/v1/passageiros', passageirosRouter);
  console.log('[MODULE] Passageiros (Fase 1) registrado ✓');
}

export default passageirosRouter;
module.exports = { registerPassageirosModule, passageirosRouter };
