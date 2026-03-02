import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getHomeSideRailsFallback, type HomeSideRailsData } from '@/lib/home-side-rails';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rsv360',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === 'admin-token-123';
}

function isValidSection(section: unknown): section is { title: string; description: string; items: unknown[] } {
  if (!section || typeof section !== 'object') return false;
  const s = section as Record<string, unknown>;
  return typeof s.title === 'string' && typeof s.description === 'string' && Array.isArray(s.items);
}

function isValidItem(item: unknown): item is { id: string; title: string; subtitle: string; href: string; badge?: string; image?: string; order_index?: number } {
  if (!item || typeof item !== 'object') return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.id === 'string' &&
    typeof i.title === 'string' &&
    typeof i.subtitle === 'string' &&
    typeof i.href === 'string'
  );
}

function validateData(body: unknown): { valid: boolean; data?: HomeSideRailsData; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Corpo inválido' };
  }
  const b = body as Record<string, unknown>;
  if (!isValidSection(b.left)) {
    return { valid: false, error: 'Seção left inválida (title, description, items obrigatórios)' };
  }
  if (!isValidSection(b.right)) {
    return { valid: false, error: 'Seção right inválida (title, description, items obrigatórios)' };
  }
  for (const item of b.left.items as unknown[]) {
    if (!isValidItem(item)) {
      return { valid: false, error: 'Item da lateral esquerda inválido (id, title, subtitle, href obrigatórios)' };
    }
  }
  for (const item of b.right.items as unknown[]) {
    if (!isValidItem(item)) {
      return { valid: false, error: 'Item da lateral direita inválido (id, title, subtitle, href obrigatórios)' };
    }
  }
  return {
    valid: true,
    data: {
      left: b.left as HomeSideRailsData['left'],
      right: b.right as HomeSideRailsData['right'],
    },
  };
}

async function ensureTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS website_side_rails (
      id SERIAL PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    try {
      await ensureTable();
    } catch {
      return NextResponse.json({
        success: true,
        data: getHomeSideRailsFallback(),
      });
    }
    const result = await pool.query(
      `SELECT data, updated_at FROM website_side_rails ORDER BY updated_at DESC LIMIT 1`
    );
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: getHomeSideRailsFallback(),
      });
    }
    const row = result.rows[0];
    const data = row?.data ?? getHomeSideRailsFallback();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Erro ao buscar side rails:', error);
    if ((error as { message?: string })?.message?.includes('does not exist')) {
      try {
        await ensureTable();
      } catch {
        return NextResponse.json({ success: true, data: getHomeSideRailsFallback() });
      }
      return NextResponse.json({ success: true, data: getHomeSideRailsFallback() });
    }
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar laterais', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    const body = await request.json();
    const validation = validateData(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Dados inválidos' },
        { status: 400 }
      );
    }
    await ensureTable();
    const countResult = await pool.query('SELECT id FROM website_side_rails LIMIT 1');
    if (countResult.rows.length === 0) {
      await pool.query(
        `INSERT INTO website_side_rails (data, updated_at) VALUES ($1::jsonb, NOW()) RETURNING id`,
        [JSON.stringify(validation.data)]
      );
    } else {
      await pool.query(
        `UPDATE website_side_rails SET data = $1::jsonb, updated_at = NOW() WHERE id = $2`,
        [JSON.stringify(validation.data), countResult.rows[0].id]
      );
    }
    return NextResponse.json({ success: true, data: validation.data });
  } catch (error: unknown) {
    console.error('Erro ao salvar side rails:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar laterais', details: (error as Error).message },
      { status: 500 }
    );
  }
}
