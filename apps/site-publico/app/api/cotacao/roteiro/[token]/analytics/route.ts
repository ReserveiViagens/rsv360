import { NextRequest, NextResponse } from 'next/server';
import { getFase1BackendBaseUrl } from '@/lib/fase1-bff';
import { jsonInternalError } from '@/lib/api-error';

type Params = { params: Promise<{ token: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const body = await request.text();
    const backend = getFase1BackendBaseUrl();
    const upstream = await fetch(
      `${backend}/api/v1/roteiro/${encodeURIComponent(token)}/analytics`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      },
    );
    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const json = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { success: false, error: json.error || 'Falha ao registrar analytics' },
      { status: upstream.status },
    );
  } catch (error) {
    return jsonInternalError(error);
  }
}
