import type { Express } from 'express';
import acomodacoesRouter from './routes/index';
import importRouter from './routes/import.routes';
import syncRouter from './routes/sync.routes';
import anfitriaoRouter from './routes/anfitriao.routes';

export function registerAcomodacoesModule(app: Express) {
  app.use('/api/v1/acomodacoes', acomodacoesRouter);
  app.use('/api/v1/acomodacoes/import', importRouter);
  app.use('/api/v1/acomodacoes/sync', syncRouter);
  app.use('/api/v1/acomodacoes/anfitriao', anfitriaoRouter);
  console.log('[MODULE] Acomodações (tipologia + wizard_addons + importador) registrado ✓');
}

module.exports = { registerAcomodacoesModule, acomodacoesRouter };
