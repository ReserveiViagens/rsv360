#!/usr/bin/env node
/**
 * Desativa add-on global "Upgrade Suíte Master" (escopo=hotel).
 * Motivo: modelo híbrido por unidade (upgrade_varanda_*) — evita cobrança dupla
 * e oferta sem lastro em unidades sem varanda.
 *
 * Cotações antigas que já persistiram o item no orçamento NÃO são alteradas
 * (só deixa de aparecer no wizard para novas seleções).
 *
 * Uso:
 *   $env:DATABASE_URL="postgresql://rsv360:REDACTED_PG_DEV_PASSWORD@localhost:5433/rsv_360_ecosystem"
 *   node scripts/desativar-addon-suite-master.mjs --dry-run
 *   node scripts/desativar-addon-suite-master.mjs
 */
import 'dotenv/config';
import { Pool } from 'pg';

const dryRun = process.argv.includes('--dry-run');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL obrigatório');
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, nome, valor, escopo, ativo
       FROM wizard_addons
       WHERE nome = 'Upgrade Suíte Master' AND escopo = 'hotel'`,
    );
    if (!rows.length) {
      console.log('[desativar-addon] nenhum add-on encontrado — noop');
      return;
    }
    for (const row of rows) {
      console.log(
        `[desativar-addon] id=${row.id} ativo=${row.ativo} → false dryRun=${dryRun}`,
      );
      if (!dryRun && row.ativo) {
        await client.query(
          `UPDATE wizard_addons SET ativo = false WHERE id = $1`,
          [row.id],
        );
      }
    }
    console.log('[desativar-addon] OK');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('[desativar-addon] falhou:', e.message);
  process.exit(1);
});
