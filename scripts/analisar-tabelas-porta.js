#!/usr/bin/env node
/**
 * Analisa PostgreSQL em uma porta e lista as tabelas.
 * Uso: node scripts/analisar-tabelas-porta.js [porta]
 */
const path = require('path');
const backendPath = path.join(__dirname, '..', 'backend');
require('dotenv').config({ path: path.join(backendPath, '.env') });

const { Pool } = require('pg');

const porta = parseInt(process.argv[2] || process.env.DB_PORT || '5432');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: porta,
  database: process.env.DB_NAME || 'rsv360',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '290491Bb',
  connectionTimeoutMillis: 5000,
});

async function main() {
  console.log('');
  console.log('========================================');
  console.log('ANALISE POSTGRESQL - PORTA', porta);
  console.log('========================================');
  console.log('');

  try {
    await pool.query('SELECT 1');
    console.log('Conexao OK na porta', porta);
  } catch (err) {
    console.error('Erro ao conectar na porta', porta + ':', err.message);
    if (err.message.includes('Connection refused') || err.message.includes('timeout')) {
      console.log('');
      console.log('O PostgreSQL NAO esta escutando na porta', porta);
      console.log('Tente a porta 5432 (padrao).');
    }
    process.exit(1);
  }

  console.log('');
  console.log('--- TABELAS NO SCHEMA public ---');
  const r = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);

  if (r.rows.length === 0) {
    console.log('  (nenhuma tabela)');
  } else {
    r.rows.forEach((row, i) => {
      console.log('  ' + (i + 1) + '. ' + row.table_name);
    });
    console.log('');
    console.log('Total:', r.rows.length, 'tabelas');
  }

  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
