import type Redis from 'ioredis';

let sharedClient: Redis | null | undefined;

export function isRedisRequiredForLocks(): boolean {
  return process.env.REDIS_DISABLED !== 'true' && Boolean(process.env.REDIS_URL);
}

/** Cliente Redis dedicado a locks/BullMQ — exige REDIS_URL (sem fallback em memória). */
export async function getRedisConnection(): Promise<Redis> {
  if (sharedClient) {
    return sharedClient;
  }
  if (!isRedisRequiredForLocks()) {
    throw new Error(
      'Redis obrigatório para locks de vaga (defina REDIS_URL e não use REDIS_DISABLED=true)',
    );
  }
  const IORedis = (await import('ioredis')).default;
  const client = new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 5_000,
  });
  await client.connect();
  sharedClient = client;
  return client;
}

/** BullMQ reutiliza a mesma URL; conexão separada evita conflito com comandos do cache hub. */
export async function createBullMQConnection(): Promise<Redis> {
  const IORedis = (await import('ioredis')).default;
  if (!isRedisRequiredForLocks()) {
    throw new Error('Redis obrigatório para fila reservas (REDIS_URL)');
  }
  const client = new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 5_000,
  });
  await client.connect();
  return client;
}

export async function disconnectRedisConnection(): Promise<void> {
  if (sharedClient) {
    await sharedClient.quit();
  }
  sharedClient = undefined;
}
