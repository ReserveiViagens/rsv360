// Setup global para testes
const { pool } = require('../database/db');
const { disconnectDatabase } = require('../src/config/database');
const { disconnectRedis } = require('../src/config/redis');
const { stopRateLimitCleanup } = require('../src/websocket/server');

// Limpar banco de dados de teste antes de cada suite
beforeAll(async () => {
  // Conectar ao banco de dados de teste
  // TODO: Configurar banco de dados de teste separado
});

afterAll(async () => {
  // Fecha pool PG usado em services legados
  try {
    await pool.end();
  } catch (_) {
    // ignora se ja estiver fechado
  }

  // Fecha conexao knex usada pelo middleware de auth e outras rotas
  try {
    await disconnectDatabase();
  } catch (_) {
    // ignora se nao houver conexao ativa
  }

  // Fecha conexao Redis caso tenha sido aberta durante os testes
  try {
    await disconnectRedis();
  } catch (_) {
    // ignora se redis nao estiver conectado
  }

  // Fecha websocket caso algum teste tenha inicializado servidor completo
  try {
    if (global.wsServer?.io) {
      await new Promise((resolve) => global.wsServer.io.close(resolve));
    }
  } catch (_) {
    // ignora
  }

  // Garante encerramento de timers do módulo websocket
  try {
    stopRateLimitCleanup();
  } catch (_) {
    // ignora
  }
});

// Limpar dados de teste após cada teste
afterEach(async () => {
  // TODO: Limpar dados de teste
});

module.exports = {};
