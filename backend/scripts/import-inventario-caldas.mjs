#!/usr/bin/env node
/**
 *   INVENTARIO_CALDAS_CSV — caminho para .csv ou .xlsx (ex.: backend/data/inventario_caldas_novas.xlsx)
 * Uso:
 *   cd backend && node scripts/import-inventario-caldas.mjs --dry-run
 *   cd backend && node scripts/import-inventario-caldas.mjs --commit
 */
import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { resolve, basename } from 'path';
import { pipelineImportacao } from '../../server/modules/acomodacoes/import/pipeline.ts';
import { syncEmpreendimentosCaldas } from '../../server/modules/acomodacoes/sync/sync-empreendimentos.ts';

const commit = process.argv.includes('--commit');
const defaultXlsx = resolve(process.cwd(), 'data/inventario_caldas_novas.xlsx');
const defaultFixture = resolve(process.cwd(), '../data/cotacao/inventario-caldas-fixture.csv');
const csvPath =
  process.env.INVENTARIO_CALDAS_CSV ||
  (existsSync(defaultXlsx) ? defaultXlsx : defaultFixture);

if (!existsSync(csvPath)) {
  console.error('CSV não encontrado:', csvPath);
  process.exit(1);
}

const proprietarioId = Number(process.env.CONTA_INVENTARIO_USER_ID || 0) || null;

console.log('[import-inventario] sync empreendimentos...');
const sync = await syncEmpreendimentosCaldas();
console.log(sync);

const buffer = readFileSync(csvPath);
const nomeArquivo = basename(csvPath);
const relatorio = await pipelineImportacao(buffer, nomeArquivo, {
  dryRun: !commit,
  bulkPublicado: true,
  proprietarioId,
});

console.log('[import-inventario]', { commit, csvPath, proprietarioId, ignorados: relatorio.ignorados, relatorio });
if (relatorio.erros > 0) process.exit(2);
process.exit(0);
