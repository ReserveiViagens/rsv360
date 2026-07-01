/**
 * Valida migration 0019 (Fase 0): pré-checagem de duplicados, índices e rejeição de token duplicado.
 * Uso: DATABASE_URL=postgresql://...@127.0.0.1:5433/rsv_360_ecosystem node scripts/verify-migration-0019.mjs
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const migrationPath = resolve(root, 'drizzle/0019_propostas_token_publico_unique.sql');

const connectionString =
  process.env.DATABASE_URL || 'postgresql://rsv360:rsv360@127.0.0.1:5433/rsv_360_ecosystem';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function checkDuplicates(client) {
  const { rows } = await client.query(`
    SELECT token_publico, COUNT(*)::int AS total
    FROM propostas
    WHERE token_publico IS NOT NULL AND btrim(token_publico) <> ''
    GROUP BY token_publico
    HAVING COUNT(*) > 1
    ORDER BY total DESC
    LIMIT 5
  `);

  if (rows.length > 0) {
    console.error('❌ token_publico duplicados encontrados (limpe antes da migration):');
    for (const row of rows) {
      console.error(`   - ${row.token_publico}: ${row.total} ocorrências`);
    }
    process.exit(1);
  }

  console.log('✅ Pré-checagem: nenhum token_publico duplicado');
}

async function ensureIndexes(client) {
  const { rows } = await client.query(`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'propostas'
      AND indexname IN ('idx_propostas_token', 'idx_propostas_status_valido_ate', 'propostas_token_publico_unique')
  `);

  const names = new Set(rows.map((r) => r.indexname));
  assert(
    names.has('idx_propostas_token') || names.has('propostas_token_publico_unique'),
    'Índice UNIQUE em token_publico ausente (idx_propostas_token ou propostas_token_publico_unique)',
  );
  assert(names.has('idx_propostas_status_valido_ate'), 'Índice idx_propostas_status_valido_ate ausente');

  console.log('✅ Índices presentes:', [...names].join(', '));
}

async function assertDuplicateInsertRejected(client) {
  const token = `rt-test-dup-${Date.now()}`;
  const insertBase = `
    INSERT INTO propostas (
      titulo, cliente_nome, status, valor_total, moeda, token_publico, is_publica
    ) VALUES ($1, $2, 'draft', 0, 'BRL', $3, false)
    RETURNING id
  `;

  const first = await client.query(insertBase, ['Teste dup A', 'Cliente Teste', token]);
  const firstId = first.rows[0]?.id;
  assert(firstId, 'Falha ao inserir proposta de teste');

  let rejected = false;
  try {
    await client.query(insertBase, ['Teste dup B', 'Cliente Teste', token]);
  } catch (error) {
    rejected = /unique|duplicate key/i.test(String(error.message));
  }

  await client.query('DELETE FROM propostas WHERE id = $1', [firstId]);

  assert(rejected, 'Inserção com token_publico duplicado deveria ser rejeitada pelo índice UNIQUE');
  console.log('✅ Inserção de token duplicado rejeitada pelo banco');
}

async function main() {
  const sql = readFileSync(migrationPath, 'utf8');
  assert(sql.includes('idx_propostas_token'), 'Arquivo 0019 deve criar idx_propostas_token');
  assert(sql.includes('idx_propostas_status_valido_ate'), 'Arquivo 0019 deve criar idx_propostas_status_valido_ate');
  assert(sql.includes('HAVING COUNT(*) > 1'), 'Arquivo 0019 deve pré-checagem de duplicados');

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await checkDuplicates(client);
    await ensureIndexes(client);
    await assertDuplicateInsertRejected(client);
    console.log('\n🎉 Migration 0019 verificada com sucesso');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('\n❌ verify-migration-0019 falhou:', error.message);
  process.exit(1);
});
