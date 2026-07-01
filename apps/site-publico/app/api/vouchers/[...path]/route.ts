import { NextRequest } from 'next/server';
import { proxyFase1V1 } from '@/lib/fase1-bff';

type Params = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, params: Params, method?: string) {
  const { path } = await params.params;
  const suffix = path?.length ? `/${path.join('/')}` : '';
  const query = request.nextUrl.search;
  return proxyFase1V1(`/api/v1/vouchers${suffix}${query}`, request, { method });
}

export async function GET(request: NextRequest, params: Params) {
  return forward(request, params, 'GET');
}
