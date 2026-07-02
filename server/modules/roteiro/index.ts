import type { Express } from 'express';
import roteiroPontosRouter from './routes/index';

export function registerRoteiroModule(app: Express) {
  app.use('/api/v1/roteiro', roteiroPontosRouter);
  console.log('[MODULE] Roteiro (mapa pontos) registrado ✓');
}

export default roteiroPontosRouter;

module.exports = { registerRoteiroModule, roteiroPontosRouter };
