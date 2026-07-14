-- F2b: cache semântico pgvector (desbloqueado por I1).
CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS agente_cache_semantico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  agente text NOT NULL,
  carimbo_contexto jsonb NOT NULL,
  pergunta_normalizada text NOT NULL,
  embedding vector(1536) NOT NULL,
  resposta text NOT NULL,
  versao_base text NOT NULL,
  hits integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now(),
  expira_em timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agente_cache_semantico_hnsw
  ON agente_cache_semantico
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_agente_cache_semantico_agente_versao
  ON agente_cache_semantico (agente, versao_base);

CREATE INDEX IF NOT EXISTS idx_agente_cache_semantico_expira
  ON agente_cache_semantico (expira_em);

-- Rollback limpo (manual):
-- DROP INDEX IF EXISTS idx_agente_cache_semantico_expira;
-- DROP INDEX IF EXISTS idx_agente_cache_semantico_agente_versao;
-- DROP INDEX IF EXISTS idx_agente_cache_semantico_hnsw;
-- DROP TABLE IF EXISTS agente_cache_semantico;
-- (não DROP EXTENSION vector — pode ser compartilhada)
