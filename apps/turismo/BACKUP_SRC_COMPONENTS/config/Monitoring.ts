import { z } from 'zod';

// Schema para métricas de monitoramento
export const MetricSchema = z.object({
  name: string,
  value: z.number(),
  unit: z.string(),
  timestamp: z.number(),
  tags: z.record(z.string()).optional(),
});

export type Metric = z.infer<typeof MetricSchema>;

// Schema para logs
export const LogSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  message: z.string(),
  timestamp: z.number(),
  context: z.string().optional(),
  data: z.record(z.any()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
});

export type Log = z.infer<typeof LogSchema>;

// Schema para alertas
export const AlertSchema = z.object({
  id: z.string(),
  type: z.enum(['info', 'warning', 'error', 'critical']),
  title: z.string(),
  message: z.string(),
  timestamp: z.number(),
  acknowledged: z.boolean(),
  acknowledgedBy: z.string().optional(),
  acknowledgedAt: z.number().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['performance', 'security', 'availability', 'business']),
  source: z.string(),
  metadata: z.record(z.any()).optional(),
});

export type Alert = z.infer<typeof AlertSchema>;

// Interface para provedores de monitoramento
export interface MonitoringProvider {
  sendMetric(metric: Metric): Promise<void>;
  sendLog(log: Log): Promise<void>;
  sendAlert(alert: Alert): Promise<void>;
  getMetrics(query: MetricQuery): Promise<Metric[]>;
  getLogs(query: LogQuery): Promise<Log[]>;
  getAlerts(query: AlertQuery): Promise<Alert[]>;
}

// Interfaces para consultas
export interface MetricQuery {
  name?: string;
  startTime?: number;
  endTime?: number;
  tags?: Record<string, string>;
  limit?: number;
}

export interface LogQuery {
  level?: Log['level'];
  startTime?: number;
  endTime?: number;
  context?: string;
  userId?: string;
  limit?: number;
}

export interface AlertQuery {
  type?: Alert['type'];
  severity?: Alert['severity'];
  category?: Alert['category'];
  acknowledged?: boolean;
  startTime?: number;
  endTime?: number;
  limit?: number;
}

// Classe principal de monitoramento
export class MonitoringSystem {
  private providers: MonitoringProvider[] = [];
  private metricsBuffer: Metric[] = [];
  private logsBuffer: Log[] = [];
  private alertsBuffer: Alert[] = [];
  private bufferSize: number = 100;
  private flushInterval: number = 5000; // 5 segundos
  private flushTimer: NodeJS.Timeout | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.startFlushTimer();
  }

  // Adicionar provedor de monitoramento
  addProvider(provider: MonitoringProvider): void {
    this.providers.push(provider);
    console.log(`✅ Provedor de monitoramento adicionado: ${provider.constructor.name}`);
  }

  // Habilitar/desabilitar monitoramento
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      this.startFlushTimer();
    } else {
      this.stopFlushTimer();
    }
    console.log(`🔄 Monitoramento ${enabled ? 'habilitado' : 'desabilitado'}`);
  }

  // Enviar métrica
  async sendMetric(metric: Omit<Metric, 'timestamp'>): Promise<void> {
    if (!this.isEnabled) return;

    const fullMetric: Metric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metricsBuffer.push(fullMetric);

    if (this.metricsBuffer.length >= this.bufferSize) {
      await this.flushMetrics();
    }
  }

  // Enviar log
  async sendLog(log: Omit<Log, 'timestamp'>): Promise<void> {
    if (!this.isEnabled) return;

    const fullLog: Log = {
      ...log,
      timestamp: Date.now(),
    };

    this.logsBuffer.push(fullLog);

    if (this.logsBuffer.length >= this.bufferSize) {
      await this.flushLogs();
    }
  }

  // Enviar alerta
  async sendAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>): Promise<void> {
    if (!this.isEnabled) return;

    const fullAlert: Alert = {
      ...alert,
      id: this.generateId(),
      timestamp: Date.now(),
      acknowledged: false,
    };

    this.alertsBuffer.push(fullAlert);

    // Alertas são enviados imediatamente
    await this.flushAlerts();
  }

  // Métricas de sistema
  async recordSystemMetrics(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Métricas de performance
      if (typeof performance !== 'undefined') {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          await this.sendMetric({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.loadEventStart,
            unit: 'ms',
            tags: { type: 'navigation' },
          });

          await this.sendMetric({
            name: 'dom_content_loaded',
            value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            unit: 'ms',
            tags: { type: 'dom' },
          });
        }
      }

      // Métricas de memória (se disponível)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        await this.sendMetric({
          name: 'memory_used',
          value: memory.usedJSHeapSize / (1024 * 1024),
          unit: 'MB',
          tags: { type: 'memory' },
        });

        await this.sendMetric({
          name: 'memory_limit',
          value: memory.jsHeapSizeLimit / (1024 * 1024),
          unit: 'MB',
          tags: { type: 'memory' },
        });
      }

      // Métricas de rede
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          await this.sendMetric({
            name: 'network_type',
            value: connection.effectiveType === '4g' ? 4 : connection.effectiveType === '3g' ? 3 : 2,
            unit: 'g',
            tags: { type: 'network' },
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao registrar métricas do sistema:', error);
    }
  }

  // Métricas de negócio
  async recordBusinessMetrics(data: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'number') {
          this.sendMetric({
            name: `business_${key}`,
            value,
            unit: 'count',
            tags: { type: 'business' },
          });
        }
      });
    } catch (error) {
      console.error('❌ Erro ao registrar métricas de negócio:', error);
    }
  }

  // Log de erro com contexto
  async logError(error: Error, context?: string, data?: Record<string, any>): Promise<void> {
    await this.sendLog({
      level: 'error',
      message: error.message,
      context: context || 'application',
      data: {
        stack: error.stack,
        name: error.name,
        ...data,
      },
    });
  }

  // Log de performance
  async logPerformance(operation: string, duration: number, metadata?: Record<string, any>): Promise<void> {
    await this.sendLog({
      level: 'info',
      message: `Performance: ${operation}`,
      context: 'performance',
      data: {
        operation,
        duration,
        ...metadata,
      },
    });

    await this.sendMetric({
      name: 'operation_duration',
      value: duration,
      unit: 'ms',
      tags: { operation, type: 'performance' },
    });
  }

  // Log de segurança
  async logSecurity(event: string, userId?: string, ip?: string, data?: Record<string, any>): Promise<void> {
    await this.sendLog({
      level: 'warn',
      message: `Security event: ${event}`,
      context: 'security',
      userId,
      ip,
      data,
    });
  }

  // Alerta de performance
  async alertPerformance(metric: string, value: number, threshold: number): Promise<void> {
    if (value > threshold) {
      await this.sendAlert({
        type: 'warning',
        title: 'Performance Degradada',
        message: `Métrica ${metric} (${value}) excedeu o limite de ${threshold}`,
        severity: 'medium',
        category: 'performance',
        source: 'monitoring',
        metadata: { metric, value, threshold },
      });
    }
  }

  // Alerta de erro
  async alertError(error: Error, context: string): Promise<void> {
    await this.sendAlert({
      type: 'error',
      title: 'Erro Detectado',
      message: error.message,
      severity: 'high',
      category: 'availability',
      source: context,
      metadata: { stack: error.stack, name: error.name },
    });
  }

  // Alerta de segurança
  async alertSecurity(event: string, severity: 'medium' | 'high' | 'critical' = 'medium'): Promise<void> {
    await this.sendAlert({
      type: 'warning',
      title: 'Evento de Segurança',
      message: event,
      severity,
      category: 'security',
      source: 'security_monitoring',
    });
  }

  // Consultar métricas
  async getMetrics(query: MetricQuery): Promise<Metric[]> {
    const results: Metric[] = [];
    
    for (const provider of this.providers) {
      try {
        const metrics = await provider.getMetrics(query);
        results.push(...metrics);
      } catch (error) {
        console.error(`❌ Erro ao consultar métricas do provedor ${provider.constructor.name}:`, error);
      }
    }

    return results;
  }

  // Consultar logs
  async getLogs(query: LogQuery): Promise<Log[]> {
    const results: Log[] = [];
    
    for (const provider of this.providers) {
      try {
        const logs = await provider.getLogs(query);
        results.push(...logs);
      } catch (error) {
        console.error(`❌ Erro ao consultar logs do provedor ${provider.constructor.name}:`, error);
      }
    }

    return results;
  }

  // Consultar alertas
  async getAlerts(query: AlertQuery): Promise<Alert[]> {
    const results: Alert[] = [];
    
    for (const provider of this.providers) {
      try {
        const alerts = await provider.getAlerts(query);
        results.push(...alerts);
      } catch (error) {
        console.error(`❌ Erro ao consultar alertas do provedor ${provider.constructor.name}:`, error);
      }
    }

    return results;
  }

  // Iniciar timer de flush
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(async () => {
      await this.flushAll();
    }, this.flushInterval);
  }

  // Parar timer de flush
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // Flush de métricas
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metrics = [...this.metricsBuffer];
    this.metricsBuffer = [];

    for (const provider of this.providers) {
      try {
        for (const metric of metrics) {
          await provider.sendMetric(metric);
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar métricas para ${provider.constructor.name}:`, error);
      }
    }
  }

  // Flush de logs
  private async flushLogs(): Promise<void> {
    if (this.logsBuffer.length === 0) return;

    const logs = [...this.logsBuffer];
    this.logsBuffer = [];

    for (const provider of this.providers) {
      try {
        for (const log of logs) {
          await provider.sendLog(log);
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar logs para ${provider.constructor.name}:`, error);
      }
    }
  }

  // Flush de alertas
  private async flushAlerts(): Promise<void> {
    if (this.alertsBuffer.length === 0) return;

    const alerts = [...this.alertsBuffer];
    this.alertsBuffer = [];

    for (const provider of this.providers) {
      try {
        for (const alert of alerts) {
          await provider.sendAlert(alert);
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar alertas para ${provider.constructor.name}:`, error);
      }
    }
  }

  // Flush de todos os buffers
  private async flushAll(): Promise<void> {
    await Promise.all([
      this.flushMetrics(),
      this.flushLogs(),
      this.flushAlerts(),
    ]);
  }

  // Gerar ID único
  private generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obter estatísticas do sistema
  getStats(): {
    metricsBufferSize: number;
    logsBufferSize: number;
    alertsBufferSize: number;
    providersCount: number;
    isEnabled: boolean;
  } {
    return {
      metricsBufferSize: this.metricsBuffer.length,
      logsBufferSize: this.logsBuffer.length,
      alertsBufferSize: this.alertsBuffer.length,
      providersCount: this.providers.length,
      isEnabled: this.isEnabled,
    };
  }

  // Limpar buffers
  clearBuffers(): void {
    this.metricsBuffer = [];
    this.logsBuffer = [];
    this.alertsBuffer = [];
    console.log('🧹 Buffers de monitoramento limpos');
  }

  // Destruir sistema
  destroy(): void {
    this.stopFlushTimer();
    this.clearBuffers();
    this.providers = [];
    console.log('🗑️ Sistema de monitoramento destruído');
  }
}

// Provedor de monitoramento local (para desenvolvimento)
export class LocalMonitoringProvider implements MonitoringProvider {
  private metrics: Metric[] = [];
  private logs: Log[] = [];
  private alerts: Alert[] = [];

  async sendMetric(metric: Metric): Promise<void> {
    this.metrics.push(metric);
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  async sendLog(log: Log): Promise<void> {
    this.logs.push(log);
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  async sendAlert(alert: Alert): Promise<void> {
    this.alerts.push(alert);
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  async getMetrics(query: MetricQuery): Promise<Metric[]> {
    let filtered = this.metrics;

    if (query.name) {
      filtered = filtered.filter(m => m.name === query.name);
    }
    if (query.startTime) {
      filtered = filtered.filter(m => m.timestamp >= query.startTime);
    }
    if (query.endTime) {
      filtered = filtered.filter(m => m.timestamp <= query.endTime);
    }
    if (query.tags) {
      filtered = filtered.filter(m => 
        Object.entries(query.tags!).every(([key, value]) => m.tags?.[key] === value)
      );
    }

    return filtered.slice(-(query.limit || 100));
  }

  async getLogs(query: LogQuery): Promise<Log[]> {
    let filtered = this.logs;

    if (query.level) {
      filtered = filtered.filter(l => l.level === query.level);
    }
    if (query.startTime) {
      filtered = filtered.filter(l => l.timestamp >= query.startTime);
    }
    if (query.endTime) {
      filtered = filtered.filter(l => l.timestamp <= query.endTime);
    }
    if (query.context) {
      filtered = filtered.filter(l => l.context === query.context);
    }
    if (query.userId) {
      filtered = filtered.filter(l => l.userId === query.userId);
    }

    return filtered.slice(-(query.limit || 100));
  }

  async getAlerts(query: AlertQuery): Promise<Alert[]> {
    let filtered = this.alerts;

    if (query.type) {
      filtered = filtered.filter(a => a.type === query.type);
    }
    if (query.severity) {
      filtered = filtered.filter(a => a.severity === query.severity);
    }
    if (query.category) {
      filtered = filtered.filter(a => a.category === query.category);
    }
    if (query.acknowledged !== undefined) {
      filtered = filtered.filter(a => a.acknowledged === query.acknowledged);
    }
    if (query.startTime) {
      filtered = filtered.filter(a => a.timestamp >= query.startTime);
    }
    if (query.endTime) {
      filtered = filtered.filter(a => a.timestamp <= query.endTime);
    }

    return filtered.slice(-(query.limit || 100));
  }

  // Métodos específicos para desenvolvimento
  getStoredMetrics(): Metric[] {
    return [...this.metrics];
  }

  getStoredLogs(): Log[] {
    return [...this.logs];
  }

  getStoredAlerts(): Alert[] {
    return [...this.alerts];
  }

  clear(): void {
    this.metrics = [];
    this.logs = [];
    this.alerts = [];
  }
}

// Instância singleton do sistema de monitoramento
export const monitoringSystem = new MonitoringSystem();

// Adicionar provedor local por padrão
monitoringSystem.addProvider(new LocalMonitoringProvider());

// Funções utilitárias para uso direto
export async function recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>): Promise<void> {
  await monitoringSystem.sendMetric({ name, value, unit, tags });
}

export async function logInfo(message: string, context?: string, data?: Record<string, any>): Promise<void> {
  await monitoringSystem.sendLog({ level: 'info', message, context, data });
}

export async function logError(error: Error, context?: string, data?: Record<string, any>): Promise<void> {
  await monitoringSystem.logError(error, context, data);
}

export async function logPerformance(operation: string, duration: number, metadata?: Record<string, any>): Promise<void> {
  await monitoringSystem.logPerformance(operation, duration, metadata);
}

export async function alertPerformance(metric: string, value: number, threshold: number): Promise<void> {
  await monitoringSystem.alertPerformance(metric, value, threshold);
}

export async function alertError(error: Error, context: string): Promise<void> {
  await monitoringSystem.alertError(error, context);
}

export async function alertSecurity(event: string, severity?: 'medium' | 'high' | 'critical'): Promise<void> {
  await monitoringSystem.alertSecurity(event, severity);
}

export default monitoringSystem;
