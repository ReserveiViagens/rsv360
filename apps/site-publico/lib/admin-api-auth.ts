import { NextRequest } from 'next/server';
import { verifyAdminToken, type AdminTokenPayload } from '@/lib/admin-token';

function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim();
}

/** Valida JWT admin nas rotas REST /api/admin/** */
export async function verifyAdminApiRequest(
  request: NextRequest
): Promise<AdminTokenPayload | null> {
  const token = extractBearerToken(request);
  if (!token) return null;
  const payload = await verifyAdminToken(token);
  if (!payload?.sub || payload.role !== 'admin') return null;
  return {
    sub: String(payload.sub),
    role: 'admin',
    email: typeof payload.email === 'string' ? payload.email : undefined,
  };
}
