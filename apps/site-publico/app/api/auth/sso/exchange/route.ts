import { NextRequest, NextResponse } from 'next/server';
import { proxySsoExchange } from '@/lib/sso-backend';

/** POST /api/auth/sso/exchange — troca código SSO por sessão JWT (Fase 4). */
export async function POST(request: NextRequest) {
  let code = '';
  try {
    const body = await request.json();
    code = typeof body?.code === 'string' ? body.code.trim() : '';
  } catch {
    return NextResponse.json({ success: false, error: 'JSON inválido' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ success: false, error: 'code é obrigatório' }, { status: 400 });
  }

  const { status, json } = await proxySsoExchange(code);
  return NextResponse.json(json, { status });
}
