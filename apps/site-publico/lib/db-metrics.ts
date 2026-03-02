/**
 * 📊 INSTRUMENTAÇÃO DE MÉTRICAS PARA BANCO DE DADOS
 * 
 * Wrapper para queryDatabase que registra métricas automaticamente
 */

import { queryDatabase as originalQueryDatabase, getDbPool } from './db';
import { 
  recordDbQuery, 
  dbConnectionsActive, 
  dbPoolSize, 
  dbPoolWaiting, 
  dbPoolIdle,
  dbQueryErrorsTotal 
} from './metrics';
import { Pool } from 'pg';

/**
 * Detecta o tipo de query baseado no SQL
 */
function detectQueryType(sql: string): 'select' | 'insert' | 'update' | 'delete' {
  const trimmed = sql.trim().toLowerCase();
  if (trimmed.startsWith('select')) return 'select';
  if (trimmed.startsWith('insert')) return 'insert';
  if (trimmed.startsWith('update')) return 'update';
  if (trimmed.startsWith('delete')) return 'delete';
  return 'select'; // Default
}

/**
 * Atualiza métricas do pool de conexões
 */
function updatePoolMetrics(): void {
  try {
    const pool = getDbPool();
    
    // Atualizar métricas do pool
    dbPoolSize.set(pool.totalCount);
    dbPoolIdle.set(pool.idleCount);
    dbPoolWaiting.set(pool.waitingCount);
    
    // Calcular conexões ativas
    const activeConnections = pool.totalCount - pool.idleCount;
    dbConnectionsActive.set(activeConnections);
  } catch (error) {
    // Ignorar erros ao atualizar métricas do pool
    console.warn('⚠️ Erro ao atualizar métricas do pool:', error);
  }
}

/**
 * QueryDatabase com instrumentação de métricas
 * 
 * @example
 * ```typescript
 * import { queryDatabase } from '@/lib/db-metrics';
 * 
 * const users = await queryDatabase('SELECT * FROM users WHERE id = $1', [userId]);
 * ```
 */
export async function queryDatabase<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const startTime = Date.now();
  const queryType = detectQueryType(text);

  try {
    // Atualizar métricas do pool antes da query
    updatePoolMetrics();

    // Executar query original
    const result = await originalQueryDatabase<T>(text, params);

    // Calcular duração
    const durationSeconds = (Date.now() - startTime) / 1000;

    // Registrar métricas de sucesso
    recordDbQuery(queryType, durationSeconds, true);

    // Atualizar métricas do pool após a query
    updatePoolMetrics();

    return result;
  } catch (error) {
    // Calcular duração mesmo em caso de erro
    const durationSeconds = (Date.now() - startTime) / 1000;

    // Registrar métricas de erro
    recordDbQuery(queryType, durationSeconds, false);

    // Registrar erro específico
    const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
    dbQueryErrorsTotal.inc({ error_type: errorType });

    // Atualizar métricas do pool
    updatePoolMetrics();

    // Re-throw o erro
    throw error;
  }
}

/**
 * Inicia monitoramento periódico do pool
 * Chame isso uma vez na inicialização da aplicação
 */
export function startPoolMonitoring(intervalMs: number = 30000): void {
  setInterval(() => {
    updatePoolMetrics();
  }, intervalMs);
}

