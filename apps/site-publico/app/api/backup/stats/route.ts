/**
 * API de Estatísticas de Backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { backupService } from '@/lib/backup-service';

/**
 * GET /api/backup/stats
 * Obter estatísticas de backup
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
    const configId = searchParams.get('config_id');

    const stats = await backupService.getBackupStats(
      configId ? parseInt(configId) : undefined
    );

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Erro ao obter estatísticas de backup:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter estatísticas de backup' },
      { status: 500 }
    );
  }
}

