/**
 * ✅ SCRIPT DE VERIFICAÇÃO DO AMBIENTE RSV GEN 2
 * 
 * Verifica se todas as dependências e serviços estão configurados:
 * - Redis
 * - WebSocket
 * - PostgreSQL
 * - Variáveis de ambiente
 * 
 * Uso: node scripts/verificar-ambiente-rsv-gen2.js
 */

const { Pool } = require('pg');
const Redis = require('ioredis');
require('dotenv').config();

const checks = {
  postgresql: { status: '⏳', message: 'Verificando PostgreSQL...' },
  redis: { status: '⏳', message: 'Verificando Redis...' },
  env: { status: '⏳', message: 'Verificando variáveis de ambiente...' },
  dependencies: { status: '⏳', message: 'Verificando dependências...' },
};

async function checkPostgreSQL() {
  try {
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'onboarding_rsv_db',
      user: process.env.DB_USER || 'onboarding_rsv',
      password: process.env.DB_PASSWORD || 'senha_segura_123',
    });

    await pool.query('SELECT 1');
    await pool.end();
    
    checks.postgresql = {
      status: '✅',
      message: 'PostgreSQL conectado com sucesso',
    };
  } catch (error) {
    checks.postgresql = {
      status: '❌',
      message: `PostgreSQL não disponível: ${error.message}`,
    };
  }
}

async function checkRedis() {
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: () => null, // Não tentar reconectar se falhar
      maxRetriesPerRequest: 1,
    });

    await redis.ping();
    await redis.quit();
    
    checks.redis = {
      status: '✅',
      message: 'Redis conectado com sucesso',
    };
  } catch (error) {
    checks.redis = {
      status: '⚠️',
      message: `Redis não disponível (usando fallback em memória): ${error.message}`,
    };
  }
}

function checkEnv() {
  // Valores padrão que serão usados se não estiverem definidos
  const defaults = {
    'DB_HOST': 'localhost',
    'DB_NAME': 'onboarding_rsv_db',
    'DB_USER': 'onboarding_rsv',
    'JWT_SECRET': 'your-secret-key-change-in-production',
  };

  const required = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'JWT_SECRET',
  ];

  const optional = [
    'REDIS_HOST',
    'REDIS_PORT',
    'WS_PORT',
    'NEXT_PUBLIC_WS_URL',
  ];

  // Verificar se variáveis obrigatórias estão definidas ou têm defaults
  const missing = required.filter(key => {
    const value = process.env[key] || defaults[key];
    return !value || value === defaults[key] && key === 'JWT_SECRET';
  });

  const warnings = optional.filter(key => !process.env[key]);

  // Se JWT_SECRET está usando o valor padrão, avisar mas não falhar
  const usingDefaultSecret = !process.env.JWT_SECRET || 
    process.env.JWT_SECRET === defaults.JWT_SECRET;

  if (missing.length === 0 && warnings.length === 0 && !usingDefaultSecret) {
    checks.env = {
      status: '✅',
      message: 'Todas as variáveis de ambiente configuradas',
    };
  } else if (missing.length === 0 && !usingDefaultSecret) {
    checks.env = {
      status: '⚠️',
      message: `Variáveis opcionais faltando: ${warnings.join(', ')}`,
    };
  } else if (usingDefaultSecret && missing.length === 0) {
    checks.env = {
      status: '⚠️',
      message: `JWT_SECRET usando valor padrão (altere em produção). Variáveis opcionais: ${warnings.join(', ')}`,
    };
  } else {
    checks.env = {
      status: '⚠️',
      message: `Algumas variáveis usando valores padrão. Configure .env para produção.`,
    };
  }
}

function checkDependencies() {
  try {
    require('socket.io');
    require('ioredis');
    require('pg');
    require('jsonwebtoken');
    
    checks.dependencies = {
      status: '✅',
      message: 'Todas as dependências instaladas',
    };
  } catch (error) {
    checks.dependencies = {
      status: '❌',
      message: `Dependências faltando: ${error.message}`,
    };
  }
}

async function runChecks() {
  console.log('🔍 Verificando ambiente RSV Gen 2...\n');

  // Verificações síncronas
  checkDependencies();
  checkEnv();

  // Verificações assíncronas
  await Promise.all([
    checkPostgreSQL(),
    checkRedis(),
  ]);

  // Exibir resultados
  console.log('📊 Resultados:\n');
  
  Object.entries(checks).forEach(([key, check]) => {
    console.log(`${check.status} ${check.message}`);
  });

  console.log('\n');

  // Resumo
  const allOk = Object.values(checks).every(c => c.status === '✅');
  const hasErrors = Object.values(checks).some(c => c.status === '❌');

  if (allOk) {
    console.log('🎉 Ambiente configurado corretamente!\n');
    process.exit(0);
  } else if (hasErrors) {
    console.log('❌ Alguns problemas foram encontrados. Verifique acima.\n');
    process.exit(1);
  } else {
    console.log('⚠️  Ambiente funcional, mas com avisos. Verifique acima.\n');
    process.exit(0);
  }
}

runChecks();

