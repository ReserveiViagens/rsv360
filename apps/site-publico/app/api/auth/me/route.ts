import { NextRequest, NextResponse } from 'next/server';
import { getAuthBackendBaseUrl } from '@/lib/auth-v1-backend';
import { mapSessionToLegacyUser } from '@/lib/auth-v1';

/** GET /api/auth/me — legacy shim over v1 session (T1.8). */
export async function GET(request: NextRequest) {
  const backend = getAuthBackendBaseUrl().replace(/\/$/, '');
  const authorization = request.headers.get('authorization');
  if (!authorization) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const upstream = await fetch(`${backend}/api/v1/auth/session`, {
    method: 'GET',
    headers: { Authorization: authorization },
  });

  const session = await upstream.json();
  if (!upstream.ok || !session.authenticated) {
    return NextResponse.json(
      { error: session.error || 'Não autenticado' },
      { status: upstream.status === 200 ? 401 : upstream.status }
    );
  }

  const user = mapSessionToLegacyUser(session);
  if (!user) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
  }

  return NextResponse.json(user);
}
