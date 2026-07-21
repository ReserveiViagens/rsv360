/**
 * PR-04a — centralized JWT secrets (fail-closed).
 * No defaults. Refresh inherits JWT_SECRET until PR-04b separates them.
 */

export const JWT_HS256_ALGORITHMS: ['HS256'] = ['HS256'];

export type JwtHs256VerifyOptions = {
  algorithms: ['HS256'];
};

/** Options for jsonwebtoken.verify — pin HS256 only. */
export const JWT_HS256_VERIFY_OPTIONS: JwtHs256VerifyOptions = {
  algorithms: JWT_HS256_ALGORITHMS,
};

export class JwtSecretMissingError extends Error {
  readonly code = 'JWT_SECRET_MISSING';

  constructor(message = 'JWT_SECRET is required (fail-closed). Set it in the environment.') {
    super(message);
    this.name = 'JwtSecretMissingError';
  }
}

type EnvLike = Record<string, string | undefined>;

function readNonEmpty(env: EnvLike, key: string): string | undefined {
  const raw = env[key];
  if (raw == null) return undefined;
  const trimmed = String(raw).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Access-token HMAC secret. Throws if unset/empty. */
export function getJwtSecret(env: EnvLike = process.env): string {
  const secret = readNonEmpty(env, 'JWT_SECRET');
  if (!secret) {
    throw new JwtSecretMissingError();
  }
  return secret;
}

/**
 * Refresh-token HMAC secret.
 * If JWT_REFRESH_SECRET is absent, inherits JWT_SECRET explicitly (PR-04a).
 * Real separation / rotation → PR-04b.
 */
export function getJwtRefreshSecret(env: EnvLike = process.env): string {
  const refresh = readNonEmpty(env, 'JWT_REFRESH_SECRET');
  if (refresh) return refresh;
  return getJwtSecret(env);
}

/** Boot-time assert — call before listen / Next register. */
export function assertJwtSecretsConfigured(env: EnvLike = process.env): void {
  getJwtSecret(env);
}
