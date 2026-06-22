import { NextRequest } from 'next/server';
import { proxyAuthV1 } from '@/lib/auth-v1-backend';

/** POST /api/auth/forgot-password — BFF proxy to backend v1 (D2.7). */
export async function POST(request: NextRequest) {
  return proxyAuthV1('/api/v1/auth/forgot-password', request);
}
