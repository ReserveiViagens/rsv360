-- Migration 011: Tabelas Split Marketplace e Tributação Otimizada
-- Data: 28/01/2026
-- Descrição: Módulos híbridos Split de Pagamento (marketplace) e Tributação Otimizada

-- ===================================================================
-- SPLIT MARKETPLACE
-- ===================================================================

-- Recebedores (proprietários, imobiliárias, parques)
CREATE TABLE IF NOT EXISTS marketplace_receivers (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('owner', 'agency', 'park')),
  name VARCHAR(255),
  document VARCHAR(20),
  bank_account JSONB,
  default_split_pct DECIMAL(5,2) DEFAULT 80.00,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  external_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_receivers_type ON marketplace_receivers(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_receivers_property_id ON marketplace_receivers(property_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_receivers_status ON marketplace_receivers(status);

-- Regras de split por tipo de serviço
CREATE TABLE IF NOT EXISTS split_config_rules (
  id SERIAL PRIMARY KEY,
  service_type VARCHAR(30) NOT NULL CHECK (service_type IN ('rent', 'ticket', 'package')),
  platform_pct DECIMAL(5,2) NOT NULL,
  partner_pct DECIMAL(5,2) NOT NULL,
  ai_suggested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir regras padrão (apenas se tabela vazia)
INSERT INTO split_config_rules (service_type, platform_pct, partner_pct)
SELECT 'rent', 20.00, 80.00 WHERE NOT EXISTS (SELECT 1 FROM split_config_rules WHERE service_type = 'rent');
INSERT INTO split_config_rules (service_type, platform_pct, partner_pct)
SELECT 'ticket', 15.00, 85.00 WHERE NOT EXISTS (SELECT 1 FROM split_config_rules WHERE service_type = 'ticket');
INSERT INTO split_config_rules (service_type, platform_pct, partner_pct)
SELECT 'package', 18.00, 82.00 WHERE NOT EXISTS (SELECT 1 FROM split_config_rules WHERE service_type = 'package');

-- Transações de split (registro histórico)
CREATE TABLE IF NOT EXISTS marketplace_split_transactions (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER,
  payment_id VARCHAR(100),
  total_amount DECIMAL(12,2) NOT NULL,
  platform_amount DECIMAL(12,2) NOT NULL,
  receiver_id INTEGER REFERENCES marketplace_receivers(id) ON DELETE SET NULL,
  receiver_amount DECIMAL(12,2),
  service_type VARCHAR(30),
  gateway_response JSONB,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_split_transactions_booking ON marketplace_split_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_split_transactions_receiver ON marketplace_split_transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_split_transactions_status ON marketplace_split_transactions(status);

-- ===================================================================
-- TRIBUTAÇÃO OTIMIZADA
-- ===================================================================

-- Despesas dedutíveis
CREATE TABLE IF NOT EXISTS tax_deductions (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(50),
  ai_confidence DECIMAL(3,2),
  approved_by_user BOOLEAN DEFAULT FALSE,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_deductions_category ON tax_deductions(category);
CREATE INDEX IF NOT EXISTS idx_tax_deductions_period ON tax_deductions(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_tax_deductions_approved ON tax_deductions(approved_by_user);

-- Triggers
CREATE TRIGGER update_marketplace_receivers_updated_at 
  BEFORE UPDATE ON marketplace_receivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_split_config_rules_updated_at 
  BEFORE UPDATE ON split_config_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_split_transactions_updated_at 
  BEFORE UPDATE ON marketplace_split_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_deductions_updated_at 
  BEFORE UPDATE ON tax_deductions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE marketplace_receivers IS 'Recebedores do split marketplace (proprietários, imobiliárias, parques)';
COMMENT ON TABLE split_config_rules IS 'Regras de % por tipo de serviço (aluguel, ingresso, pacote)';
COMMENT ON TABLE marketplace_split_transactions IS 'Histórico de transações com split';
COMMENT ON TABLE tax_deductions IS 'Despesas dedutíveis para tributação otimizada';
