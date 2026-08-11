/**
 * PR-13e-followup-e — best-effort Redis injection for LLM gateway budget.
 * Missing REDIS_URL / REDIS_DISABLED → leave gateway on in-memory budget (no throw).
 */

import type { LlmGatewayRedisLike } from '@rsv360/shared';

export function isLlmGatewayRedisConfigured(): boolean {
  return (
    process.env.REDIS_DISABLED !== 'true' &&
    Boolean(process.env.REDIS_URL && process.env.REDIS_URL.trim())
  );
}

/**
 * Connect ioredis from REDIS_URL and register with setLlmGatewayRedis.
 * Never throws — failures leave process-local budget intact.
 */
export async function wireLlmGatewayRedis(
  setRedis: (client: LlmGatewayRedisLike | null) => void,
): Promise<'redis' | 'memory'> {
  if (!isLlmGatewayRedisConfigured()) {
    setRedis(null);
    return 'memory';
  }

  try {
    const Redis = (await import('ioredis')).default;
    const client = new Redis(process.env.REDIS_URL!.trim(), {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 5_000,
    });
    await client.connect();
    setRedis(client as unknown as LlmGatewayRedisLike);
    return 'redis';
  } catch (err) {
    console.warn(
      '[llm-gateway] Redis wire skipped:',
      (err as Error)?.message || 'Error',
    );
    setRedis(null);
    return 'memory';
  }
}
