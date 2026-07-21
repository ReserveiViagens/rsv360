/**
 * Shared helper for one-off DB scripts. Never hardcode passwords.
 * Prefer DB_PASSWORD, then POSTGRES_PASSWORD.
 */
function requireDbPassword() {
  const password = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD;
  if (!password) {
    console.error(
      '[scripts] Missing DB_PASSWORD or POSTGRES_PASSWORD. Set it in .env — never hardcode credentials.',
    );
    process.exit(1);
  }
  return password;
}

module.exports = { requireDbPassword };
