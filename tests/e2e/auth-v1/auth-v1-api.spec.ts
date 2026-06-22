import { test, expect } from '@playwright/test';

const email = process.env.SEED_TEST_USER_EMAIL || 'test@local.dev';
const password =
  process.env.SEED_TEST_USER_PASSWORD || 'dev-only-fallback-do-not-use-in-prod';

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
});
