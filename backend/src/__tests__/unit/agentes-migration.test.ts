import { readFileSync } from 'fs';
import { join } from 'path';

const SQL_PATH = join(__dirname, '../../../drizzle/0037_agentes_fundacao.sql');

describe('Migration 0037_agentes_fundacao', () => {
  const sqlRaw = readFileSync(SQL_PATH, 'utf8');
  /** Ignora comentários SQL ao validar proibições de escopo. */
  const sql = sqlRaw
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  it('cria só agente_execucoes (sem cache semântico / sem extension)', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS agente_execucoes/i);
    expect(sql).not.toMatch(/agente_cache_semantico/i);
    expect(sql).not.toMatch(/CREATE EXTENSION/i);
  });

  it('seed flag agentes OFF + limiares/TTLs', () => {
    expect(sql).toMatch(/'agentes'/);
    expect(sql).toMatch(/"agentes_modulo_ativo":\s*false/);
    expect(sql).toMatch(/"limiar_semantico_hit":\s*0\.92/);
    expect(sql).toMatch(/"limiar_semantico_verificar":\s*0\.85/);
    expect(sql).toMatch(/ON CONFLICT \(chave\) DO NOTHING/);
  });

  it('documenta rollback limpo (DROP + DELETE flag)', () => {
    expect(sqlRaw).toMatch(/DROP TABLE IF EXISTS agente_execucoes/i);
    expect(sqlRaw).toMatch(/DELETE FROM configuracoes_sistema WHERE chave = 'agentes'/i);
  });
});
