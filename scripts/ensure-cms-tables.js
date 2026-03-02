#!/usr/bin/env node
/**
 * Garante que as tabelas Flash Deals, OTA e Google Hotel Ads existem no banco.
 * Executa as migrations SQL necessárias se as tabelas não existirem.
 * Usado pelo Iniciar Sistema Completo.ps1 antes de iniciar os servicos.
 */
const path = require('path');
const fs = require('fs');
const backendPath = path.join(__dirname, '..', 'backend');
require('dotenv').config({ path: path.join(backendPath, '.env') });

const { Pool } = require('pg');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'rsv_360_ecosystem',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '290491Bb',
};

// Apenas migrations que nao dependem de 001 (enterprises/properties ja devem existir)
const MIGRATIONS = [
  { file: '004_create_flash_deals_tables.sql', tables: ['flash_deals'] },
  { file: '005_create_ota_tables.sql', tables: ['ota_connections'] },
  { file: '006_create_google_hotel_ads_tables.sql', tables: ['google_hotel_ads_feeds'] },
];

async function tableExists(pool, tableName) {
  const r = await pool.query(`
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)
  `, [tableName]);
  return r.rows[0]?.exists;
}

async function ensureFunctionExists(pool) {
  const sql = `
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;
  try {
    await pool.query(sql);
  } catch (e) {
    // Função pode já existir
  }
}

async function main() {
  const pool = new Pool(DB_CONFIG);
  const migrationsPath = path.join(__dirname, '..', 'database', 'migrations');

  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('Erro ao conectar ao banco:', err.message);
    process.exit(1);
  }

  try {
    await ensureFunctionExists(pool);

    for (const mig of MIGRATIONS) {
      const needRun = [];
      for (const t of mig.tables) {
        const exists = await tableExists(pool, t);
        if (!exists) needRun.push(t);
      }
      if (needRun.length === 0) continue;

      const filePath = path.join(migrationsPath, mig.file);
      if (!fs.existsSync(filePath)) {
        console.log(`  [AVISO] Migration nao encontrada: ${mig.file}`);
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf8');
      try {
        await pool.query(sql);
        console.log(`  [OK] ${mig.file} executada`);
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log(`  [OK] ${mig.file} (tabelas ja existem)`);
        } else {
          console.error(`  [ERRO] ${mig.file}:`, err.message);
        }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
