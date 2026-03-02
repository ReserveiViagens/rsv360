/**
 * API de Deleção de Dados LGPD/GDPR (Direito ao Esquecimento)
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { gdprService } from '@/lib/gdpr-service';

/**
 * POST /api/gdpr/delete
 * Solicitar deleção de dados (direito ao esquecimento)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const reason = body.reason;

    // Solicitar deleção
    const deletionRequest = await gdprService.requestDataDeletion(auth.user.id, reason);

    return NextResponse.json({
      success: true,
      data: deletionRequest,
      message: 'Solicitação de deleção criada. Seus dados serão processados e deletados em até 30 dias.',
      warning: 'Esta ação é irreversível. Após a deleção, você não poderá recuperar seus dados.',
    });
  } catch (error: any) {
    console.error('Erro ao solicitar deleção:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao solicitar deleção' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gdpr/delete
 * Obter status da solicitação de deleção
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
      data: null,
    });
  } catch (error: any) {
    console.error('Erro ao obter solicitação de deleção:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter solicitação de deleção' },
      { status: 500 }
    );
  }
}

