-- ✅ TAREFA HIGH-2: Migration para Sistema de A/B Testing de Precificação
-- Cria tabelas para experimentos A/B de precificação

-- Tabela de experimentos A/B
CREATE TABLE IF NOT EXISTS pricing_ab_experiments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, running, paused, completed, cancelled
  traffic_split DECIMAL(5,2) DEFAULT 50.00, -- % de tráfego para variante B
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  UNIQUE(name, property_id)
);

-- Tabela de variantes do experimento
CREATE TABLE IF NOT EXISTS pricing_ab_variants (
  id SERIAL PRIMARY KEY,
  experiment_id INTEGER REFERENCES pricing_ab_experiments(id) ON DELETE CASCADE,
  variant_name VARCHAR(50) NOT NULL, -- 'control' ou 'treatment'
  pricing_strategy JSONB NOT NULL, -- Configuração de precificação
  traffic_percentage DECIMAL(5,2) NOT NULL, -- % de tráfego para esta variante
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(experiment_id, variant_name)
);

-- Tabela de participantes do experimento
CREATE TABLE IF NOT EXISTS pricing_ab_participants (
  id SERIAL PRIMARY KEY,
  experiment_id INTEGER REFERENCES pricing_ab_experiments(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES pricing_ab_variants(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(experiment_id, user_id)
);

-- Tabela de métricas do experimento
CREATE TABLE IF NOT EXISTS pricing_ab_metrics (
  id SERIAL PRIMARY KEY,
  experiment_id INTEGER REFERENCES pricing_ab_experiments(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES pricing_ab_variants(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  impressions INTEGER DEFAULT 0, -- Visualizações
  clicks INTEGER DEFAULT 0, -- Cliques
  bookings INTEGER DEFAULT 0, -- Reservas
  revenue DECIMAL(10,2) DEFAULT 0.00, -- Receita
  conversion_rate DECIMAL(5,2) DEFAULT 0.00, -- Taxa de conversão
  avg_price DECIMAL(10,2) DEFAULT 0.00, -- Preço médio
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(experiment_id, variant_id, metric_date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pricing_ab_experiments_property ON pricing_ab_experiments(property_id);
CREATE INDEX IF NOT EXISTS idx_pricing_ab_experiments_status ON pricing_ab_experiments(status);
CREATE INDEX IF NOT EXISTS idx_pricing_ab_experiments_dates ON pricing_ab_experiments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_pricing_ab_variants_experiment ON pricing_ab_variants(experiment_id);
CREATE INDEX IF NOT EXISTS idx_pricing_ab_participants_experiment ON pricing_ab_participants(experiment_id);
CREATE INDEX IF NOT EXISTS idx_pricing_ab_participants_user ON pricing_ab_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_ab_metrics_experiment ON pricing_ab_metrics(experiment_id);
CREATE INDEX IF NOT EXISTS idx_pricing_ab_metrics_variant ON pricing_ab_metrics(variant_id);
CREATE INDEX IF NOT EXISTS idx_pricing_ab_metrics_date ON pricing_ab_metrics(metric_date);

-- Comentários
COMMENT ON TABLE pricing_ab_experiments IS 'Experimentos A/B de precificação';
COMMENT ON TABLE pricing_ab_variants IS 'Variantes de cada experimento A/B';
COMMENT ON TABLE pricing_ab_participants IS 'Participantes atribuídos a variantes';
COMMENT ON TABLE pricing_ab_metrics IS 'Métricas coletadas para cada variante';

