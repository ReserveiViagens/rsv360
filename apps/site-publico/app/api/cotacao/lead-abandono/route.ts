import { NextRequest, NextResponse } from 'next/server';
import { jsonInternalError } from '@/lib/api-error';

function backendUrl(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3002'
  ).replace(/\/$/, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await fetch(`${backendUrl()}/api/v1/cotacao-publica/lead-abandono`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
  } catch (error) {
    return jsonInternalError(error);
  }
}
