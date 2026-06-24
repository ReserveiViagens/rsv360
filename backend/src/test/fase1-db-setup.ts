import { execSync } from 'node:child_process';
import path from 'node:path';

let migrated = false;

/** Aplica migrations Drizzle uma vez por processo de teste (requer DATABASE_URL). */
export function applyTestMigrations(): void {
  if (migrated || !process.env.DATABASE_URL) return;
  const backendRoot = path.resolve(__dirname, '../..');
  try {
    execSync('npm run migrate', {
      cwd: backendRoot,
      env: process.env,
      stdio: 'pipe',
    });
    migrated = true;
  } catch (error) {
    console.warn('[test] migrate falhou — testes com DB serão ignorados ou falharão:', (error as Error).message);
  }
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
