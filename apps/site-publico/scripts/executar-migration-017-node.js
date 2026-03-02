/**
 * ✅ SCRIPT DE EXECUÇÃO - MIGRATION 017: COMPLETAR SCHEMA RSV GEN 2
 * Versão Node.js (alternativa ao PowerShell)
 * Data: 02/12/2025
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

console.log('🚀 Executando Migration 017: Completar Schema RSV Gen 2\n');

// Configurações do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

console.log('📋 Configurações do banco:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Porta: ${dbConfig.port}`);
console.log(`   Banco: ${dbConfig.database}`);
console.log(`   Usuário: ${dbConfig.user}\n`);

// Caminho do arquivo SQL
const sqlFile = path.join(__dirname, 'migration-017-complete-rsv-gen2-schema.sql');

if (!fs.existsSync(sqlFile)) {
  console.error(`❌ Arquivo SQL não encontrado: ${sqlFile}`);
  process.exit(1);
}

console.log(`📄 Arquivo SQL encontrado: ${sqlFile}\n`);

// Ler arquivo SQL
const sql = fs.readFileSync(sqlFile, 'utf8');

// Criar pool de conexão
const pool = new Pool(dbConfig);

// Executar migration
async function executeMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Executando migration...\n');
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('\n✅ Migration executada com sucesso!\n');
    console.log('📊 Resumo:');
    console.log('   ✅ Triggers de votos melhorados');
    console.log('   ✅ Tabelas de Smart Pricing criadas');
    console.log('   ✅ Tabelas de Quality Program criadas');
    console.log('   ✅ Funções SQL úteis criadas');
    console.log('   ✅ Índices de performance criados\n');
    
    console.log('🎉 Migration 017 concluída!\n');
    console.log('Próximos passos:');
    console.log('   1. Verificar tabelas criadas no banco');
    console.log('   2. Testar triggers de votos');
    console.log('   3. Continuar com TAREFA 1.3: Setup Ambiente\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Erro ao executar migration\n');
    console.error('Detalhes do erro:');
    console.error(error.message);
    console.error('\n');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar
executeMigration().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});

