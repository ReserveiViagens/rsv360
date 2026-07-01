import type { Express } from 'express';
import configuracoesRouter from './routes/index';

export function registerConfiguracoesModule(app: Express) {
  app.use('/api/v1/configuracoes', configuracoesRouter);
  console.log('[MODULE] Configurações (módulo propostas) registrado ✓');
}

export default configuracoesRouter;
module.exports = { registerConfiguracoesModule, configuracoesRouter };
