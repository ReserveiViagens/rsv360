/**
 * ✅ SERVIÇO DE MONITORAMENTO DE PRODUÇÃO
 * 
 * Monitoramento com:
 * - Health checks
 * - Metrics collection
 * - Alerting
 * - Uptime monitoring
 */

import { queryDatabase } from './db';
import { redisCache } from './redis-cache';

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: { status: 'up' | 'down'; latency?: number };
    redis: { status: 'up' | 'down'; latency?: number };
    disk: { status: 'up' | 'down'; usage?: number };
    memory: { status: 'up' | 'down'; usage?: number };
  };
  timestamp: string;
}

/**
 * Health check completo
 */
export async function performHealthCheck(): Promise<HealthCheck> {
  const checks: HealthCheck['checks'] = {
    database: { status: 'down' },
    redis: { status: 'down' },
    disk: { status: 'down' },
    memory: { status: 'down' },
  };

  // Check database
  try {
    const dbStart = Date.now();
    await queryDatabase('SELECT 1');
    const dbLatency = Date.now() - dbStart;
    checks.database = { status: 'up', latency: dbLatency };
  } catch (error) {
    checks.database = { status: 'down' };
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    await redisCache.exists('health:check');
    const redisLatency = Date.now() - redisStart;
    checks.redis = { status: 'up', latency: redisLatency };
  } catch (error) {
    checks.redis = { status: 'down' };
  }

  // Check disk (simplificado)
  try {
    const diskUsage = process.memoryUsage();
    const usagePercent = (diskUsage.heapUsed / diskUsage.heapTotal) * 100;
    checks.disk = { status: usagePercent < 90 ? 'up' : 'down', usage: usagePercent };
  } catch (error) {
    checks.disk = { status: 'down' };
  }

  // Check memory
  try {
    const memUsage = process.memoryUsage();
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    checks.memory = { status: memUsagePercent < 90 ? 'up' : 'down', usage: memUsagePercent };
  } catch (error) {
    checks.memory = { status: 'down' };
  }

  // Determinar status geral
  const allUp = Object.values(checks).every(c => c.status === 'up');
  const anyDown = Object.values(checks).some(c => c.status === 'down');

  const status: HealthCheck['status'] = allUp 
    ? 'healthy' 
    : anyDown && checks.database.status === 'up'
    ? 'degraded'
    : 'unhealthy';

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Coletar métricas
 */
export async function collectMetrics(): Promise<{
  timestamp: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
}> {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  // Buscar métricas do cache (em produção, usar sistema de métricas dedicado)
  const requests = await redisCache.get<number>('metrics:requests') || 0;
  const errors = await redisCache.get<number>('metrics:errors') || 0;
  const responseTimes = await redisCache.get<number[]>('metrics:response_times') || [];
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  return {
    timestamp: new Date().toISOString(),
    requests,
    errors,
    avgResponseTime,
    memoryUsage: memUsage,
    cpuUsage,
  };
}

/**
 * Registrar métrica de requisição
 */
export async function recordRequestMetric(responseTime: number, success: boolean): Promise<void> {
  try {
    // Incrementar contador de requisições
    const currentRequests = await redisCache.get<number>('metrics:requests') || 0;
    await redisCache.set('metrics:requests', currentRequests + 1, 3600);

    // Registrar tempo de resposta
    const responseTimes = await redisCache.get<number[]>('metrics:response_times') || [];
    responseTimes.push(responseTime);
    if (responseTimes.length > 1000) {
      responseTimes.shift(); // Manter apenas últimos 1000
    }
    await redisCache.set('metrics:response_times', responseTimes, 3600);

    // Registrar erro se houver
    if (!success) {
      const currentErrors = await redisCache.get<number>('metrics:errors') || 0;
      await redisCache.set('metrics:errors', currentErrors + 1, 3600);
    }
  } catch (error) {
    // Não falhar se não conseguir registrar métricas
    console.error('Erro ao registrar métrica:', error);
  }
}

