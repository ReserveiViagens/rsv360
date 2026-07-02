#!/usr/bin/env node
/**
 * Mini-PR §11.1 — publica unidades em rascunho após precificação.
 *
 * Uso:
 *   DATABASE_URL=postgresql://... node scripts/publicar-rascunhos-precificados.mjs precos.csv
 *   DATABASE_URL=postgresql://... node scripts/publicar-rascunhos-precificados.mjs precos.json
 *
 * CSV: cabeçalho id,preco_diaria (ou id;preco_diaria)
 * JSON: [{ "id": 8, "preco_diaria": 350.00 }, ...]
 *
 * Pipeline por unidade:
 *   rascunho → completo (preco + dados_completos)
 *   completo → em_aprovacao
 *   em_aprovacao → publicado (+ ativo)
 *
 * Flags:
 *   --dry-run   só valida e imprime o que faria
 *   --skip-approve  para em em_aprovacao (não publica; staff aprova depois)
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipApprove = args.includes('--skip-approve');
const inputPath = args.find((a) => !a.startsWith('--'));

if (!inputPath) {
  console.error('Uso: node scripts/publicar-rascunhos-precificados.mjs <precos.csv|precos.json> [--dry-run] [--skip-approve]');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[publicar-rascunhos] DATABASE_URL obrigatório');
  process.exit(1);
}

function parseInput(filePath) {
  const abs = resolve(filePath);
  const raw = readFileSync(abs, 'utf8').replace(/^\uFEFF/, '');
  if (filePath.endsWith('.json')) {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('JSON deve ser array [{ id, preco_diaria }]');
    return data.map((row) => ({
      id: Number(row.id),
      precoDiaria: Number(row.preco_diaria ?? row.precoDiaria),
    }));
  }

  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  const sep = lines[0].includes(';') ? ';' : ',';
  const header = lines[0].toLowerCase().split(sep).map((h) => h.trim());
  const idIdx = header.indexOf('id');
  const precoIdx = header.findIndex((h) => h === 'preco_diaria' || h === 'precodiaria');
  if (idIdx < 0 || precoIdx < 0) throw new Error('CSV precisa de colunas id e preco_diaria');

  return lines.slice(1).map((line) => {
    const cols = line.split(sep);
    return {
      id: Number(cols[idIdx]),
      precoDiaria: Number(String(cols[precoIdx]).replace(',', '.')),
    };
  });
}

function assertRow(row, lineNo) {
  if (!Number.isInteger(row.id) || row.id <= 0) {
    throw new Error(`Linha ${lineNo}: id inválido (${row.id})`);
  }
  if (!Number.isFinite(row.precoDiaria) || row.precoDiaria <= 0) {
    throw new Error(`Linha ${lineNo}: preco_diaria inválido para id=${row.id}`);
  }
}

const rows = parseInput(inputPath);
rows.forEach((r, i) => assertRow(r, i + 2));

const pool = new Pool({ connectionString });

async function publicarUm(client, { id, precoDiaria }) {
  const before = await client.query(
    `SELECT id, hotel_id, titulo, status_publicacao, preco_diaria
     FROM acomodacoes WHERE id = $1`,
    [id],
  );
  if (!before.rows[0]) {
    return { id, ok: false, error: 'not_found' };
  }

  const unit = before.rows[0];
  if (unit.status_publicacao === 'publicado') {
    return { id, ok: true, skipped: true, reason: 'ja_publicado', hotel_id: unit.hotel_id, titulo: unit.titulo };
  }
  if (unit.status_publicacao !== 'rascunho') {
    return {
      id,
      ok: false,
      error: `status_inesperado:${unit.status_publicacao}`,
      hotel_id: unit.hotel_id,
      titulo: unit.titulo,
    };
  }

  if (dryRun) {
    return {
      id,
      ok: true,
      dryRun: true,
      hotel_id: unit.hotel_id,
      titulo: unit.titulo,
      preco_diaria: precoDiaria,
      pipeline: skipApprove ? 'rascunho→completo→em_aprovacao' : 'rascunho→completo→em_aprovacao→publicado',
    };
  }

  await client.query(
    `UPDATE acomodacoes
     SET preco_diaria = $2,
         status_publicacao = 'completo',
         dados_completos = true,
         atualizado_em = now()
     WHERE id = $1 AND status_publicacao = 'rascunho'`,
    [id, precoDiaria.toFixed(2)],
  );

  await client.query(
    `UPDATE acomodacoes
     SET status_publicacao = 'em_aprovacao',
         dados_completos = true,
         atualizado_em = now()
     WHERE id = $1 AND status_publicacao = 'completo'`,
    [id],
  );

  if (!skipApprove) {
    const approved = await client.query(
      `UPDATE acomodacoes
       SET status_publicacao = 'publicado',
           dados_completos = true,
           ativo = true,
           atualizado_em = now()
       WHERE id = $1 AND status_publicacao = 'em_aprovacao'
       RETURNING id, hotel_id, titulo, status_publicacao`,
      [id],
    );
    if (!approved.rows[0]) {
      return { id, ok: false, error: 'falha_aprovar', hotel_id: unit.hotel_id, titulo: unit.titulo };
    }
    return { id, ok: true, status: 'publicado', hotel_id: approved.rows[0].hotel_id, titulo: approved.rows[0].titulo };
  }

  return { id, ok: true, status: 'em_aprovacao', hotel_id: unit.hotel_id, titulo: unit.titulo };
}

async function main() {
  const client = await pool.connect();
  const results = [];

  try {
    await client.query('BEGIN');
    for (const row of rows) {
      results.push(await publicarUm(client, row));
    }
    if (dryRun) await client.query('ROLLBACK');
    else await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  const ok = results.filter((r) => r.ok && !r.skipped);
  const skipped = results.filter((r) => r.skipped);
  const failed = results.filter((r) => !r.ok);

  console.log(JSON.stringify({ total: rows.length, ok: ok.length, skipped: skipped.length, failed: failed.length, results }, null, 2));

  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error('[publicar-rascunhos] falhou:', err.message);
  process.exit(1);
});
