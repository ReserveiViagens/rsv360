-- RAG incremental: tabela base (pgvector opcional em produção via migration dedicada).
CREATE TABLE IF NOT EXISTS "conhecimento_chunks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "conteudo" text NOT NULL,
  "fonte" text NOT NULL,
  "embedding" jsonb,
  "criado_em" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_conhecimento_chunks_fonte" ON "conhecimento_chunks" ("fonte");
