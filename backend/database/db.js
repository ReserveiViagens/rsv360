const { Pool } = require('pg');
const logger = require('../src/utils/logger');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'rsv_360_ecosystem',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Máximo de clientes no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log de erros do pool - NÃO encerrar o processo; o pool remove o cliente com falha e continua
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client (pool continua ativo):', err.message);
});

// Testar conexão (evitar ruído em ambiente de teste)
if (process.env.NODE_ENV !== 'test') {
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      logger.error('Database connection error:', err);
    } else {
      logger.info('✅ Database pool connected successfully');
    }
  });
}

module.exports = { pool };
