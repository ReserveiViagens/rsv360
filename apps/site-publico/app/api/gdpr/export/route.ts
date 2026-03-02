/**
 * API de Exportação de Dados LGPD/GDPR
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { gdprService } from '@/lib/gdpr-service';

/**
 * POST /api/gdpr/export
 * Solicitar exportação de dados
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const format = body.format || 'json';

    if (!['json', 'csv', 'xml'].includes(format)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use: json, csv ou xml' },
        { status: 400 }
      );
    }

    // Solicitar exportação
    const exportRequest = await gdprService.requestDataExport(auth.user.id, format);

    return NextResponse.json({
      success: true,
      data: exportRequest,
      message: 'Solicitação de exportação criada. Você receberá uma notificação quando estiver pronta.',
    });
  } catch (error: any) {
    console.error('Erro ao solicitar exportação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao solicitar exportação' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gdpr/export
 * Obter status das exportações do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Em produção, isso buscaria do banco
    // Por enquanto, retornar vazio
    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error: any) {
    console.error('Erro ao obter exportações:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter exportações' },
      { status: 500 }
    );
  }
}

