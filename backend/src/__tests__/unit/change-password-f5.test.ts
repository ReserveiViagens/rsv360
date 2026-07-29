/**
 * F5 — change-password validation (no secrets in assertions).
 */
describe('change-password.service (F5)', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
    jest.clearAllMocks();
  });

  function loadService(queryImpl: jest.Mock) {
    jest.doMock('../../api/v1/auth/refresh-token.service', () => ({
      isDbRefreshEnabled: () => true,
      queryDatabase: queryImpl,
      revokeAllUserTokens: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock('../../api/v1/auth/two-factor.service', () => ({
      verifyEnabledTotp: jest.fn().mockResolvedValue({ ok: true }),
    }));
    return require('../../api/v1/auth/change-password.service');
  }

  it('rejects missing fields', async () => {
    const svc = loadService(jest.fn());
    const result = await svc.changePasswordWithTotp({});
    expect(result.error).toBe('validation');
    expect(result.status).toBe(400);
  });

  it('rejects short new password', async () => {
    const svc = loadService(jest.fn());
    const result = await svc.changePasswordWithTotp({
      email: 'admin@example.com',
      current_password: 'old-password-ok',
      new_password: 'short',
      totp_code: '123456',
    });
    expect(result.error).toBe('validation');
    expect(result.message).toMatch(/8/);
  });

  it('rejects confirmation mismatch', async () => {
    const svc = loadService(jest.fn());
    const result = await svc.changePasswordWithTotp({
      email: 'admin@example.com',
      current_password: 'old-password-ok',
      new_password: 'new-password-ok',
      password_confirmation: 'different-password',
      totp_code: '123456',
    });
    expect(result.error).toBe('validation');
    expect(result.message).toMatch(/Confirmação/i);
  });

  it('returns generic invalid_credentials when user missing', async () => {
    const query = jest.fn().mockResolvedValue([]);
    const svc = loadService(query);
    const result = await svc.changePasswordWithTotp({
      email: 'missing@example.com',
      current_password: 'old-password-ok',
      new_password: 'new-password-ok',
      totp_code: '123456',
    });
    expect(result.status).toBe(401);
    expect(result.message).toMatch(/Credenciais/i);
    expect(JSON.stringify(result)).not.toMatch(/password|totp|secret/i);
  });
});
