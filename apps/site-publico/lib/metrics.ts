/**
 * 📊 MÉTRICAS PROMETHEUS PARA RSV GEN 2
 * 
 * Sistema centralizado de coleta de métricas para monitoramento:
 * - Métricas HTTP (requests, latência, status codes)
 * - Métricas de negócio (bookings, tickets, check-ins, pagamentos)
 * - Métricas de banco de dados (queries, conexões, erros)
 * - Métricas de cache (Redis operations, hit rate)
 * - Métricas de sistema (CPU, memória, event loop)
 */

import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// ============================================
// REGISTRY PRINCIPAL
// ============================================

// Criar registry e coletar métricas padrão do Node.js
export const register = new Registry();

// Coletar métricas padrão do Node.js (CPU, memória, event loop, etc.)
collectDefaultMetrics({ 
  register,
  prefix: 'nodejs_',
});

// ============================================
// MÉTRICAS HTTP
// ============================================

/**
 * Contador de requisições HTTP totais
 * Labels: method, route, status_code
 */
export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP recebidas',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * Histograma de duração de requisições HTTP
 * Labels: method, route, status_code
 * Buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
 */
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração de requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

/**
 * Contador de requisições HTTP por status code
 * Labels: status_code
 */
export const httpRequestsByStatus = new Counter({
  name: 'http_requests_by_status',
  help: 'Total de requisições HTTP por status code',
  labelNames: ['status_code'],
  registers: [register],
});

// ============================================
// MÉTRICAS DE NEGÓCIO - BOOKINGS
// ============================================

/**
 * Contador de reservas criadas
 * Labels: status, payment_status
 */
export const bookingsCreatedTotal = new Counter({
  name: 'bookings_created_total',
  help: 'Total de reservas criadas',
  labelNames: ['status', 'payment_status'],
  registers: [register],
});

/**
 * Contador de reservas canceladas
 * Labels: cancellation_reason
 */
export const bookingsCancelledTotal = new Counter({
  name: 'bookings_cancelled_total',
  help: 'Total de reservas canceladas',
  labelNames: ['cancellation_reason'],
  registers: [register],
});

/**
 * Gauge de reservas ativas
 */
export const bookingsActive = new Gauge({
  name: 'bookings_active',
  help: 'Número de reservas ativas no momento',
  registers: [register],
});

/**
 * Contador de receita total de reservas
 * Labels: currency
 */
export const bookingRevenueTotal = new Counter({
  name: 'booking_revenue_total',
  help: 'Receita total gerada por reservas',
  labelNames: ['currency'],
  registers: [register],
});

// ============================================
// MÉTRICAS DE NEGÓCIO - TICKETS
// ============================================

/**
 * Contador de tickets criados
 * Labels: category, priority
 */
export const ticketsCreatedTotal = new Counter({
  name: 'tickets_created_total',
  help: 'Total de tickets de suporte criados',
  labelNames: ['category', 'priority'],
  registers: [register],
});

/**
 * Contador de tickets resolvidos
 * Labels: category, priority
 */
export const ticketsResolvedTotal = new Counter({
  name: 'tickets_resolved_total',
  help: 'Total de tickets de suporte resolvidos',
  labelNames: ['category', 'priority'],
  registers: [register],
});

/**
 * Gauge de tickets abertos
 */
export const ticketsOpen = new Gauge({
  name: 'tickets_open',
  help: 'Número de tickets abertos no momento',
  registers: [register],
});

/**
 * Histograma de tempo de resolução de tickets
 * Labels: category, priority
 */
export const ticketResolutionTime = new Histogram({
  name: 'ticket_resolution_time_seconds',
  help: 'Tempo de resolução de tickets em segundos',
  labelNames: ['category', 'priority'],
  buckets: [60, 300, 600, 1800, 3600, 7200, 14400, 28800, 86400], // 1min até 1 dia
  registers: [register],
});

/**
 * Gauge de tickets com SLA violado
 */
export const ticketsSlaBreached = new Gauge({
  name: 'tickets_sla_breached',
  help: 'Número de tickets com SLA violado',
  registers: [register],
});

// ============================================
// MÉTRICAS DE NEGÓCIO - CHECK-IN/CHECK-OUT
// ============================================

/**
 * Contador de check-ins criados
 */
export const checkinsCreatedTotal = new Counter({
  name: 'checkins_created_total',
  help: 'Total de check-ins digitais criados',
  registers: [register],
});

/**
 * Contador de check-ins completados
 */
export const checkinsCompletedTotal = new Counter({
  name: 'checkins_completed_total',
  help: 'Total de check-ins digitais completados',
  registers: [register],
});

/**
 * Histograma de duração do processo de check-in
 */
export const checkinDuration = new Histogram({
  name: 'checkin_duration_seconds',
  help: 'Duração do processo de check-in em segundos',
  buckets: [60, 300, 600, 1800, 3600], // 1min até 1 hora
  registers: [register],
});

// ============================================
// MÉTRICAS DE NEGÓCIO - PAGAMENTOS
// ============================================

/**
 * Contador de pagamentos processados
 * Labels: payment_method, status
 */
export const paymentsProcessedTotal = new Counter({
  name: 'payments_processed_total',
  help: 'Total de pagamentos processados',
  labelNames: ['payment_method', 'status'],
  registers: [register],
});

/**
 * Contador de pagamentos falhados
 * Labels: payment_method, error_type
 */
export const paymentsFailedTotal = new Counter({
  name: 'payments_failed_total',
  help: 'Total de pagamentos que falharam',
  labelNames: ['payment_method', 'error_type'],
  registers: [register],
});

/**
 * Contador de valor total processado
 * Labels: payment_method, currency
 */
export const paymentAmountTotal = new Counter({
  name: 'payment_amount_total',
  help: 'Valor total processado em pagamentos',
  labelNames: ['payment_method', 'currency'],
  registers: [register],
});

/**
 * Histograma de tempo de processamento de pagamentos
 * Labels: payment_method
 */
export const paymentProcessingTime = new Histogram({
  name: 'payment_processing_time_seconds',
  help: 'Tempo de processamento de pagamentos em segundos',
  labelNames: ['payment_method'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

// ============================================
// MÉTRICAS DE BANCO DE DADOS
// ============================================

/**
 * Histograma de duração de queries
 * Labels: type (select, insert, update, delete)
 */
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duração de queries do banco de dados em segundos',
  labelNames: ['type'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

/**
 * Contador de queries totais
 * Labels: type, status (success, error)
 */
export const dbQueryTotal = new Counter({
  name: 'db_query_total',
  help: 'Total de queries executadas no banco de dados',
  labelNames: ['type', 'status'],
  registers: [register],
});

/**
 * Gauge de conexões ativas do banco
 */
export const dbConnectionsActive = new Gauge({
  name: 'db_connections_active',
  help: 'Número de conexões ativas com o banco de dados',
  registers: [register],
});

/**
 * Contador de erros de banco de dados
 * Labels: error_type
 */
export const dbQueryErrorsTotal = new Counter({
  name: 'db_query_errors_total',
  help: 'Total de erros em queries do banco de dados',
  labelNames: ['error_type'],
  registers: [register],
});

/**
 * Gauge de tamanho do pool de conexões
 */
export const dbPoolSize = new Gauge({
  name: 'db_pool_size',
  help: 'Tamanho do pool de conexões do banco de dados',
  registers: [register],
});

/**
 * Gauge de conexões aguardando no pool
 */
export const dbPoolWaiting = new Gauge({
  name: 'db_pool_waiting',
  help: 'Número de requisições aguardando conexão no pool',
  registers: [register],
});

/**
 * Gauge de conexões idle no pool
 */
export const dbPoolIdle = new Gauge({
  name: 'db_pool_idle',
  help: 'Número de conexões idle no pool',
  registers: [register],
});

// ============================================
// MÉTRICAS DE CACHE (REDIS)
// ============================================

/**
 * Contador de operações Redis
 * Labels: operation (get, set, del, exists), status (success, error)
 */
export const redisOperationsTotal = new Counter({
  name: 'redis_operations_total',
  help: 'Total de operações no Redis',
  labelNames: ['operation', 'status'],
  registers: [register],
});

/**
 * Gauge de taxa de cache hit
 */
export const redisHitRate = new Gauge({
  name: 'redis_hit_rate',
  help: 'Taxa de cache hit do Redis (0-1)',
  registers: [register],
});

/**
 * Gauge de taxa de cache miss
 */
export const redisMissRate = new Gauge({
  name: 'redis_miss_rate',
  help: 'Taxa de cache miss do Redis (0-1)',
  registers: [register],
});

/**
 * Histograma de duração de operações Redis
 * Labels: operation
 */
export const redisOperationDuration = new Histogram({
  name: 'redis_operation_duration_seconds',
  help: 'Duração de operações no Redis em segundos',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});

/**
 * Contador de erros do Redis
 * Labels: error_type
 */
export const redisErrorsTotal = new Counter({
  name: 'redis_errors_total',
  help: 'Total de erros no Redis',
  labelNames: ['error_type'],
  registers: [register],
});

/**
 * Gauge de memória usada pelo Redis
 */
export const redisMemoryUsedBytes = new Gauge({
  name: 'redis_memory_used_bytes',
  help: 'Memória usada pelo Redis em bytes',
  registers: [register],
});

/**
 * Gauge de total de chaves no Redis
 */
export const redisKeysTotal = new Gauge({
  name: 'redis_keys_total',
  help: 'Total de chaves armazenadas no Redis',
  registers: [register],
});

// ============================================
// FUNÇÃO PARA EXPORTAR MÉTRICAS
// ============================================

/**
 * Exporta todas as métricas no formato Prometheus
 * @returns String com métricas no formato Prometheus
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Exporta métricas em formato JSON (útil para debug)
 * @returns Objeto com métricas
 */
export async function getMetricsAsJSON(): Promise<any> {
  return register.getMetricsAsJSON();
}

// ============================================
// HELPERS PARA ATUALIZAR MÉTRICAS
// ============================================

/**
 * Helper para registrar duração de requisição HTTP
 */
export function recordHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  durationSeconds: number
): void {
  httpRequestTotal.inc({
    method,
    route,
    status_code: statusCode.toString(),
  });

  httpRequestDuration.observe(
    {
      method,
      route,
      status_code: statusCode.toString(),
    },
    durationSeconds
  );

  httpRequestsByStatus.inc({
    status_code: statusCode.toString(),
  });
}

/**
 * Helper para registrar query de banco de dados
 */
export function recordDbQuery(
  type: 'select' | 'insert' | 'update' | 'delete',
  durationSeconds: number,
  success: boolean = true
): void {
  dbQueryDuration.observe({ type }, durationSeconds);
  dbQueryTotal.inc({
    type,
    status: success ? 'success' : 'error',
  });
}

/**
 * Helper para registrar operação Redis
 */
export function recordRedisOperation(
  operation: 'get' | 'set' | 'del' | 'exists' | 'expire',
  durationSeconds: number,
  success: boolean = true
): void {
  redisOperationsTotal.inc({
    operation,
    status: success ? 'success' : 'error',
  });
  redisOperationDuration.observe({ operation }, durationSeconds);
}

