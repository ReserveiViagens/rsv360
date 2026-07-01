const originalFetch = global.fetch;

describe('verificarTurnstile', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.TURNSTILE_SECRET_KEY;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('bypass em dev quando secret ausente', async () => {
    process.env.NODE_ENV = 'development';
    const { verificarTurnstile } = await import('../../../../server/lib/turnstile');
    const result = await verificarTurnstile(undefined);
    expect(result.ok).toBe(true);
  });

  it('rejeita token ausente quando secret configurado', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret';
    const { verificarTurnstile } = await import('../../../../server/lib/turnstile');
    const result = await verificarTurnstile('');
    expect(result.ok).toBe(false);
  });

  it('aceita resposta success do siteverify', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret';
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true }),
    });
    const { verificarTurnstile } = await import('../../../../server/lib/turnstile');
    const result = await verificarTurnstile('valid-turnstile-token-12345');
    expect(result.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalled();
  });

  it('rejeita resposta failure do siteverify', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret';
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    });
    const { verificarTurnstile } = await import('../../../../server/lib/turnstile');
    const result = await verificarTurnstile('bad-token-123456789');
    expect(result.ok).toBe(false);
  });
});
