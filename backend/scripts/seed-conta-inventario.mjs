#!/usr/bin/env node
/**
 * PR 23 — cria usuário técnico conta_reservei_inventario (id documentado no stdout).
 * Uso: cd backend && node scripts/seed-conta-inventario.mjs
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const email = process.env.CONTA_INVENTARIO_EMAIL || 'conta_reservei_inventario@reserveiviagens.com.br';
const password = process.env.CONTA_INVENTARIO_PASSWORD || 'Inventario-Reservei-2026!';
const name = 'Conta Reservei Inventário';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role, is_active)
     VALUES ($1, $2, $3, 'user', true)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = 'user', is_active = true
     RETURNING id, email, role`,
    [name, email, hash],
  );
  const user = rows[0];
  console.log('[seed-conta-inventario] conta técnica pronta:', user);
  console.log('Use proprietarioId=', user.id, 'no import bulk PR 23');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
