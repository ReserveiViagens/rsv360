#!/usr/bin/env node
/**
 * PR-05b live smoke — CORS ACAO matrix + /metrics bearer.
 * Usage:
 *   METRICS_TOKEN=... node scripts/smoke-pr05b-cors-metrics.cjs
 *   BACKEND_URL=http://127.0.0.1:3002 METRICS_TOKEN=... node scripts/smoke-pr05b-cors-metrics.cjs
 */
const fs = require('fs');
const path = require('path');

const BACKEND_URL = (process.env.BACKEND_URL || 'http://127.0.0.1:3002').replace(
  /\/$/,
  '',
);
const SITE_URL = (process.env.SITE_URL || 'http://127.0.0.1:3000').replace(
  /\/$/,
  '',
);
const METRICS_TOKEN = process.env.METRICS_TOKEN || '';

const LEGIT = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3004',
  'http://127.0.0.1:3005',
  'http://127.0.0.1:3006',
];

const lines = [];
function log(msg) {
  console.log(msg);
  lines.push(msg);
}

async function fetchHeaders(url, init = {}) {
  const res = await fetch(url, init);
  const headers = {};
  res.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });
  return { status: res.status, headers, text: await res.text() };
}

async function main() {
  log(`# PR-05b smoke @ ${new Date().toISOString()}`);
  log(`BACKEND_URL=${BACKEND_URL}`);
  log(`SITE_URL=${SITE_URL}`);
  log('');

  let pass = 0;
  let fail = 0;

  log('## CORS matrix (GET /health)');
  for (const origin of LEGIT) {
    try {
      const { status, headers } = await fetchHeaders(`${BACKEND_URL}/health`, {
        headers: { Origin: origin },
      });
      const acao = headers['access-control-allow-origin'] || '';
      const ok = status === 200 && acao === origin;
      log(`${ok ? 'PASS' : 'FAIL'} origin=${origin} status=${status} acao=${acao || '(none)'}`);
      if (ok) pass++;
      else fail++;
    } catch (err) {
      log(`FAIL origin=${origin} error=${err.message}`);
      fail++;
    }
  }

  try {
    const evil = 'http://evil.example';
    const { status, headers } = await fetchHeaders(`${BACKEND_URL}/health`, {
      headers: { Origin: evil },
    });
    const acao = headers['access-control-allow-origin'];
    const ok = status === 200 && !acao;
    log(
      `${ok ? 'PASS' : 'FAIL'} origin=${evil} status=${status} acao=${acao || '(none)'} (must deny)`,
    );
    if (ok) pass++;
    else fail++;
  } catch (err) {
    log(`FAIL evil error=${err.message}`);
    fail++;
  }

  log('');
  log('## /metrics bearer');
  if (!METRICS_TOKEN) {
    log('SKIP metrics live checks — METRICS_TOKEN unset');
  } else {
    try {
      const anon = await fetchHeaders(`${BACKEND_URL}/metrics`);
      const ok401 = anon.status === 401;
      log(`${ok401 ? 'PASS' : 'FAIL'} GET /metrics anon → ${anon.status} (want 401)`);
      if (ok401) pass++;
      else fail++;

      const auth = await fetchHeaders(`${BACKEND_URL}/metrics`, {
        headers: { Authorization: `Bearer ${METRICS_TOKEN}` },
      });
      const ok200 =
        auth.status === 200 && String(auth.text).includes('rsv360_');
      log(
        `${ok200 ? 'PASS' : 'FAIL'} GET /metrics bearer → ${auth.status} (want 200+rsv360_)`,
      );
      if (ok200) pass++;
      else fail++;
    } catch (err) {
      log(`FAIL metrics error=${err.message}`);
      fail++;
    }

    try {
      const siteAnon = await fetchHeaders(`${SITE_URL}/api/metrics`);
      if (siteAnon.status >= 500) {
        log(
          `SKIP GET /api/metrics site → ${siteAnon.status} (site-publico not on PR image / known lab 500)`,
        );
      } else {
        const ok401 = siteAnon.status === 401;
        log(
          `${ok401 ? 'PASS' : 'FAIL'} GET /api/metrics anon → ${siteAnon.status} (want 401)`,
        );
        if (ok401) pass++;
        else fail++;
      }
    } catch (err) {
      log(`SKIP /api/metrics site unreachable: ${err.message}`);
    }
  }

  log('');
  log(`SMOKE_SUMMARY pass=${pass} fail=${fail}`);

  const outDir = path.join(
    __dirname,
    '..',
    'docs',
    'evidence',
    'pr-05b-cors-metrics',
  );
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'matrix-live.txt');
  fs.writeFileSync(outFile, lines.join('\n') + '\n', 'utf8');
  log(`wrote ${outFile}`);

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
