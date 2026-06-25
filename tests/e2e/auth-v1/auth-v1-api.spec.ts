import { test, expect } from '@playwright/test';

const email = (process.env.SEED_TEST_USER_EMAIL?.trim() || 'test@local.dev');
const password =
  process.env.SEED_TEST_USER_PASSWORD?.trim() ||
  'dev-only-fallback-do-not-use-in-prod';

test.describe.configure({ mode: 'serial' });

test.describe('Auth v1 API — cenários #31', () => {
  let accessToken = '';

  test('1. login válido → session 200', async ({ request }) => {
    const login = await request.post('/api/v1/auth/login', {
      data: { email, password },
    });
    expect(login.status()).toBe(200);
    const body = await login.json();
    expect(body.success).toBe(true);
    expect(body.data?.access_token).toBeTruthy();
    expect(body.data?.refresh_token).toBeTruthy();
    accessToken = body.data!.access_token;

    const session = await request.get('/api/v1/auth/session', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(session.status()).toBe(200);
    const sessionBody = await session.json();
    expect(sessionBody.authenticated).toBe(true);
    expect(sessionBody.user?.email).toBe(email);
  });

  test('5. RBAC / enterpriseId na session', async ({ request }) => {
    expect(accessToken).toBeTruthy();

    const session = await request.get('/api/v1/auth/session', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const sessionBody = await session.json();
    expect(sessionBody.user?.enterpriseId).toBeTruthy();
    expect(Array.isArray(sessionBody.user?.roles)).toBe(true);
    expect(sessionBody.session?.enterpriseId).toBe(sessionBody.user?.enterpriseId);

    const enterpriseId = sessionBody.user.enterpriseId;
    const tenant = await request.get('/api/v1/tenant/context', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Enterprise-Id': enterpriseId,
      },
    });
    expect(tenant.status()).toBe(200);
    const tenantBody = await tenant.json();
    expect(tenantBody.enterpriseId).toBe(enterpriseId);
  });

  test('3. refresh válido → novo access_token', async ({ request }) => {
    const login = await request.post('/api/v1/auth/login', {
      data: { email, password },
    });
    expect(login.status()).toBe(200);
    const loginBody = await login.json();
    const refreshToken = loginBody.data?.refresh_token;
    expect(refreshToken).toBeTruthy();

    const refresh = await request.post('/api/v1/auth/refresh', {
      data: { refresh_token: refreshToken },
    });
    expect(refresh.status()).toBe(200);
    const refreshBody = await refresh.json();
    expect(refreshBody.success).toBe(true);
    expect(refreshBody.data?.access_token).toBeTruthy();
  });

  test('4. logout revoga refresh → 401', async ({ request }) => {
    const login = await request.post('/api/v1/auth/login', {
      data: { email, password },
    });
    expect(login.status()).toBe(200);
    const loginBody = await login.json();
    const access = loginBody.data?.access_token;
    const revokedRefresh = loginBody.data?.refresh_token;

    const logout = await request.post('/api/v1/auth/logout', {
      headers: { Authorization: `Bearer ${access}` },
      data: { refresh_token: revokedRefresh },
    });
    expect(logout.status()).toBe(200);

    const refreshAfter = await request.post('/api/v1/auth/refresh', {
      data: { refresh_token: revokedRefresh },
    });
    expect(refreshAfter.status()).toBe(401);
  });

  test('2. credencial inválida → 401', async ({ request }) => {
    const login = await request.post('/api/v1/auth/login', {
      data: { email, password: 'wrong-password-xyz' },
    });
    expect(login.status()).toBe(401);
    const body = await login.json();
    expect(body.success).toBe(false);
  });

  test('6. register v1 → 201 sem tokens (D2.2/D2.3)', async ({ request }) => {
    const uniqueEmail = `d2-register-${Date.now()}@test.local`;
    const register = await request.post('/api/v1/auth/register', {
      data: {
        name: 'E2E Register',
        email: uniqueEmail,
        password: 'TestPass123',
        password_confirmation: 'TestPass123',
      },
    });
    expect(register.status()).toBe(201);
    const body = await register.json();
    expect(body.success).toBe(true);
    expect(body.data?.email).toBe(uniqueEmail);
    expect(body.data?.access_token).toBeUndefined();

    const duplicate = await request.post('/api/v1/auth/register', {
      data: {
        name: 'E2E Register Dup',
        email: uniqueEmail,
        password: 'TestPass123',
        password_confirmation: 'TestPass123',
      },
    });
    expect(duplicate.status()).toBe(409);
  });

  test('7. legado /api/auth/register → 404', async ({ request }) => {
    const legacy = await request.post('/api/auth/register', {
      data: { name: 'Legacy', email: 'legacy@test.local', password: 'TestPass123' },
    });
    expect(legacy.status()).toBe(404);
  });

  test('8. forgot-password v1 → 200 genérico (D2.4)', async ({ request }) => {
    const e2eIp = `10.200.${Date.now() % 250}.${Math.floor(Math.random() * 200) + 1}`;
    const response = await request.post('/api/v1/auth/forgot-password', {
      headers: { 'X-Forwarded-For': e2eIp },
      data: { email: `forgot-e2e-${Date.now()}@test.local` },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBeTruthy();
  });

  test('9. reset-password v1 → 401 token inválido (D2.4)', async ({ request }) => {
    const e2eIp = `10.201.${Date.now() % 250}.${Math.floor(Math.random() * 200) + 1}`;
    const reset = await request.post('/api/v1/auth/reset-password', {
      headers: { 'X-Forwarded-For': e2eIp },
      data: {
        token: 'invalid-opaque-token',
        password: 'NewPass123',
        password_confirmation: 'NewPass123',
      },
    });
    expect(reset.status()).toBe(401);
    const body = await reset.json();
    expect(body.success).toBe(false);
  });
});
