-- Etapa A′: tarifário dinâmico (temporada × categoria × unidade)
-- Motor desligado por padrão — zero regressão no wizard.

CREATE TABLE IF NOT EXISTS tarifa_categoria (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  nome text NOT NULL,
  desconto_percentual numeric(5, 2),
  requer_comprovacao boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  criado_por integer REFERENCES users(id),
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tarifa_temporada (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  nome text NOT NULL,
  cor text,
  prioridade integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tarifa_temporada_periodo (
  id serial PRIMARY KEY,
  temporada_id integer NOT NULL REFERENCES tarifa_temporada(id) ON DELETE CASCADE,
  data_inicio date NOT NULL,
  data_fim date NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tarifa_temporada_periodo_datas
  ON tarifa_temporada_periodo (data_inicio, data_fim);

CREATE TYPE tarifa_regra_nivel AS ENUM ('unidade', 'empreendimento', 'global');
CREATE TYPE tarifa_tipo_valor AS ENUM ('absoluto', 'multiplicador', 'delta', 'desconto_percentual');

CREATE TABLE IF NOT EXISTS tarifa_regra (
  id serial PRIMARY KEY,
  nivel tarifa_regra_nivel NOT NULL,
  acomodacao_id integer REFERENCES acomodacoes(id) ON DELETE CASCADE,
  hotel_id text,
  temporada_id integer REFERENCES tarifa_temporada(id) ON DELETE SET NULL,
  categoria_id integer REFERENCES tarifa_categoria(id) ON DELETE SET NULL,
  tipo_valor tarifa_tipo_valor NOT NULL DEFAULT 'absoluto',
  valor numeric(12, 2) NOT NULL,
  prioridade integer NOT NULL DEFAULT 0,
  vigencia_inicio date,
  vigencia_fim date,
  ativo boolean NOT NULL DEFAULT true,
  criado_por integer REFERENCES users(id),
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tarifa_regra_lookup
  ON tarifa_regra (nivel, acomodacao_id, hotel_id, temporada_id, categoria_id, ativo);

ALTER TABLE empreendimentos
  ADD COLUMN IF NOT EXISTS tarifario_dinamico_ativo boolean;

INSERT INTO configuracoes_sistema (chave, valores)
VALUES ('tarifario', '{"tarifario_dinamico_ativo": false}'::jsonb)
ON CONFLICT (chave) DO NOTHING;
