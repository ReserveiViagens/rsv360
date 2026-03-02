/**
 * ✅ SCRIPT PARA EXECUTAR TODOS OS SCRIPTS SQL
 * 
 * Execute: node scripts/run-all-sql-scripts.js
 * 
 * Nota: Requer senha do banco de dados
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rsv_360_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// Lista de scripts SQL para executar (em ordem)
const sqlScripts = [
  'create-database-indexes.sql',
  'create-notification-queue-table.sql',
  'create-saved-searches-table.sql',
  'create-2fa-tables.sql',
  'create-audit-logs-table.sql',
  'create-lgpd-tables.sql',
  'create-rate-limit-tables.sql',
];

async function runScript(scriptName) {
  const scriptPath = path.join(__dirname, scriptName);
  
  if (!fs.existsSync(scriptPath)) {
    console.log(`⚠️  Script não encontrado: ${scriptName}`);
    return false;
  }

  try {
    const sql = fs.readFileSync(scriptPath, 'utf8');
    console.log(`\n📄 Executando: ${scriptName}...`);
    
    await pool.query(sql);
    console.log(`✅ ${scriptName} executado com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar ${scriptName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando execução de scripts SQL...\n');
  console.log('📋 Scripts a executar:');
  sqlScripts.forEach((script, index) => {
    console.log(`   ${index + 1}. ${script}`);
  });
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const script of sqlScripts) {
    const success = await runScript(script);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO:');
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Falhas: ${failCount}`);
  console.log('='.repeat(50));

  await pool.end();
  
  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

