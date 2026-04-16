/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
const { spawn } = require('child_process');
const assert = require('assert');

const PORT = Number(process.env.E2E_PORT || 3102);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const BACKEND_SCRIPT = process.env.E2E_BACKEND_SCRIPT || 'backend/server.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 120_000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) return;
    } catch {
      // ignore and retry
    }

    await sleep(1500);
  }

  throw new Error(`Servidor não ficou pronto em ${timeoutMs}ms: ${url}`);
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();
  return { response, body };
}

async function main() {
  const env = {
    ...process.env,
    PORT: String(PORT),
    NODE_ENV: 'test',
    REDIS_DISABLED: 'true',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/rsv360_test',
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN || 'test-token',
  };

  const server = spawn(process.execPath, [BACKEND_SCRIPT], {
    env,
    stdio: 'inherit',
  });

  const shutdown = () => {
    if (!server.killed) {
      server.kill('SIGTERM');
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    await waitForServer(`${BASE_URL}/health`);

    const health = await requestJson('/health');
    assert.strictEqual(health.response.status, 200);
    assert.strictEqual(health.body.status, 'OK');

    const info = await requestJson('/api/info');
    assert.strictEqual(info.response.status, 200);
    assert.strictEqual(info.body.author, 'Douglas P. Figueiredo');
    assert.ok(Array.isArray(info.body.websites));

    const docs = await requestJson('/api/openapi.json');
    assert.strictEqual(docs.response.status, 200);
    assert.strictEqual(docs.body.openapi, '3.0.3');
    assert.ok(docs.body.paths['/health']);
    assert.ok(docs.body.paths['/api/docs']);

    const metrics = await fetch(`${BASE_URL}/metrics`);
    assert.strictEqual(metrics.status, 200);
    const metricsText = await metrics.text();
    assert.ok(metricsText.includes('rsv360_http_requests_total'));

    const cloneAlert = await requestJson('/api/clone-alert', {
      method: 'POST',
      body: JSON.stringify({
        cloneDomain: 'clone.example.com',
        cloneUrl: 'https://clone.example.com',
        referrer: 'https://www.reserveiviagens.com.br',
        userAgent: 'RSV360 E2E',
      }),
    });
    assert.strictEqual(cloneAlert.response.status, 201);
    assert.strictEqual(cloneAlert.body.success, true);

    const tracking = await requestJson('/api/tracking/event', {
      method: 'POST',
      body: JSON.stringify({
        eventName: 'E2EInfraSmoke',
        eventId: `e2e-${Date.now()}`,
        data: { source: 'infra-test' },
      }),
    });
    assert.ok([200, 201].includes(tracking.response.status));
    assert.strictEqual(tracking.body.success, true);

    const docsUi = await fetch(`${BASE_URL}/api/docs/ui`);
    assert.strictEqual(docsUi.status, 200);

    console.log(JSON.stringify({
      health: true,
      info: true,
      docs: true,
      metrics: true,
      cloneAlert: true,
      tracking: true,
    }, null, 2));
  } finally {
    shutdown();
  }
}

main().catch((error) => {
  console.error('[E2E] Infra smoke failed:', error);
  process.exit(1);
});
