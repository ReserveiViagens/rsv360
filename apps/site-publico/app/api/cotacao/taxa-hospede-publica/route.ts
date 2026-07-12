import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { TaxaHospedePublicaConfig } from '@/components/cotacao/wizard/wizard-types';

const taxaHospedePublicaSchema = z.object({
  ativa: z.literal(true),
  pct: z.number().finite().min(0).max(10),
  nome: z.string().trim().min(1).max(120),
  descricao: z.string().trim().max(500),
});

function backendBase(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3002'
  ).replace(/\/$/, '');
}

function parseTaxaHospedePublica(raw: unknown): TaxaHospedePublicaConfig | null {
  const parsed = taxaHospedePublicaSchema.safeParse(raw);
  if (!parsed.success) return null;
  return parsed.data;
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
    const data = parseTaxaHospedePublica(json.data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[taxa-hospede-publica]', error);
    return NextResponse.json({ success: true, data: null });
  }
}
