// Script para verificar todas as implementações
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

async function checkTable(tableName) {
  try {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      )`,
      [tableName]
    );
    return result.rows[0].exists;
  } catch (error) {
    return false;
  }
}

async function checkFile(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

async function checkEnvVar(varName) {
  return !!process.env[varName];
}

async function main() {
  console.log('========================================');
  console.log('VERIFICAÇÃO DE IMPLEMENTAÇÕES');
  console.log('========================================');
  console.log('');

  // Verificar tabelas
  console.log('📊 VERIFICANDO TABELAS:');
  const tables = [
    'property_calendars',
    'blocked_dates',
    'events_calendar',
    'pricing_rules',
    'access_logs',
    'smart_locks',
    'checkins',
    'checkin_documents',
    'contracts',
    'identity_verifications',
  ];

  let tablesOk = 0;
  for (const table of tables) {
    const exists = await checkTable(table);
    if (exists) {
      console.log(`  ✅ ${table}`);
      tablesOk++;
    } else {
      console.log(`  ❌ ${table} (não encontrada)`);
    }
  }
  console.log(`\n  Total: ${tablesOk}/${tables.length} tabelas criadas\n`);

  // Verificar arquivos
  console.log('📁 VERIFICANDO ARQUIVOS:');
  const files = [
    'lib/pricing-engine.ts',
    'lib/ical-sync.ts',
    'lib/google-calendar-sync.ts',
    'lib/smartlock-integration.ts',
    'lib/whatsapp.ts',
    'lib/telegram-bot.ts',
    'lib/meta-senders.ts',
    'app/api/webhooks/meta/route.ts',
    'app/api/properties/[id]/calendar/route.ts',
    'app/api/checkin/route.ts',
    'app/api/contracts/route.ts',
    'app/api/smartlocks/route.ts',
    'components/calendar/advanced-calendar.tsx',
    'components/checkin/checkin-form.tsx',
  ];

  let filesOk = 0;
  for (const file of files) {
    const exists = checkFile(file);
    if (exists) {
      console.log(`  ✅ ${file}`);
      filesOk++;
    } else {
      console.log(`  ❌ ${file} (não encontrado)`);
    }
  }
  console.log(`\n  Total: ${filesOk}/${files.length} arquivos criados\n`);

  // Verificar variáveis de ambiente (opcional)
  console.log('⚙️  VERIFICANDO VARIÁVEIS DE AMBIENTE (opcionais):');
  const envVars = [
    'WHATSAPP_PHONE_ID',
    'WHATSAPP_TOKEN',
    'TELEGRAM_BOT_TOKEN',
    'GOOGLE_CLIENT_ID',
    'MESSENGER_PAGE_ACCESS_TOKEN',
    'YALE_API_KEY',
    'UNICO_API_KEY',
  ];

  let envOk = 0;
  for (const varName of envVars) {
    const exists = checkEnvVar(varName);
    if (exists) {
      console.log(`  ✅ ${varName}`);
      envOk++;
    } else {
      console.log(`  ⚠️  ${varName} (não configurado)`);
    }
  }
  console.log(`\n  Total: ${envOk}/${envVars.length} variáveis configuradas\n`);

  // Resumo
  console.log('========================================');
  console.log('RESUMO');
  console.log('========================================');
  console.log(`✅ Tabelas: ${tablesOk}/${tables.length} (${Math.round((tablesOk/tables.length)*100)}%)`);
  console.log(`✅ Arquivos: ${filesOk}/${files.length} (${Math.round((filesOk/files.length)*100)}%)`);
  console.log(`⚠️  Variáveis: ${envOk}/${envVars.length} (${Math.round((envOk/envVars.length)*100)}%)`);
  console.log('');

  if (tablesOk === tables.length && filesOk === files.length) {
    console.log('🎉 TODAS AS IMPLEMENTAÇÕES ESTÃO COMPLETAS!');
    console.log('');
    console.log('Próximos passos:');
    console.log('  1. Configure as variáveis de ambiente no .env.local');
    console.log('  2. Veja GUIA_IMPLEMENTACAO_COMPLETA.md para detalhes');
  } else {
    console.log('⚠️  Algumas implementações estão faltando.');
    console.log('   Execute: node scripts/executar-todas-implementacoes.js');
  }

  await pool.end();
}

main().catch(console.error);

