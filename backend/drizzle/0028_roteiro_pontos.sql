-- PR 25: pontos georreferenciados do roteiro cinematográfico (mapa OSM)
CREATE TABLE IF NOT EXISTS roteiro_pontos (
  id serial PRIMARY KEY,
  hotel_id integer NOT NULL REFERENCES empreendimentos(id),
  acomodacao_id integer REFERENCES acomodacoes(id),
  tipo text NOT NULL,
  titulo text NOT NULL,
  descricao text,
  lat numeric(9, 6) NOT NULL,
  lng numeric(9, 6) NOT NULL,
  dia integer,
  ordem integer DEFAULT 0,
  ativo boolean DEFAULT true,
  atualizado_em timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roteiro_pontos_hotel_ativo
  ON roteiro_pontos (hotel_id, ativo);
