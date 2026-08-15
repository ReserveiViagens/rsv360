#!/usr/bin/env node
/**
 * PR-16d-telemetry — aggregate sanitized CSP JSONL into counts by app/directive.
 *
 * Usage:
 *   node scripts/csp-telemetry-aggregate.cjs path/to/csp.jsonl [more.jsonl...]
 *   node scripts/csp-telemetry-aggregate.cjs --stdin < csp.jsonl
 *
 * Expects lines produced by packages/shared/security-headers.cjs (no PII fields).
 */
'use strict';

const fs = require('fs');

function usage() {
  console.error(
    'Usage: node scripts/csp-telemetry-aggregate.cjs <file.jsonl> [file...] | --stdin',
  );
  process.exit(2);
}

function ingestLine(line, byApp, byDirective, rows) {
  const trimmed = line.trim();
  if (!trimmed) return;
  let row;
  try {
    row = JSON.parse(trimmed);
  } catch {
    return;
  }
  if (!row || typeof row !== 'object') return;
  // Reject accidental raw CSP payloads.
  if (row['csp-report'] || row['blocked-uri']) return;

  const app = String(row.app || 'unknown').slice(0, 48);
  const directive = String(
    row.effectiveDirective || row.violatedDirective || 'unknown',
  ).slice(0, 64);
  const blockedUri = String(row.blockedUri || 'unknown').slice(0, 128);
  const documentPath = String(row.documentPath || '/').slice(0, 128);

  byApp[app] = (byApp[app] || 0) + 1;
  byDirective[directive] = (byDirective[directive] || 0) + 1;
  const key = `${app}\t${directive}\t${blockedUri}\t${documentPath}`;
  rows.set(key, (rows.get(key) || 0) + 1);
}

function aggregate(text) {
  const byApp = Object.create(null);
  const byDirective = Object.create(null);
  const rows = new Map();
  for (const line of text.split(/\r?\n/)) {
    ingestLine(line, byApp, byDirective, rows);
  }
  const list = [...rows.entries()]
    .map(([key, count]) => {
      const [app, directive, blockedUri, documentPath] = key.split('\t');
      return { app, directive, blockedUri, documentPath, count };
    })
    .sort((a, b) => b.count - a.count);
  const total = list.reduce((n, r) => n + r.count, 0);
  return {
    event: 'csp_telemetry_aggregate',
    generatedAt: new Date().toISOString(),
    total,
    byApp,
    byDirective,
    rows: list.slice(0, 200),
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) usage();

  let text = '';
  if (args[0] === '--stdin') {
    text = fs.readFileSync(0, 'utf8');
  } else {
    for (const file of args) {
      text += fs.readFileSync(file, 'utf8');
      if (!text.endsWith('\n')) text += '\n';
    }
  }

  process.stdout.write(`${JSON.stringify(aggregate(text), null, 2)}\n`);
}

main();
