#!/usr/bin/env node
/**
 * Verifica se as tabelas da migration 011 (Split e Tributação) existem no banco
 */
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Carregar .env do backend
const envPath = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'rsv360',
      user: process.env.DB_USER || 'postgres',
      password: String(process.env.DB_PASSWORD || ''),
    };

const pool = new Pool(poolConfig);

const TABLES = [
  'marketplace_receivers',
  'split_config_rules',
  'marketplace_split_transactions',
  'tax_deductions',
];

async function main() {
  try {
    const result = await pool.query(
      `SELECT tablename FROM pg_tables 
       WHERE schemaname = 'public' 
       AND tablename = ANY($1::text[])`,
      [TABLES]
    );
    const found = result.rows.map((r) => r.tablename);
    const missing = TABLES.filter((t) => !found.includes(t));

    console.log('\n=== Verificação das tabelas Split/Tributação ===\n');
    TABLES.forEach((t) => {
      console.log(found.includes(t) ? `  [OK] ${t}` : `  [FALTA] ${t}`);
    });
    console.log('');

    if (missing.length > 0) {
      console.log('Tabelas faltando:', missing.join(', '));
      console.log('Execute: scripts/EXECUTAR_MIGRATIONS_SQL.ps1\n');
      process.exit(1);
    }
    console.log('Todas as 4 tabelas existem.\n');
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
