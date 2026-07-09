import { NextRequest } from 'next/server';
import { proxyCms } from '@/lib/cms-bff';

export async function GET(request: NextRequest) {
  const pageType = request.nextUrl.searchParams.get('pageType') || 'hotels';
  return proxyCms(request, `/content?pageType=${encodeURIComponent(pageType)}`);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyCms(request, '/content', { method: 'POST', body });
}
