import { NextRequest, NextResponse } from 'next/server';
import { getDbPool, queryDatabase } from '@/lib/db';

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === 'admin-token-123';
}

async function ensurePagesTable() {
  const pool = getDbPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS website_pages (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(50) DEFAULT 'page',
      content TEXT,
      images JSONB DEFAULT '[]',
      videos JSONB DEFAULT '[]',
      metadata JSONB DEFAULT '{}',
      navigation JSONB DEFAULT '{}',
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

// GET - Listar páginas
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    await ensurePagesTable();
    const rows = await queryDatabase<any>(
      `SELECT id, slug, title, type, content, images, videos, metadata, navigation, status, created_at, updated_at
       FROM website_pages ORDER BY updated_at DESC`
    );
    const pages = rows.map((row: any) => ({
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
    }));
    return NextResponse.json({ success: true, data: pages });
  } catch (error: any) {
    console.error('Erro ao listar páginas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar páginas' },
      { status: 500 }
    );
  }
}

// POST - Criar página
export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    await ensurePagesTable();
    const body = await request.json();
    const { slug, title, type, content, images, videos, metadata, navigation, status } = body;
    if (!slug || !title) {
      return NextResponse.json(
        { success: false, error: 'Slug e título são obrigatórios' },
        { status: 400 }
      );
    }
    const pool = getDbPool();
    const result = await pool.query(
      `INSERT INTO website_pages (slug, title, type, content, images, videos, metadata, navigation, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING id, slug, title, type, content, images, videos, metadata, navigation, status, created_at, updated_at`,
      [
        slug,
        title || '',
        type || 'page',
        content || '',
        JSON.stringify(images || []),
        JSON.stringify(videos || []),
        JSON.stringify(metadata || {}),
        JSON.stringify(navigation || {}),
        status || 'draft',
      ]
    );
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
    console.error('Erro ao criar página:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Já existe uma página com este slug' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar página' },
      { status: 500 }
    );
  }
}
