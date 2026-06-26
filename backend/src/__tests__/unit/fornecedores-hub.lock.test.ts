import { randomUUID } from 'node:crypto';
import {
  adquirirLock,
  liberarLock,
} from '../../../../server/modules/fornecedores-hub/lock';
import {
  disconnectRedisConnection,
  isRedisRequiredForLocks,
} from '../../../../server/modules/fornecedores-hub/redis-connection';

const redisOk = isRedisRequiredForLocks();

describe('fornecedores-hub — lock (Redis real)', () => {
  afterAll(async () => {
    await disconnectRedisConnection();
  });

  beforeAll(() => {
    if (!redisOk) {
      console.warn('[lock.test] Pulando — defina REDIS_URL e REDIS_DISABLED≠true');
    }
  });

  it('apenas um adquirirLock simultâneo vence a corrida', async () => {
    if (!redisOk) return;

    const chaveVaga = `test-race-${randomUUID()}`;
    const idA = randomUUID();
    const idB = randomUUID();

    const [a, b] = await Promise.all([
      adquirirLock(chaveVaga, idA),
      adquirirLock(chaveVaga, idB),
    ]);

    expect([a, b].filter(Boolean)).toHaveLength(1);

    const winner = a ? idA : idB;
    await liberarLock(chaveVaga, winner);
  });

  it('liberarLock só apaga se GET == reservaId (dono)', async () => {
    if (!redisOk) return;

    const chaveVaga = `test-owner-${randomUUID()}`;
    const dono = randomUUID();
    const intruso = randomUUID();

    expect(await adquirirLock(chaveVaga, dono)).toBe(true);
    expect(await liberarLock(chaveVaga, intruso)).toBe(false);
    expect(await adquirirLock(chaveVaga, intruso)).toBe(false);
    expect(await liberarLock(chaveVaga, dono)).toBe(true);
    expect(await adquirirLock(chaveVaga, intruso)).toBe(true);
    await liberarLock(chaveVaga, intruso);
  });
});
