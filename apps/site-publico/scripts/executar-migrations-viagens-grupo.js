/**
 * ✅ SCRIPT DE EXECUÇÃO - MIGRATIONS VIAGENS EM GRUPO
 * Executa todas as migrations necessárias para viagens em grupo
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

const migrations = [
  { 
    name: 'create-payment-splits-tables.sql', 
    checkTable: 'split_payments',
    description: 'Tabelas de Split Payment',
    checkAlternative: ['split_payment_participants'] // Verificar tabela relacionada também
  },
  { 
    name: 'create-trip-invitations-tables.sql', 
    checkTable: 'trip_invitations',
    description: 'Tabelas de Trip Invitations'
  },
  { 
    name: 'create-group-chat-tables.sql', 
    checkTable: 'group_chats',
    description: 'Tabelas de Group Chat'
  },
];

async function checkTableExists(tableName) {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    return false;
  }
}

async function executeSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
}

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Executando migrations de Viagens em Grupo...\n');
    
    for (const migration of migrations) {
      const filePath = path.join(__dirname, migration.name);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Arquivo não encontrado: ${migration.name}`);
        continue;
      }
      
      // Verificar se tabela já existe
      const exists = await checkTableExists(migration.checkTable);
      
      if (exists) {
        console.log(`⏭️  ${migration.description} - Tabela ${migration.checkTable} já existe, pulando...`);
        continue;
      }
      
      console.log(`📝 Executando: ${migration.description}...`);
      
      try {
        await executeSqlFile(filePath);
        console.log(`✅ ${migration.description} - Executado com sucesso!\n`);
      } catch (error) {
        console.error(`❌ Erro ao executar ${migration.name}:`);
        console.error(`   ${error.message}\n`);
        // Continuar com próxima migration mesmo se uma falhar
      }
    }
    
    console.log('🎉 Migrations concluídas!\n');
    
    // Verificar resultado final
    console.log('🔍 Verificando tabelas criadas...\n');
    const verifyScript = path.join(__dirname, 'verificar-tabelas-viagens-grupo.js');
    if (fs.existsSync(verifyScript)) {
      require(verifyScript);
    }
    
  } catch (error) {
    console.error('\n❌ Erro geral ao executar migrations:');
    console.error(error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();

