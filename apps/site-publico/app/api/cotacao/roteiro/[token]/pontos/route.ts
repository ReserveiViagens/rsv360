import { NextRequest, NextResponse } from 'next/server';
import { getFase1BackendBaseUrl } from '@/lib/fase1-bff';
import { jsonInternalError } from '@/lib/api-error';

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const backend = getFase1BackendBaseUrl();
    const upstream = await fetch(
      `${backend}/api/v1/roteiro/${encodeURIComponent(token)}/pontos`,
      { cache: 'no-store' },
    );

    if (!upstream.ok) {
      const json = await upstream.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: json.error || 'Falha ao carregar pontos do roteiro' },
        { status: upstream.status },
      );
    }

    const json = await upstream.json();
    return NextResponse.json(json);
  } catch (error) {
    return jsonInternalError(error);
  }
}
