import { NextRequest } from 'next/server';
import { verifyAdminToken, type AdminTokenPayload } from '@/lib/admin-token';

function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7).trim();
  const cookie = request.cookies.get('admin_token')?.value;
  return cookie?.trim() || null;
}

const STAFF_ROLES = new Set(['admin', 'manager']);

/** Valida JWT admin nas rotas REST /api/admin/** — roles admin|manager (padrao preview=1). */
export async function verifyAdminApiRequest(
  request: NextRequest
): Promise<AdminTokenPayload | null> {
  const token = extractBearerToken(request);
  if (!token) return null;
  const payload = await verifyAdminToken(token);
  const role = payload?.role;
  if (!payload?.sub || !role || !STAFF_ROLES.has(role)) return null;
  return {
    sub: String(payload.sub),
    role: role as 'admin' | 'manager',
    email: typeof payload.email === 'string' ? payload.email : undefined,
  };
}
