import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === 'admin-token-123';
}

const slugToPageType: Record<string, string> = {
  hoteis: 'hotels',
  hotels: 'hotels',
  ingressos: 'tickets',
  tickets: 'tickets',
  atracoes: 'attractions',
  attractions: 'attractions',
  promocoes: 'promotions',
  promotions: 'promotions',
};

// GET - Importar galeria (imagens e vídeos) dos cards de um tipo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    const { slug } = await params;
    const pageType = slugToPageType[slug?.toLowerCase() || ''];
    if (!pageType) {
      return NextResponse.json(
        { success: false, error: 'Slug inválido. Use: hoteis, ingressos, atracoes ou promocoes' },
        { status: 400 }
      );
    }
    const rows = await queryDatabase<any>(
      `SELECT images FROM website_content WHERE page_type = $1 AND status = 'active'`,
      [pageType]
    );
    const images: string[] = [];
    const videos: string[] = [];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const videoDomains = ['youtube.com', 'youtu.be', 'vimeo.com'];
    for (const row of rows) {
      const imgs = typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (row.images || []);
      for (const url of imgs) {
        if (typeof url === 'string') {
          const isVideo = videoExtensions.some(ext => url.toLowerCase().includes(ext)) ||
            videoDomains.some(d => url.toLowerCase().includes(d));
          if (isVideo) {
            if (!videos.includes(url)) videos.push(url);
          } else {
            if (!images.includes(url)) images.push(url);
          }
        }
      }
    }
    return NextResponse.json({ success: true, data: { images, videos } });
  } catch (error: any) {
    console.error('Erro ao importar galeria:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao importar galeria' },
      { status: 500 }
    );
  }
}
