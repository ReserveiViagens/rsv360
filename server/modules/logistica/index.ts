import type { Express } from 'express';
import logisticaRouter from './routes/index';

export function registerLogisticaModule(app: Express) {
  app.use('/api/v1/logistica', logisticaRouter);
  console.log('[MODULE] Logística (Fase 1) registrado ✓');
}

export default logisticaRouter;
module.exports = { registerLogisticaModule, logisticaRouter };
