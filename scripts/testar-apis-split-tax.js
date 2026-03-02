#!/usr/bin/env node
/**
 * Testa as APIs dos módulos Split e Tributação
 */
const BASE = 'http://localhost:3000';
const COOKIE = 'admin_token=admin-token-123';

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Cookie: COOKIE,
      ...opts.headers,
    },
  });
  return res.json();
}

async function main() {
  console.log('\n=== Teste das APIs Split e Tributação ===\n');

  const tests = [
    { name: 'GET /api/split-marketplace/config', fn: () => fetchJson(`${BASE}/api/split-marketplace/config`) },
    { name: 'GET /api/tax/deductions', fn: () => fetchJson(`${BASE}/api/tax/deductions`) },
    {
      name: 'POST /api/tax/simulation',
      fn: () =>
        fetchJson(`${BASE}/api/tax/simulation`, {
          method: 'POST',
          body: JSON.stringify({ gross_revenue: 600000, regime: 'simples', service_type: 'services' }),
        }),
    },
    { name: 'GET /api/tax/perse?cnae=79.11-2', fn: () => fetchJson(`${BASE}/api/tax/perse?cnae=79.11-2`) },
    {
      name: 'POST /api/tax/chat',
      fn: () =>
        fetchJson(`${BASE}/api/tax/chat`, {
          method: 'POST',
          body: JSON.stringify({ message: 'O que é Perse?', context: {} }),
        }),
    },
    {
      name: 'POST /api/tax/classify',
      fn: () =>
        fetchJson(`${BASE}/api/tax/classify`, {
          method: 'POST',
          body: JSON.stringify({ description: 'Anúncio Facebook', amount: 500 }),
        }),
    },
    {
      name: 'POST /api/split-marketplace/suggest',
      fn: () =>
        fetchJson(`${BASE}/api/split-marketplace/suggest`, {
          method: 'POST',
          body: JSON.stringify({ receiver_id: 1, service_type: 'rent' }),
        }),
    },
  ];

  let ok = 0;
  let fail = 0;

  for (const t of tests) {
    try {
      const json = await t.fn();
      const success = json.success === true;
      if (success) {
        console.log(`  [OK] ${t.name}`);
        ok++;
      } else {
        console.log(`  [FALHA] ${t.name}: ${json.error || 'unknown'}`);
        fail++;
      }
    } catch (err) {
      console.log(`  [ERRO] ${t.name}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nResumo: ${ok} OK, ${fail} falhas\n`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
