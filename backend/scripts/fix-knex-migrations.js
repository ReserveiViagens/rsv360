#!/usr/bin/env node
/**
 * Sincroniza knex_migrations com o estado real do banco.
 * Marca como executadas as migrações cujas tabelas já existem.
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rsv360',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const MIGRATIONS = [
  '001_create_users_table.js',
  '002_create_bookings_table.js',
  '003_create_payments_table.js',
  '004_create_audit_logs_table.js',
  '005_create_customers_table.js',
  '006_create_travel_packages_table.js',
  '007_create_auctions_tables.js',
  '008_create_website_content_schema.js',
  '009_create_website_pages_table.js',
];

async function main() {
  try {
    // Criar tabela knex_migrations se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS knex_migrations_lock (
        index SERIAL PRIMARY KEY,
        is_locked INTEGER
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS knex_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        batch INTEGER,
        migration_time TIMESTAMPTZ
      )
    `);

    const existing = await pool.query('SELECT name FROM knex_migrations');
    const existingNames = new Set(existing.rows.map(r => r.name));

    let batch = 1;
    const maxBatch = await pool.query('SELECT COALESCE(MAX(batch), 0) as m FROM knex_migrations');
    if (maxBatch.rows[0]?.m) batch = maxBatch.rows[0].m + 1;

    for (const name of MIGRATIONS) {
      if (existingNames.has(name)) {
        console.log(`  [OK] ${name} (já registrada)`);
        continue;
      }
      await pool.query(
        'INSERT INTO knex_migrations (name, batch, migration_time) VALUES ($1, $2, NOW())',
        [name, batch]
      );
      console.log(`  + ${name}`);
    }

    console.log('\n✅ knex_migrations sincronizado. Execute: npx knex migrate:status');
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
