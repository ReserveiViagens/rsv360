import { NextRequest, NextResponse } from 'next/server';
import { getDbPool, queryDatabase } from '@/lib/db';

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === 'admin-token-123';
}

// GET - Buscar página por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    const { id } = await params;
    const rows = await queryDatabase<any>(
      `SELECT id, slug, title, type, content, images, videos, metadata, navigation, status, created_at, updated_at
       FROM website_pages WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Página não encontrada' }, { status: 404 });
    }
    const row = rows[0];
    const page = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      type: row.type || 'page',
      content: row.content || '',
      images: typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (row.images || []),
      videos: typeof row.videos === 'string' ? JSON.parse(row.videos || '[]') : (row.videos || []),
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : (row.metadata || {}),
      navigation: typeof row.navigation === 'string' ? JSON.parse(row.navigation || '{}') : (row.navigation || {}),
      status: row.status || 'draft',
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error('Erro ao buscar página:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar página' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar página
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const { slug, title, type, content, images, videos, metadata, navigation, status } = body;
    const pool = getDbPool();
    const result = await pool.query(
      `UPDATE website_pages SET
        slug = COALESCE(NULLIF($2, ''), slug),
        title = COALESCE(NULLIF($3, ''), title),
        type = COALESCE(NULLIF($4, ''), type),
        content = COALESCE($5, content),
        images = CASE WHEN $6 IS NOT NULL THEN $6::jsonb ELSE images END,
        videos = CASE WHEN $7 IS NOT NULL THEN $7::jsonb ELSE videos END,
        metadata = CASE WHEN $8 IS NOT NULL THEN $8::jsonb ELSE metadata END,
        navigation = CASE WHEN $9 IS NOT NULL THEN $9::jsonb ELSE navigation END,
        status = COALESCE(NULLIF($10, ''), status),
        updated_at = NOW()
       WHERE id = $1
       RETURNING id, slug, title, type, content, images, videos, metadata, navigation, status, created_at, updated_at`,
      [
        id,
        slug || null,
        title || null,
        type || null,
        content ?? null,
        images != null ? JSON.stringify(images) : null,
        videos != null ? JSON.stringify(videos) : null,
        metadata != null ? JSON.stringify(metadata) : null,
        navigation != null ? JSON.stringify(navigation) : null,
        status || null,
      ]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Página não encontrada' }, { status: 404 });
    }
    const row = result.rows[0];
    const page = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      type: row.type || 'page',
      content: row.content || '',
      images: typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (row.images || []),
      videos: typeof row.videos === 'string' ? JSON.parse(row.videos || '[]') : (row.videos || []),
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : (row.metadata || {}),
      navigation: typeof row.navigation === 'string' ? JSON.parse(row.navigation || '{}') : (row.navigation || {}),
      status: row.status || 'draft',
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error('Erro ao atualizar página:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao atualizar página' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar página
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    const { id } = await params;
    const pool = getDbPool();
    const result = await pool.query('DELETE FROM website_pages WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Página não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar página:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao deletar página' },
      { status: 500 }
    );
  }
}
