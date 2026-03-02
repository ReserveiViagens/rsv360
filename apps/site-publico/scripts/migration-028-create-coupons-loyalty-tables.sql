-- ✅ ITENS 71-74: MIGRATION 012 - CREATE COUPONS & LOYALTY TABLES
-- Tabelas para Sistema de Cupons/Descontos e Sistema de Fidelidade

-- ============================================
-- TABELA: coupons (Cupons/Descontos)
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Tipo de desconto
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_night')),
  discount_value DECIMAL(10, 2) NOT NULL,
  
  -- Validade
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  
  -- Limites
  min_purchase_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER, -- Limite total de usos
  usage_limit_per_user INTEGER DEFAULT 1, -- Limite por usuário
  
  -- Aplicação
  applicable_to VARCHAR(50) CHECK (applicable_to IN ('all', 'properties', 'categories', 'specific')),
  applicable_properties INTEGER[], -- IDs de propriedades específicas
  applicable_categories VARCHAR(50)[], -- Categorias aplicáveis
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true, -- Se pode ser usado por qualquer um
  
  -- Estatísticas
  total_uses INTEGER DEFAULT 0,
  total_discount_given DECIMAL(10, 2) DEFAULT 0,
  
  -- Metadados
  created_by INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_coupon_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT check_valid_dates CHECK (valid_until >= valid_from),
  CONSTRAINT check_discount_value CHECK (discount_value > 0)
);

-- ============================================
-- TABELA: coupon_usage (Histórico de Uso de Cupons)
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_usage (
  id SERIAL PRIMARY KEY,
  coupon_id INTEGER NOT NULL,
  booking_id INTEGER,
  user_id INTEGER,
  
  -- Dados do uso
  code_used VARCHAR(50) NOT NULL,
  discount_applied DECIMAL(10, 2) NOT NULL,
  original_amount DECIMAL(10, 2) NOT NULL,
  final_amount DECIMAL(10, 2) NOT NULL,
  
  -- Metadados
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  CONSTRAINT fk_coupon_usage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_usage_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_coupon_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABELA: loyalty_points (Pontos de Fidelidade)
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_points (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  
  -- Pontos
  current_points INTEGER DEFAULT 0 NOT NULL,
  lifetime_points INTEGER DEFAULT 0 NOT NULL, -- Total acumulado
  points_redeemed INTEGER DEFAULT 0 NOT NULL,
  
  -- Nível/Tier
  tier VARCHAR(50) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  tier_points_required INTEGER DEFAULT 0, -- Pontos necessários para o tier atual
  
  -- Metadados
  last_activity_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_loyalty_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_loyalty UNIQUE(user_id),
  CONSTRAINT check_points_non_negative CHECK (current_points >= 0)
);

-- ============================================
-- TABELA: loyalty_transactions (Transações de Pontos)
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  loyalty_points_id INTEGER NOT NULL,
  
  -- Tipo de transação
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
    'earned', 'redeemed', 'expired', 'adjusted', 'bonus', 'refund'
  )),
  
  -- Pontos
  points INTEGER NOT NULL, -- Positivo para ganho, negativo para uso
  points_before INTEGER NOT NULL,
  points_after INTEGER NOT NULL,
  
  -- Referência
  reference_type VARCHAR(50), -- 'booking', 'review', 'referral', 'promotion', etc.
  reference_id INTEGER, -- ID da referência (booking_id, review_id, etc.)
  
  -- Descrição
  description TEXT,
  expires_at DATE, -- Data de expiração dos pontos (se aplicável)
  
  -- Metadados
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_loyalty_transaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_loyalty_transaction_loyalty FOREIGN KEY (loyalty_points_id) REFERENCES loyalty_points(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: loyalty_rewards (Recompensas)
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Custo
  points_required INTEGER NOT NULL,
  
  -- Tipo de recompensa
  reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN (
    'discount', 'free_night', 'upgrade', 'cashback', 'gift', 'voucher'
  )),
  reward_value DECIMAL(10, 2), -- Valor da recompensa
  
  -- Disponibilidade
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER, -- Quantidade disponível (NULL = ilimitado)
  valid_from DATE,
  valid_until DATE,
  
  -- Aplicação
  applicable_to VARCHAR(50) CHECK (applicable_to IN ('all', 'properties', 'categories')),
  applicable_properties INTEGER[],
  applicable_categories VARCHAR(50)[],
  
  -- Metadados
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: loyalty_redemptions (Resgates de Recompensas)
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  loyalty_points_id INTEGER NOT NULL,
  reward_id INTEGER NOT NULL,
  booking_id INTEGER, -- Se aplicado a uma reserva
  
  -- Dados do resgate
  points_used INTEGER NOT NULL,
  reward_value DECIMAL(10, 2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'used', 'expired')),
  
  -- Aplicação
  applied_at TIMESTAMP,
  expires_at DATE,
  
  -- Metadados
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_redemption_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_redemption_loyalty FOREIGN KEY (loyalty_points_id) REFERENCES loyalty_points(id) ON DELETE CASCADE,
  CONSTRAINT fk_redemption_reward FOREIGN KEY (reward_id) REFERENCES loyalty_rewards(id) ON DELETE RESTRICT,
  CONSTRAINT fk_redemption_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_booking ON coupon_usage(booking_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON loyalty_points(tier);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_reference ON loyalty_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON loyalty_rewards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_points ON loyalty_rewards(points_required);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_user ON loyalty_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_status ON loyalty_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_reward ON loyalty_redemptions(reward_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_coupon_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_coupon_timestamp
BEFORE UPDATE ON coupons
FOR EACH ROW
EXECUTE FUNCTION update_coupon_timestamp();

CREATE TRIGGER trigger_update_loyalty_points_timestamp
BEFORE UPDATE ON loyalty_points
FOR EACH ROW
EXECUTE FUNCTION update_coupon_timestamp();

CREATE TRIGGER trigger_update_loyalty_rewards_timestamp
BEFORE UPDATE ON loyalty_rewards
FOR EACH ROW
EXECUTE FUNCTION update_coupon_timestamp();

CREATE TRIGGER trigger_update_loyalty_redemptions_timestamp
BEFORE UPDATE ON loyalty_redemptions
FOR EACH ROW
EXECUTE FUNCTION update_coupon_timestamp();

-- Função para atualizar estatísticas de cupom após uso
CREATE OR REPLACE FUNCTION update_coupon_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons
  SET 
    total_uses = total_uses + 1,
    total_discount_given = total_discount_given + NEW.discount_applied,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_coupon_stats
AFTER INSERT ON coupon_usage
FOR EACH ROW
EXECUTE FUNCTION update_coupon_stats();

-- Função para atualizar pontos de fidelidade após transação
CREATE OR REPLACE FUNCTION update_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE loyalty_points
  SET 
    current_points = NEW.points_after,
    lifetime_points = CASE 
      WHEN NEW.transaction_type = 'earned' OR NEW.transaction_type = 'bonus' 
      THEN lifetime_points + ABS(NEW.points)
      ELSE lifetime_points
    END,
    points_redeemed = CASE 
      WHEN NEW.transaction_type = 'redeemed' 
      THEN points_redeemed + ABS(NEW.points)
      ELSE points_redeemed
    END,
    last_activity_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.loyalty_points_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_loyalty_points
AFTER INSERT ON loyalty_transactions
FOR EACH ROW
EXECUTE FUNCTION update_loyalty_points();

-- Comentários
COMMENT ON TABLE coupons IS 'Cupons e descontos disponíveis';
COMMENT ON TABLE coupon_usage IS 'Histórico de uso de cupons';
COMMENT ON TABLE loyalty_points IS 'Pontos de fidelidade dos usuários';
COMMENT ON TABLE loyalty_transactions IS 'Transações de pontos de fidelidade';
COMMENT ON TABLE loyalty_rewards IS 'Recompensas disponíveis para resgate';
COMMENT ON TABLE loyalty_redemptions IS 'Resgates de recompensas de fidelidade';

