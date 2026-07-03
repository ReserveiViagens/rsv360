#!/usr/bin/env node
/**
 * Etapa A §12 — atualiza preco_diaria em unidades já publicadas.
 *
 * Uso:
 *   DATABASE_URL=postgresql://... node scripts/atualizar-precos-publicados.mjs precos.csv
 *   DATABASE_URL=postgresql://... node scripts/atualizar-precos-publicados.mjs precos.json
 *
 * CSV: cabeçalho id,preco_diaria (ou id;preco_diaria)
 * JSON: [{ "id": 8, "preco_diaria": 350.00 }, ...]
 *
 * Flags:
 *   --dry-run          só valida e imprime o que faria (sem COMMIT)
 *   --allow-simbolico  permite CSV/JSON com linhas marcadas SIMBOLICO (não usar em prod)
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const allowSimbolico = args.includes('--allow-simbolico');
const inputPath = args.find((a) => !a.startsWith('--'));

if (!inputPath) {
  console.error(
    'Uso: node scripts/atualizar-precos-publicados.mjs <precos.csv|precos.json> [--dry-run] [--allow-simbolico]',
  );
  process.exit(1);
}

function isSimbolicoMarker(value) {
  return typeof value === 'string' && /\bsimbolico\b/i.test(value);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[atualizar-precos] DATABASE_URL obrigatório');
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
      simbolico:
        row.simbolico === true ||
        isSimbolicoMarker(row.nota) ||
        isSimbolicoMarker(row.obs),
    }));
  }

  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  const sep = lines[0].includes(';') ? ';' : ',';
  const header = lines[0].toLowerCase().split(sep).map((h) => h.trim());
  const idIdx = header.indexOf('id');
  const precoIdx = header.findIndex((h) => h === 'preco_diaria' || h === 'precodiaria');
  const notaIdx = header.findIndex((h) => h === 'nota' || h === 'obs');
  if (idIdx < 0 || precoIdx < 0) throw new Error('CSV precisa de colunas id e preco_diaria');

  return lines.slice(1).map((line) => {
    const cols = line.split(sep);
    const nota = notaIdx >= 0 ? cols[notaIdx] ?? '' : '';
    return {
      id: Number(cols[idIdx]),
      precoDiaria: Number(String(cols[precoIdx]).replace(',', '.')),
      simbolico: isSimbolicoMarker(nota),
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

const simbolicos = rows.filter((r) => r.simbolico);
if (simbolicos.length && !allowSimbolico) {
  console.error(
    `[atualizar-precos] ${simbolicos.length} linha(s) marcada(s) SIMBOLICO (ids: ${simbolicos.map((r) => r.id).join(', ')}). ` +
      'Abortado. Use --allow-simbolico apenas para dry-run local com scaffolding.',
  );
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function atualizarUm(client, { id, precoDiaria }) {
  const before = await client.query(
    `SELECT id, hotel_id, titulo, status_publicacao, preco_diaria
     FROM acomodacoes WHERE id = $1`,
    [id],
  );
  if (!before.rows[0]) {
    return { id, ok: false, error: 'not_found' };
  }

  const unit = before.rows[0];
  if (unit.status_publicacao !== 'publicado') {
    return {
      id,
      ok: false,
      error: `nao_publicado:${unit.status_publicacao}`,
      hotel_id: unit.hotel_id,
      titulo: unit.titulo,
    };
  }

  const precoAtual = unit.preco_diaria != null ? Number(unit.preco_diaria) : null;
  if (precoAtual === precoDiaria) {
    return {
      id,
      ok: true,
      skipped: true,
      reason: 'preco_igual',
      hotel_id: unit.hotel_id,
      titulo: unit.titulo,
      preco_diaria: precoAtual,
    };
  }

  if (dryRun) {
    return {
      id,
      ok: true,
      dryRun: true,
      hotel_id: unit.hotel_id,
      titulo: unit.titulo,
      preco_anterior: precoAtual,
      preco_novo: precoDiaria,
    };
  }

  const updated = await client.query(
    `UPDATE acomodacoes
     SET preco_diaria = $2,
         atualizado_em = now()
     WHERE id = $1 AND status_publicacao = 'publicado'
     RETURNING id, hotel_id, titulo, preco_diaria`,
    [id, precoDiaria.toFixed(2)],
  );

  if (!updated.rows[0]) {
    return { id, ok: false, error: 'falha_update', hotel_id: unit.hotel_id, titulo: unit.titulo };
  }

  return {
    id,
    ok: true,
    hotel_id: updated.rows[0].hotel_id,
    titulo: updated.rows[0].titulo,
    preco_anterior: precoAtual,
    preco_novo: Number(updated.rows[0].preco_diaria),
  };
}

async function main() {
  const client = await pool.connect();
  const results = [];

  try {
    await client.query('BEGIN');
    for (const row of rows) {
      results.push(await atualizarUm(client, row));
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
  console.error('[atualizar-precos] falhou:', err.message);
  process.exit(1);
});
