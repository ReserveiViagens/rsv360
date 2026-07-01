import type { Express } from 'express';
import type { Server } from 'socket.io';
import propostasRouter from './routes/index';
import { registerPropostaChatSocket } from './websocket/proposta-chat.socket';
import { registerPropostasMetrics } from './metrics';

export function registerPropostasModule(app: Express, io?: Server) {
  registerPropostasMetrics();
  app.use('/api/v1/propostas', propostasRouter);
  if (io) registerPropostaChatSocket(io);
  console.log('[MODULE] Propostas + Chat HITL (Fase 1) registrado ✓');
}

export default propostasRouter;

module.exports = { registerPropostasModule, propostasRouter };
