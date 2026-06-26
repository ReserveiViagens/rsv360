import { getRedisConnection } from './redis-connection';

/** TTL do lock de vaga — 10 minutos. */
export const LOCK_TTL_SECONDS = 600;

const LOCK_PREFIX = 'rsv360:lock:vaga:';

const RELEASE_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

export class ConflictError extends Error {
  readonly statusCode = 409;

  constructor(message = 'Vaga indisponível — lock ativo') {
    super(message);
    this.name = 'ConflictError';
  }
}

function lockKey(chaveVaga: string): string {
  return `${LOCK_PREFIX}${chaveVaga}`;
}

/**
 * Aquisição atômica via SET NX EX (um round-trip).
 * Lua reservado para liberarLock — evita job atrasado liberar lock de outro dono.
 */
export async function adquirirLock(chaveVaga: string, reservaId: string): Promise<boolean> {
  const redis = await getRedisConnection();
  const result = await redis.set(lockKey(chaveVaga), reservaId, 'EX', LOCK_TTL_SECONDS, 'NX');
  return result === 'OK';
}

/** Libera somente se o valor atual for igual a reservaId (compare-and-delete). */
export async function liberarLock(chaveVaga: string, reservaId: string): Promise<boolean> {
  const redis = await getRedisConnection();
  const released = await redis.eval(RELEASE_LUA, 1, lockKey(chaveVaga), reservaId);
  return Number(released) === 1;
}

export function chaveVagaFromOferta(parceiroId: string, ofertaId: string): string {
  return `${parceiroId}:${ofertaId}`;
}
