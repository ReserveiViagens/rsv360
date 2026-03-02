/**
 * ✅ SERVIÇO DE CACHE REDIS
 * 
 * Implementação de cache usando Redis:
 * - Cache de queries
 * - Cache de sessões
 * - Cache de resultados de API
 * - TTL configurável
 * - Fallback para cache em memória
 * - Métricas Prometheus integradas
 */

import {
  recordRedisOperation,
  redisOperationsTotal,
  redisHitRate,
  redisMissRate,
  redisErrorsTotal,
  redisMemoryUsedBytes,
  redisKeysTotal
} from './metrics';

interface CacheOptions {
  ttl?: number; // Time to live em segundos
  prefix?: string; // Prefixo para keys
}

class RedisCacheService {
  private redisClient: any = null;
  private memoryCache: Map<string, { value: any; expires: number }> = new Map();
  private isRedisAvailable: boolean = false;

  /**
   * Inicializar conexão Redis
   */
  private async initializeRedis() {
    try {
      // Tentar importar e conectar ao Redis
      const Redis = (await import('ioredis')).default;
      
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      };

      this.redisClient = new Redis(redisConfig);

      this.redisClient.on('connect', () => {
        console.log('✅ Redis conectado');
        this.isRedisAvailable = true;
      });

      this.redisClient.on('error', (error: any) => {
        console.warn('⚠️ Redis não disponível, usando cache em memória:', error.message);
        this.isRedisAvailable = false;
      });

      // Testar conexão
      await this.redisClient.ping();
      this.isRedisAvailable = true;
    } catch (error) {
      console.warn('⚠️ Redis não disponível, usando cache em memória');
      this.isRedisAvailable = false;
    }
  }

  /**
   * Obter valor do cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now();
    try {
      if (this.isRedisAvailable && this.redisClient) {
        const value = await this.redisClient.get(key);
        const durationSeconds = (Date.now() - startTime) / 1000;
        
        if (value) {
          // Cache hit
          recordRedisOperation('get', durationSeconds, true);
          redisOperationsTotal.inc({ operation: 'get', status: 'success' });
          this.updateHitRate(true);
          return JSON.parse(value) as T;
        } else {
          // Cache miss
          recordRedisOperation('get', durationSeconds, true);
          redisOperationsTotal.inc({ operation: 'get', status: 'success' });
          this.updateHitRate(false);
          return null;
        }
      } else {
        // Fallback para cache em memória
        const cached = this.memoryCache.get(key);
        const durationSeconds = (Date.now() - startTime) / 1000;
        
        if (cached && cached.expires > Date.now()) {
          // Cache hit
          recordRedisOperation('get', durationSeconds, true);
          redisOperationsTotal.inc({ operation: 'get', status: 'success' });
          this.updateHitRate(true);
          return cached.value as T;
        } else {
          // Cache miss
          if (cached) {
            this.memoryCache.delete(key);
          }
          recordRedisOperation('get', durationSeconds, true);
          redisOperationsTotal.inc({ operation: 'get', status: 'success' });
          this.updateHitRate(false);
          return null;
        }
      }
    } catch (error) {
      const durationSeconds = (Date.now() - startTime) / 1000;
      const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
      recordRedisOperation('get', durationSeconds, false);
      redisOperationsTotal.inc({ operation: 'get', status: 'error' });
      redisErrorsTotal.inc({ error_type: errorType });
      console.error('Erro ao obter do cache:', error);
      return null;
    }
  }

  // Contadores para calcular hit rate
  private hitCount = 0;
  private missCount = 0;

  /**
   * Atualiza taxa de hit/miss
   */
  private updateHitRate(isHit: boolean): void {
    if (isHit) {
      this.hitCount++;
    } else {
      this.missCount++;
    }

    const total = this.hitCount + this.missCount;
    if (total > 0) {
      const hitRate = this.hitCount / total;
      const missRate = this.missCount / total;
      redisHitRate.set(hitRate);
      redisMissRate.set(missRate);
    }
  }

  /**
   * Salvar valor no cache
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    const startTime = Date.now();
    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.setex(key, ttl, JSON.stringify(value));
        const durationSeconds = (Date.now() - startTime) / 1000;
        recordRedisOperation('set', durationSeconds, true);
        redisOperationsTotal.inc({ operation: 'set', status: 'success' });
        this.updateRedisMetrics();
        return true;
      } else {
        // Fallback para cache em memória
        this.memoryCache.set(key, {
          value,
          expires: Date.now() + ttl * 1000,
        });
        const durationSeconds = (Date.now() - startTime) / 1000;
        recordRedisOperation('set', durationSeconds, true);
        redisOperationsTotal.inc({ operation: 'set', status: 'success' });
        return true;
      }
    } catch (error) {
      const durationSeconds = (Date.now() - startTime) / 1000;
      const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
      recordRedisOperation('set', durationSeconds, false);
      redisOperationsTotal.inc({ operation: 'set', status: 'error' });
      redisErrorsTotal.inc({ error_type: errorType });
      console.error('Erro ao salvar no cache:', error);
      return false;
    }
  }

  /**
   * Deletar do cache
   */
  async delete(key: string): Promise<boolean> {
    const startTime = Date.now();
    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.del(key);
        const durationSeconds = (Date.now() - startTime) / 1000;
        recordRedisOperation('del', durationSeconds, true);
        redisOperationsTotal.inc({ operation: 'del', status: 'success' });
        this.updateRedisMetrics();
        return true;
      } else {
        this.memoryCache.delete(key);
        const durationSeconds = (Date.now() - startTime) / 1000;
        recordRedisOperation('del', durationSeconds, true);
        redisOperationsTotal.inc({ operation: 'del', status: 'success' });
        return true;
      }
    } catch (error) {
      const durationSeconds = (Date.now() - startTime) / 1000;
      const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
      recordRedisOperation('del', durationSeconds, false);
      redisOperationsTotal.inc({ operation: 'del', status: 'error' });
      redisErrorsTotal.inc({ error_type: errorType });
      console.error('Erro ao deletar do cache:', error);
      return false;
    }
  }

  /**
   * Deletar múltiplas keys por padrão
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          // Usar pipeline para melhor performance
          const pipeline = this.redisClient.pipeline();
          keys.forEach((key: string) => pipeline.del(key));
          await pipeline.exec();
          return keys.length;
        }
        return 0;
      } else {
        // Fallback para cache em memória
        let deleted = 0;
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern)) {
            this.memoryCache.delete(key);
            deleted++;
          }
        }
        return deleted;
      }
    } catch (error) {
      console.error('Erro ao deletar padrão do cache:', error);
      return 0;
    }
  }

  /**
   * Limpar todo o cache
   */
  async clear(): Promise<boolean> {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.flushdb();
        return true;
      } else {
        this.memoryCache.clear();
        return true;
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  }

  /**
   * Verificar se key existe
   */
  async exists(key: string): Promise<boolean> {
    const startTime = Date.now();
    try {
      if (this.isRedisAvailable && this.redisClient) {
        const result = await this.redisClient.exists(key);
        const durationSeconds = (Date.now() - startTime) / 1000;
        recordRedisOperation('exists', durationSeconds, true);
        redisOperationsTotal.inc({ operation: 'exists', status: 'success' });
        return result === 1;
      } else {
        const cached = this.memoryCache.get(key);
        const durationSeconds = (Date.now() - startTime) / 1000;
        recordRedisOperation('exists', durationSeconds, true);
        redisOperationsTotal.inc({ operation: 'exists', status: 'success' });
        return cached ? cached.expires > Date.now() : false;
      }
    } catch (error) {
      const durationSeconds = (Date.now() - startTime) / 1000;
      const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
      recordRedisOperation('exists', durationSeconds, false);
      redisOperationsTotal.inc({ operation: 'exists', status: 'error' });
      redisErrorsTotal.inc({ error_type: errorType });
      console.error('Erro ao verificar existência no cache:', error);
      return false;
    }
  }

  /**
   * Atualiza métricas do Redis (memória, chaves)
   */
  private async updateRedisMetrics(): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        // Obter informações do Redis
        const info = await this.redisClient.info('memory');
        const keyspace = await this.redisClient.info('keyspace');
        
        // Extrair memória usada (em bytes)
        const memoryMatch = info.match(/used_memory:(\d+)/);
        if (memoryMatch) {
          redisMemoryUsedBytes.set(parseInt(memoryMatch[1]));
        }

        // Contar chaves
        const dbMatch = keyspace.match(/keys=(\d+)/);
        if (dbMatch) {
          redisKeysTotal.set(parseInt(dbMatch[1]));
        } else {
          // Fallback: contar todas as chaves (pode ser lento)
          const keys = await this.redisClient.keys('*');
          redisKeysTotal.set(keys.length);
        }
      } else {
        // Para cache em memória, usar tamanho do Map
        redisKeysTotal.set(this.memoryCache.size);
        // Estimativa de memória (aproximada)
        const estimatedMemory = this.memoryCache.size * 1024; // ~1KB por entrada
        redisMemoryUsedBytes.set(estimatedMemory);
      }
    } catch (error) {
      // Ignorar erros ao atualizar métricas
      console.warn('⚠️ Erro ao atualizar métricas do Redis:', error);
    }
  }

  /**
   * Obter ou calcular (cache-aside pattern)
   */
  async getOrSet<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Limpar cache em memória periodicamente
   */
  private startMemoryCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.memoryCache.entries()) {
        if (cached.expires <= now) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000); // Limpar a cada minuto
  }

  constructor() {
    this.initializeRedis();
    this.startMemoryCacheCleanup();
    
    // Atualizar métricas periodicamente
    setInterval(() => {
      this.updateRedisMetrics();
    }, 30000); // A cada 30 segundos
  }
}

// Singleton
export const redisCache = new RedisCacheService();

// Exportar funções de conveniência
export const cacheGet = <T = any>(key: string) => redisCache.get<T>(key);
export const cacheSet = (key: string, value: any, ttl?: number) => redisCache.set(key, value, ttl);
export const cacheDelete = (key: string) => redisCache.delete(key);
export const cacheClear = () => redisCache.clear();
export const cacheExists = (key: string) => redisCache.exists(key);
export const cacheGetOrSet = <T = any>(key: string, fetcher: () => Promise<T>, ttl?: number) =>
  redisCache.getOrSet<T>(key, fetcher, ttl);

