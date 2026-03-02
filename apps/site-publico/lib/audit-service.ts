/**
 * Serviço de Logs de Auditoria
 * Registra todas as ações importantes do sistema para auditoria e compliance
 */

import { queryDatabase } from './db';

export interface AuditLog {
  id?: number;
  userId?: number;
  userEmail?: string;
  action: string; // create, update, delete, read, login, logout, etc.
  resource: string; // booking, customer, property, etc.
  resourceId?: string | number;
  ipAddress?: string;
  userAgent?: string;
  method?: string; // HTTP method
  endpoint?: string; // API endpoint
  statusCode?: number;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  changes?: Record<string, { old: unknown; new: unknown }>; // Para updates
  metadata?: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  duration?: number; // ms
}

export interface AuditLogFilter {
  userId?: number;
  action?: string;
  resource?: string;
  resourceId?: string | number;
  severity?: AuditLog['severity'];
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

export interface AuditStats {
  totalLogs: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  bySeverity: Record<string, number>;
  byUser: Record<string, number>;
  recentActivity: AuditLog[];
}

/**
 * Serviço de auditoria
 */
export class AuditService {
  /**
   * Registrar log de auditoria
   */
  async log(auditLog: Partial<AuditLog>): Promise<AuditLog> {
    const result = await queryDatabase(
      `INSERT INTO audit_logs 
       (user_id, user_email, action, resource, resource_id, ip_address, user_agent,
        method, endpoint, status_code, request_body, response_body, changes,
        metadata, severity, timestamp, duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        auditLog.userId || null,
        auditLog.userEmail || null,
        auditLog.action,
        auditLog.resource,
        auditLog.resourceId ? String(auditLog.resourceId) : null,
        auditLog.ipAddress || null,
        auditLog.userAgent || null,
        auditLog.method || null,
        auditLog.endpoint || null,
        auditLog.statusCode || null,
        auditLog.requestBody ? JSON.stringify(auditLog.requestBody) : null,
        auditLog.responseBody ? JSON.stringify(auditLog.responseBody) : null,
        auditLog.changes ? JSON.stringify(auditLog.changes) : null,
        auditLog.metadata ? JSON.stringify(auditLog.metadata) : null,
        auditLog.severity || 'info',
        auditLog.timestamp || new Date(),
        auditLog.duration || null,
      ]
    );

    return this.mapDbToLog(result[0]);
  }

  /**
   * Buscar logs de auditoria
   */
  async searchLogs(filter: AuditLogFilter): Promise<{ logs: AuditLog[]; total: number }> {
    let query = `SELECT * FROM audit_logs WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filter.userId) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(filter.userId);
    }

    if (filter.action) {
      query += ` AND action = $${paramIndex++}`;
      params.push(filter.action);
    }

    if (filter.resource) {
      query += ` AND resource = $${paramIndex++}`;
      params.push(filter.resource);
    }

    if (filter.resourceId !== undefined) {
      query += ` AND resource_id = $${paramIndex++}`;
      params.push(String(filter.resourceId));
    }

    if (filter.severity) {
      query += ` AND severity = $${paramIndex++}`;
      params.push(filter.severity);
    }

    if (filter.startDate) {
      query += ` AND timestamp >= $${paramIndex++}`;
      params.push(filter.startDate);
    }

    if (filter.endDate) {
      query += ` AND timestamp <= $${paramIndex++}`;
      params.push(filter.endDate);
    }

    if (filter.ipAddress) {
      query += ` AND ip_address = $${paramIndex++}`;
      params.push(filter.ipAddress);
    }

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered`;
    const countResult = await queryDatabase(countQuery, params);
    const total = parseInt(countResult[0].total) || 0;

    // Ordenar e limitar
    query += ` ORDER BY timestamp DESC`;
    
    if (filter.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filter.limit);
    }

    if (filter.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filter.offset);
    }

    const logs = await queryDatabase(query, params);
    const mappedLogs = logs.map((log: any) => this.mapDbToLog(log));

    return { logs: mappedLogs, total };
  }

  /**
   * Obter estatísticas de auditoria
   */
  async getStats(startDate?: Date, endDate?: Date): Promise<AuditStats> {
    let query = `SELECT 
      COUNT(*) as total,
      action,
      resource,
      severity,
      user_id,
      user_email
    FROM audit_logs WHERE 1=1`;

    const params: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      query += ` AND timestamp >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND timestamp <= $${paramIndex++}`;
      params.push(endDate);
    }

    query += ` GROUP BY action, resource, severity, user_id, user_email`;

    const results = await queryDatabase(query, params);

    const stats: AuditStats = {
      totalLogs: 0,
      byAction: {},
      byResource: {},
      bySeverity: {},
      byUser: {},
      recentActivity: [],
    };

    for (const row of results) {
      stats.totalLogs += parseInt(row.total) || 0;
      
      if (row.action) {
        stats.byAction[row.action] = (stats.byAction[row.action] || 0) + parseInt(row.total);
      }
      
      if (row.resource) {
        stats.byResource[row.resource] = (stats.byResource[row.resource] || 0) + parseInt(row.total);
      }
      
      if (row.severity) {
        stats.bySeverity[row.severity] = (stats.bySeverity[row.severity] || 0) + parseInt(row.total);
      }
      
      if (row.user_email) {
        stats.byUser[row.user_email] = (stats.byUser[row.user_email] || 0) + parseInt(row.total);
      }
    }

    // Obter atividade recente
    const recentQuery = `SELECT * FROM audit_logs 
      ${startDate ? `WHERE timestamp >= $1` : ''}
      ORDER BY timestamp DESC LIMIT 10`;
    const recentParams = startDate ? [startDate] : [];
    const recentLogs = await queryDatabase(recentQuery, recentParams);
    stats.recentActivity = recentLogs.map((log: any) => this.mapDbToLog(log));

    return stats;
  }

  /**
   * Registrar mudanças (para updates)
   */
  async logChanges(
    userId: number | undefined,
    userEmail: string | undefined,
    action: string,
    resource: string,
    resourceId: string | number,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog> {
    // Calcular mudanças
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    
    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          old: oldData[key],
          new: newData[key],
        };
      }
    }

    return this.log({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      changes,
      ipAddress,
      userAgent,
      severity: Object.keys(changes).length > 0 ? 'info' : 'info',
      timestamp: new Date(),
    });
  }

  /**
   * Exportar logs para CSV
   */
  async exportLogs(filter: AuditLogFilter): Promise<string> {
    const { logs } = await this.searchLogs({ ...filter, limit: 10000 });

    // Criar CSV
    const headers = [
      'ID',
      'Timestamp',
      'User ID',
      'User Email',
      'Action',
      'Resource',
      'Resource ID',
      'IP Address',
      'Method',
      'Endpoint',
      'Status Code',
      'Severity',
    ];

    const rows = logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.userId || '',
      log.userEmail || '',
      log.action,
      log.resource,
      log.resourceId || '',
      log.ipAddress || '',
      log.method || '',
      log.endpoint || '',
      log.statusCode || '',
      log.severity,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Limpar logs antigos
   */
  async cleanupOldLogs(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await queryDatabase(
      `DELETE FROM audit_logs WHERE timestamp < $1 RETURNING id`,
      [cutoffDate]
    );

    return result.length;
  }

  /**
   * Mapear dados do banco para AuditLog
   */
  private mapDbToLog(row: any): AuditLog {
    return {
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      action: row.action,
      resource: row.resource,
      resourceId: row.resource_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      method: row.method,
      endpoint: row.endpoint,
      statusCode: row.status_code,
      requestBody: row.request_body ? JSON.parse(row.request_body) : undefined,
      responseBody: row.response_body ? JSON.parse(row.response_body) : undefined,
      changes: row.changes ? JSON.parse(row.changes) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      severity: row.severity,
      timestamp: new Date(row.timestamp),
      duration: row.duration,
    };
  }
}

// Instância singleton
export const auditService = new AuditService();
