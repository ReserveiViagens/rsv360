-- MVP-A comissões marketplace (stack S2) — módulo desligado por padrão.
-- Geração real (pagamento confirmado) entra no MVP-B.

CREATE TABLE IF NOT EXISTS comissoes_lancamento (
  id serial PRIMARY KEY,
  proposta_id integer NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
  acomodacao_id integer REFERENCES acomodacoes(id) ON DELETE SET NULL,
  beneficiario_user_id integer NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  papel text NOT NULL,
  base_valor numeric(12, 2) NOT NULL,
  percentual numeric(5, 2) NOT NULL,
  valor_comissao numeric(12, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  evento_gerador text NOT NULL DEFAULT 'pagamento_confirmado',
  criado_em timestamptz DEFAULT now(),
  CONSTRAINT comissoes_lancamento_papel_check
    CHECK (papel IN ('plataforma', 'proprietario', 'corretor')),
  CONSTRAINT comissoes_lancamento_status_check
    CHECK (status IN ('pendente', 'confirmada', 'paga', 'estornada')),
  CONSTRAINT comissoes_lancamento_proposta_beneficiario_papel_unique
    UNIQUE (proposta_id, beneficiario_user_id, papel)
);

CREATE INDEX IF NOT EXISTS idx_comissoes_lancamento_beneficiario
  ON comissoes_lancamento (beneficiario_user_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_comissoes_lancamento_proposta
  ON comissoes_lancamento (proposta_id);

INSERT INTO configuracoes_sistema (chave, valores)
VALUES (
  'comissoes',
  '{
    "comissoes_modulo_ativo": false,
    "taxa_plataforma_pct": 20,
    "taxa_corretor_pct": 5
  }'::jsonb
)
ON CONFLICT (chave) DO NOTHING;
