import { NextRequest, NextResponse } from 'next/server';
import {
  createPricingRule,
  deletePricingRule,
  getPricingRules,
  updatePricingRule,
} from '@/lib/pricing-rules-service';
import { pricingLabAuth } from '@/lib/pricing-lab-auth';

/** Temporadas = regras rule_type seasonal (MVP sem tabela dedicada). */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    if (!itemId) {
      return NextResponse.json({ success: false, error: 'item_id é obrigatório' }, { status: 400 });
    }

    const rules = await getPricingRules(parseInt(itemId, 10));
    const seasons = rules.filter((r) => r.rule_type === 'seasonal');

    return NextResponse.json({ success: true, data: seasons });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao listar temporadas';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await pricingLabAuth(request);
    if (!auth.user) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { item_id, rule_name, config, priority, is_active } = body;

    if (!item_id || !rule_name || !config?.start_date || !config?.end_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'item_id, rule_name, config.start_date e config.end_date são obrigatórios',
        },
        { status: 400 }
      );
    }

    const rule = await createPricingRule(
      item_id,
      rule_name,
      'seasonal',
      {
        start_date: config.start_date,
        end_date: config.end_date,
        multiplier: config.multiplier ?? 1.2,
        name: rule_name,
      },
      priority ?? 10,
      is_active !== false
    );

    return NextResponse.json({ success: true, data: rule });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao criar temporada';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await pricingLabAuth(request);
    if (!auth.user) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, rule_name, config, priority, is_active } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    }

    const rule = await updatePricingRule(id, {
      rule_name,
      config,
      priority,
      is_active,
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar temporada';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await pricingLabAuth(request);
    if (!auth.user) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0', 10);
    if (!id) {
      return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    }

    await deletePricingRule(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao excluir temporada';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
