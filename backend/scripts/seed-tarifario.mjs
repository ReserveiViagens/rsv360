#!/usr/bin/env node
/**
 * Seed idempotente — estrutura de tarifário sem regras de preço.
 * Motor nasce desligado (config tarifario.tarifario_dinamico_ativo = false).
 */
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function upsertCategoria(client, { slug, nome, desconto, ativo }) {
  await client.query(
    `INSERT INTO tarifa_categoria (slug, nome, desconto_percentual, ativo)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (slug) DO UPDATE SET
       nome = EXCLUDED.nome,
       desconto_percentual = EXCLUDED.desconto_percentual,
       ativo = EXCLUDED.ativo,
       atualizado_em = now()`,
    [slug, nome, desconto, ativo],
  );
}

async function upsertTemporada(client, { slug, nome, prioridade }) {
  await client.query(
    `INSERT INTO tarifa_temporada (slug, nome, prioridade, ativo)
     VALUES ($1, $2, $3, true)
     ON CONFLICT (slug) DO UPDATE SET nome = EXCLUDED.nome, prioridade = EXCLUDED.prioridade`,
    [slug, nome, prioridade],
  );
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO configuracoes_sistema (chave, valores)
       VALUES ('tarifario', '{"tarifario_dinamico_ativo": false}'::jsonb)
       ON CONFLICT (chave) DO NOTHING`,
    );

    await upsertCategoria(client, { slug: 'padrao', nome: 'Padrão', desconto: null, ativo: true });
    await upsertCategoria(client, { slug: 'professor', nome: 'Professor', desconto: 10, ativo: false });
    await upsertCategoria(client, { slug: 'enfermeiro', nome: 'Enfermeiro', desconto: 10, ativo: false });

    await upsertTemporada(client, { slug: 'baixa', nome: 'Baixa temporada', prioridade: 1 });
    await upsertTemporada(client, { slug: 'media', nome: 'Média temporada', prioridade: 2 });
    await upsertTemporada(client, { slug: 'alta', nome: 'Alta temporada', prioridade: 3 });

    await client.query('COMMIT');
    console.log('[seed-tarifario] categorias + temporadas (sem períodos/regras); motor off');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[seed-tarifario] falhou:', err.message);
  process.exit(1);
});
