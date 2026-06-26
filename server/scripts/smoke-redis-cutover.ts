/**
 * Smoke pós-cutover Redis — cache (PR 4), lock (PR 5) e conexão BullMQ.
 * Uso: REDIS_URL definido; REDIS_DISABLED ausente ou ≠ true.
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { adquirirLock, liberarLock } from '../modules/fornecedores-hub/lock';
import { disconnectRedisConnection } from '../modules/fornecedores-hub/redis-connection';
import { disconnectRedisCache } from '../modules/fornecedores-hub/cache';

type Step = { name: string; ok: boolean; detail?: string };

function log(s: Step) {
  console.log(`[${s.ok ? 'PASS' : 'FAIL'}] ${s.name}${s.detail ? ` — ${s.detail}` : ''}`);
}

async function main() {
  const steps: Step[] = [];

  if (process.env.REDIS_DISABLED === 'true') {
    console.error('[FAIL] REDIS_DISABLED=true — remova antes do cutover de produção');
    process.exit(1);
  }
  if (!process.env.REDIS_URL) {
    console.error('[FAIL] REDIS_URL ausente');
    process.exit(1);
  }

  steps.push({
    name: 'REDIS_URL configurado',
    ok: true,
    detail: process.env.REDIS_URL.replace(/:[^:@]+@/, ':***@'),
  });

  try {
    const { createBullMQConnection } = await import('../modules/fornecedores-hub/redis-connection');
    const conn = await createBullMQConnection();
    const pong = await conn.ping();
    steps.push({ name: 'PING Redis (BullMQ)', ok: pong === 'PONG', detail: pong });
    await conn.quit();
  } catch (e) {
    steps.push({ name: 'PING Redis (BullMQ)', ok: false, detail: (e as Error).message });
  }

  const chave = `smoke:${randomUUID()}`;
  const reservaId = randomUUID();
  try {
    const locked = await adquirirLock(chave, reservaId);
    const dup = await adquirirLock(chave, randomUUID());
    const released = await liberarLock(chave, reservaId);
    steps.push({
      name: 'Lock NX + conflito + release Lua',
      ok: locked === true && dup === false && released === true,
      detail: `lock=${locked} dup=${dup} release=${released}`,
    });
  } catch (e) {
    steps.push({ name: 'Lock NX + conflito + release Lua', ok: false, detail: (e as Error).message });
  }

  try {
    const { gravarRedis, lerRedis, apagarRedis } = await import('../modules/fornecedores-hub/cache');
    const key = `smoke:cache:${Date.now()}`;
    const ofertas = [
      {
        fornecedor: 'smoke',
        tipo: 'hospedagem' as const,
        titulo: 'Teste',
        preco: 100,
        moeda: 'BRL' as const,
        imagens: [],
        descricao: '',
        fonte: 'https://example.com',
        capturadoEm: new Date().toISOString(),
      },
    ];
    await gravarRedis(key, ofertas);
    const hit = await lerRedis(key);
    await apagarRedis(key);
    steps.push({
      name: 'Cache gravar/ler/apagar',
      ok: hit?.length === 1 && hit[0].preco === 100,
      detail: `items=${hit?.length ?? 0}`,
    });
  } catch (e) {
    steps.push({ name: 'Cache gravar/ler/apagar', ok: false, detail: (e as Error).message });
  }

  console.log('\n=== Smoke Redis cutover (PR 4 + PR 5) ===\n');
  for (const s of steps) log(s);

  await disconnectRedisConnection().catch(() => undefined);
  await disconnectRedisCache().catch(() => undefined);

  const failed = steps.filter((s) => !s.ok);
  console.log(`\nResumo: ${steps.length - failed.length}/${steps.length} PASS`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
