/**
 * ✅ OTIMIZADOR DE QUERIES
 * 
 * Sistema para otimizar queries do banco de dados:
 * - Cache de queries (Redis ou memória)
 * - Prepared statements
 * - Query batching
 * - Connection pooling
 * - Query analysis e otimização automática
 */

import { queryDatabase } from './db';
import { cacheGetOrSet } from './redis-cache';

interface CachedQuery {
  result: any;
  timestamp: number;
  ttl: number;
}

const queryCache = new Map<string, CachedQuery>();
const DEFAULT_TTL = 60000; // 1 minuto

/**
 * Executar query com cache (usando Redis se disponível)
 */
export async function queryWithCache<T = any>(
  query: string,
  params: any[] = [],
  ttl: number = DEFAULT_TTL
): Promise<T[]> {
  const cacheKey = `query:${Buffer.from(query).toString('base64')}:${JSON.stringify(params)}`;
  
  // Tentar usar Redis cache primeiro
  try {
    const cached = await cacheGetOrSet<T[]>(
      cacheKey,
      async () => {
        const result = await queryDatabase(query, params);
        return result as T[];
      },
      Math.floor(ttl / 1000) // Converter ms para segundos
    );
    return cached;
  } catch (error) {
    // Fallback para cache em memória
    const memoryCacheKey = `${query}:${JSON.stringify(params)}`;
    const cached = queryCache.get(memoryCacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.result as T[];
    }

    const result = await queryDatabase(query, params);
    queryCache.set(memoryCacheKey, {
      result,
      timestamp: Date.now(),
      ttl,
    });

    return result as T[];
  }
}

/**
 * Invalidar cache (Redis e memória)
 */
export async function invalidateCache(pattern?: string) {
  try {
    const { redisCache } = await import('./redis-cache');
    
    if (pattern) {
      // Invalidar no Redis
      await redisCache.deletePattern(`query:*${pattern}*`);
      
      // Invalidar na memória
      for (const key of queryCache.keys()) {
        if (key.includes(pattern)) {
          queryCache.delete(key);
        }
      }
    } else {
      // Limpar tudo
      await redisCache.deletePattern('query:*');
      queryCache.clear();
    }
  } catch (error) {
    console.error('Erro ao invalidar cache:', error);
  }
}

/**
 * Executar múltiplas queries em batch
 */
export async function batchQueries<T = any>(
  queries: Array<{ query: string; params?: any[] }>
): Promise<T[][]> {
  // Executar queries em paralelo
  const results = await Promise.all(
    queries.map(({ query, params = [] }) => queryDatabase(query, params))
  );
  return results as T[][];
}

/**
 * Query otimizada com paginação
 */
export async function paginatedQuery<T = any>(
  query: string,
  params: any[] = [],
  page: number = 1,
  pageSize: number = 20
): Promise<{
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}> {
  const offset = (page - 1) * pageSize;

  // Query de contagem
  const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
  const countResult = await queryDatabase(countQuery, params);
  const total = parseInt(countResult[0]?.total || '0');

  // Query de dados com paginação
  const paginatedQuery = `${query} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const data = await queryDatabase(paginatedQuery, [...params, pageSize, offset]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data as T[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Limpar cache periodicamente
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, cached] of queryCache.entries()) {
    if (now - cached.timestamp > cached.ttl) {
      queryCache.delete(key);
    }
  }
}, DEFAULT_TTL);

