/**
 * ✅ Executar Migration 018: Sistema de Webhooks
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/rsv_gen2'
});

async function executeMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Executando Migration 018: Sistema de Webhooks...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'migration-018-create-webhooks-tables.sql'),
      'utf8'
    );
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migration 018 executada com sucesso!');
    
    // Verificar tabelas criadas
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'webhook%'
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tabelas criadas:');
    tables.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao executar migration:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

executeMigration();

