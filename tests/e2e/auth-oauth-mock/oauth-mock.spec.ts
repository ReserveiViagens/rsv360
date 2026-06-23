import { test, expect } from '@playwright/test';

const backendBase =
  process.env.RSV_AUTH_V1_BACKEND_URL || 'http://localhost:3002';

type OAuthProvider = 'google' | 'facebook';

async function followOAuthMockFlow(
  request: import('@playwright/test').APIRequestContext,
  provider: OAuthProvider,
  redirectPath = '/login'
) {
  const start = await request.get(`/api/auth/${provider}?redirect=${encodeURIComponent(redirectPath)}`, {
    maxRedirects: 0,
  });

  if (start.status() === 503) {
    return { skipped: true as const, reason: 'OAUTH_DEV_MOCK desabilitado ou IdP configurado' };
  }

  expect(start.status(), `${provider} start`).toBe(307);
  const callbackUrl = start.headers()['location'];
  expect(callbackUrl).toContain(`/api/auth/${provider}/callback`);
  expect(callbackUrl).toContain('code=dev_mock');

  const callback = await request.get(callbackUrl, { maxRedirects: 0 });
  expect(callback.status(), `${provider} callback`).toBe(307);

  const finalUrl = callback.headers()['location'] || '';
  expect(finalUrl).toContain('access_token=');
  expect(finalUrl).toContain('refresh_token=');
  expect(finalUrl).toContain(`provider=${provider}`);

  const accessToken = new URL(finalUrl, 'http://localhost').searchParams.get('access_token');
  expect(accessToken).toBeTruthy();

  const session = await request.get(`${backendBase}/api/v1/auth/session`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(session.status()).toBe(200);
  const sessionBody = await session.json();
  expect(sessionBody.authenticated).toBe(true);
  expect(sessionBody.user?.email).toMatch(/@oauth\.local$/);

  return { skipped: false as const, accessToken, email: sessionBody.user?.email };
}

test.describe('OAuth mock BFF (D2.9)', () => {
  test('10. Google dev_mock → tokens v1 + session', async ({ request }) => {
    const result = await followOAuthMockFlow(request, 'google');
    if (result.skipped) {
      test.skip(true, result.reason);
    }
    expect(result.email).toContain('google_dev_');
  });

  test('11. Facebook dev_mock → tokens v1 + session', async ({ request }) => {
    const result = await followOAuthMockFlow(request, 'facebook');
    if (result.skipped) {
      test.skip(true, result.reason);
    }
    expect(result.email).toContain('facebook_dev_');
  });
});
