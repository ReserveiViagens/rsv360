import { NextRequest, NextResponse } from 'next/server';
import { getFase1BackendBaseUrl } from '@/lib/fase1-bff';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const backend = getFase1BackendBaseUrl();
    const upstream = await fetch(`${backend}/api/v1/cotacao-publica/gerar-proposta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const json = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json(
        { success: false, error: json.error || 'Falha ao gerar proposta' },
        { status: upstream.status },
      );
    }

    const token = json.data?.tokenPublico as string;
    return NextResponse.json({
      success: true,
      propostaId: json.data?.propostaId,
      tokenPublico: token,
      validoAte: json.data?.validoAte,
      url: json.data?.url ?? `/proposta/${token}`,
    });
  } catch (error) {
    console.error('[gerar-proposta BFF]', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Erro interno' },
      { status: 500 },
    );
  }
}
