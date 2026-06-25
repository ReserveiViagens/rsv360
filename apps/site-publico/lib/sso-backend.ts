import { getAuthBackendBaseUrl } from '@/lib/auth-v1-backend';

const backend = () => getAuthBackendBaseUrl().replace(/\/$/, '');

export function getSsoBffSecret(): string {
  return (process.env.SSO_BFF_SECRET || process.env.OAUTH_BFF_SECRET || '').trim();
}

export async function proxySsoIssue(body: Record<string, unknown>) {
  const secret = getSsoBffSecret();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret) {
    headers['X-Sso-Bff-Secret'] = secret;
  }

  const upstream = await fetch(`${backend()}/api/v1/auth/sso/issue`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const text = await upstream.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    json = { success: false, error: text || 'Resposta inválida' };
  }

  return { status: upstream.status, json };
}

export async function proxySsoExchange(code: string) {
  const upstream = await fetch(`${backend()}/api/v1/auth/sso/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const text = await upstream.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    json = { success: false, error: text || 'Resposta inválida' };
  }

  return { status: upstream.status, json };
}
