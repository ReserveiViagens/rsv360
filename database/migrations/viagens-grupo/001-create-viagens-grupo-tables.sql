CREATE TABLE IF NOT EXISTS grupos_viagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  destino VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_prevista DATE,
  limite_participantes INTEGER,
  privacidade VARCHAR(20) DEFAULT 'publico',
  status VARCHAR(20) DEFAULT 'formando',
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membros_grupo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID REFERENCES grupos_viagem(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(20) DEFAULT 'membro',
  status VARCHAR(20) DEFAULT 'ativo',
  joined_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID REFERENCES grupos_viagem(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  item_tipo VARCHAR(50) NOT NULL,
  item_id UUID,
  descricao TEXT,
  votos INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pagamentos_divididos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID REFERENCES grupos_viagem(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  valor_por_pessoa DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pendente',
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_grupos_status ON grupos_viagem(status);
CREATE INDEX idx_grupos_destino ON grupos_viagem(destino);
CREATE INDEX idx_membros_grupo ON membros_grupo(grupo_id);
CREATE INDEX idx_membros_user ON membros_grupo(user_id);
CREATE INDEX idx_wishlist_grupo ON wishlist_items(grupo_id);
CREATE INDEX idx_pagamentos_grupo ON pagamentos_divididos(grupo_id);
