import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationPath = resolve(__dirname, '../../../drizzle/0019_propostas_token_publico_unique.sql');

describe('migration 0019_propostas_token_publico_unique', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  it('pré-checagem de token_publico duplicado antes do índice único', () => {
    expect(sql).toMatch(/GROUP BY token_publico/i);
    expect(sql).toMatch(/HAVING COUNT\(\*\) > 1/i);
    expect(sql).toMatch(/RAISE EXCEPTION/i);
  });

  it('cria idx_propostas_token UNIQUE em token_publico', () => {
    expect(sql).toMatch(
      /CREATE UNIQUE INDEX IF NOT EXISTS idx_propostas_token ON propostas \(token_publico\)/i,
    );
  });

  it('reforça idx_propostas_status_valido_ate (valido_ate, não expira_em)', () => {
    expect(sql).toMatch(
      /CREATE INDEX IF NOT EXISTS idx_propostas_status_valido_ate ON propostas \(status, valido_ate\)/i,
    );
    expect(sql).not.toMatch(/expira_em/i);
  });
});
