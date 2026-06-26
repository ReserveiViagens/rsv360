require('dotenv').config();
require('tsx/cjs');

const http = require('http');
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3001;
const { createApp } = require('./app');

async function startServer() {
  try {
    const app = await createApp();
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: { origin: process.env.CORS_ORIGIN || '*', methods: ['GET', 'POST'] },
      path: '/socket.io',
    });

    try {
      const { registerPropostaChatSocket } = require('../server/modules/propostas/websocket/proposta-chat.socket');
      const { setPropostaIo } = require('../server/modules/propostas/websocket/proposta-broadcast');
      registerPropostaChatSocket(io);
      setPropostaIo(io);
    } catch (err) {
      console.warn('[WS] Propostas Chat HITL não disponível:', err.message);
    }

    try {
      const { startReservasWorker } = require('../server/modules/fornecedores-hub/reservas.worker');
      void startReservasWorker();
    } catch (err) {
      console.warn('[fornecedores-hub] Worker reservas não disponível:', err.message);
    }

    try {
      const { startPropostasWorker } = require('../server/modules/propostas/propostas.worker');
      void startPropostasWorker();
    } catch (err) {
      console.warn('[propostas] Worker objeção não disponível:', err.message);
    }

    server.listen(PORT, () => {
      console.log(`[SERVER] RSV360 Backend API Server running on port ${PORT}`);
      console.log(`[SERVER] Health check: http://localhost:${PORT}/health`);
      console.log(`[WS] Socket.IO: ws://localhost:${PORT}/propostas`);
      console.log(`[SECURITY] Security health check: http://localhost:${PORT}/health/security`);
    });
  } catch (error) {
    console.error('[INIT] Failed to initialize server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
