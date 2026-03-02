/**
 * ✅ ITEM 37: API DE REGRAS DE PRECIFICAÇÃO
 * GET /api/pricing/rules - Listar regras
 * POST /api/pricing/rules - Criar regra
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createPricingRule,
  getPricingRules,
  updatePricingRule,
  deletePricingRule,
} from '@/lib/pricing-rules-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// GET /api/pricing/rules - Listar regras
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    const activeOnly = searchParams.get('active_only') === 'true';

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'item_id é obrigatório' },
        { status: 400 }
      );
    }

    const rules = await getPricingRules(parseInt(itemId), activeOnly);

    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (error: any) {
    console.error('Erro ao listar regras:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar regras' },
      { status: 500 }
    );
  }
}

// POST /api/pricing/rules - Criar regra
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
    const { item_id, rule_name, rule_type, config, priority, is_active } = body;

    if (!item_id || !rule_name || !rule_type || !config) {
      return NextResponse.json(
        {
          success: false,
          error: 'item_id, rule_name, rule_type e config são obrigatórios',
        },
        { status: 400 }
      );
    }

    const rule = await createPricingRule(
      item_id,
      rule_name,
      rule_type,
      config,
      priority || 0,
      is_active !== undefined ? is_active : true
    );

    return NextResponse.json({
      success: true,
      message: 'Regra criada com sucesso',
      data: rule,
    });
  } catch (error: any) {
    console.error('Erro ao criar regra:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar regra' },
      { status: 500 }
    );
  }
}

// PUT /api/pricing/rules - Atualizar regra
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rule_id, ...updates } = body;

    if (!rule_id) {
      return NextResponse.json(
        { success: false, error: 'rule_id é obrigatório' },
        { status: 400 }
      );
    }

    const rule = await updatePricingRule(rule_id, updates);

    if (!rule) {
      return NextResponse.json(
        { success: false, error: 'Regra não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Regra atualizada com sucesso',
      data: rule,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar regra:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao atualizar regra' },
      { status: 500 }
    );
  }
}

// DELETE /api/pricing/rules - Deletar regra
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('rule_id');

    if (!ruleId) {
      return NextResponse.json(
        { success: false, error: 'rule_id é obrigatório' },
        { status: 400 }
      );
    }

    await deletePricingRule(parseInt(ruleId));

    return NextResponse.json({
      success: true,
      message: 'Regra deletada com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar regra:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao deletar regra' },
      { status: 500 }
    );
  }
}

