/**
 * ✅ ITEM 81: API DE TEMPLATES DE MENSAGENS
 * GET /api/messages/templates - Listar templates
 * POST /api/messages/templates - Criar template
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { listMessageTemplates, createMessageTemplate, applyTemplate } from '@/lib/messages-enhanced-service';

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
    const category = searchParams.get('category') || undefined;
    const is_public = searchParams.get('is_public') === 'true';
    const applicable_to = searchParams.get('applicable_to') || undefined;

    const templates = await listMessageTemplates({
      category,
      is_public,
      user_id: user.id,
      applicable_to,
    });

    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar templates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar templates' },
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
    const { apply_variables, variables } = body;

    if (apply_variables && variables && body.id) {
      // Aplicar template com variáveis
      const templates = await listMessageTemplates({ user_id: user.id });
      const template = templates.find((t: any) => t.id === body.id);

      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template não encontrado' },
          { status: 404 }
        );
      }

      const result = applyTemplate(template, variables);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } else {
      // Criar novo template
      const template = await createMessageTemplate(body, user.id);

      return NextResponse.json({
        success: true,
        message: 'Template criado com sucesso',
        data: template,
      });
    }
  } catch (error: any) {
    console.error('Erro ao criar/aplicar template:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar/aplicar template' },
      { status: 500 }
    );
  }
}

