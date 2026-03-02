/**
 * ✅ ITEM 62: AGENDAMENTO DE RELATÓRIOS
 * GET /api/reports/scheduled - Listar relatórios agendados
 * POST /api/reports/scheduled - Criar relatório agendado
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createScheduledReport,
  listScheduledReports,
} from '@/lib/reports-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// GET /api/reports/scheduled - Listar relatórios agendados
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
      is_enabled: searchParams.get('is_enabled') === 'true' ? true : 
                  searchParams.get('is_enabled') === 'false' ? false : undefined,
      report_type: searchParams.get('report_type') || undefined,
    };

    const reports = await listScheduledReports(filters);

    return NextResponse.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar relatórios agendados:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar relatórios' },
      { status: 500 }
    );
  }
}

// POST /api/reports/scheduled - Criar relatório agendado
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
    const report = await createScheduledReport({
      ...body,
      created_by: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Relatório agendado criado com sucesso',
      data: report,
    });
  } catch (error: any) {
    console.error('Erro ao criar relatório agendado:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar relatório agendado' },
      { status: 500 }
    );
  }
}

