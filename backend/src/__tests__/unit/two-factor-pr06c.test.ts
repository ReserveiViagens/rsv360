/**
 * PR-06c — TOTP anti-replay (unit, mocked otplib + DB).
 */
jest.mock('otplib', () => ({
  generateSecret: () => 'TESTSECRET',
  generateSync: () => '123456',
  verify: async () => ({ valid: true, delta: 0 }),
  generateURI: () => 'otpauth://totp/test',
}));

jest.mock('qrcode', () => ({
  toDataURL: async () => 'data:image/png;base64,AAAA',
}));

jest.mock('../../api/v1/auth/two-factor-crypto', () => ({
  encryptSecret: (s: string) => `enc:${s}`,
  decryptSecret: (s: string) => String(s).replace(/^enc:/, ''),
}));

describe('two-factor anti-replay (PR-06c)', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('assertTotpNotReplayed rejects same step twice', async () => {
    process.env.DATABASE_URL = 'postgres://test';
    const rows: { last_totp_step: number | null } = { last_totp_step: null };

    jest.doMock('../../api/v1/auth/refresh-token.service', () => ({
      isDbRefreshEnabled: () => true,
      queryDatabase: jest.fn(async (sql: string) => {
        if (String(sql).includes('SELECT * FROM user_2fa')) {
          return [{ ...rows, user_id: 1, enabled_at: new Date().toISOString() }];
        }
        if (String(sql).includes('last_totp_step')) {
          rows.last_totp_step = 12345;
          return [];
        }
        return [];
      }),
    }));

    jest.doMock('../../api/v1/auth/login.service', () => ({
      issueLoginTokens: jest.fn(),
      comparePassword: jest.fn(),
      getStoredPasswordHash: jest.fn(),
    }));

    const { assertTotpNotReplayed } = require('../../api/v1/auth/two-factor.service');
    await expect(assertTotpNotReplayed(1, 12345)).resolves.toBe(true);
    await expect(assertTotpNotReplayed(1, 12345)).resolves.toBe(false);
  });
});
