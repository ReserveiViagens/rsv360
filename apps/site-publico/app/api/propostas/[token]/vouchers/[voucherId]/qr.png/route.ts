import { NextRequest, NextResponse } from 'next/server';
import { getFase1BackendBaseUrl } from '@/lib/fase1-bff';

type Params = { params: Promise<{ token: string; voucherId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { token, voucherId } = await params;
  const backend = getFase1BackendBaseUrl();
  const url = `${backend}/api/v1/propostas/${encodeURIComponent(token)}/vouchers/${encodeURIComponent(voucherId)}/qr.png`;

  const upstream = await fetch(url, { cache: 'no-store' });
  if (!upstream.ok) {
    const errText = await upstream.text();
    return new NextResponse(errText, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  }

  const buffer = await upstream.arrayBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'private, max-age=300',
    },
  });
}
