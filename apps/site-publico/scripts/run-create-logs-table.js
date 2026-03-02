/**
 * ✅ Script para executar create-logs-table.sql
 * Execute: node scripts/run-create-logs-table.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createLogsTable() {
  // Verificar variáveis de ambiente
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'onboarding_rsv_db',
    user: process.env.DB_USER || 'onboarding_rsv',
    password: process.env.DB_PASSWORD,
  };

  console.log('📋 Configuração do banco:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Password: ${dbConfig.password ? '***' : 'NÃO CONFIGURADA'}`);
  
  if (!dbConfig.password) {
    console.log('\n⚠️  AVISO: DB_PASSWORD não configurada no .env');
    console.log('   A tabela será criada apenas se o banco permitir conexão sem senha.');
  }

  const pool = new Pool(dbConfig);

  try {
    console.log('📊 Conectando ao banco de dados...');
    
    // Ler script SQL
    const sqlPath = path.join(__dirname, 'create-logs-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executando script SQL...');
    
    // Executar script
    await pool.query(sql);
    
    console.log('✅ Tabela application_logs criada com sucesso!');
    
    // Verificar se a tabela foi criada
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'application_logs'
      );
    `);
    
    if (result.rows[0].exists) {
      console.log('✅ Verificação: Tabela application_logs existe no banco de dados');
    } else {
      console.log('⚠️  Aviso: Tabela não foi encontrada após criação');
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message);
    
    // Se a tabela já existe, apenas avisar
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tabela já existe no banco de dados');
    } else {
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

createLogsTable();

