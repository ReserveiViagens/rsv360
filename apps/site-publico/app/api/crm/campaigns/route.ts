/**
 * ✅ ITEM 53: API DE CAMPANHAS
 * GET /api/crm/campaigns - Listar campanhas
 * POST /api/crm/campaigns - Criar campanha
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createCampaign,
  listCampaigns,
} from '@/lib/crm-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// GET /api/crm/campaigns - Listar campanhas
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
    const filters = {
      status: searchParams.get('status') || undefined,
      campaign_type: searchParams.get('campaign_type') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const campaigns = await listCampaigns(filters);

    return NextResponse.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar campanhas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar campanhas' },
      { status: 500 }
    );
  }
}

// POST /api/crm/campaigns - Criar campanha
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
    const campaign = await createCampaign({
      ...body,
      created_by: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Campanha criada com sucesso',
      data: campaign,
    });
  } catch (error: any) {
    console.error('Erro ao criar campanha:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar campanha' },
      { status: 500 }
    );
  }
}

