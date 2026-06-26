import { encryptApiKey, decryptApiKey, isEncryptedApiKey } from '../../../../server/modules/fornecedores-hub/crypto';

describe('fornecedores-hub — crypto', () => {
  const prevKey = process.env.FORNECEDORES_ENCRYPTION_KEY;
  const prevPlain = process.env.FORNECEDORES_ALLOW_PLAINTEXT_API_KEY;

  beforeAll(() => {
    process.env.FORNECEDORES_ENCRYPTION_KEY = 'test-key-pr3-min-32-chars-long!!';
    delete process.env.FORNECEDORES_ALLOW_PLAINTEXT_API_KEY;
  });

  afterAll(() => {
    if (prevKey === undefined) delete process.env.FORNECEDORES_ENCRYPTION_KEY;
    else process.env.FORNECEDORES_ENCRYPTION_KEY = prevKey;
    if (prevPlain === undefined) delete process.env.FORNECEDORES_ALLOW_PLAINTEXT_API_KEY;
    else process.env.FORNECEDORES_ALLOW_PLAINTEXT_API_KEY = prevPlain;
  });

  it('criptografa e descriptografa apiKey (AES-256-GCM)', () => {
    const plain = 'sk_live_super_secret_123';
    const stored = encryptApiKey(plain);
    expect(isEncryptedApiKey(stored)).toBe(true);
    expect(stored).not.toContain(plain);
    expect(decryptApiKey(stored)).toBe(plain);
  });

  it('rejeita plaintext sem flag de migração', () => {
    expect(() => decryptApiKey('plaintext-key')).toThrow(/não está criptografada/);
  });

  it('aceita plaintext com FORNECEDORES_ALLOW_PLAINTEXT_API_KEY', () => {
    process.env.FORNECEDORES_ALLOW_PLAINTEXT_API_KEY = 'true';
    expect(decryptApiKey('legacy-plain')).toBe('legacy-plain');
    delete process.env.FORNECEDORES_ALLOW_PLAINTEXT_API_KEY;
  });
});
