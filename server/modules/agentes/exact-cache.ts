import { createHash } from 'crypto';
import type Redis from 'ioredis';
import { getRedisConnection } from '../fornecedores-hub/redis-connection';

const REDIS_PREFIX = 'rsv360:agentes:exact:';

type MemoryEntry = { payload: string; expiresAt: number };

let redisClient: Redis | null | undefined;
const memoryStore = new Map<string, MemoryEntry>();

function isRedisDisabled(): boolean {
  return process.env.REDIS_DISABLED === 'true' || !process.env.REDIS_URL;
}

async function getClient(): Promise<Redis | null> {
  if (redisClient !== undefined) return redisClient;
  if (isRedisDisabled()) {
    redisClient = null;
    return null;
  }
  try {
    redisClient = await getRedisConnection();
    return redisClient;
  } catch {
    redisClient = null;
    return null;
  }
}

export function assertTtlSeconds(ttlSeconds: number): void {
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error('TTL obrigatório: ttlSeconds deve ser número > 0');
  }
}

export function hashEntrada(entrada: string): string {
  return createHash('sha256').update(entrada).digest('hex');
}

export function buildExactCacheKey(agente: string, entradaHash: string): string {
  const a = agente.trim().toLowerCase() || 'default';
  return `${REDIS_PREFIX}${a}:${entradaHash}`;
}

/** GET — null se miss ou expirado. */
export async function getExactCache(agente: string, entradaHash: string): Promise<string | null> {
  const key = buildExactCacheKey(agente, entradaHash);
  const client = await getClient();

  if (client) {
    return client.get(key);
  }

  const entry = memoryStore.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.payload;
}

/**
 * SET com TTL obrigatório (erro se TTL ausente/≤0).
 * Prefixo: rsv360:agentes:exact:<agente>:<sha256>
 */
export async function setExactCache(
  agente: string,
  entradaHash: string,
  value: string,
  ttlSeconds: number,
): Promise<void> {
  assertTtlSeconds(ttlSeconds);
  const key = buildExactCacheKey(agente, entradaHash);
  const client = await getClient();

  if (client) {
    await client.setex(key, Math.floor(ttlSeconds), value);
    return;
  }

  memoryStore.set(key, {
    payload: value,
    expiresAt: Date.now() + Math.floor(ttlSeconds) * 1000,
  });
}

/** Só para testes unitários. */
export function __resetExactCacheForTests(): void {
  memoryStore.clear();
  redisClient = undefined;
}
