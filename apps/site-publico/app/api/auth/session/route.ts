import { NextRequest } from 'next/server';
import { proxyAuthV1 } from '@/lib/auth-v1-backend';

/** GET /api/auth/session — BFF proxy to backend /api/v1/auth/session (T1.8). */
export async function GET(request: NextRequest) {
  return proxyAuthV1('/api/v1/auth/session', request, { method: 'GET' });
}
