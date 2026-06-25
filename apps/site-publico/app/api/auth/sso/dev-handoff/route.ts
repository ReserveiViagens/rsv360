import { NextRequest, NextResponse } from 'next/server';
import { proxySsoIssue } from '@/lib/sso-backend';
import { isSsoDevMockEnabled } from '@/lib/sso-config';

/**
 * GET /api/auth/sso/dev-handoff — simula handoff do S1 em dev (SSO_DEV_MOCK=true).
 * Redireciona para /auth/sso/callback com código one-time.
 */
export async function GET(request: NextRequest) {
  if (!isSsoDevMockEnabled()) {
    return NextResponse.json({ success: false, error: 'Não disponível' }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const email = (searchParams.get('email') || 'test@local.dev').trim().toLowerCase();
  const returnPath = searchParams.get('return') || '/lab';
  const safeReturn = returnPath.startsWith('/') ? returnPath : '/lab';

  const { status, json } = await proxySsoIssue({
    email,
    name: searchParams.get('name') || email.split('@')[0],
    return_url: safeReturn,
    external_user_id: searchParams.get('external_user_id') || 'dev-mock',
  });

  if (status !== 200 || !json.success) {
    return NextResponse.json(json, { status: status >= 400 ? status : 502 });
  }

  const data = json.data as { callback_url?: string } | undefined;
  const callbackUrl = data?.callback_url;
  if (!callbackUrl) {
    return NextResponse.json(
      { success: false, error: 'callback_url ausente na resposta' },
      { status: 502 }
    );
  }

  return NextResponse.redirect(callbackUrl);
}
