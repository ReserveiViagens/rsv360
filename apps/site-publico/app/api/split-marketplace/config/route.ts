/**
 * API CRUD configuração Split Marketplace
 * GET: listar recebedores e regras
 * POST: criar recebedor ou atualizar regra
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import {
  listReceivers,
  createReceiver,
  updateReceiver,
  getSplitRules,
  updateSplitRule,
} from '@/lib/marketplace-split/marketplace-split-service';

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
    const type = searchParams.get('type');
    const property_id = searchParams.get('property_id');
    const status = searchParams.get('status');

    const [receivers, rules] = await Promise.all([
      listReceivers({
        type: type || undefined,
        property_id: property_id ? parseInt(property_id) : undefined,
        status: status || undefined,
      }),
      getSplitRules(),
    ]);

    return NextResponse.json({
      success: true,
      data: { receivers, rules },
    });
  } catch (err: unknown) {
    console.error('[split-marketplace/config] GET error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

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
    const { action } = body;

    if (action === 'create_receiver') {
      const { type, name, document, bank_account, default_split_pct, property_id, external_id } =
        body;
      if (!type) {
        return NextResponse.json(
          { success: false, error: 'type é obrigatório' },
          { status: 400 }
        );
      }
      const receiver = await createReceiver({
        type,
        name,
        document,
        bank_account,
        default_split_pct,
        property_id,
        external_id,
      });
      return NextResponse.json({ success: true, data: receiver });
    }

    if (action === 'update_receiver') {
      const { id, name, document, bank_account, default_split_pct, status } = body;
      if (!id) {
        return NextResponse.json(
          { success: false, error: 'id é obrigatório' },
          { status: 400 }
        );
      }
      const receiver = await updateReceiver(id, {
        name,
        document,
        bank_account,
        default_split_pct,
        status,
      });
      if (!receiver) {
        return NextResponse.json({ success: false, error: 'Recebedor não encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: receiver });
    }

    if (action === 'update_rule') {
      const { id, platform_pct, partner_pct } = body;
      if (!id || platform_pct == null || partner_pct == null) {
        return NextResponse.json(
          { success: false, error: 'id, platform_pct e partner_pct são obrigatórios' },
          { status: 400 }
        );
      }
      const rule = await updateSplitRule(id, { platform_pct, partner_pct });
      if (!rule) {
        return NextResponse.json({ success: false, error: 'Regra não encontrada' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: rule });
    }

    return NextResponse.json(
      { success: false, error: 'action inválida. Use create_receiver, update_receiver ou update_rule' },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error('[split-marketplace/config] POST error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
