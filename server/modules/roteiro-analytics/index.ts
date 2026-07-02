import type { Express } from 'express';
import roteiroAnalyticsRouter from './routes/index';

export function registerRoteiroAnalyticsModule(app: Express) {
  app.use('/api/v1/roteiro', roteiroAnalyticsRouter);
  console.log('[MODULE] Roteiro Analytics (ingest) registrado ✓');
}

export default roteiroAnalyticsRouter;

module.exports = { registerRoteiroAnalyticsModule, roteiroAnalyticsRouter };
