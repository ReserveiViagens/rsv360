const redis = require('redis');
// BullMQ será instalado separadamente se necessário
// const { Queue, Worker } = require('bullmq');
const logger = require('../utils/logger');

// Configuração do Redis
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    connectTimeout: 2000, // falha em 2s se Redis nao responder (evita delay no startup)
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times) => {
    if (times > 3) return null; // para de tentar apos 3 falhas
    return Math.min(times * 100, 1000);
  },
};

// Cliente Redis para cache
let redisClient = null;

// Cliente Redis para BullMQ (jobs)
let redisConnection = null;

// Conectar ao Redis
const connectRedis = async () => {
  try {
    // Cliente para cache
    redisClient = redis.createClient(redisConfig);

    // Limitar logs de erro (evita flood quando Redis nao esta rodando)
    let redisErrorCount = 0;
    redisClient.on('error', (err) => {
      redisErrorCount++;
      if (redisErrorCount <= 2) {
        logger.error('Redis Client Error:', err?.message || err);
      }
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client connecting...');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client connected successfully');
    });

    await redisClient.connect();

    // Cliente para BullMQ (jobs)
    redisConnection = {
      host: redisConfig.socket.host,
      port: redisConfig.socket.port,
      password: redisConfig.password,
      db: (redisConfig.database || 0) + 1, // DB diferente para jobs
    };

    return { redisClient, redisConnection };
  } catch (error) {
    // Encerrar cliente para parar reconexoes e novos erros
    if (redisClient) {
      try {
        redisClient.removeAllListeners?.('error');
        if (typeof redisClient.disconnect === 'function') {
          redisClient.disconnect();
        } else if (typeof redisClient.quit === 'function') {
          redisClient.quit().catch(() => {});
        }
      } catch (_) { /* ignora */ }
      redisClient = null;
    }
    redisConnection = null;
    logger.error('Redis connection failed:', error.message);
    throw error;
  }
};

// Desconectar do Redis
const disconnectRedis = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('📴 Redis Client disconnected');
    }
  } catch (error) {
    logger.error('❌ Error disconnecting Redis:', error.message);
  }
};

// Funções de cache
const cache = {
  // Obter valor do cache
  get: async (key) => {
    try {
      if (!redisClient || !redisClient.isReady) {
        return null;
      }
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error.message);
      return null;
    }
  },

  // Definir valor no cache
  set: async (key, value, ttl = 3600) => {
    try {
      if (!redisClient || !redisClient.isReady) {
        return false;
      }
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error.message);
      return false;
    }
  },

  // Deletar valor do cache
  delete: async (key) => {
    try {
      if (!redisClient || !redisClient.isReady) {
        return false;
      }
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error.message);
      return false;
    }
  },

  // Deletar múltiplas chaves por padrão
  deletePattern: async (pattern) => {
    try {
      if (!redisClient || !redisClient.isReady) {
        return false;
      }
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      logger.error(`Error deleting cache pattern ${pattern}:`, error.message);
      return false;
    }
  },
};

// Funções de locks temporários (para leilões - 5 minutos)
const locks = {
  // Criar lock temporário
  acquire: async (key, ttl = 300) => {
    try {
      if (!redisClient || !redisClient.isReady) {
        return false;
      }
      const lockKey = `lock:${key}`;
      const result = await redisClient.setNX(lockKey, '1');
      if (result) {
        await redisClient.expire(lockKey, ttl);
      }
      return result;
    } catch (error) {
      logger.error(`Error acquiring lock ${key}:`, error.message);
      return false;
    }
  },

  // Liberar lock
  release: async (key) => {
    try {
      if (!redisClient || !redisClient.isReady) {
        return false;
      }
      const lockKey = `lock:${key}`;
      await redisClient.del(lockKey);
      return true;
    } catch (error) {
      logger.error(`Error releasing lock ${key}:`, error.message);
      return false;
    }
  },

  // Verificar se lock existe
  exists: async (key) => {
    try {
      if (!redisClient || !redisClient.isReady) {
        return false;
      }
      const lockKey = `lock:${key}`;
      const result = await redisClient.exists(lockKey);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking lock ${key}:`, error.message);
      return false;
    }
  },
};

// Criar queue para jobs (requer bullmq instalado)
const createQueue = (queueName) => {
  try {
    const { Queue } = require('bullmq');
    if (!redisConnection) {
      throw new Error('Redis connection not initialized');
    }
    return new Queue(queueName, {
      connection: redisConnection,
    });
  } catch (error) {
    logger.warn('BullMQ not installed. Queue functionality disabled.');
    return null;
  }
};

// Criar worker para processar jobs (requer bullmq instalado)
const createWorker = (queueName, processor) => {
  try {
    const { Worker } = require('bullmq');
    if (!redisConnection) {
      throw new Error('Redis connection not initialized');
    }
    return new Worker(queueName, processor, {
      connection: redisConnection,
      concurrency: 5,
    });
  } catch (error) {
    logger.warn('BullMQ not installed. Worker functionality disabled.');
    return null;
  }
};

// Health check do Redis
const checkRedisHealth = async () => {
  try {
    if (!redisClient || !redisClient.isReady) {
      return {
        status: 'unhealthy',
        error: 'Redis client not connected',
        connection: 'failed',
      };
    }
    const result = await redisClient.ping();
    return {
      status: result === 'PONG' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      connection: 'active',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      connection: 'failed',
    };
  }
};

module.exports = {
  connectRedis,
  disconnectRedis,
  cache,
  locks,
  createQueue,
  createWorker,
  checkRedisHealth,
  getRedisClient: () => redisClient,
  getRedisConnection: () => redisConnection,
};
