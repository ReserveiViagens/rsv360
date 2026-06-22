import { NextRequest } from 'next/server';
import { proxyAuthV1 } from '@/lib/auth-v1-backend';

/** POST /api/auth/reset-password — BFF proxy to backend v1 (D2.7). */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const token = body.token;
  const password =
    body.password ?? body.newPassword ?? body.new_password;
  const passwordConfirmation =
    body.password_confirmation ??
    body.passwordConfirmation ??
    body.confirmPassword ??
    password;

  const normalized = JSON.stringify({
    token,
    password,
    password_confirmation: passwordConfirmation,
  });

  const headers = new Headers(request.headers);
  headers.set('Content-Type', 'application/json');

  const proxyRequest = new NextRequest(request.url, {
    method: 'POST',
    headers,
    body: normalized,
  });

  return proxyAuthV1('/api/v1/auth/reset-password', proxyRequest);
}
