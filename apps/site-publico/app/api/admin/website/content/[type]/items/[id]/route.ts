import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === 'admin-token-123';
}

// GET - Buscar item por ID ou content_id para importação
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    const { type, id } = await params;
    const validTypes = ['hotels', 'promotions', 'attractions', 'tickets'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Tipo inválido. Use: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }
    const rows = await queryDatabase<any>(
      `SELECT id, content_id, title, description, images, metadata, seo_data, status
       FROM website_content WHERE page_type = $1 AND (id::text = $2 OR content_id = $2)`,
      [type, id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 });
    }
    const row = rows[0];
    const item = {
      id: row.id,
      content_id: row.content_id,
      title: row.title,
      description: row.description || '',
      images: typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (row.images || []),
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : (row.metadata || {}),
      seo_data: typeof row.seo_data === 'string' ? JSON.parse(row.seo_data || '{}') : (row.seo_data || {}),
    };
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Erro ao buscar item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar item' },
      { status: 500 }
    );
  }
}
