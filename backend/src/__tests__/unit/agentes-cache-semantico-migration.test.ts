import { readFileSync } from 'fs';
import { join } from 'path';

const SQL_PATH = join(__dirname, '../../../drizzle/0038_agente_cache_semantico.sql');

describe('Migration 0038_agente_cache_semantico', () => {
  const sqlRaw = readFileSync(SQL_PATH, 'utf8');
  const sql = sqlRaw
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  it('cria extension vector + tabela + índice HNSW', () => {
    expect(sql).toMatch(/CREATE EXTENSION IF NOT EXISTS vector/i);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS agente_cache_semantico/i);
    expect(sql).toMatch(/embedding vector\(1536\)/i);
    expect(sql).toMatch(/USING hnsw \(embedding vector_cosine_ops\)/i);
    expect(sql).toMatch(/\(agente, versao_base\)/i);
  });

  it('documenta rollback sem DROP EXTENSION', () => {
    expect(sqlRaw).toMatch(/DROP TABLE IF EXISTS agente_cache_semantico/i);
    expect(sqlRaw).toMatch(/não DROP EXTENSION vector/i);
  });
});
