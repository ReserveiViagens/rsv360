-- ✅ ITENS 39-42: TABELAS DO PROGRAMA TOP HOST
-- Criar tabelas para sistema de qualidade, ratings e badges

-- 1. Tabela de ratings operacionais de hosts
CREATE TABLE IF NOT EXISTS host_ratings (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL, -- ID do usuário/host
  item_id INTEGER, -- ID do item/propriedade (opcional)
  rating_type VARCHAR(50) NOT NULL, -- 'response_time', 'cleanliness', 'communication', 'accuracy', 'check_in', 'value', 'overall'
  rating_value DECIMAL(3, 2) NOT NULL CHECK (rating_value >= 0 AND rating_value <= 5),
  review_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_host_ratings FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_host_rating_type UNIQUE(host_id, item_id, rating_type)
);

CREATE INDEX IF NOT EXISTS idx_host_ratings_host ON host_ratings(host_id);
CREATE INDEX IF NOT EXISTS idx_host_ratings_item ON host_ratings(item_id);
CREATE INDEX IF NOT EXISTS idx_host_ratings_type ON host_ratings(rating_type);

-- 2. Tabela de badges de hosts
CREATE TABLE IF NOT EXISTS host_badges (
  id SERIAL PRIMARY KEY,
  badge_key VARCHAR(100) NOT NULL UNIQUE, -- 'superhost', 'quick_response', 'excellent_cleanliness', etc.
  badge_name VARCHAR(255) NOT NULL,
  badge_description TEXT,
  badge_icon VARCHAR(255), -- URL ou nome do ícone
  badge_category VARCHAR(50), -- 'quality', 'performance', 'achievement', 'special'
  criteria JSONB NOT NULL, -- Critérios para obter o badge
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_host_badges_key ON host_badges(badge_key);
CREATE INDEX IF NOT EXISTS idx_host_badges_category ON host_badges(badge_category);
CREATE INDEX IF NOT EXISTS idx_host_badges_active ON host_badges(is_active);

-- 3. Tabela de badges atribuídos a hosts
CREATE TABLE IF NOT EXISTS host_badge_assignments (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL,
  badge_id INTEGER NOT NULL,
  item_id INTEGER, -- Badge específico de um item (opcional)
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- Badges podem expirar
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT fk_host_assignment FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_badge_assignment FOREIGN KEY (badge_id) REFERENCES host_badges(id) ON DELETE CASCADE,
  CONSTRAINT unique_host_badge UNIQUE(host_id, badge_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_badge_assignments_host ON host_badge_assignments(host_id);
CREATE INDEX IF NOT EXISTS idx_badge_assignments_badge ON host_badge_assignments(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_assignments_active ON host_badge_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_badge_assignments_expires ON host_badge_assignments(expires_at);

-- 4. Tabela de métricas de qualidade
CREATE TABLE IF NOT EXISTS quality_metrics (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL,
  item_id INTEGER, -- Métricas específicas de um item (opcional)
  metric_type VARCHAR(50) NOT NULL, -- 'response_rate', 'response_time', 'cancellation_rate', 'occupancy_rate', 'revenue', 'guest_satisfaction'
  metric_value DECIMAL(10, 2) NOT NULL,
  metric_unit VARCHAR(20), -- 'percentage', 'hours', 'days', 'currency', 'count'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_host_metrics FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quality_metrics_host ON quality_metrics(host_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_item ON quality_metrics(item_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_type ON quality_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_period ON quality_metrics(period_start, period_end);

-- 5. Tabela de histórico de scores de hosts
CREATE TABLE IF NOT EXISTS host_scores (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL,
  item_id INTEGER, -- Score específico de um item (opcional)
  overall_score DECIMAL(5, 2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  quality_score DECIMAL(5, 2),
  performance_score DECIMAL(5, 2),
  guest_satisfaction_score DECIMAL(5, 2),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_host_scores FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_host_scores_host ON host_scores(host_id);
CREATE INDEX IF NOT EXISTS idx_host_scores_item ON host_scores(item_id);
CREATE INDEX IF NOT EXISTS idx_host_scores_calculated ON host_scores(calculated_at DESC);

-- Trigger para atualizar last_updated em host_ratings
CREATE OR REPLACE FUNCTION update_host_ratings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_host_ratings_timestamp
BEFORE UPDATE ON host_ratings
FOR EACH ROW
EXECUTE FUNCTION update_host_ratings_timestamp();

-- Comentários
COMMENT ON TABLE host_ratings IS 'Ratings operacionais de hosts (response time, cleanliness, etc.)';
COMMENT ON TABLE host_badges IS 'Definições de badges disponíveis';
COMMENT ON TABLE host_badge_assignments IS 'Badges atribuídos a hosts';
COMMENT ON TABLE quality_metrics IS 'Métricas de qualidade de hosts';
COMMENT ON TABLE host_scores IS 'Scores calculados de hosts';

