import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-static';

export async function GET() {
  const content = readFileSync(
    join(process.cwd(), 'public/roteiro/manifest.webmanifest'),
    'utf-8',
  );
  return new Response(content, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
