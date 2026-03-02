-- ✅ ITEM 37: TABELAS DE REGRAS DE PRECIFICAÇÃO
-- Criar tabelas para gestão de regras de precificação

-- 1. Tabela de regras de precificação
CREATE TABLE IF NOT EXISTS pricing_rules (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'seasonal', 'day_of_week', 'stay_duration', 'advance_booking', 'last_minute', 'custom'
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Ordem de aplicação (maior = primeiro)
  
  -- Configurações da regra (JSONB para flexibilidade)
  config JSONB NOT NULL,
  
  -- Exemplos de config:
  -- Seasonal: {"start_date": "2024-12-01", "end_date": "2024-12-31", "multiplier": 1.5, "name": "Natal"}
  -- Day of week: {"days": [5, 6], "multiplier": 1.2} -- Sexta e Sábado
  -- Stay duration: {"min_nights": 7, "discount": 10} -- 10% desconto para 7+ noites
  -- Advance booking: {"days_before": 30, "discount": 15} -- 15% desconto para 30+ dias antes
  -- Last minute: {"days_before": 3, "discount": 20} -- 20% desconto para 3 dias ou menos
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_item_rules FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pricing_rules_item ON pricing_rules(item_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_type ON pricing_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_priority ON pricing_rules(priority DESC);

-- 2. Tabela de histórico de aplicação de regras
CREATE TABLE IF NOT EXISTS pricing_rule_applications (
  id SERIAL PRIMARY KEY,
  rule_id INTEGER NOT NULL REFERENCES pricing_rules(id) ON DELETE CASCADE,
  booking_id INTEGER,
  item_id INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  price_after_rule DECIMAL(10, 2) NOT NULL,
  multiplier_applied DECIMAL(5, 2),
  discount_applied DECIMAL(5, 2),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_item_applications FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rule_applications_rule ON pricing_rule_applications(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_applications_item ON pricing_rule_applications(item_id);
CREATE INDEX IF NOT EXISTS idx_rule_applications_booking ON pricing_rule_applications(booking_id);
CREATE INDEX IF NOT EXISTS idx_rule_applications_applied ON pricing_rule_applications(applied_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_pricing_rules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pricing_rules_timestamp
BEFORE UPDATE ON pricing_rules
FOR EACH ROW
EXECUTE FUNCTION update_pricing_rules_timestamp();

-- Comentários
COMMENT ON TABLE pricing_rules IS 'Regras de precificação dinâmica por item';
COMMENT ON TABLE pricing_rule_applications IS 'Histórico de aplicação de regras de precificação';

