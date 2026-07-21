/**
 * PR-04a — Next.js boot assert (fail-closed JWT_SECRET).
 * Runs on server runtime only.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertJwtSecretsConfigured } = await import('@rsv360/shared');
    assertJwtSecretsConfigured();
  }
}
