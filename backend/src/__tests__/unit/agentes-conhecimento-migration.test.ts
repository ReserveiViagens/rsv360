import { readFileSync } from 'fs';
import { join } from 'path';

const SQL_PATH = join(__dirname, '../../../drizzle/0039_agente_conhecimento.sql');

describe('Migration 0039_agente_conhecimento', () => {
  const sqlRaw = readFileSync(SQL_PATH, 'utf8');
  const sql = sqlRaw
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  it('cria schema langgraph + tabela + HNSW + UNIQUE + merge config', () => {
    expect(sql).toMatch(/CREATE SCHEMA IF NOT EXISTS langgraph/i);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS agente_conhecimento/i);
    expect(sql).toMatch(/embedding vector\(1536\)/i);
    expect(sql).toMatch(/USING hnsw \(embedding vector_cosine_ops\)/i);
    expect(sql).toMatch(/UNIQUE \(agente, doc_slug, chunk_ordem, versao_base\)/i);
    expect(sql).toMatch(/agente_instrutor_ativo/i);
    expect(sql).toMatch(/valores \|\|/i);
  });

  it('documenta rollback com DROP SCHEMA CASCADE e preserva extension', () => {
    expect(sqlRaw).toMatch(/DROP TABLE IF EXISTS agente_conhecimento/i);
    expect(sqlRaw).toMatch(/DROP SCHEMA IF EXISTS langgraph CASCADE/i);
    expect(sqlRaw).toMatch(/extension vector PRESERVADA/i);
    expect(sqlRaw).toMatch(/FORA do journal Drizzle/i);
  });
});
