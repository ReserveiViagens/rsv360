import { NextRequest, NextResponse } from 'next/server';
import { getAuthBackendBaseUrl } from '@/lib/auth-v1-backend';

export type OAuthProvider = 'google' | 'facebook';

export function getSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

export function getOAuthCallbackUrl(provider: OAuthProvider): string {
  const override =
    provider === 'google'
      ? process.env.GOOGLE_REDIRECT_URI
      : process.env.FACEBOOK_REDIRECT_URI;
  return override || `${getSiteOrigin()}/api/auth/${provider}/callback`;
}

export function parseOAuthState(state: string | null): { redirect: string } {
  const fallback = { redirect: '/minhas-reservas' };
  if (!state) return fallback;
  try {
    const parsed = JSON.parse(decodeURIComponent(state)) as { redirect?: string };
    return { redirect: parsed.redirect || fallback.redirect };
  } catch {
    return fallback;
  }
}

export interface OAuthProfile {
  provider: OAuthProvider;
  provider_id: string;
  email: string;
  name: string;
}

export interface V1OAuthTokens {
  access_token?: string;
  refresh_token?: string;
  requires_2fa?: boolean;
  temp_token?: string;
  expires_in?: number;
}

export async function exchangeOAuthProfileForV1Tokens(
  profile: OAuthProfile
): Promise<{ ok: true; data: V1OAuthTokens } | { ok: false; status: number; error: string }> {
  const backend = getAuthBackendBaseUrl().replace(/\/$/, '');
  const response = await fetch(`${backend}/api/v1/auth/oauth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-OAuth-Bff-Secret': process.env.OAUTH_BFF_SECRET || '',
    },
    body: JSON.stringify(profile),
  });

  let body: Record<string, unknown> = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok || body.success !== true) {
    return {
      ok: false,
      status: response.status,
      error: String(body.error || 'Erro ao autenticar com OAuth'),
    };
  }

  const data = (body.data ?? body) as V1OAuthTokens;
  return { ok: true, data };
}

export function redirectOAuthError(
  request: NextRequest,
  redirectTo: string,
  code: string
): NextResponse {
  const url = new URL(redirectTo.startsWith('/') ? redirectTo : '/login', request.url);
  url.searchParams.set('error', code);
  return NextResponse.redirect(url.toString());
}

export function redirectOAuthSuccess(
  request: NextRequest,
  redirectTo: string,
  tokens: V1OAuthTokens,
  provider: OAuthProvider
): NextResponse {
  if (tokens.requires_2fa && tokens.temp_token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('requires_2fa', '1');
    url.searchParams.set('temp_token', tokens.temp_token);
    url.searchParams.set('redirect', redirectTo);
    url.searchParams.set('provider', provider);
    return NextResponse.redirect(url.toString());
  }

  if (!tokens.access_token || !tokens.refresh_token) {
    return redirectOAuthError(request, '/login', 'oauth_token_error');
  }

  const url = new URL(redirectTo.startsWith('/') ? redirectTo : '/minhas-reservas', request.url);
  url.searchParams.set('access_token', tokens.access_token);
  url.searchParams.set('refresh_token', tokens.refresh_token);
  url.searchParams.set('provider', provider);
  return NextResponse.redirect(url.toString());
}

export async function fetchGoogleProfile(code: string): Promise<OAuthProfile | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirectUri = getOAuthCallbackUrl('google');

  if (!clientId || !clientSecret) {
    return null;
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    return null;
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    return null;
  }

  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userResponse.ok) {
    return null;
  }

  const googleUser = (await userResponse.json()) as {
    id?: string;
    email?: string;
    name?: string;
    given_name?: string;
  };

  if (!googleUser.id) {
    return null;
  }

  return {
    provider: 'google',
    provider_id: googleUser.id,
    email: googleUser.email || '',
    name: googleUser.name || googleUser.given_name || 'Usuário Google',
  };
}

export async function fetchFacebookProfile(code: string): Promise<OAuthProfile | null> {
  const appId = process.env.FACEBOOK_APP_ID || '';
  const appSecret = process.env.FACEBOOK_APP_SECRET || '';
  const redirectUri = getOAuthCallbackUrl('facebook');

  if (!appId || !appSecret) {
    return null;
  }

  const tokenUrl =
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${encodeURIComponent(appId)}&` +
    `client_secret=${encodeURIComponent(appSecret)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `code=${encodeURIComponent(code)}`;

  const tokenResponse = await fetch(tokenUrl);
  if (!tokenResponse.ok) {
    return null;
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    return null;
  }

  const userResponse = await fetch(
    `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${encodeURIComponent(tokenData.access_token)}`
  );

  if (!userResponse.ok) {
    return null;
  }

  const facebookUser = (await userResponse.json()) as {
    id?: string;
    name?: string;
    email?: string;
  };

  if (!facebookUser.id) {
    return null;
  }

  return {
    provider: 'facebook',
    provider_id: facebookUser.id,
    email: facebookUser.email || '',
    name: facebookUser.name || 'Usuário Facebook',
  };
}

export function buildDevMockProfile(provider: OAuthProvider): OAuthProfile {
  const stamp = Date.now();
  return {
    provider,
    provider_id: `dev_${stamp}`,
    email: `${provider}_dev_${stamp}@oauth.local`,
    name: provider === 'google' ? 'Usuário Google (dev)' : 'Usuário Facebook (dev)',
  };
}

export function isOAuthDevMockEnabled(): boolean {
  return process.env.OAUTH_DEV_MOCK === 'true' && process.env.NODE_ENV !== 'production';
}
