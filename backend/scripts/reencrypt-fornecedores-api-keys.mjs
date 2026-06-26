/**
 * Re-criptografa api_key em texto plano na tabela fornecedores_api.
 * Uso: FORNECEDORES_ENCRYPTION_KEY=... DATABASE_URL=... node scripts/reencrypt-fornecedores-api-keys.mjs
 */
import pg from 'pg';
import { createCipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12;
const KEY_BYTES = 32;
const SCRYPT_SALT = 'rsv360-fornecedores-api-v1';

function deriveKey(secret) {
  return scryptSync(secret, SCRYPT_SALT, KEY_BYTES);
}

function isEncrypted(value) {
  const parts = value.split(':');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

function encryptApiKey(plain, key) {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`;
}

const secret = process.env.FORNECEDORES_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
const url = process.env.DATABASE_URL;
if (!secret) {
  console.error('Defina FORNECEDORES_ENCRYPTION_KEY');
  process.exit(1);
}
if (!url) {
  console.error('Defina DATABASE_URL');
  process.exit(1);
}

const key = deriveKey(secret);
const client = new pg.Client({ connectionString: url });
await client.connect();

const { rows } = await client.query('SELECT id, api_key FROM fornecedores_api');
let updated = 0;
for (const row of rows) {
  if (isEncrypted(row.api_key)) continue;
  const encrypted = encryptApiKey(row.api_key, key);
  await client.query('UPDATE fornecedores_api SET api_key = $1 WHERE id = $2', [encrypted, row.id]);
  updated++;
}

await client.end();
console.log(`[reencrypt] ${updated}/${rows.length} linha(s) atualizada(s)`);
