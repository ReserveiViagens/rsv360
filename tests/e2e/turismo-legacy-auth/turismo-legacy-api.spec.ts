import { test, expect } from '@playwright/test';

const backendBase =
  process.env.RSV_AUTH_V1_BACKEND_URL || 'http://localhost:3002';

/**
 * D2.1 — smoke: endpoints legado ainda não expostos no backend (:3002).
 * Register migrou para v1 (D2.2/D2.3) — fora desta lista.
 */
const legacyEndpoints = [
  { name: '2fa setup', path: '/api/auth/2fa/setup', method: 'POST' as const },
  { name: '2fa verify', path: '/api/auth/2fa/verify', method: 'POST' as const },
  { name: '2fa verify-setup', path: '/api/auth/2fa/verify-setup', method: 'POST' as const },
  { name: '2fa disable', path: '/api/auth/2fa/disable', method: 'POST' as const },
  { name: '2fa backup-codes', path: '/api/auth/2fa/backup-codes', method: 'POST' as const },
  { name: 'forgot-password', path: '/api/auth/forgot-password', method: 'POST' as const },
  { name: 'reset-password', path: '/api/auth/reset-password', method: 'POST' as const },
];

test.describe('D2.1 — turismo legacy auth API (backend)', () => {
  for (const endpoint of legacyEndpoints) {
    test(`${endpoint.name} → 404 (não implementado no backend)`, async ({ request }) => {
      const response = await request.fetch(`${backendBase}${endpoint.path}`, {
        method: endpoint.method,
        data: {},
      });
      expect(response.status()).toBe(404);
    });
  }

  test('legado /api/auth/register → 404', async ({ request }) => {
    const response = await request.post(`${backendBase}/api/auth/register`, { data: {} });
    expect(response.status()).toBe(404);
  });

  test('v1 register (controle) responde 400 sem body válido', async ({ request }) => {
    const response = await request.post(`${backendBase}/api/v1/auth/register`, {
      data: {},
    });
    expect([400, 501]).toContain(response.status());
  });

  test('v1 login (controle) responde 400 sem body', async ({ request }) => {
    const response = await request.post(`${backendBase}/api/v1/auth/login`, {
      data: {},
    });
    expect(response.status()).toBe(400);
  });
});

test.describe('D2.1 — turismo health (CI)', () => {
  const turismoBase = process.env.RSV_SMOKE_TURISMO_URL || 'http://localhost:3005';

  test('GET /api/health responde 200', async ({ request }) => {
    const response = await request.get(`${turismoBase}/api/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    // Contrato real do turismo: { status: "ok", ... } (não body.ok).
    expect(body.status).toBe('ok');
  });
});
