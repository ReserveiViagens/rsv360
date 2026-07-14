import type { Express } from 'express';
import agentesRouter from './routes/index';

export function registerAgentesModule(app: Express) {
  app.use('/api/v1/agentes', agentesRouter);
  console.log('[MODULE] Agentes (F1+F2b+F2c-2 Instrutor — flags OFF) registrado ✓');
}

export default agentesRouter;
module.exports = { registerAgentesModule, agentesRouter };
