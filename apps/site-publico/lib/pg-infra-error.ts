/** Erros de infraestrutura Postgres/rede — login deve retornar 503, nao 500. */
export function isPostgresInfrastructureError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string })?.code ?? '';

  const infraCodes = new Set([
    '28P01', // invalid_password
    '3D000', // invalid_catalog_name (database does not exist)
    '57P03', // cannot_connect_now
    '53300', // too_many_connections
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
  ]);

  if (infraCodes.has(code)) return true;

  return (
    /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET/i.test(message) ||
    /password authentication failed|database .* does not exist|connect|timeout|connection terminated/i.test(
      message
    ) ||
    /^57P/.test(code) ||
    /^08/.test(code)
  );
}
