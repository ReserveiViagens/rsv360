/**
 * ✅ SCRIPT DE VERIFICAÇÃO E EXECUÇÃO - SPLIT PAYMENTS
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

async function main() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando tabelas de Split Payment...\n');
    
    const splitPaymentsExists = await checkTableExists('split_payments');
    const participantsExists = await checkTableExists('split_payment_participants');
    
    if (splitPaymentsExists && participantsExists) {
      console.log('✅ Tabelas de Split Payment já existem!\n');
      return;
    }
    
    console.log('📝 Executando migration de Split Payment...\n');
    
    const filePath = path.join(__dirname, 'create-payment-splits-tables.sql');
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Arquivo não encontrado: ${filePath}`);
      return;
    }
    
    await executeSqlFile(filePath);
    console.log('✅ Migration de Split Payment executada com sucesso!\n');
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:');
    console.error(error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

