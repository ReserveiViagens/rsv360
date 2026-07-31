/**
 * E2E credentials — never hardcode passwords in specs.
 * Align with backend seed: SEED_TEST_USER_EMAIL / SEED_TEST_USER_PASSWORD
 * (see docs/evidence/turismo-auth-t1/README.md).
 */
export function getE2EAuthCredentials(): { email: string; password: string } | null {
  const email = process.env.E2E_AUTH_EMAIL?.trim();
  const password = process.env.E2E_AUTH_PASSWORD;
  if (!email || !password) {
    return null;
  }
  return { email, password };
}

export function requireE2EAuthCredentials(
  test: { skip: (condition?: boolean, description?: string) => void }
): { email: string; password: string } {
  const creds = getE2EAuthCredentials();
  if (!creds) {
    test.skip(
      true,
      'SKIP: set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD (seed via SEED_TEST_USER_* on backend)'
    );
    return { email: '', password: '' };
  }
  return creds;
}
