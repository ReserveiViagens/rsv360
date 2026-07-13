-- F1 fundação módulo agentes — telemetria de execuções + flag fail-safe OFF.
-- Cache semântico e extensão pgvector ficam em migration futura (pós I1).

CREATE TABLE IF NOT EXISTS agente_execucoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  agente text NOT NULL,
  canal text,
  entrada_hash text NOT NULL,
  tier text NOT NULL,
  cache_hit text NOT NULL,
  modelo text,
  tokens_in integer,
  tokens_out integer,
  custo_estimado numeric(12, 6),
  duracao_ms integer,
  criado_em timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT agente_execucoes_tier_check
    CHECK (tier IN ('t0', 't1', 't2', 't3')),
  CONSTRAINT agente_execucoes_cache_hit_check
    CHECK (cache_hit IN ('exact', 'semantic', 'none'))
);

CREATE INDEX IF NOT EXISTS idx_agente_execucoes_agente_criado
  ON agente_execucoes (agente, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_agente_execucoes_entrada_hash
  ON agente_execucoes (entrada_hash);

INSERT INTO configuracoes_sistema (chave, valores)
VALUES (
  'agentes',
  '{
    "agentes_modulo_ativo": false,
    "limiar_semantico_hit": 0.92,
    "limiar_semantico_verificar": 0.85,
    "ttl_cache_institucional_dias": 7,
    "ttl_cache_catalogo_horas": 24
  }'::jsonb
)
ON CONFLICT (chave) DO NOTHING;

-- Rollback limpo (manual):
-- DELETE FROM configuracoes_sistema WHERE chave = 'agentes';
-- DROP TABLE IF EXISTS agente_execucoes;
