#!/usr/bin/env node
/**
 * Etapa A §12 — gera data/etapa-a/publicar_17_rascunhos.csv
 * a partir do inventário 436 (linhas sem preco_diaria) + ids no banco.
 *
 * Uso:
 *   DATABASE_URL=... node scripts/gerar-publicar-17-csv.mjs
 *   INVENTARIO_CALDAS_CSV=... node scripts/gerar-publicar-17-csv.mjs
 */
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '../../data/etapa-a/publicar_17_rascunhos.csv');

/** Preços simbólicos (média temporada placeholder) — substituir pelo tarifário real. */
const SYMBOLIC_BY_CODIGO = {
  KN39H: 120,
  'VC-APTO-409-GOLDEN-DOLPHIN-SUPREME': 350,
  'AGF-STD': 150,
  'ATR-DUP': 150,
  'DAP-2Q': 150,
  'AGF-FAM': 220,
  'AQR-FAM': 220,
  'ATR-FAM': 200,
  'PRT1-2Q': 200,
  'DRF-1Q': 190,
  'ATR-SUV': 180,
  'ALD-DUP': 180,
  'SDC-2Q': 180,
  'ALD-FAM': 250,
  'ALV-LUX': 280,
  'AQR-CZ': 160,
  'ALV-PRE': 320,
};

const csvPath =
  process.env.INVENTARIO_CALDAS_CSV ||
  resolve(process.env.USERPROFILE || '', 'Downloads/inventario_caldas_novas436 acomodação.csv');

if (!process.env.DATABASE_URL) {
  console.error('[gerar-publicar-17] DATABASE_URL obrigatório');
  process.exit(1);
}

function parseSemPreco(filePath) {
  const raw = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(',');
  const precoIdx = header.findIndex((h) => h.toLowerCase().includes('preco'));
  const codigoIdx = header.findIndex((h) => h.toLowerCase().includes('codigo'));
  const tituloIdx = header.findIndex((h) => h.toLowerCase().includes('titulo'));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const preco = (cols[precoIdx] ?? '').trim();
    if (preco) continue;
    const codigo = (cols[codigoIdx] ?? '').trim();
    if (!codigo) continue;
    rows.push({ codigo, titulo: (cols[tituloIdx] ?? '').trim() });
  }
  return rows;
}

const semPreco = parseSemPreco(csvPath);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { rows: dbRows } = await pool.query(
  `SELECT id, codigo_externo, titulo, status_publicacao
   FROM acomodacoes
   WHERE codigo_externo = ANY($1::text[])
   ORDER BY id`,
  [semPreco.map((r) => r.codigo)],
);

await pool.end();

const byCodigo = new Map(dbRows.map((r) => [r.codigo_externo, r]));
const lines = ['id,codigo_externo,titulo,preco_diaria,nota'];

for (const row of semPreco) {
  const db = byCodigo.get(row.codigo);
  if (!db) {
    console.warn(`[gerar-publicar-17] codigo ${row.codigo} não encontrado no banco — pulando`);
    continue;
  }
  const preco = SYMBOLIC_BY_CODIGO[row.codigo] ?? 150;
  const nota =
    row.codigo === 'KN39H'
      ? 'SIMBOLICO bootstrap KN23H/KN39H — preco real por operador/data'
      : 'SIMBOLICO media temporada — ajustar tarifario (baixa/media/alta + categorias)';
  const titulo = (db.titulo || row.titulo).replace(/,/g, ' ');
  lines.push(`${db.id},${row.codigo},${titulo},${preco},${nota}`);
}

if (lines.length !== 18) {
  console.warn(`[gerar-publicar-17] esperado 17 linhas de dados, gerou ${lines.length - 1}`);
}

writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`[gerar-publicar-17] ${lines.length - 1} linhas -> ${outPath}`);
