import { NextRequest } from 'next/server';
import { proxyCms } from '@/lib/cms-bff';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await request.text();
  return proxyCms(request, `/content/${encodeURIComponent(id)}`, { method: 'PUT', body });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const hard = request.nextUrl.searchParams.get('hard');
  const qs = hard ? `?hard=${encodeURIComponent(hard)}` : '';
  return proxyCms(request, `/content/${encodeURIComponent(id)}${qs}`, { method: 'DELETE' });
}
