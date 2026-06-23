import { NextRequest } from 'next/server';
import { proxyFase1V1 } from '@/lib/fase1-bff';

type Params = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, params: Params, method?: string) {
  const { path } = await params.params;
  const suffix = path?.length ? `/${path.join('/')}` : '';
  const query = request.nextUrl.search;
  return proxyFase1V1(`/api/v1/orcamentos${suffix}${query}`, request, { method });
}

export async function GET(request: NextRequest, params: Params) {
  return forward(request, params, 'GET');
}

export async function POST(request: NextRequest, params: Params) {
  return forward(request, params, 'POST');
}

export async function PUT(request: NextRequest, params: Params) {
  return forward(request, params, 'PUT');
}

export async function PATCH(request: NextRequest, params: Params) {
  return forward(request, params, 'PATCH');
}

export async function DELETE(request: NextRequest, params: Params) {
  return forward(request, params, 'DELETE');
}
