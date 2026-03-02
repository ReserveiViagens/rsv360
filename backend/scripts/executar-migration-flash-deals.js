#!/usr/bin/env node
/**
 * Script para executar migration de Flash Deals e Auctions (winner_id)
 * Uso: node scripts/executar-migration-flash-deals.js
 * Ou: cd backend && node scripts/executar-migration-flash-deals.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'rsv_360_ecosystem',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '290491Bb',
});

async function runMigration() {
  const migrationPath = path.join(__dirname, '../../database/migrations/010_fix_flash_deals_and_auctions.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Arquivo de migration não encontrado:', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    console.log('🔄 Executando migration 010 (Flash Deals + winner_id)...');
    await pool.query(sql);
    console.log('✅ Migration executada com sucesso!');
    
    // Verificar resultado
    const flashDealsCheck = await pool.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flash_deals')
    `);
    const winnerIdCheck = await pool.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'auctions' AND column_name = 'winner_id')
    `);
    
    console.log('');
    console.log('📊 Verificação:');
    console.log('  - Tabela flash_deals:', flashDealsCheck.rows[0].exists ? '✅ Existe' : '❌ Não existe');
    console.log('  - Coluna auctions.winner_id:', winnerIdCheck.rows[0].exists ? '✅ Existe' : '❌ Não existe');
    console.log('');
  } catch (error) {
    console.error('❌ Erro na migration:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
