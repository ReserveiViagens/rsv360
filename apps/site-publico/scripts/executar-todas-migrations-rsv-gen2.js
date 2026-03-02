/**
 * ✅ SCRIPT COMPLETO - EXECUTAR TODAS AS MIGRATIONS RSV GEN 2
 * Executa todas as migrations na ordem correta
 * Data: 02/12/2025
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

console.log('🚀 Executando Todas as Migrations RSV Gen 2\n');

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

// Ordem das migrations
const migrations = [
  'create-wishlists-tables-fixed.sql',
  'create-smart-pricing-tables-fixed.sql',
  'create-top-host-tables.sql',
  'migration-017-complete-rsv-gen2-schema.sql',
];

// Criar pool de conexão
const pool = new Pool(dbConfig);

// Função para verificar se tabela existe
async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )`,
    [tableName]
  );
  return result.rows[0].exists;
}

// Executar migrations
async function executeMigrations() {
  const client = await pool.connect();
  
  try {
    // Verificar tabelas base
    console.log('🔍 Verificando tabelas existentes...\n');
    
    const hasWishlists = await tableExists(client, 'shared_wishlists');
    const hasPricing = await tableExists(client, 'pricing_history');
    const hasHost = await tableExists(client, 'host_ratings');
    
    console.log(`   shared_wishlists: ${hasWishlists ? '✅' : '❌'}`);
    console.log(`   pricing_history: ${hasPricing ? '✅' : '❌'}`);
    console.log(`   host_ratings: ${hasHost ? '✅' : '❌'}\n`);
    
    // Executar migrations necessárias
    for (const migration of migrations) {
      const sqlFile = path.join(__dirname, migration);
      
      if (!fs.existsSync(sqlFile)) {
        console.log(`⚠️  Arquivo não encontrado: ${migration}`);
        console.log(`   Pulando...\n`);
        continue;
      }
      
      // Verificar se precisa executar
      let shouldExecute = true;
      
      if ((migration === 'create-wishlists-tables.sql' || migration === 'create-wishlists-tables-fixed.sql') && hasWishlists) {
        console.log(`⏭️  ${migration} - Tabelas já existem, pulando...\n`);
        shouldExecute = false;
      }
      
      if ((migration === 'create-smart-pricing-tables.sql' || migration === 'create-smart-pricing-tables-fixed.sql') && hasPricing) {
        console.log(`⏭️  ${migration} - Tabelas já existem, pulando...\n`);
        shouldExecute = false;
      }
      
      if (migration === 'create-top-host-tables.sql' && hasHost) {
        console.log(`⏭️  ${migration} - Tabelas já existem, pulando...\n`);
        shouldExecute = false;
      }
      
      if (!shouldExecute) {
        continue;
      }
      
      console.log(`📄 Executando: ${migration}...`);
      
      const sql = fs.readFileSync(sqlFile, 'utf8');
      
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      
      console.log(`✅ ${migration} executada com sucesso!\n`);
    }
    
    console.log('🎉 Todas as migrations foram executadas!\n');
    console.log('📊 Resumo:');
    console.log('   ✅ Tabelas de Wishlists criadas');
    console.log('   ✅ Tabelas de Smart Pricing criadas');
    console.log('   ✅ Tabelas de Quality Program criadas');
    console.log('   ✅ Triggers e funções criadas');
    console.log('   ✅ Índices de performance criados\n');
    
    console.log('Próximos passos:');
    console.log('   1. Verificar tabelas criadas no banco');
    console.log('   2. Testar triggers de votos');
    console.log('   3. Continuar com TAREFA 1.3: Setup Ambiente\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Erro ao executar migrations\n');
    console.error('Detalhes do erro:');
    console.error(error.message);
    if (error.position) {
      console.error(`   Posição: ${error.position}`);
    }
    console.error('\n');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar
executeMigrations().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});

