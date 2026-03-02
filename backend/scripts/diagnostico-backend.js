#!/usr/bin/env node
/**
 * Script de diagnóstico do backend - identifica por que o servidor não inicia
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const path = require('path');
const fs = require('fs');

console.log('\n========================================');
console.log('  DIAGNÓSTICO DO BACKEND RSV360');
console.log('========================================\n');

// 1. Variáveis de ambiente
console.log('1. Variáveis de ambiente:');
console.log('   DB_HOST:', process.env.DB_HOST || '(não definido)');
console.log('   DB_PORT:', process.env.DB_PORT || '(não definido)');
console.log('   DB_NAME:', process.env.DB_NAME || '(não definido)');
console.log('   PORT:', process.env.PORT || '5000');
console.log('   NODE_ENV:', process.env.NODE_ENV || '(não definido)');
console.log('');

// 2. Testar conexão com banco de dados
async function runDiagnostico() {
  console.log('2. Testando conexão com PostgreSQL...');
  const knex = require('knex');
  const knexConfig = require('../knexfile');
  const config = knexConfig[process.env.NODE_ENV || 'development'];

  try {
    const db = knex(config);
    const result = await db.raw('SELECT 1 as ok');
    const ok = result.rows?.[0]?.ok ?? result[0]?.[0] ?? result;
    console.log('   ✅ Banco de dados OK:', ok);
    await db.destroy();
  } catch (err) {
    console.log('   ❌ Erro ao conectar ao banco:', err.message);
  }
  console.log('');

  // 3. Testar Redis (opcional)
  console.log('3. Testando Redis (opcional)...');
  try {
    const redis = require('redis');
    const client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        connectTimeout: 3000,
      },
    });
    await client.connect();
    const pong = await client.ping();
    console.log('   ✅ Redis OK:', pong);
    await client.quit();
  } catch (err) {
    console.log('   ⚠️  Redis não disponível (não bloqueia):', err.message);
  }
  console.log('');

  // 4. Verificar se server.js pode ser carregado
  console.log('4. Carregando módulos do servidor...');
  const serverPath = path.join(__dirname, '../src/server.js');
  if (!fs.existsSync(serverPath)) {
    console.log('   ❌ server.js não encontrado');
  } else {
    try {
      require('../src/server');
      console.log('   ✅ server.js carregado sem erros');
    } catch (e) {
      console.log('   ❌ Erro ao carregar server.js:', e.message);
      console.log('   Stack:', e.stack);
    }
  }
  console.log('');

  // 5. Iniciar servidor em modo teste (timeout curto)
  console.log('5. Iniciando servidor (teste de 5 segundos)...');
  try {
    const { startServer } = require('../src/server');
    const timeout = setTimeout(() => {
      console.log('   ⏱️  Servidor iniciou e está rodando (timeout de teste)');
      process.exit(0);
    }, 5000);

    const { server } = await startServer();
    console.log('   ✅ Servidor iniciou com sucesso na porta', process.env.PORT || 5000);
    clearTimeout(timeout);
    server.close(() => {
      console.log('   Servidor encerrado (teste concluído)');
      process.exit(0);
    });
  } catch (err) {
    console.log('   ❌ Erro ao iniciar servidor:', err.message);
    console.log('   Stack:', err.stack);
    process.exit(1);
  }
}

runDiagnostico().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
