/**
 * API de Backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { backupService, type BackupConfig } from '@/lib/backup-service';

/**
 * GET /api/backup
 * Obter configurações de backup
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

    if (configId) {
      const config = await backupService.getBackupConfig(parseInt(configId));
      if (!config) {
        return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: config });
    }

    // Retornar todas as configurações (implementar se necessário)
    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    console.error('Erro ao obter configurações de backup:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter configurações de backup' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backup
 * Criar configuração de backup ou executar backup
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
    const { action, config_id, config } = body;

    if (action === 'execute' && config_id) {
      // Executar backup
      const backup = await backupService.executeBackup(config_id, true);
      return NextResponse.json({
        success: true,
        data: backup,
        message: 'Backup iniciado com sucesso',
      });
    }

    if (action === 'create' && config) {
      // Criar configuração
      const backupConfig: BackupConfig = {
        name: config.name,
        type: config.type,
        schedule: config.schedule,
        scheduleTime: config.schedule_time,
        scheduleDay: config.schedule_day,
        retentionDays: config.retention_days || 30,
        compression: config.compression !== false,
        storageLocations: config.storage_locations || [],
        enabled: config.enabled !== false,
      };

      const created = await backupService.createBackupConfig(backupConfig);
      return NextResponse.json({
        success: true,
        data: created,
        message: 'Configuração de backup criada com sucesso',
      });
    }

    return NextResponse.json(
      { error: 'Ação inválida. Use "execute" ou "create"' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erro ao processar backup:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar backup' },
      { status: 500 }
    );
  }
}

