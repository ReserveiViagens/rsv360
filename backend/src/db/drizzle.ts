import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index';
import { requireDatabaseUrl } from './connection';
import 'dotenv/config';

const pool = new Pool({ connectionString: requireDatabaseUrl() });
export const db = drizzle(pool, { schema });

export async function closeDbPool(): Promise<void> {
  await pool.end();
}
