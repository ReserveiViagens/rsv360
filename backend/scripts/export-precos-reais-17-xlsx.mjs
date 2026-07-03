#!/usr/bin/env node
/**
 * Etapa A flat — exporta data/etapa-a/precos_reais_17.csv para XLSX editável.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const csvPath = resolve(repoRoot, 'data/etapa-a/precos_reais_17.csv');
const csv = readFileSync(csvPath, 'utf8');
const lines = csv.trim().split(/\r?\n/);
const header = lines[0].split(',');
const rows = lines.slice(1).map((line) => {
  const obj = {};
  const cols = line.split(',');
  header.forEach((h, i) => {
    obj[h] = cols[i] ?? '';
  });
  return obj;
});

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'precos_reais_17');
const outPath = resolve(repoRoot, 'data/etapa-a/precos_reais_17.xlsx');
XLSX.writeFile(wb, outPath);
console.log('exported', rows.length, 'rows ->', outPath);
