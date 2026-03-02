/**
 * Script para executar a migration 019 - Check-in/Check-out Digital
 * Cria todas as tabelas necessárias para o sistema de check-in digital
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rsv360',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function executeMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migration 019 - Check-in/Check-out Digital...\n');
    
    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'migration-019-create-digital-checkin-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Executar o SQL
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migration 019 executada com sucesso!\n');
    
    // Verificar se as tabelas foram criadas
    console.log('🔍 Verificando tabelas criadas...\n');
    
    const tables = [
      'digital_checkins',
      'checkin_documents',
      'checkin_inspections',
      'checkin_access_codes'
    ];
    
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`  ✅ Tabela "${table}" criada com sucesso`);
        
        // Contar índices
        const indexesResult = await client.query(`
          SELECT COUNT(*) as count
          FROM pg_indexes
          WHERE tablename = $1;
        `, [table]);
        
        console.log(`     └─ ${indexesResult.rows[0].count} índices criados`);
      } else {
        console.log(`  ❌ Tabela "${table}" NÃO foi criada`);
      }
    }
    
    console.log('\n✅ Verificação concluída!\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao executar migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar
executeMigration()
  .then(() => {
    console.log('🎉 Migration 019 concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });

