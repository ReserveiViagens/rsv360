import { NextRequest, NextResponse } from 'next/server';
import { getOAuthCallbackUrl, getSiteOrigin, parseOAuthState } from '@/lib/oauth-server';

export const dynamic = 'force-dynamic';

/** GET /api/auth/facebook — inicia OAuth Facebook (BFF, D2.9). */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const redirect = searchParams.get('redirect') || '/minhas-reservas';
    const appId = process.env.FACEBOOK_APP_ID || '';

    if (!appId) {
      if (process.env.OAUTH_DEV_MOCK === 'true') {
        const state = encodeURIComponent(JSON.stringify({ redirect }));
        const callback = `${getSiteOrigin()}/api/auth/facebook/callback?code=dev_mock&state=${state}`;
        return NextResponse.redirect(callback);
      }
      return NextResponse.json({
        success: false,
        error: 'Facebook OAuth não configurado. Defina FACEBOOK_APP_ID ou OAUTH_DEV_MOCK=true.',
      }, { status: 503 });
    }

    const redirectUri = getOAuthCallbackUrl('facebook');
    const authUrl =
      `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${encodeURIComponent(appId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('email public_profile')}&` +
      `state=${encodeURIComponent(JSON.stringify({ redirect }))}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[OAuth] facebook start error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao iniciar autenticação Facebook' },
      { status: 500 }
    );
  }
}
