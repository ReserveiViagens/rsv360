/**
 * ✅ ITENS 63-70: API DE INTEGRAÇÕES OTA/PMS
 * GET /api/integrations - Listar integrações
 * POST /api/integrations - Criar integração
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// GET /api/integrations - Listar integrações
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const property_id = searchParams.get('property_id');
    const integration_type = searchParams.get('integration_type');
    const integration_name = searchParams.get('integration_name');

    let query = `SELECT * FROM integration_config WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (property_id) {
      query += ` AND property_id = $${paramIndex}`;
      params.push(parseInt(property_id));
      paramIndex++;
    }

    if (integration_type) {
      query += ` AND integration_type = $${paramIndex}`;
      params.push(integration_type);
      paramIndex++;
    }

    if (integration_name) {
      query += ` AND integration_name = $${paramIndex}`;
      params.push(integration_name);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const integrations = await queryDatabase(query, params);

    return NextResponse.json({
      success: true,
      data: integrations,
      count: integrations.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar integrações:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar integrações' },
      { status: 500 }
    );
  }
}

// POST /api/integrations - Criar integração
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { property_id, integration_type, integration_name, credentials, config } = body;

    if (!property_id || !integration_type || !integration_name || !credentials) {
      return NextResponse.json(
        { success: false, error: 'property_id, integration_type, integration_name e credentials são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await queryDatabase(
      `INSERT INTO integration_config 
       (property_id, integration_type, integration_name, credentials, config, is_active, auto_sync)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (property_id, integration_type, integration_name) 
       DO UPDATE SET 
         credentials = EXCLUDED.credentials,
         config = EXCLUDED.config,
         is_active = EXCLUDED.is_active,
         auto_sync = EXCLUDED.auto_sync,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        property_id,
        integration_type,
        integration_name,
        JSON.stringify(credentials),
        config ? JSON.stringify(config) : null,
        body.is_active !== false,
        body.auto_sync !== false,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Integração criada/atualizada com sucesso',
      data: result[0],
    });
  } catch (error: any) {
    console.error('Erro ao criar integração:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar integração' },
      { status: 500 }
    );
  }
}

