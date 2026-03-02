/**
 * API de Restauração de Backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { backupService } from '@/lib/backup-service';

/**
 * POST /api/backup/restore
 * Restaurar backup
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { backup_id } = body;

    if (!backup_id) {
      return NextResponse.json(
        { error: 'backup_id é obrigatório' },
        { status: 400 }
      );
    }

    // Restaurar backup
    await backupService.restoreBackup(backup_id);

    return NextResponse.json({
      success: true,
      message: 'Backup restaurado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao restaurar backup:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao restaurar backup' },
      { status: 500 }
    );
  }
}

