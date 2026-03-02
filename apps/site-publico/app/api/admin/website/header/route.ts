import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuração do banco de dados (mesmo do backend)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rsv360',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// Função para verificar autenticação
function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return token === 'admin-token-123' || token === 'admin-token-123';
}

// GET - Buscar header atual
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `SELECT id, type, url, title, autoplay, muted, updated_at 
       FROM website_header 
       ORDER BY updated_at DESC 
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      // Retornar header padrão se não houver nenhum salvo
      return NextResponse.json({
        success: true,
        data: {
          type: "image",
          url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png",
          title: "Reservei Viagens",
          autoplay: true,
          muted: true,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Erro ao buscar header:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao carregar header',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Criar novo header
export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, url, title, autoplay, muted } = body;

    // Validações
    if (!type || !url) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tipo e URL são obrigatórios',
          details: ['type é obrigatório', 'url é obrigatória']
        },
        { status: 400 }
      );
    }

    if (type !== 'image' && type !== 'video') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tipo deve ser "image" ou "video"',
          details: ['type deve ser "image" ou "video"']
        },
        { status: 400 }
      );
    }

    // Deletar headers antigos (manter apenas o mais recente)
    await pool.query('DELETE FROM website_header');

    // Inserir novo header
    const result = await pool.query(
      `INSERT INTO website_header (type, url, title, autoplay, muted, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, type, url, title, autoplay, muted, updated_at`,
      [
        type,
        url,
        title || null,
        autoplay ?? true,
        muted ?? true,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Erro ao criar header:', error);
    
    // Se a tabela não existir, criar
    if (error.message?.includes('does not exist')) {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS website_header (
            id SERIAL PRIMARY KEY,
            type VARCHAR(10) NOT NULL CHECK (type IN ('image', 'video')),
            url TEXT NOT NULL,
            title TEXT,
            autoplay BOOLEAN DEFAULT true,
            muted BOOLEAN DEFAULT true,
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
        
        // Tentar inserir novamente
        const body = await request.json();
        const { type, url, title, autoplay, muted } = body;
        
        const result = await pool.query(
          `INSERT INTO website_header (type, url, title, autoplay, muted, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           RETURNING id, type, url, title, autoplay, muted, updated_at`,
          [
            type,
            url,
            title || null,
            autoplay ?? true,
            muted ?? true,
          ]
        );

        return NextResponse.json({
          success: true,
          data: result.rows[0]
        });
      } catch (createError: any) {
        console.error('Erro ao criar tabela:', createError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erro ao criar header',
            details: createError.message 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao salvar header',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar header existente
export async function PUT(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, url, title, autoplay, muted } = body;

    // Validações
    if (!type || !url) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tipo e URL são obrigatórios',
          details: ['type é obrigatório', 'url é obrigatória']
        },
        { status: 400 }
      );
    }

    if (type !== 'image' && type !== 'video') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tipo deve ser "image" ou "video"',
          details: ['type deve ser "image" ou "video"']
        },
        { status: 400 }
      );
    }

    // Verificar se existe header
    const existing = await pool.query(
      'SELECT id FROM website_header ORDER BY updated_at DESC LIMIT 1'
    );

    if (existing.rows.length === 0) {
      // Se não existir, criar novo
      return POST(request);
    }

    // Atualizar header existente
    const result = await pool.query(
      `UPDATE website_header 
       SET type = $1, url = $2, title = $3, autoplay = $4, muted = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, type, url, title, autoplay, muted, updated_at`,
      [
        type,
        url,
        title || null,
        autoplay ?? true,
        muted ?? true,
        existing.rows[0].id,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Erro ao atualizar header:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao atualizar header',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Resetar header para padrão
export async function DELETE(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Deletar todos os headers
    await pool.query('DELETE FROM website_header');

    // Retornar header padrão
    return NextResponse.json({
      success: true,
      data: {
        type: "image",
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png",
        title: "Reservei Viagens",
        autoplay: true,
        muted: true,
      }
    });
  } catch (error: any) {
    console.error('Erro ao deletar header:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao resetar header',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

