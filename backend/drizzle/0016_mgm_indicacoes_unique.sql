CREATE UNIQUE INDEX IF NOT EXISTS "idx_indicacoes_token_indicador_unique"
  ON "indicacoes" ("token_proposta", "indicador_id");
