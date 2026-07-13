process.env.REDIS_DISABLED = 'true';
delete process.env.REDIS_URL;

import {
  __resetExactCacheForTests,
  assertTtlSeconds,
  buildExactCacheKey,
  getExactCache,
  hashEntrada,
  setExactCache,
} from '../../../../server/modules/agentes/exact-cache';

describe('Agentes — exact-cache TTL obrigatório', () => {
  beforeEach(() => {
    __resetExactCacheForTests();
    process.env.REDIS_DISABLED = 'true';
    delete process.env.REDIS_URL;
  });

  it('assertTtlSeconds rejeita TTL ausente/≤0', () => {
    expect(() => assertTtlSeconds(0)).toThrow(/TTL obrigatório/);
    expect(() => assertTtlSeconds(-1)).toThrow(/TTL obrigatório/);
    expect(() => assertTtlSeconds(Number.NaN)).toThrow(/TTL obrigatório/);
    expect(() => assertTtlSeconds(60)).not.toThrow();
  });

  it('setExactCache sem TTL válido lança erro', async () => {
    const hash = hashEntrada('ping');
    await expect(setExactCache('instrutor', hash, '{"ok":true}', 0)).rejects.toThrow(
      /TTL obrigatório/,
    );
  });

  it('set/get com TTL grava e lê no store em memória', async () => {
    const hash = hashEntrada('como publico unidade');
    await setExactCache('instrutor', hash, '{"answer":"guia"}', 120);
    const hit = await getExactCache('instrutor', hash);
    expect(hit).toBe('{"answer":"guia"}');
    expect(buildExactCacheKey('instrutor', hash)).toBe(
      `rsv360:agentes:exact:instrutor:${hash}`,
    );
  });

  it('miss retorna null', async () => {
    await expect(getExactCache('instrutor', hashEntrada('absent'))).resolves.toBeNull();
  });
});
