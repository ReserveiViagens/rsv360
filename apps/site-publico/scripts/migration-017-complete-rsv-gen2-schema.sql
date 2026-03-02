-- ✅ MIGRATION 017: COMPLETAR SCHEMA RSV GEN 2
-- Data: 02/12/2025
-- Objetivo: Completar todas as tabelas e triggers faltantes para RSV Gen 2
-- Status: FASE 1 - TAREFA 1.2

-- ============================================
-- PARTE 1: VERIFICAR E MELHORAR TRIGGERS DE VOTOS
-- ============================================

-- Melhorar trigger de votos para funcionar com DELETE também
CREATE OR REPLACE FUNCTION update_wishlist_item_votes()
RETURNS TRIGGER AS $$
DECLARE
  target_item_id INTEGER;
BEGIN
  -- Determinar qual item_id usar
  IF TG_OP = 'DELETE' THEN
    target_item_id := OLD.item_id;
  ELSE
    target_item_id := NEW.item_id;
  END IF;

  -- Atualizar contadores de votos
  UPDATE wishlist_items
  SET 
    votes_up = (
      SELECT COUNT(*) FROM wishlist_votes 
      WHERE item_id = target_item_id AND vote = 'up'
    ),
    votes_down = (
      SELECT COUNT(*) FROM wishlist_votes 
      WHERE item_id = target_item_id AND vote = 'down'
    ),
    votes_maybe = (
      SELECT COUNT(*) FROM wishlist_votes 
      WHERE item_id = target_item_id AND vote = 'maybe'
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = target_item_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger se não existir
DROP TRIGGER IF EXISTS trigger_update_vote_counts ON wishlist_votes;
CREATE TRIGGER trigger_update_vote_counts
AFTER INSERT OR UPDATE OR DELETE ON wishlist_votes
FOR EACH ROW
EXECUTE FUNCTION update_wishlist_item_votes();

-- ============================================
-- PARTE 2: TABELAS ADICIONAIS PARA SMART PRICING
-- ============================================

-- Tabela de fatores de precificação (mais detalhada)
CREATE TABLE IF NOT EXISTS pricing_factors (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  factor_type VARCHAR(50) NOT NULL, -- 'weather', 'event', 'competitor', 'demand', 'season', 'holiday'
  factor_name VARCHAR(255) NOT NULL,
  factor_value DECIMAL(10, 2) NOT NULL,
  multiplier DECIMAL(5, 2) DEFAULT 1.0,
  impact_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  date DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  -- item_id pode referenciar properties(id) ou outras tabelas
  -- CONSTRAINT removido para evitar dependência de website_content
);

CREATE INDEX IF NOT EXISTS idx_pricing_factors_item ON pricing_factors(item_id);
CREATE INDEX IF NOT EXISTS idx_pricing_factors_type ON pricing_factors(factor_type);
CREATE INDEX IF NOT EXISTS idx_pricing_factors_date ON pricing_factors(date);
CREATE INDEX IF NOT EXISTS idx_pricing_factors_item_date ON pricing_factors(item_id, date);

-- Tabela de configuração de precificação inteligente (mais completa)
CREATE TABLE IF NOT EXISTS smart_pricing_config (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT true,
  base_price DECIMAL(10, 2) NOT NULL,
  
  -- Fatores e seus pesos
  weather_weight DECIMAL(3, 2) DEFAULT 0.15,
  event_weight DECIMAL(3, 2) DEFAULT 0.20,
  competitor_weight DECIMAL(3, 2) DEFAULT 0.25,
  demand_weight DECIMAL(3, 2) DEFAULT 0.30,
  season_weight DECIMAL(3, 2) DEFAULT 0.10,
  
  -- Limites
  min_price_multiplier DECIMAL(5, 2) DEFAULT 0.50,
  max_price_multiplier DECIMAL(5, 2) DEFAULT 2.00,
  
  -- Configurações avançadas
  update_frequency VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  ml_model_version VARCHAR(50),
  last_calculation_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- item_id pode referenciar properties(id) ou outras tabelas
  -- CONSTRAINT removido para evitar dependência de website_content,
  CONSTRAINT unique_item_smart_pricing UNIQUE(item_id),
  CONSTRAINT check_weights_sum CHECK (
    weather_weight + event_weight + competitor_weight + demand_weight + season_weight <= 1.0
  )
);

CREATE INDEX IF NOT EXISTS idx_smart_pricing_config_item ON smart_pricing_config(item_id);
CREATE INDEX IF NOT EXISTS idx_smart_pricing_config_enabled ON smart_pricing_config(enabled);

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_smart_pricing_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_smart_pricing_config_timestamp ON smart_pricing_config;
CREATE TRIGGER trigger_update_smart_pricing_config_timestamp
BEFORE UPDATE ON smart_pricing_config
FOR EACH ROW
EXECUTE FUNCTION update_smart_pricing_config_timestamp();

-- ============================================
-- PARTE 3: TABELAS ADICIONAIS PARA QUALITY PROGRAM
-- ============================================

-- Tabela de incentivos de hosts
CREATE TABLE IF NOT EXISTS host_incentives (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL,
  incentive_type VARCHAR(50) NOT NULL, -- 'discount', 'priority_support', 'feature_access', 'badge', 'commission_reduction'
  incentive_value DECIMAL(10, 2),
  incentive_description TEXT,
  criteria_met JSONB, -- Critérios que foram atendidos
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  used_at TIMESTAMP,
  
  CONSTRAINT fk_host_incentive FOREIGN KEY (host_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_host_incentives_host ON host_incentives(host_id);
CREATE INDEX IF NOT EXISTS idx_host_incentives_type ON host_incentives(incentive_type);
CREATE INDEX IF NOT EXISTS idx_host_incentives_active ON host_incentives(is_active);
CREATE INDEX IF NOT EXISTS idx_host_incentives_expires ON host_incentives(expires_at);

-- Tabela de histórico de atribuição de badges (auditoria)
CREATE TABLE IF NOT EXISTS badge_assignment_history (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL,
  badge_id INTEGER NOT NULL,
  item_id INTEGER,
  action VARCHAR(20) NOT NULL, -- 'awarded', 'revoked', 'expired', 'renewed'
  reason TEXT,
  performed_by INTEGER, -- ID do admin que executou (se manual)
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_badge_history_host FOREIGN KEY (host_id) 
    REFERENCES users(id) ON DELETE CASCADE
  -- CONSTRAINT fk_badge_history_badge removido - host_badges pode não existir
);

CREATE INDEX IF NOT EXISTS idx_badge_history_host ON badge_assignment_history(host_id);
CREATE INDEX IF NOT EXISTS idx_badge_history_badge ON badge_assignment_history(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_history_action ON badge_assignment_history(action);
CREATE INDEX IF NOT EXISTS idx_badge_history_performed_at ON badge_assignment_history(performed_at DESC);

-- ============================================
-- PARTE 4: FUNÇÕES SQL ÚTEIS
-- ============================================

-- Função para calcular score total de um host
CREATE OR REPLACE FUNCTION calculate_host_score(p_host_id INTEGER)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
  v_score DECIMAL(5, 2);
BEGIN
  SELECT 
    COALESCE(
      (
        (COALESCE(AVG(CASE WHEN rating_type = 'overall' THEN rating_value END), 0) * 0.40) +
        (COALESCE(AVG(CASE WHEN rating_type = 'response_time' THEN rating_value END), 0) * 0.20) +
        (COALESCE(AVG(CASE WHEN rating_type = 'cleanliness' THEN rating_value END), 0) * 0.20) +
        (COALESCE(AVG(CASE WHEN rating_type = 'communication' THEN rating_value END), 0) * 0.20)
      ) * 20, -- Converter de 0-5 para 0-100
      0
    )
  INTO v_score
  FROM host_ratings
  WHERE host_id = p_host_id;
  
  RETURN COALESCE(v_score, 0);
EXCEPTION
  WHEN undefined_table THEN
    -- Tabela host_ratings não existe, retornar 0
    RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se host deve receber badge
CREATE OR REPLACE FUNCTION check_badge_eligibility(
  p_host_id INTEGER,
  p_badge_key VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_criteria JSONB;
  v_meets_criteria BOOLEAN := false;
  v_score DECIMAL(5, 2);
  v_response_rate DECIMAL(5, 2);
  v_rating DECIMAL(3, 2);
BEGIN
  -- Buscar critérios do badge (se tabela host_badges existir)
  BEGIN
    SELECT criteria INTO v_criteria
    FROM host_badges
    WHERE badge_key = p_badge_key AND is_active = true;
    
    IF v_criteria IS NULL THEN
      RETURN false;
    END IF;
  EXCEPTION
    WHEN undefined_table THEN
      -- Tabela host_badges não existe, retornar false
      RETURN false;
  END;
  
  -- Verificar critérios comuns
  IF v_criteria->>'min_score' IS NOT NULL THEN
    v_score := calculate_host_score(p_host_id);
    IF v_score < (v_criteria->>'min_score')::DECIMAL THEN
      RETURN false;
    END IF;
  END IF;
  
  IF v_criteria->>'min_rating' IS NOT NULL THEN
    BEGIN
      SELECT AVG(rating_value) INTO v_rating
      FROM host_ratings
      WHERE host_id = p_host_id AND rating_type = 'overall';
      
      IF v_rating < (v_criteria->>'min_rating')::DECIMAL THEN
        RETURN false;
      END IF;
    EXCEPTION
      WHEN undefined_table THEN
        -- Tabela host_ratings não existe, ignorar critério
        NULL;
    END;
  END IF;
  
  IF v_criteria->>'min_response_rate' IS NOT NULL THEN
    BEGIN
      SELECT metric_value INTO v_response_rate
      FROM quality_metrics
      WHERE host_id = p_host_id 
        AND metric_type = 'response_rate'
      ORDER BY calculated_at DESC
      LIMIT 1;
      
      IF v_response_rate < (v_criteria->>'min_response_rate')::DECIMAL THEN
        RETURN false;
      END IF;
    EXCEPTION
      WHEN undefined_table THEN
        -- Tabela quality_metrics não existe, ignorar critério
        NULL;
    END;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PARTE 5: ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================

-- Índices compostos para queries frequentes
CREATE INDEX IF NOT EXISTS idx_wishlist_items_votes ON wishlist_items(votes_up DESC, votes_down, votes_maybe);
CREATE INDEX IF NOT EXISTS idx_wishlist_votes_item_vote ON wishlist_votes(item_id, vote);
-- Índices abaixo comentados - tabelas podem não existir
-- CREATE INDEX IF NOT EXISTS idx_pricing_history_item_date_price ON pricing_history(item_id, date DESC, final_price);
-- CREATE INDEX IF NOT EXISTS idx_competitor_prices_item_competitor_date ON competitor_prices(item_id, competitor_name, scraped_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_host_ratings_host_type_value ON host_ratings(host_id, rating_type, rating_value DESC);
-- CREATE INDEX IF NOT EXISTS idx_quality_metrics_host_type_period ON quality_metrics(host_id, metric_type, period_start DESC, period_end DESC);

-- ============================================
-- PARTE 6: COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON FUNCTION update_wishlist_item_votes() IS 'Atualiza automaticamente contadores de votos em wishlist_items';
COMMENT ON FUNCTION calculate_host_score(INTEGER) IS 'Calcula score total de um host baseado em ratings';
COMMENT ON FUNCTION check_badge_eligibility(INTEGER, VARCHAR) IS 'Verifica se host atende critérios para receber badge';
COMMENT ON TABLE pricing_factors IS 'Fatores individuais que influenciam precificação';
COMMENT ON TABLE smart_pricing_config IS 'Configuração completa de precificação inteligente por item';
COMMENT ON TABLE host_incentives IS 'Incentivos e recompensas para hosts';
COMMENT ON TABLE badge_assignment_history IS 'Histórico de atribuições de badges (auditoria)';

-- ============================================
-- FIM DA MIGRATION
-- ============================================

-- Verificar se tudo foi criado corretamente
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Verificar tabelas
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'pricing_factors',
      'smart_pricing_config',
      'host_incentives',
      'badge_assignment_history'
    );
  
  IF v_count = 4 THEN
    RAISE NOTICE '✅ Todas as tabelas foram criadas com sucesso!';
  ELSE
    RAISE WARNING '⚠️ Algumas tabelas podem não ter sido criadas. Verifique manualmente.';
  END IF;
  
  -- Verificar funções
  SELECT COUNT(*) INTO v_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN (
      'update_wishlist_item_votes',
      'calculate_host_score',
      'check_badge_eligibility'
    );
  
  IF v_count = 3 THEN
    RAISE NOTICE '✅ Todas as funções foram criadas com sucesso!';
  ELSE
    RAISE WARNING '⚠️ Algumas funções podem não ter sido criadas. Verifique manualmente.';
  END IF;
END $$;

