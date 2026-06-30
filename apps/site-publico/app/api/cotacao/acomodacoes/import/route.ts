import { NextRequest, NextResponse } from 'next/server';

function backendUrl(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3002'
  ).replace(/\/$/, '');
}

function authHeaders(req: NextRequest): HeadersInit {
  const headers: Record<string, string> = {};
  const auth = req.headers.get('authorization');
  if (auth) headers.Authorization = auth;
  return headers;
}

async function proxyForm(
  req: NextRequest,
  path: 'preview' | 'commit',
): Promise<NextResponse> {
  try {
    const form = await req.formData();
    const upstream = await fetch(`${backendUrl()}/api/v1/acomodacoes/import/${path}`, {
      method: 'POST',
      headers: authHeaders(req),
      body: form,
      cache: 'no-store',
    });
    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action') ?? 'preview';
  if (action === 'commit') {
    return proxyForm(req, 'commit');
  }
  return proxyForm(req, 'preview');
}

export async function GET(req: NextRequest) {
  try {
    const upstream = await fetch(`${backendUrl()}/api/v1/acomodacoes/import/modelo.xlsx`, {
      headers: authHeaders(req),
      cache: 'no-store',
    });
    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      status: upstream.status,
      headers: {
        'Content-Type':
          upstream.headers.get('content-type') ??
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          upstream.headers.get('content-disposition') ??
          'attachment; filename="modelo-importacao-acomodacoes.xlsx"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
