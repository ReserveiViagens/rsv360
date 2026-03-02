-- Migration 008: Criar tabelas de Sistema de Afiliados
-- Data: 22/01/2025
-- Descrição: Criação das tabelas para sistema de afiliados com comissão de 20% recorrente

-- Tabela de afiliados
CREATE TABLE IF NOT EXISTS affiliates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER, -- Referência para usuário (se existir tabela users)
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  company_name VARCHAR(255),
  tax_id VARCHAR(50), -- CPF/CNPJ
  commission_rate DECIMAL(5,2) DEFAULT 20.00, -- Taxa de comissão em % (recorrente)
  referral_code VARCHAR(50) NOT NULL UNIQUE, -- Código único de referência
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
  total_referrals INTEGER DEFAULT 0, -- Total de hotéis referenciados
  total_commission DECIMAL(10,2) DEFAULT 0, -- Total de comissão acumulada
  total_paid DECIMAL(10,2) DEFAULT 0, -- Total já pago
  payment_method VARCHAR(50), -- pix, bank_transfer, stripe
  payment_details JSONB, -- Detalhes do método de pagamento
  contract_signed BOOLEAN DEFAULT false,
  contract_signed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_created_at ON affiliates(created_at DESC);

-- Tabela de comissões de afiliados
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE SET NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  commission_type VARCHAR(50) DEFAULT 'recurring', -- recurring, one_time
  commission_rate DECIMAL(5,2) NOT NULL,
  base_amount DECIMAL(10,2) NOT NULL, -- Valor base para cálculo
  commission_amount DECIMAL(10,2) NOT NULL, -- Valor da comissão
  period_start DATE, -- Início do período (para comissão recorrente)
  period_end DATE, -- Fim do período (para comissão recorrente)
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, paid, cancelled
  approved_at TIMESTAMP,
  approved_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_enterprise_id ON affiliate_commissions(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_property_id ON affiliate_commissions(property_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_booking_id ON affiliate_commissions(booking_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_period_start ON affiliate_commissions(period_start);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_period_end ON affiliate_commissions(period_end);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_created_at ON affiliate_commissions(created_at DESC);

-- Tabela de payouts de afiliados
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  commission_ids INTEGER[], -- Array de IDs de comissões incluídas
  payment_method VARCHAR(50) NOT NULL,
  payment_details JSONB,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, paid, failed, cancelled
  processed_at TIMESTAMP,
  paid_at TIMESTAMP,
  failure_reason TEXT,
  transaction_id VARCHAR(255), -- ID da transação no gateway de pagamento
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON affiliate_payouts(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_paid_at ON affiliate_payouts(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_created_at ON affiliate_payouts(created_at DESC);

-- Tabela de referências (hotéis referenciados por afiliados)
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  enterprise_id INTEGER NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, cancelled
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(affiliate_id, enterprise_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_enterprise_id ON affiliate_referrals(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referral_code ON affiliate_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_commissions_updated_at BEFORE UPDATE ON affiliate_commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_payouts_updated_at BEFORE UPDATE ON affiliate_payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_referrals_updated_at BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE affiliates IS 'Tabela de afiliados com comissão de 20% recorrente';
COMMENT ON TABLE affiliate_commissions IS 'Tabela de comissões de afiliados';
COMMENT ON TABLE affiliate_payouts IS 'Tabela de pagamentos de comissões a afiliados';
COMMENT ON TABLE affiliate_referrals IS 'Tabela de referências (hotéis referenciados por afiliados)';
