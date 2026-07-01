import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-static';

export async function GET() {
  const content = readFileSync(join(process.cwd(), 'public/roteiro/sw.js'), 'utf-8');
  return new Response(content, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/roteiro/',
      'Cache-Control': 'no-cache',
    },
  });
}
