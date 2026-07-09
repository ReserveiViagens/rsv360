import { NextRequest } from 'next/server';
import { proxyCms } from '@/lib/cms-bff';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  return proxyCms(request, '/upload', { method: 'POST', body: form });
}
