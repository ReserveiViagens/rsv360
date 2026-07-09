import { NextRequest } from 'next/server';
import { proxyCms } from '@/lib/cms-bff';

export async function GET(request: NextRequest) {
  return proxyCms(request, '/amenidades');
}
