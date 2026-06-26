/** Fecha pools/conexões abertos pelos testes do hub (evita Jest pendurado sem --forceExit). */
export default async function globalTeardown(): Promise<void> {
  const safe = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch {
      /* ignore */
    }
  };

  await safe(async () => {
    const { closeReservasQueue } = await import(
      '../../../server/modules/fornecedores-hub/reservas.queue'
    );
    await closeReservasQueue();
  });

  await safe(async () => {
    const { disconnectRedisConnection } = await import(
      '../../../server/modules/fornecedores-hub/redis-connection'
    );
    await disconnectRedisConnection();
  });

  await safe(async () => {
    const { disconnectRedisCache } = await import(
      '../../../server/modules/fornecedores-hub/cache'
    );
    await disconnectRedisCache();
  });

  await safe(async () => {
    const { closeDbPool } = await import('../db/drizzle');
    await closeDbPool();
  });
}
