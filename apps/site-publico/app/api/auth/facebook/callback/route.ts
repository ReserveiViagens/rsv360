import { NextRequest } from 'next/server';
import {
  buildDevMockProfile,
  exchangeOAuthProfileForV1Tokens,
  fetchFacebookProfile,
  isOAuthDevMockEnabled,
  parseOAuthState,
  redirectOAuthError,
  redirectOAuthSuccess,
} from '@/lib/oauth-server';

export const dynamic = 'force-dynamic';

/** GET /api/auth/facebook/callback — callback OAuth → v1 tokens (D2.9). */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const { redirect: redirectTo } = parseOAuthState(state);

    if (!code) {
      return redirectOAuthError(request, redirectTo, 'oauth_cancelled');
    }

    let profile =
      code === 'dev_mock' && isOAuthDevMockEnabled()
        ? buildDevMockProfile('facebook')
        : await fetchFacebookProfile(code);

    if (!profile) {
      return redirectOAuthError(request, redirectTo, 'oauth_token_error');
    }

    const result = await exchangeOAuthProfileForV1Tokens(profile);
    if (!result.ok) {
      return redirectOAuthError(request, redirectTo, 'oauth_backend_error');
    }

    return redirectOAuthSuccess(request, redirectTo, result.data, 'facebook');
  } catch (error) {
    console.error('[OAuth] facebook callback error:', error);
    return redirectOAuthError(request, '/login', 'oauth_error');
  }
}
