function maskDatabaseUrl(connectionString: string): string {
  return connectionString.replace(/:([^@]+)@/, ':***@');
}

export function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Did you forget to run `cp .env.example .env` in the project root?'
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error(
      `DATABASE_URL is malformed: "${maskDatabaseUrl(databaseUrl)}". Expected postgresql://user:pass@host:port/db. ` +
        'Check that POSTGRES_USER, POSTGRES_PASSWORD and POSTGRES_DB are set in .env.'
    );
  }

  const isPostgresProtocol = parsedUrl.protocol === 'postgres:' || parsedUrl.protocol === 'postgresql:';
  if (
    !isPostgresProtocol ||
    !parsedUrl.username ||
    !parsedUrl.password ||
    !parsedUrl.hostname ||
    !parsedUrl.port ||
    !parsedUrl.pathname ||
    parsedUrl.pathname === '/'
  ) {
    throw new Error(
      `DATABASE_URL is malformed: "${maskDatabaseUrl(databaseUrl)}". Expected postgresql://user:pass@host:port/db. ` +
        'Check that POSTGRES_USER, POSTGRES_PASSWORD and POSTGRES_DB are set in .env.'
    );
  }

  return databaseUrl;
}
