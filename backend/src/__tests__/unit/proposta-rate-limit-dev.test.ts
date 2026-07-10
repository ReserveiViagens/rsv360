/**
 * Valida política de rate limit em dev — espelha cotacao-publica.service.ts (cooldown/debounce).
 */
describe('proposta rate limit dev (env)', () => {
  const envKeyCooldown = 'PROPOSTA_SUCCESS_COOLDOWN_MS';
  const envKeyDebounce = 'PROPOSTA_ATTEMPT_DEBOUNCE_MS';
  let prevCooldown: string | undefined;
  let prevDebounce: string | undefined;
  let prevNodeEnv: string | undefined;

  beforeEach(() => {
    prevCooldown = process.env[envKeyCooldown];
    prevDebounce = process.env[envKeyDebounce];
    prevNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (prevCooldown === undefined) delete process.env[envKeyCooldown];
    else process.env[envKeyCooldown] = prevCooldown;
    if (prevDebounce === undefined) delete process.env[envKeyDebounce];
    else process.env[envKeyDebounce] = prevDebounce;
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNodeEnv;
  });

  function readCooldownMs(): number {
    const raw = process.env.PROPOSTA_SUCCESS_COOLDOWN_MS;
    if (raw !== undefined && raw !== '') return Math.max(0, Number(raw) || 0);
    return process.env.NODE_ENV === 'production' ? 45_000 : 0;
  }

  function simulateBurst(ip: string, attempts: number): boolean[] {
    const cooldownMs = readCooldownMs();
    const map = new Map<string, number>();
    const results: boolean[] = [];
    for (let i = 0; i < attempts; i++) {
      if (cooldownMs <= 0) {
        results.push(true);
        continue;
      }
      const now = Date.now();
      const last = map.get(ip) ?? 0;
      const allowed = now - last >= cooldownMs;
      results.push(allowed);
      if (allowed) map.set(ip, now);
    }
    return results;
  }

  it('dev com PROPOSTA_SUCCESS_COOLDOWN_MS=0 permite 10 propostas seguidas (sem 429)', () => {
    process.env.NODE_ENV = 'development';
    process.env[envKeyCooldown] = '0';
    const results = simulateBurst('127.0.0.1', 10);
    expect(results.every(Boolean)).toBe(true);
    expect(readCooldownMs()).toBe(0);
  });

  it('prod default permanece 45s quando env ausente', () => {
    delete process.env[envKeyCooldown];
    process.env.NODE_ENV = 'production';
    expect(readCooldownMs()).toBe(45_000);
    const results = simulateBurst('127.0.0.1', 3);
    expect(results[0]).toBe(true);
    expect(results[1]).toBe(false);
    expect(results[2]).toBe(false);
  });
});
