CREATE TABLE IF NOT EXISTS excursoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  destino VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  vagas_disponiveis INTEGER NOT NULL,
  vagas_totais INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'planejamento',
  inclui_transporte BOOLEAN DEFAULT false,
  inclui_hospedagem BOOLEAN DEFAULT false,
  inclui_refeicoes BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roteiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  excursao_id UUID REFERENCES excursoes(id) ON DELETE CASCADE,
  dia INTEGER NOT NULL,
  horario TIME,
  atividade VARCHAR(255) NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participantes_excursao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  excursao_id UUID REFERENCES excursoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente',
  pagamento_status VARCHAR(20) DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_excursoes_status ON excursoes(status);
CREATE INDEX idx_excursoes_destino ON excursoes(destino);
CREATE INDEX idx_excursoes_datas ON excursoes(data_inicio, data_fim);
CREATE INDEX idx_roteiros_excursao ON roteiros(excursao_id);
CREATE INDEX idx_participantes_excursao ON participantes_excursao(excursao_id);
CREATE INDEX idx_participantes_user ON participantes_excursao(user_id);
