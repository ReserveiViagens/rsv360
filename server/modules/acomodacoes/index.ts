import type { Express } from 'express';
import acomodacoesRouter from './routes/index';
import importRouter from './routes/import.routes';

export function registerAcomodacoesModule(app: Express) {
  app.use('/api/v1/acomodacoes', acomodacoesRouter);
  app.use('/api/v1/acomodacoes/import', importRouter);
  console.log('[MODULE] Acomodações (tipologia + wizard_addons + importador) registrado ✓');
}

module.exports = { registerAcomodacoesModule, acomodacoesRouter };
