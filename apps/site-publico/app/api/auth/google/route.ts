import { NextRequest, NextResponse } from 'next/server';
import { getOAuthCallbackUrl, getSiteOrigin, parseOAuthState } from '@/lib/oauth-server';

export const dynamic = 'force-dynamic';

/** GET /api/auth/google — inicia OAuth Google (BFF, D2.9). */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const redirect = searchParams.get('redirect') || '/minhas-reservas';
    const clientId = process.env.GOOGLE_CLIENT_ID || '';

    if (!clientId) {
      if (process.env.OAUTH_DEV_MOCK === 'true') {
        const state = encodeURIComponent(JSON.stringify({ redirect }));
        const callback = `${getSiteOrigin()}/api/auth/google/callback?code=dev_mock&state=${state}`;
        return NextResponse.redirect(callback);
      }
      return NextResponse.json({
        success: false,
        error: 'Google OAuth não configurado. Defina GOOGLE_CLIENT_ID ou OAUTH_DEV_MOCK=true.',
      }, { status: 503 });
    }

    const redirectUri = getOAuthCallbackUrl('google');
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `state=${encodeURIComponent(JSON.stringify({ redirect }))}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[OAuth] google start error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao iniciar autenticação Google' },
      { status: 500 }
    );
  }
}
