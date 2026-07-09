#!/usr/bin/env node
/**
 * Aplica seed da vitrine Etapa A (11 hotéis) + desativa demos.
 *
 * Uso:
 *   $env:DATABASE_URL="postgresql://rsv360:rsv360_dev_2024@localhost:5433/rsv_360_ecosystem"
 *   node backend/scripts/seed-vitrine-etapa-a.mjs --dry-run
 *   node backend/scripts/seed-vitrine-etapa-a.mjs
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const dryRun = process.argv.includes('--dry-run');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.resolve(__dirname, '../../database/seeds/vitrine-etapa-a-11-hoteis.sql');

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL obrigatório');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(`[seed-vitrine] file=${sqlPath} dryRun=${dryRun}`);

  if (dryRun) {
    console.log('[seed-vitrine] DRY-RUN — SQL não executado');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(sql);
    const { rows } = await pool.query(
      `SELECT content_id, title, status, order_index
       FROM website_content
       WHERE page_type = 'hotels'
       ORDER BY order_index, content_id`,
    );
    console.log('[seed-vitrine] hotels:');
    for (const r of rows) {
      console.log(`  ${r.status.padEnd(8)} ${r.order_index} ${r.content_id} — ${r.title}`);
    }
    console.log('[seed-vitrine] OK');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('[seed-vitrine] falhou:', e.message);
  process.exit(1);
});
