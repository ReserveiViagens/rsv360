#!/usr/bin/env node
/**
 * Seed metadata upgrade varanda (ATR-SUV, AQR-FAM) + Premium âncora (ALD-FAM)
 * + UPDATE KN39H preco_diaria = 200.
 *
 * Uso:
 *   DATABASE_URL=... node scripts/seed-upgrade-varanda-metadata.mjs --dry-run
 *   DATABASE_URL=... node scripts/seed-upgrade-varanda-metadata.mjs
 */
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const dryRun = process.argv.includes('--dry-run');

const UPGRADE_CODES = ['ATR-SUV', 'AQR-FAM'];
const ANCORA_CODES = ['ALD-FAM'];
const KN39H = 'KN39H';
const UPGRADE_VALOR = 80;
const KN39H_PRECO = 200;

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const codigo of UPGRADE_CODES) {
      const { rows } = await client.query(
        `SELECT id, codigo_externo, metadata, preco_diaria
         FROM acomodacoes WHERE codigo_externo = $1 LIMIT 1`,
        [codigo],
      );
      if (!rows[0]) {
        console.warn(`[skip] ${codigo} não encontrado`);
        continue;
      }
      const meta =
        rows[0].metadata && typeof rows[0].metadata === 'object' ? rows[0].metadata : {};
      const next = {
        ...meta,
        upgrade_varanda_disponivel: true,
        upgrade_varanda_valor: UPGRADE_VALOR,
      };
      console.log(
        `[upgrade] ${codigo} id=${rows[0].id} valor=${UPGRADE_VALOR} dryRun=${dryRun}`,
      );
      if (!dryRun) {
        await client.query(
          `UPDATE acomodacoes SET metadata = $1::jsonb, atualizado_em = now() WHERE id = $2`,
          [JSON.stringify(next), rows[0].id],
        );
      }
    }

    for (const codigo of ANCORA_CODES) {
      const { rows } = await client.query(
        `SELECT id, codigo_externo, metadata FROM acomodacoes WHERE codigo_externo = $1 LIMIT 1`,
        [codigo],
      );
      if (!rows[0]) {
        console.warn(`[skip] ${codigo} não encontrado`);
        continue;
      }
      const meta =
        rows[0].metadata && typeof rows[0].metadata === 'object' ? rows[0].metadata : {};
      const next = {
        ...meta,
        premium_ancora: true,
        upgrade_varanda_disponivel: false,
      };
      console.log(`[ancora] ${codigo} id=${rows[0].id} dryRun=${dryRun}`);
      if (!dryRun) {
        await client.query(
          `UPDATE acomodacoes SET metadata = $1::jsonb, atualizado_em = now() WHERE id = $2`,
          [JSON.stringify(next), rows[0].id],
        );
      }
    }

    const { rows: kn } = await client.query(
      `SELECT id, codigo_externo, preco_diaria FROM acomodacoes WHERE codigo_externo = $1 LIMIT 1`,
      [KN39H],
    );
    if (!kn[0]) {
      console.warn(`[skip] ${KN39H} não encontrado`);
    } else {
      console.log(
        `[kn39h] id=${kn[0].id} preco_antes=${kn[0].preco_diaria} -> ${KN39H_PRECO} dryRun=${dryRun}`,
      );
      if (!dryRun) {
        await client.query(
          `UPDATE acomodacoes
           SET preco_diaria = $1, atualizado_em = now()
           WHERE id = $2 AND status_publicacao = 'publicado'`,
          [KN39H_PRECO, kn[0].id],
        );
      }
    }

    if (dryRun) {
      await client.query('ROLLBACK');
      console.log('[seed-upgrade-varanda] dry-run OK (rollback)');
    } else {
      await client.query('COMMIT');
      console.log('[seed-upgrade-varanda] commit OK');
    }
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[seed-upgrade-varanda] falhou:', err.message);
  process.exit(1);
});
