import { NextResponse } from 'next/server';
import {
  parseTaxaHospedePublicaFields,
  taxaHospedePublicaLiteral,
} from '@/lib/taxa-hospede-publica-parse';

function backendBase(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3002'
  ).replace(/\/$/, '');
}

export async function GET() {
  try {
    const res = await fetch(`${backendBase()}/api/v1/cotacao-publica/taxa-hospede-publica`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ success: true, data: null });
    }
    const json = (await res.json()) as { data?: unknown };
    const parsed = parseTaxaHospedePublicaFields(json.data);
    if (!parsed) {
      return NextResponse.json({ success: true, data: null });
    }
    const literal = taxaHospedePublicaLiteral(parsed);
    return NextResponse.json({
      success: true,
      data: {
        ativa: literal.ativa,
        pct: literal.pct,
        nome: literal.nome,
        descricao: literal.descricao,
      },
    });
  } catch (error) {
    console.error('[taxa-hospede-publica]', error);
    return NextResponse.json({ success: true, data: null });
  }
}
