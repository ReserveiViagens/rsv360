import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12;
const KEY_BYTES = 32;
const SCRYPT_SALT = 'rsv360-fornecedores-api-v1';

const ENCRYPTED_PARTS = 3;

function deriveKey(): Buffer {
  const secret = process.env.FORNECEDORES_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('FORNECEDORES_ENCRYPTION_KEY (ou ENCRYPTION_KEY) não configurada');
  }
  return scryptSync(secret, SCRYPT_SALT, KEY_BYTES);
}

/** Formato persistido: `iv:authTag:ciphertext` (base64). */
export function isEncryptedApiKey(value: string): boolean {
  const parts = value.split(':');
  return parts.length === ENCRYPTED_PARTS && parts.every((p) => p.length > 0);
}

export function encryptApiKey(plain: string): string {
  const key = deriveKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`;
}

export function decryptApiKey(stored: string): string {
  if (!isEncryptedApiKey(stored)) {
    if (process.env.FORNECEDORES_ALLOW_PLAINTEXT_API_KEY === 'true') {
      return stored;
    }
    throw new Error(
      'api_key não está criptografada — execute migração ou defina FORNECEDORES_ALLOW_PLAINTEXT_API_KEY=true temporariamente',
    );
  }

  const [ivB64, tagB64, dataB64] = stored.split(':');
  const key = deriveKey();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]);
  return plain.toString('utf8');
}
