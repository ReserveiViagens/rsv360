/**
 * API de Logs de Auditoria
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { auditService, type AuditLogFilter } from '@/lib/audit-service';

/**
 * GET /api/audit
 * Buscar logs de auditoria
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    const filter: AuditLogFilter = {
      userId: searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!) : undefined,
      action: searchParams.get('action') || undefined,
      resource: searchParams.get('resource') || undefined,
      resourceId: searchParams.get('resource_id') || undefined,
      severity: searchParams.get('severity') as any || undefined,
      startDate: searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : undefined,
      endDate: searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : undefined,
      ipAddress: searchParams.get('ip_address') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const result = await auditService.searchLogs(filter);

    return NextResponse.json({
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        limit: filter.limit,
        offset: filter.offset,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar logs de auditoria' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit
 * Registrar log de auditoria manualmente
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    // Obter IP e User-Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const log = await auditService.log({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: body.action,
      resource: body.resource,
      resourceId: body.resource_id,
      ipAddress,
      userAgent,
      method: body.method,
      endpoint: body.endpoint,
      statusCode: body.status_code,
      requestBody: body.request_body,
      responseBody: body.response_body,
      changes: body.changes,
      metadata: body.metadata,
      severity: body.severity || 'info',
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      duration: body.duration,
    });

    return NextResponse.json({
      success: true,
      data: log,
    });
  } catch (error: any) {
    console.error('Erro ao registrar log de auditoria:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao registrar log de auditoria' },
      { status: 500 }
    );
  }
}

