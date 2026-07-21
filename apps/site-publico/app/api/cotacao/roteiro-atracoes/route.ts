import { NextRequest, NextResponse } from 'next/server';
import { jsonInternalError } from '@/lib/api-error';

function backendBase(): string {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3002'
  ).replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const qs = new URLSearchParams();
    const turno = sp.get('turno');
    const publico = sp.get('publico');
    if (turno) qs.set('turno', turno);
    if (publico) qs.set('publico', publico);

    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const upstream = await fetch(
      `${backendBase()}/api/v1/cotacao-publica/roteiro-atracoes${suffix}`,
      { cache: 'no-store' },
    );

    const json = await upstream.json();
    return NextResponse.json(json, {
      status: upstream.status,
      headers: {
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('[roteiro-atracoes]', error);
    return jsonInternalError(error);
  }
}
