import type { Express } from 'express';
import campanhasRouter from './routes/index';

export function registerCampanhasModule(app: Express) {
  app.use('/api/v1/campanhas', campanhasRouter);
  console.log('[MODULE] Campanhas/Cupons (Fase 1) registrado ✓');
}

export default campanhasRouter;
module.exports = { registerCampanhasModule, campanhasRouter };
