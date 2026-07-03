import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const csvPath = resolve(repoRoot, 'data/etapa-a/publicar_17_rascunhos.csv');
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
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'publicar_17');
const repoPath = resolve(repoRoot, 'data/etapa-a/publicar_17_rascunhos.xlsx');
XLSX.writeFile(wb, repoPath);
console.log('exported', rows.length, 'rows ->', repoPath);
