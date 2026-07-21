import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { verifyAdminApiRequest } from '@/lib/admin-api-auth';
import { getJwtSecret } from '@rsv360/shared';

function backendBase(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3002'
  ).replace(/\/$/, '');
}

function jwtSecretKey(): Uint8Array {
  const secret = getJwtSecret();
  return new TextEncoder().encode(secret);
}

/** Converte admin_token (site) em access JWT do backend (userId + role). */
export async function mintBackendStaffToken(admin: {
  sub: string;
  role: string;
  email?: string;
}): Promise<string> {
  const numericId = Number(admin.sub);
  const userId = Number.isFinite(numericId) && numericId > 0 ? numericId : 1;
  return new SignJWT({
    userId,
    role: admin.role,
    email: admin.email,
    name: admin.email ?? admin.role,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime('1h')
    .sign(jwtSecretKey());
}

export async function requireCmsStaff(request: NextRequest) {
  const admin = await verifyAdminApiRequest(request);
  if (!admin) {
    return {
      error: NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 }),
    };
  }
  return { admin, backendToken: await mintBackendStaffToken(admin) };
}

export async function proxyCms(
  request: NextRequest,
  path: string,
  init?: RequestInit,
): Promise<NextResponse> {
  const auth = await requireCmsStaff(request);
  if ('error' in auth && auth.error) return auth.error;

  const url = `${backendBase()}/api/v1/cms${path}`;
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${auth.backendToken}`);
  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const upstream = await fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const contentType = upstream.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
  }
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': contentType || 'text/plain' },
  });
}
