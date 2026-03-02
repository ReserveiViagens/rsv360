/**
 * Script para executar migration de website_content e properties
 * Banco: rsv360
 * Porta: 5433
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'rsv360',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '290491Bb',
};

const migrationFile = path.join(__dirname, '..', 'database', 'migrations', 'create-website-content-and-properties.sql');

async function executeMigration() {
  const pool = new Pool(DB_CONFIG);
  
  console.log('');
  console.log('========================================');
  console.log('EXECUTANDO MIGRATION');
  console.log('========================================');
  console.log('');
  console.log(`Banco: ${DB_CONFIG.database}`);
  console.log(`Porta: ${DB_CONFIG.port}`);
  console.log(`Arquivo: ${migrationFile}`);
  console.log('');

  try {
    // Ler arquivo SQL
    if (!fs.existsSync(migrationFile)) {
      throw new Error(`Arquivo de migration não encontrado: ${migrationFile}`);
    }

    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Executar SQL
    console.log('Executando migration...');
    await pool.query(sql);
    
    console.log('');
    console.log('========================================');
    console.log('✅ MIGRATION EXECUTADA COM SUCESSO!');
    console.log('========================================');
    console.log('');
    console.log('Tabelas criadas:');
    console.log('  - website_content');
    console.log('  - properties');
    console.log('  - website_settings');
    console.log('');
    
    // Verificar se as tabelas foram criadas
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('website_content', 'properties', 'website_settings')
      ORDER BY table_name;
    `);
    
    console.log('Tabelas verificadas:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Erro ao executar migration:', error.message);
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

executeMigration();
