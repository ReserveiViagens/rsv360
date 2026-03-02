/**
 * Script de Validação de Variáveis de Ambiente
 * 
 * Execute: node scripts/validate-env.js
 * ou: npm run validate:env
 */

// Carregar .env (tentar múltiplos caminhos)
const fs = require('fs');
const path = require('path');

// Tentar carregar .env.local primeiro
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

// Carregar .env
if (fs.existsSync('.env')) {
  require('dotenv').config({ path: '.env' });
}

// Também tentar carregar sem path específico
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Variáveis obrigatórias para desenvolvimento
const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_API_URL',
];

// Variáveis opcionais mas recomendadas
const optional = [
  'GOOGLE_MAPS_API_KEY',
  'GOOGLE_VISION_API_KEY',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'STRIPE_SECRET_KEY',
  'MERCADOPAGO_ACCESS_TOKEN',
  'REDIS_URL',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'INSURANCE_WEBHOOK_URL',
  'INSURANCE_NOTIFICATION_EMAIL',
  'NEXT_PUBLIC_WS_URL',
];

// Variáveis para integrações externas
const integrations = [
  { key: 'GOOGLE_MAPS_API_KEY', name: 'Google Maps API' },
  { key: 'GOOGLE_VISION_API_KEY', name: 'Google Vision API' },
  { key: 'GOOGLE_APPLICATION_CREDENTIALS', name: 'Google Application Credentials' },
  { key: 'STRIPE_SECRET_KEY', name: 'Stripe Payment Gateway' },
  { key: 'MERCADOPAGO_ACCESS_TOKEN', name: 'Mercado Pago Gateway' },
  { key: 'REDIS_URL', name: 'Redis Cache' },
  { key: 'SMTP_HOST', name: 'SMTP Email' },
  { key: 'INSURANCE_WEBHOOK_URL', name: 'Insurance Webhook' },
  { key: 'INSURANCE_NOTIFICATION_EMAIL', name: 'Insurance Email' },
];

log('\n🔍 Validando variáveis de ambiente...\n', 'cyan');

let errors = 0;
let warnings = 0;

// Verificar obrigatórias
log('📋 Variáveis Obrigatórias:', 'blue');
required.forEach(key => {
  if (!process.env[key]) {
    log(`   ❌ ERRO: ${key} não está definida`, 'red');
    errors++;
  } else {
    // Mascarar valores sensíveis
    const value = process.env[key];
    const masked = key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')
      ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
      : value;
    log(`   ✅ ${key} = ${masked}`, 'green');
  }
});

// Verificar opcionais
log('\n📝 Variáveis Opcionais (Recomendadas):', 'blue');
optional.forEach(key => {
  if (!process.env[key]) {
    log(`   ⚠️  AVISO: ${key} não está definida`, 'yellow');
    warnings++;
  } else {
    const value = process.env[key];
    const masked = key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')
      ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
      : value;
    log(`   ✅ ${key} = ${masked}`, 'green');
  }
});

// Verificar integrações
log('\n🔌 Status das Integrações:', 'blue');
integrations.forEach(({ key, name }) => {
  if (process.env[key]) {
    log(`   ✅ ${name}: Configurada`, 'green');
  } else {
    log(`   ⚠️  ${name}: Não configurada`, 'yellow');
  }
});

// Resumo
log('\n📊 Resultado:', 'cyan');
log(`   ✅ Obrigatórias: ${required.length - errors}/${required.length}`, errors === 0 ? 'green' : 'red');
log(`   ⚠️  Opcionais: ${optional.length - warnings}/${optional.length}`, warnings === 0 ? 'green' : 'yellow');

// Verificações específicas
log('\n🔍 Verificações Específicas:', 'blue');

// Verificar DATABASE_URL
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    log('   ✅ DATABASE_URL tem formato válido', 'green');
  } else {
    log('   ⚠️  DATABASE_URL pode ter formato inválido', 'yellow');
  }
} else {
  log('   ❌ DATABASE_URL não configurada', 'red');
}

// Verificar JWT_SECRET
if (process.env.JWT_SECRET) {
  if (process.env.JWT_SECRET.length >= 32) {
    log('   ✅ JWT_SECRET tem tamanho adequado (>= 32 caracteres)', 'green');
  } else {
    log('   ⚠️  JWT_SECRET muito curto (recomendado: >= 32 caracteres)', 'yellow');
  }
}

// Verificar chaves de API
if (process.env.GOOGLE_MAPS_API_KEY) {
  if (process.env.GOOGLE_MAPS_API_KEY.startsWith('AIza')) {
    log('   ✅ GOOGLE_MAPS_API_KEY tem formato válido', 'green');
  } else {
    log('   ⚠️  GOOGLE_MAPS_API_KEY pode ter formato inválido', 'yellow');
  }
}

if (process.env.STRIPE_SECRET_KEY) {
  if (process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    log('   ✅ STRIPE_SECRET_KEY tem formato válido', 'green');
  } else {
    log('   ⚠️  STRIPE_SECRET_KEY pode ter formato inválido', 'yellow');
  }
}

// Resultado final
log('\n' + '='.repeat(50), 'cyan');

if (errors > 0) {
  log(`\n❌ ${errors} variável(is) obrigatória(s) faltando!`, 'red');
  log('   Configure as variáveis obrigatórias no arquivo .env', 'yellow');
  log('   Veja .env.example para referência\n', 'yellow');
  process.exit(1);
}

if (warnings > 0) {
  log(`\n⚠️  ${warnings} variável(is) opcional(is) não configurada(s)`, 'yellow');
  log('   Algumas funcionalidades podem não estar disponíveis\n', 'yellow');
  process.exit(0);
}

log('\n✅ Todas as variáveis obrigatórias estão definidas!', 'green');
log('   Sistema pronto para execução\n', 'green');
process.exit(0);

