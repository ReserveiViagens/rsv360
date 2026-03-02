/**
 * API de Exportação de Logs de Auditoria
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { auditService, type AuditLogFilter } from '@/lib/audit-service';

/**
 * GET /api/audit/export
 * Exportar logs de auditoria para CSV
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
    };

    const csv = await auditService.exportLogs(filter);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao exportar logs de auditoria:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao exportar logs de auditoria' },
      { status: 500 }
    );
  }
}

