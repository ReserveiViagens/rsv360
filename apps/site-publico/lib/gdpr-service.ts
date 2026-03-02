/**
 * Serviço de LGPD/GDPR
 * Implementa conformidade com LGPD (Lei Geral de Proteção de Dados) e GDPR
 */

import { queryDatabase } from './db';

export interface ConsentRecord {
  id?: number;
  userId: number;
  consentType: 'marketing' | 'analytics' | 'cookies' | 'third_party' | 'data_processing';
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  version: string; // versão da política de privacidade
}

export interface DataExport {
  userId: number;
  format: 'json' | 'csv' | 'xml';
  requestedAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface DataDeletionRequest {
  id?: number;
  userId: number;
  reason?: string;
  requestedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
}

export interface DataAccessLog {
  id?: number;
  userId: number;
  dataType: string;
  action: 'read' | 'update' | 'delete' | 'export';
  accessedBy: number; // ID do usuário/admin que acessou
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export interface PrivacyPolicyVersion {
  id?: number;
  version: string;
  content: string;
  effectiveDate: Date;
  isActive: boolean;
}

/**
 * Serviço de LGPD/GDPR
 */
export class GDPRService {
  /**
   * Registrar consentimento
   */
  async recordConsent(consent: ConsentRecord): Promise<ConsentRecord> {
    const result = await queryDatabase(
      `INSERT INTO gdpr_consents 
       (user_id, consent_type, granted, granted_at, revoked_at, ip_address, user_agent, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        consent.userId,
        consent.consentType,
        consent.granted,
        consent.granted ? new Date() : null,
        consent.granted ? null : new Date(),
        consent.ipAddress || null,
        consent.userAgent || null,
        consent.version,
      ]
    );

    return this.mapDbToConsent(result[0]);
  }

  /**
   * Obter consentimentos de um usuário
   */
  async getUserConsents(userId: number): Promise<ConsentRecord[]> {
    const result = await queryDatabase(
      `SELECT * FROM gdpr_consents 
       WHERE user_id = $1 
       ORDER BY granted_at DESC, revoked_at DESC`,
      [userId]
    );

    return result.map((r: any) => this.mapDbToConsent(r));
  }

  /**
   * Verificar se usuário tem consentimento para um tipo específico
   */
  async hasConsent(userId: number, consentType: ConsentRecord['consentType']): Promise<boolean> {
    const result = await queryDatabase(
      `SELECT granted FROM gdpr_consents 
       WHERE user_id = $1 AND consent_type = $2 
       ORDER BY COALESCE(revoked_at, granted_at) DESC 
       LIMIT 1`,
      [userId, consentType]
    );

    if (result.length === 0) {
      return false; // Sem consentimento registrado = não consentiu
    }

    return result[0].granted === true;
  }

  /**
   * Revogar consentimento
   */
  async revokeConsent(
    userId: number,
    consentType: ConsentRecord['consentType'],
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await queryDatabase(
      `UPDATE gdpr_consents 
       SET revoked_at = CURRENT_TIMESTAMP, granted = false
       WHERE user_id = $1 AND consent_type = $2 AND revoked_at IS NULL`,
      [userId, consentType]
    );

    // Registrar revogação como novo registro
    const activePolicy = await this.getActivePrivacyPolicy();
    await this.recordConsent({
      userId,
      consentType,
      granted: false,
      ipAddress,
      userAgent,
      version: activePolicy?.version || '1.0',
    });
  }

  /**
   * Solicitar exportação de dados
   */
  async requestDataExport(
    userId: number,
    format: DataExport['format'] = 'json'
  ): Promise<DataExport> {
    // Criar registro de solicitação
    const result = await queryDatabase(
      `INSERT INTO gdpr_data_exports 
       (user_id, format, requested_at, status)
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'pending')
       RETURNING *`,
      [userId, format]
    );

    // Processar exportação em background (simulado)
    // Em produção, isso seria feito por um job/worker
    setTimeout(async () => {
      await this.processDataExport(userId, format, result[0].id);
    }, 1000);

    return this.mapDbToExport(result[0]);
  }

  /**
   * Processar exportação de dados
   */
  private async processDataExport(
    userId: number,
    format: DataExport['format'],
    exportId: number
  ): Promise<void> {
    try {
      // Atualizar status para processing
      await queryDatabase(
        `UPDATE gdpr_data_exports SET status = 'processing' WHERE id = $1`,
        [exportId]
      );

      // Coletar todos os dados do usuário
      const userData = await this.collectUserData(userId);

      // Gerar arquivo de exportação
      const exportData = this.formatExportData(userData, format);
      const downloadUrl = await this.saveExportFile(userId, exportId, exportData, format);

      // Atualizar status para completed
      await queryDatabase(
        `UPDATE gdpr_data_exports 
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP, download_url = $1
         WHERE id = $2`,
        [downloadUrl, exportId]
      );

      // Registrar acesso
      await this.logDataAccess(userId, 'export', userId, {
        exportId,
        format,
      });
    } catch (error) {
      console.error('Erro ao processar exportação:', error);
      await queryDatabase(
        `UPDATE gdpr_data_exports SET status = 'failed' WHERE id = $1`,
        [exportId]
      );
    }
  }

  /**
   * Coletar todos os dados do usuário
   */
  private async collectUserData(userId: number): Promise<Record<string, unknown>> {
    // Buscar dados do usuário/customer
    const userData = await queryDatabase(
      `SELECT * FROM customers WHERE id = $1`,
      [userId]
    );

    // Buscar reservas
    const bookings = await queryDatabase(
      `SELECT * FROM bookings WHERE customer_id = $1`,
      [userId]
    );

    // Buscar preferências
    const preferences = await queryDatabase(
      `SELECT * FROM customer_preferences WHERE customer_id = $1`,
      [userId]
    );

    // Buscar interações
    const interactions = await queryDatabase(
      `SELECT * FROM crm_interactions WHERE customer_id = $1`,
      [userId]
    );

    // Buscar pontos de fidelidade
    const loyaltyPoints = await queryDatabase(
      `SELECT * FROM loyalty_points WHERE customer_id = $1`,
      [userId]
    );

    // Buscar consentimentos
    const consents = await queryDatabase(
      `SELECT * FROM gdpr_consents WHERE user_id = $1`,
      [userId]
    );

    return {
      user: userData[0] || null,
      bookings: bookings || [],
      preferences: preferences || [],
      interactions: interactions || [],
      loyaltyPoints: loyaltyPoints || [],
      consents: consents || [],
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Formatar dados para exportação
   */
  private formatExportData(
    data: Record<string, unknown>,
    format: DataExport['format']
  ): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        // Simplificado - em produção, seria mais complexo
        return this.convertToCSV(data);
      case 'xml':
        return this.convertToXML(data);
      default:
        return JSON.stringify(data);
    }
  }

  /**
   * Converter para CSV (simplificado)
   */
  private convertToCSV(data: Record<string, unknown>): string {
    // Implementação simplificada
    return JSON.stringify(data);
  }

  /**
   * Converter para XML (simplificado)
   */
  private convertToXML(data: Record<string, unknown>): string {
    // Implementação simplificada
    return JSON.stringify(data);
  }

  /**
   * Salvar arquivo de exportação
   */
  private async saveExportFile(
    userId: number,
    exportId: number,
    data: string,
    format: DataExport['format']
  ): Promise<string> {
    // Em produção, salvaria em storage (S3, etc.)
    // Por enquanto, retornar URL simulada
    const filename = `user_${userId}_export_${exportId}.${format}`;
    return `/api/gdpr/exports/${exportId}/download`;
  }

  /**
   * Solicitar deleção de dados (direito ao esquecimento)
   */
  async requestDataDeletion(
    userId: number,
    reason?: string
  ): Promise<DataDeletionRequest> {
    const result = await queryDatabase(
      `INSERT INTO gdpr_deletion_requests 
       (user_id, reason, requested_at, status)
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'pending')
       RETURNING *`,
      [userId, reason || null]
    );

    // Processar deleção em background (simulado)
    setTimeout(async () => {
      await this.processDataDeletion(userId, result[0].id);
    }, 1000);

    return this.mapDbToDeletionRequest(result[0]);
  }

  /**
   * Processar deleção de dados
   */
  private async processDataDeletion(userId: number, requestId: number): Promise<void> {
    try {
      // Atualizar status para processing
      await queryDatabase(
        `UPDATE gdpr_deletion_requests SET status = 'processing' WHERE id = $1`,
        [requestId]
      );

      // Anonimizar ou deletar dados pessoais
      // Nota: Alguns dados podem precisar ser mantidos por questões legais (ex: transações financeiras)
      
      // Anonimizar dados do customer
      await queryDatabase(
        `UPDATE customers 
         SET name = 'Usuário Deletado', 
             email = 'deleted_${userId}@deleted.local',
             phone = NULL,
             document = NULL,
             address = NULL,
             deleted_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [userId]
      );

      // Deletar dados sensíveis de preferências
      await queryDatabase(
        `UPDATE customer_preferences 
         SET value = NULL 
         WHERE customer_id = $1 AND is_sensitive = true`,
        [userId]
      );

      // Registrar acesso
      await this.logDataAccess(userId, 'delete', userId, {
        deletionRequestId: requestId,
      });

      // Atualizar status para completed
      await queryDatabase(
        `UPDATE gdpr_deletion_requests 
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [requestId]
      );
    } catch (error) {
      console.error('Erro ao processar deleção:', error);
      await queryDatabase(
        `UPDATE gdpr_deletion_requests SET status = 'failed' WHERE id = $1`,
        [requestId]
      );
    }
  }

  /**
   * Registrar acesso a dados pessoais
   */
  async logDataAccess(
    userId: number,
    dataType: string,
    action: DataAccessLog['action'],
    accessedBy: number,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await queryDatabase(
      `INSERT INTO gdpr_data_access_logs 
       (user_id, data_type, action, accessed_by, ip_address, user_agent, timestamp, details)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7)`,
      [
        userId,
        dataType,
        action,
        accessedBy,
        ipAddress || null,
        userAgent || null,
        details ? JSON.stringify(details) : null,
      ]
    );
  }

  /**
   * Obter logs de acesso de um usuário
   */
  async getUserAccessLogs(userId: number, limit: number = 100): Promise<DataAccessLog[]> {
    const result = await queryDatabase(
      `SELECT * FROM gdpr_data_access_logs 
       WHERE user_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [userId, limit]
    );

    return result.map((r: any) => this.mapDbToAccessLog(r));
  }

  /**
   * Obter política de privacidade ativa
   */
  async getActivePrivacyPolicy(): Promise<PrivacyPolicyVersion | null> {
    const result = await queryDatabase(
      `SELECT * FROM privacy_policy_versions 
       WHERE is_active = true 
       ORDER BY effective_date DESC 
       LIMIT 1`
    );

    if (result.length === 0) {
      return null;
    }

    return this.mapDbToPrivacyPolicy(result[0]);
  }

  /**
   * Criar nova versão da política de privacidade
   */
  async createPrivacyPolicyVersion(
    version: string,
    content: string,
    effectiveDate: Date
  ): Promise<PrivacyPolicyVersion> {
    // Desativar versões anteriores
    await queryDatabase(
      `UPDATE privacy_policy_versions SET is_active = false`
    );

    // Criar nova versão
    const result = await queryDatabase(
      `INSERT INTO privacy_policy_versions 
       (version, content, effective_date, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [version, content, effectiveDate]
    );

    return this.mapDbToPrivacyPolicy(result[0]);
  }

  /**
   * Mapear dados do banco para ConsentRecord
   */
  private mapDbToConsent(row: any): ConsentRecord {
    return {
      id: row.id,
      userId: row.user_id,
      consentType: row.consent_type,
      granted: row.granted,
      grantedAt: row.granted_at ? new Date(row.granted_at) : undefined,
      revokedAt: row.revoked_at ? new Date(row.revoked_at) : undefined,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      version: row.version,
    };
  }

  /**
   * Mapear dados do banco para DataExport
   */
  private mapDbToExport(row: any): DataExport {
    return {
      userId: row.user_id,
      format: row.format,
      requestedAt: new Date(row.requested_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      downloadUrl: row.download_url,
      status: row.status,
    };
  }

  /**
   * Mapear dados do banco para DataDeletionRequest
   */
  private mapDbToDeletionRequest(row: any): DataDeletionRequest {
    return {
      id: row.id,
      userId: row.user_id,
      reason: row.reason,
      requestedAt: new Date(row.requested_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      status: row.status,
    };
  }

  /**
   * Mapear dados do banco para DataAccessLog
   */
  private mapDbToAccessLog(row: any): DataAccessLog {
    return {
      id: row.id,
      userId: row.user_id,
      dataType: row.data_type,
      action: row.action,
      accessedBy: row.accessed_by,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      timestamp: new Date(row.timestamp),
      details: row.details ? JSON.parse(row.details) : undefined,
    };
  }

  /**
   * Mapear dados do banco para PrivacyPolicyVersion
   */
  private mapDbToPrivacyPolicy(row: any): PrivacyPolicyVersion {
    return {
      id: row.id,
      version: row.version,
      content: row.content,
      effectiveDate: new Date(row.effective_date),
      isActive: row.is_active,
    };
  }
}

// Instância singleton
export const gdprService = new GDPRService();

