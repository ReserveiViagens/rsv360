import { NextRequest, NextResponse } from 'next/server';
import { getFase1BackendBaseUrl } from '@/lib/fase1-bff';
import { jsonInternalError } from '@/lib/api-error';

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const backend = getFase1BackendBaseUrl();
    const upstream = await fetch(
      `${backend}/api/v1/cotacao-publica/proposta/${encodeURIComponent(token)}/validade`,
    );
    const json = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json(
        { success: false, error: json.error || 'Proposta não encontrada' },
        { status: upstream.status },
      );
    }
    return NextResponse.json(json);
  } catch (error) {
    return jsonInternalError(error);
  }
}
