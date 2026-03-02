/**
 * Serviço de Backup Automatizado
 * Gerencia backups do banco de dados e arquivos
 */

import { queryDatabase } from './db';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const execAsync = promisify(exec);

export interface BackupConfig {
  id?: number;
  name: string;
  type: 'database' | 'files' | 'full';
  schedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  scheduleTime?: string; // HH:MM format
  scheduleDay?: number; // 0-6 for weekly, 1-31 for monthly
  retentionDays: number;
  compression: boolean;
  storageLocations: string[]; // paths or S3 buckets
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface BackupRecord {
  id?: number;
  configId: number;
  type: 'database' | 'files' | 'full';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  size?: number; // bytes
  filePath?: string;
  checksum?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface BackupStats {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalSize: number;
  lastBackup?: Date;
  nextBackup?: Date;
}

/**
 * Serviço de backup automatizado
 */
export class BackupService {
  private backupDir: string;

  constructor() {
    this.backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
  }

  /**
   * Criar configuração de backup
   */
  async createBackupConfig(config: BackupConfig): Promise<BackupConfig> {
    const result = await queryDatabase(
      `INSERT INTO backup_configs 
       (name, type, schedule, schedule_time, schedule_day, retention_days, 
        compression, storage_locations, enabled, next_run)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        config.name,
        config.type,
        config.schedule,
        config.scheduleTime || null,
        config.scheduleDay || null,
        config.retentionDays,
        config.compression,
        JSON.stringify(config.storageLocations),
        config.enabled,
        this.calculateNextRun(config),
      ]
    );

    return this.mapDbToConfig(result[0]);
  }

  /**
   * Executar backup
   */
  async executeBackup(configId: number, manual: boolean = false): Promise<BackupRecord> {
    // Obter configuração
    const config = await this.getBackupConfig(configId);
    if (!config) {
      throw new Error('Configuração de backup não encontrada');
    }

    // Criar registro de backup
    const backupRecord = await this.createBackupRecord({
      configId,
      type: config.type,
      status: 'running',
      startedAt: new Date(),
    });

    try {
      let backupPath: string;
      let size: number;
      let checksum: string;

      // Executar backup baseado no tipo
      switch (config.type) {
        case 'database':
          ({ backupPath, size, checksum } = await this.backupDatabase(config, backupRecord.id!));
          break;
        case 'files':
          ({ backupPath, size, checksum } = await this.backupFiles(config, backupRecord.id!));
          break;
        case 'full':
          ({ backupPath, size, checksum } = await this.backupFull(config, backupRecord.id!));
          break;
        default:
          throw new Error(`Tipo de backup não suportado: ${config.type}`);
      }

      // Copiar para locais de armazenamento
      for (const location of config.storageLocations) {
        await this.copyToStorage(backupPath, location);
      }

      // Atualizar registro
      await this.updateBackupRecord(backupRecord.id!, {
        status: 'completed',
        completedAt: new Date(),
        size,
        filePath: backupPath,
        checksum,
      });

      // Atualizar última execução da configuração
      await this.updateBackupConfig(configId, {
        lastRun: new Date(),
        nextRun: config.schedule !== 'manual' ? this.calculateNextRun(config) : undefined,
      });

      // Limpar backups antigos
      await this.cleanupOldBackups(configId, config.retentionDays);

      return await this.getBackupRecord(backupRecord.id!);
    } catch (error: any) {
      // Atualizar registro com erro
      await this.updateBackupRecord(backupRecord.id!, {
        status: 'failed',
        completedAt: new Date(),
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Backup do banco de dados
   */
  private async backupDatabase(
    config: BackupConfig,
    backupId: number
  ): Promise<{ backupPath: string; size: number; checksum: string }> {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.DB_NAME || 'onboarding_rsv_db';
    const dbUser = process.env.DB_USER || 'onboarding_rsv';
    const dbPassword = process.env.DB_PASSWORD || 'senha_segura_123';

    // Criar diretório de backup se não existir
    await fs.mkdir(this.backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `db_backup_${backupId}_${timestamp}.sql`;
    const backupPath = path.join(this.backupDir, filename);

    // Executar pg_dump
    const env = { ...process.env, PGPASSWORD: dbPassword };
    const pgDumpCmd = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F c -f "${backupPath}"`;

    try {
      await execAsync(pgDumpCmd, { env });
    } catch (error: any) {
      throw new Error(`Erro ao fazer backup do banco: ${error.message}`);
    }

    // Comprimir se necessário
    let finalPath = backupPath;
    if (config.compression) {
      finalPath = await this.compressFile(backupPath);
      await fs.unlink(backupPath); // Remover arquivo não comprimido
    }

    // Calcular tamanho e checksum
    const stats = await fs.stat(finalPath);
    const fileContent = await fs.readFile(finalPath);
    const checksum = crypto.createHash('sha256').update(fileContent).digest('hex');

    return {
      backupPath: finalPath,
      size: stats.size,
      checksum,
    };
  }

  /**
   * Backup de arquivos
   */
  private async backupFiles(
    config: BackupConfig,
    backupId: number
  ): Promise<{ backupPath: string; size: number; checksum: string }> {
    const filesDir = process.env.FILES_DIR || path.join(process.cwd(), 'uploads');
    
    // Criar diretório de backup se não existir
    await fs.mkdir(this.backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `files_backup_${backupId}_${timestamp}.tar.gz`;
    const backupPath = path.join(this.backupDir, filename);

    // Criar arquivo tar.gz
    const tarCmd = `tar -czf "${backupPath}" -C "${filesDir}" .`;

    try {
      await execAsync(tarCmd);
    } catch (error: any) {
      throw new Error(`Erro ao fazer backup de arquivos: ${error.message}`);
    }

    // Calcular tamanho e checksum
    const stats = await fs.stat(backupPath);
    const fileContent = await fs.readFile(backupPath);
    const checksum = crypto.createHash('sha256').update(fileContent).digest('hex');

    return {
      backupPath,
      size: stats.size,
      checksum,
    };
  }

  /**
   * Backup completo (banco + arquivos)
   */
  private async backupFull(
    config: BackupConfig,
    backupId: number
  ): Promise<{ backupPath: string; size: number; checksum: string }> {
    // Fazer backup do banco
    const dbBackup = await this.backupDatabase(config, backupId);

    // Fazer backup de arquivos
    const filesBackup = await this.backupFiles(config, backupId);

    // Criar arquivo combinado
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `full_backup_${backupId}_${timestamp}.tar.gz`;
    const backupPath = path.join(this.backupDir, filename);

    const tarCmd = `tar -czf "${backupPath}" -C "${this.backupDir}" "${path.basename(dbBackup.backupPath)}" "${path.basename(filesBackup.backupPath)}"`;

    try {
      await execAsync(tarCmd);
    } catch (error: any) {
      throw new Error(`Erro ao criar backup completo: ${error.message}`);
    }

    // Remover backups individuais
    await fs.unlink(dbBackup.backupPath).catch(() => {});
    await fs.unlink(filesBackup.backupPath).catch(() => {});

    // Calcular tamanho e checksum
    const stats = await fs.stat(backupPath);
    const fileContent = await fs.readFile(backupPath);
    const checksum = crypto.createHash('sha256').update(fileContent).digest('hex');

    return {
      backupPath,
      size: stats.size,
      checksum,
    };
  }

  /**
   * Comprimir arquivo
   */
  private async compressFile(filePath: string): Promise<string> {
    const compressedPath = `${filePath}.gz`;
    const gzipCmd = `gzip -c "${filePath}" > "${compressedPath}"`;

    try {
      await execAsync(gzipCmd);
      return compressedPath;
    } catch (error: any) {
      throw new Error(`Erro ao comprimir arquivo: ${error.message}`);
    }
  }

  /**
   * Copiar para local de armazenamento
   */
  private async copyToStorage(backupPath: string, storageLocation: string): Promise<void> {
    // Se for um caminho local
    if (storageLocation.startsWith('/') || storageLocation.match(/^[A-Z]:/)) {
      await fs.mkdir(storageLocation, { recursive: true });
      const filename = path.basename(backupPath);
      await fs.copyFile(backupPath, path.join(storageLocation, filename));
    } else if (storageLocation.startsWith('s3://')) {
      // Upload para S3 (requer AWS CLI configurado)
      const s3Cmd = `aws s3 cp "${backupPath}" "${storageLocation}/"`;
      try {
        await execAsync(s3Cmd);
      } catch (error: any) {
        console.warn(`Erro ao fazer upload para S3: ${error.message}`);
      }
    }
  }

  /**
   * Limpar backups antigos
   */
  private async cleanupOldBackups(configId: number, retentionDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const oldBackups = await queryDatabase(
      `SELECT * FROM backup_records 
       WHERE config_id = $1 AND completed_at < $2 AND status = 'completed'`,
      [configId, cutoffDate]
    );

    for (const backup of oldBackups) {
      if (backup.file_path) {
        try {
          await fs.unlink(backup.file_path);
        } catch (error) {
          console.warn(`Erro ao deletar backup antigo: ${error}`);
        }
      }

      await queryDatabase(
        `DELETE FROM backup_records WHERE id = $1`,
        [backup.id]
      );
    }
  }

  /**
   * Restaurar backup
   */
  async restoreBackup(backupId: number): Promise<void> {
    const backup = await this.getBackupRecord(backupId);
    if (!backup) {
      throw new Error('Backup não encontrado');
    }

    if (backup.status !== 'completed') {
      throw new Error('Backup não está completo');
    }

    if (!backup.filePath) {
      throw new Error('Arquivo de backup não encontrado');
    }

    // Verificar integridade
    await this.verifyBackupIntegrity(backup);

    const config = await this.getBackupConfig(backup.configId);
    if (!config) {
      throw new Error('Configuração de backup não encontrada');
    }

    // Restaurar baseado no tipo
    switch (config.type) {
      case 'database':
        await this.restoreDatabase(backup.filePath);
        break;
      case 'files':
        await this.restoreFiles(backup.filePath);
        break;
      case 'full':
        await this.restoreFull(backup.filePath);
        break;
      default:
        throw new Error(`Tipo de backup não suportado: ${config.type}`);
    }
  }

  /**
   * Restaurar banco de dados
   */
  private async restoreDatabase(backupPath: string): Promise<void> {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.DB_NAME || 'onboarding_rsv_db';
    const dbUser = process.env.DB_USER || 'onboarding_rsv';
    const dbPassword = process.env.DB_PASSWORD || 'senha_segura_123';

    // Descomprimir se necessário
    let restorePath = backupPath;
    if (backupPath.endsWith('.gz')) {
      restorePath = await this.decompressFile(backupPath);
    }

    const env = { ...process.env, PGPASSWORD: dbPassword };
    const pgRestoreCmd = `pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${restorePath}"`;

    try {
      await execAsync(pgRestoreCmd, { env });
    } catch (error: any) {
      throw new Error(`Erro ao restaurar banco: ${error.message}`);
    } finally {
      // Limpar arquivo temporário se foi descomprimido
      if (restorePath !== backupPath) {
        await fs.unlink(restorePath).catch(() => {});
      }
    }
  }

  /**
   * Restaurar arquivos
   */
  private async restoreFiles(backupPath: string): Promise<void> {
    const filesDir = process.env.FILES_DIR || path.join(process.cwd(), 'uploads');
    
    await fs.mkdir(filesDir, { recursive: true });

    const tarCmd = `tar -xzf "${backupPath}" -C "${filesDir}"`;

    try {
      await execAsync(tarCmd);
    } catch (error: any) {
      throw new Error(`Erro ao restaurar arquivos: ${error.message}`);
    }
  }

  /**
   * Restaurar backup completo
   */
  private async restoreFull(backupPath: string): Promise<void> {
    // Extrair arquivos do tar
    const extractDir = path.join(this.backupDir, 'temp_restore');
    await fs.mkdir(extractDir, { recursive: true });

    const tarCmd = `tar -xzf "${backupPath}" -C "${extractDir}"`;
    await execAsync(tarCmd);

    // Encontrar arquivos extraídos
    const files = await fs.readdir(extractDir);
    const dbBackup = files.find(f => f.startsWith('db_backup_'));
    const filesBackup = files.find(f => f.startsWith('files_backup_'));

    try {
      if (dbBackup) {
        await this.restoreDatabase(path.join(extractDir, dbBackup));
      }
      if (filesBackup) {
        await this.restoreFiles(path.join(extractDir, filesBackup));
      }
    } finally {
      // Limpar diretório temporário
      await fs.rm(extractDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  /**
   * Descomprimir arquivo
   */
  private async decompressFile(filePath: string): Promise<string> {
    const decompressedPath = filePath.replace(/\.gz$/, '');
    const gunzipCmd = `gunzip -c "${filePath}" > "${decompressedPath}"`;

    try {
      await execAsync(gunzipCmd);
      return decompressedPath;
    } catch (error: any) {
      throw new Error(`Erro ao descomprimir arquivo: ${error.message}`);
    }
  }

  /**
   * Verificar integridade do backup
   */
  async verifyBackupIntegrity(backup: BackupRecord): Promise<boolean> {
    if (!backup.filePath || !backup.checksum) {
      throw new Error('Backup não possui arquivo ou checksum');
    }

    const fileContent = await fs.readFile(backup.filePath);
    const calculatedChecksum = crypto.createHash('sha256').update(fileContent).digest('hex');

    if (calculatedChecksum !== backup.checksum) {
      throw new Error('Checksum do backup não confere. Arquivo pode estar corrompido.');
    }

    return true;
  }

  /**
   * Obter estatísticas de backup
   */
  async getBackupStats(configId?: number): Promise<BackupStats> {
    let query = `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
      SUM(size) as total_size,
      MAX(completed_at) as last_backup
    FROM backup_records`;

    const params: any[] = [];
    if (configId) {
      query += ` WHERE config_id = $1`;
      params.push(configId);
    }

    const result = await queryDatabase(query, params);
    const stats = result[0];

    // Obter próximo backup agendado
    let nextBackup: Date | undefined;
    if (configId) {
      const config = await this.getBackupConfig(configId);
      nextBackup = config?.nextRun;
    } else {
      const nextConfig = await queryDatabase(
        `SELECT next_run FROM backup_configs 
         WHERE enabled = true AND schedule != 'manual' 
         ORDER BY next_run ASC LIMIT 1`
      );
      if (nextConfig.length > 0 && nextConfig[0].next_run) {
        nextBackup = new Date(nextConfig[0].next_run);
      }
    }

    return {
      totalBackups: parseInt(stats.total) || 0,
      successfulBackups: parseInt(stats.successful) || 0,
      failedBackups: parseInt(stats.failed) || 0,
      totalSize: parseInt(stats.total_size) || 0,
      lastBackup: stats.last_backup ? new Date(stats.last_backup) : undefined,
      nextBackup,
    };
  }

  /**
   * Calcular próxima execução
   */
  private calculateNextRun(config: BackupConfig): Date | undefined {
    if (config.schedule === 'manual') {
      return undefined;
    }

    const now = new Date();
    const next = new Date(now);

    switch (config.schedule) {
      case 'daily':
        if (config.scheduleTime) {
          const [hours, minutes] = config.scheduleTime.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
          if (next <= now) {
            next.setDate(next.getDate() + 1);
          }
        } else {
          next.setDate(next.getDate() + 1);
        }
        break;

      case 'weekly':
        const dayOfWeek = config.scheduleDay ?? 0;
        const currentDay = now.getDay();
        const daysUntilNext = (dayOfWeek - currentDay + 7) % 7 || 7;
        next.setDate(now.getDate() + daysUntilNext);
        if (config.scheduleTime) {
          const [hours, minutes] = config.scheduleTime.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
        }
        break;

      case 'monthly':
        const dayOfMonth = config.scheduleDay ?? 1;
        next.setMonth(now.getMonth() + 1, dayOfMonth);
        if (config.scheduleTime) {
          const [hours, minutes] = config.scheduleTime.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
        }
        break;
    }

    return next;
  }

  /**
   * Criar registro de backup
   */
  private async createBackupRecord(record: Partial<BackupRecord>): Promise<BackupRecord> {
    const result = await queryDatabase(
      `INSERT INTO backup_records 
       (config_id, type, status, started_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [record.configId, record.type, record.status, record.startedAt]
    );

    return this.mapDbToRecord(result[0]);
  }

  /**
   * Atualizar registro de backup
   */
  private async updateBackupRecord(
    id: number,
    updates: Partial<BackupRecord>
  ): Promise<void> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      setClause.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.completedAt !== undefined) {
      setClause.push(`completed_at = $${paramIndex++}`);
      values.push(updates.completedAt);
    }
    if (updates.size !== undefined) {
      setClause.push(`size = $${paramIndex++}`);
      values.push(updates.size);
    }
    if (updates.filePath !== undefined) {
      setClause.push(`file_path = $${paramIndex++}`);
      values.push(updates.filePath);
    }
    if (updates.checksum !== undefined) {
      setClause.push(`checksum = $${paramIndex++}`);
      values.push(updates.checksum);
    }
    if (updates.error !== undefined) {
      setClause.push(`error = $${paramIndex++}`);
      values.push(updates.error);
    }

    if (setClause.length === 0) {
      return;
    }

    values.push(id);
    await queryDatabase(
      `UPDATE backup_records SET ${setClause.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  /**
   * Obter configuração de backup
   */
  async getBackupConfig(id: number): Promise<BackupConfig | null> {
    const result = await queryDatabase(
      `SELECT * FROM backup_configs WHERE id = $1`,
      [id]
    );

    if (result.length === 0) {
      return null;
    }

    return this.mapDbToConfig(result[0]);
  }

  /**
   * Atualizar configuração de backup
   */
  private async updateBackupConfig(
    id: number,
    updates: Partial<BackupConfig>
  ): Promise<void> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.lastRun !== undefined) {
      setClause.push(`last_run = $${paramIndex++}`);
      values.push(updates.lastRun);
    }
    if (updates.nextRun !== undefined) {
      setClause.push(`next_run = $${paramIndex++}`);
      values.push(updates.nextRun);
    }

    if (setClause.length === 0) {
      return;
    }

    values.push(id);
    await queryDatabase(
      `UPDATE backup_configs SET ${setClause.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  /**
   * Obter registro de backup
   */
  async getBackupRecord(id: number): Promise<BackupRecord | null> {
    const result = await queryDatabase(
      `SELECT * FROM backup_records WHERE id = $1`,
      [id]
    );

    if (result.length === 0) {
      return null;
    }

    return this.mapDbToRecord(result[0]);
  }

  /**
   * Mapear dados do banco para BackupConfig
   */
  private mapDbToConfig(row: any): BackupConfig {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      schedule: row.schedule,
      scheduleTime: row.schedule_time,
      scheduleDay: row.schedule_day,
      retentionDays: row.retention_days,
      compression: row.compression,
      storageLocations: row.storage_locations ? JSON.parse(row.storage_locations) : [],
      enabled: row.enabled,
      lastRun: row.last_run ? new Date(row.last_run) : undefined,
      nextRun: row.next_run ? new Date(row.next_run) : undefined,
    };
  }

  /**
   * Mapear dados do banco para BackupRecord
   */
  private mapDbToRecord(row: any): BackupRecord {
    return {
      id: row.id,
      configId: row.config_id,
      type: row.type,
      status: row.status,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      size: row.size,
      filePath: row.file_path,
      checksum: row.checksum,
      error: row.error,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }
}

// Instância singleton
export const backupService = new BackupService();

