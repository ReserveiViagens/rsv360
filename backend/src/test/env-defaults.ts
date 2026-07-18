/** Defaults locais para Jest — rodam em setupFiles, antes dos imports dos testes. */
process.env.DATABASE_URL ??=
  'postgresql://rsv360:rsv360_dev_2024@127.0.0.1:5433/rsv_360_ecosystem';
process.env.REDIS_URL ??= 'redis://127.0.0.1:6379';
process.env.FORNECEDORES_ENCRYPTION_KEY ??=
  'integration-test-key-32-chars-min!!';
