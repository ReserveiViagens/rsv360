#!/usr/bin/env node
/**
 * Script de sanidade: chama cada endpoint do proprietário com token e imprime OK/Falha.
 * Uso: node scripts/test-proprietor-apis.js [BASE_URL]
 * Ex.: node scripts/test-proprietor-apis.js http://localhost:5000
 */
const BASE = process.argv[2] || process.env.API_BASE_URL || 'http://localhost:5000';
const TOKEN = process.env.TEST_TOKEN || 'admin-token';

async function main() {
  const heads = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`,
  };

  const ok = (msg) => console.log(`  OK: ${msg}`);
  const fail = (msg, e) => console.log(`  FALHA: ${msg}`, e && e.message ? e.message : e);

  const get = async (path) => {
    const r = await fetch(`${BASE}${path}`, { headers: heads });
    return { status: r.status, body: r.ok ? await r.json() : await r.text() };
  };

  console.log('Testando APIs do proprietário em', BASE, 'com token', TOKEN.slice(0, 8) + '...\n');

  const tests = [
    ['/api/v1/proprietor/dashboard/stats', (d) => d.success && typeof d.data?.occupancyRate === 'number'],
    ['/api/v1/proprietor/auctions', (d) => d.success && (Array.isArray(d.data) || (d.data && typeof d.data === 'object'))],
    ['/api/v1/proprietor/revenue?period=30d', (d) => d.success && typeof d.data?.total === 'number' && Array.isArray(d.data?.byDay)],
    ['/api/v1/proprietor/occupancy?period=30d', (d) => d.success && typeof d.data?.rate === 'number' && Array.isArray(d.data?.byDay)],
    ['/api/v1/proprietor/revenue/trends?period=30d', (d) => d.success && Array.isArray(d.data)],
    ['/api/v1/proprietor/occupancy/trends?period=30d', (d) => d.success && Array.isArray(d.data)],
    ['/api/v1/proprietor/auctions/performance', (d) => d.success && Array.isArray(d.data?.byStatus) && d.data?.wonVsLost != null],
  ];

  let allOk = true;
  for (const [path, check] of tests) {
    try {
      const { status, body } = await get(path);
      if (status === 200 && (typeof body === 'object' && check(body))) {
        ok(path);
      } else {
        fail(path, { status, body: typeof body === 'string' ? body.slice(0, 80) : body });
        allOk = false;
      }
    } catch (e) {
      fail(path, e);
      allOk = false;
    }
  }

  process.exit(allOk ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
