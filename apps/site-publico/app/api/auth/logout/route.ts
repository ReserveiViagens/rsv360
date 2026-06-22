import { NextRequest } from 'next/server';
import { proxyAuthV1 } from '@/lib/auth-v1-backend';

/** POST /api/auth/logout — BFF proxy to backend /api/v1/auth/logout (T1.8). */
export async function POST(request: NextRequest) {
  return proxyAuthV1('/api/v1/auth/logout', request);
}
