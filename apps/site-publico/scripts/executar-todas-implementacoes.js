// Script para executar todas as implementações da Fase 1
// Executa SQLs, cria estruturas e valida implementações

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

const pool = new Pool(dbConfig);

async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    return true;
  } catch (error) {
    console.error(`Erro ao executar ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('EXECUTANDO TODAS AS IMPLEMENTAÇÕES');
  console.log('========================================');
  console.log('');

  const scripts = [
    { name: 'Tabela Properties (base)', file: 'create-properties-table.sql' },
    { name: 'Tabelas de Calendário', file: 'create-calendar-tables.sql' },
    { name: 'Tabelas de Check-in', file: 'create-checkin-tables.sql' },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const script of scripts) {
    console.log(`Executando: ${script.name}...`);
    const filePath = path.join(__dirname, script.file);
    
    if (fs.existsSync(filePath)) {
      const success = await executeSQLFile(filePath);
      if (success) {
        console.log(`✅ ${script.name} executado com sucesso!`);
        successCount++;
      } else {
        console.error(`❌ Erro ao executar ${script.name}`);
        errorCount++;
      }
    } else {
      console.warn(`⚠️  Arquivo não encontrado: ${script.file}`);
      errorCount++;
    }
    console.log('');
  }

  // Verificar tabelas criadas
  console.log('Verificando tabelas criadas...');
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

  for (const table of tables) {
    try {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        )`,
        [table]
      );
      if (result.rows[0].exists) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table} (não encontrada)`);
      }
    } catch (error) {
      console.log(`  ❌ ${table} (erro ao verificar)`);
    }
  }
  console.log('');

  console.log('========================================');
  console.log('RESUMO');
  console.log('========================================');
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log('');

  await pool.end();
}

main().catch(console.error);

