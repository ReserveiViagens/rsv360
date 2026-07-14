-- F2c-2: conhecimento RAG do Agente Instrutor + schema dedicado para LangGraph checkpointer.
--
-- IMPORTANTE — schema `langgraph`:
-- Criamos apenas o SCHEMA vazio. As tabelas do PostgresSaver (@langchain/langgraph-checkpoint-postgres)
-- são criadas pela própria lib em runtime via checkpointer.setup(), FORA do journal Drizzle.
-- Não versionar tabelas do LangGraph neste journal.
CREATE SCHEMA IF NOT EXISTS langgraph;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS agente_conhecimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  agente text NOT NULL,
  doc_slug text NOT NULL,
  chunk_ordem integer NOT NULL,
  papel text NOT NULL,
  rotas jsonb NOT NULL DEFAULT '[]'::jsonb,
  conteudo text NOT NULL,
  embedding vector(1536) NOT NULL,
  versao_base text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_agente_conhecimento_chunk
    UNIQUE (agente, doc_slug, chunk_ordem, versao_base)
);

CREATE INDEX IF NOT EXISTS idx_agente_conhecimento_hnsw
  ON agente_conhecimento
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_agente_conhecimento_agente_papel
  ON agente_conhecimento (agente, papel);

CREATE INDEX IF NOT EXISTS idx_agente_conhecimento_versao
  ON agente_conhecimento (agente, versao_base);

-- Merge config agentes sem sobrescrever keys existentes (fail-safe OFF).
INSERT INTO configuracoes_sistema (chave, valores)
VALUES (
  'agentes',
  '{
    "agente_instrutor_ativo": false,
    "modelo_t1": "gpt-4o-mini",
    "modelo_embedding": "text-embedding-3-small",
    "rag_top_k": 4
  }'::jsonb
)
ON CONFLICT (chave) DO UPDATE
SET valores = configuracoes_sistema.valores || '{
  "agente_instrutor_ativo": false,
  "modelo_t1": "gpt-4o-mini",
  "modelo_embedding": "text-embedding-3-small",
  "rag_top_k": 4
}'::jsonb,
updated_at = NOW();

-- Rollback (manual, em txn):
-- BEGIN;
-- DROP INDEX IF EXISTS idx_agente_conhecimento_versao;
-- DROP INDEX IF EXISTS idx_agente_conhecimento_agente_papel;
-- DROP INDEX IF EXISTS idx_agente_conhecimento_hnsw;
-- DROP TABLE IF EXISTS agente_conhecimento;
-- DROP SCHEMA IF EXISTS langgraph CASCADE;
-- -- extension vector PRESERVADA (compartilhada com 0038)
-- COMMIT;
