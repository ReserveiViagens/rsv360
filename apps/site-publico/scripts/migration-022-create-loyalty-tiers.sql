/**
 * Migration 022: Tabela loyalty_tiers (Níveis/Tiers de Fidelidade)
 * Complementa a migration-012 que já criou loyalty_points, loyalty_transactions, etc.
 * Esta migration adiciona a tabela de tiers (níveis) de fidelidade
 */

-- ============================================
-- TABELA: loyalty_tiers
-- Níveis/Tiers do programa de fidelidade
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Requisitos de pontos
  min_points INTEGER NOT NULL DEFAULT 0,
  max_points INTEGER, -- NULL = sem limite superior
  
  -- Benefícios do tier
  benefits JSONB DEFAULT '{}', -- Benefícios em formato JSON
  discount_percentage DECIMAL(5, 2) DEFAULT 0, -- Desconto percentual
  free_shipping BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  exclusive_offers BOOLEAN DEFAULT false,
  bonus_points_multiplier DECIMAL(3, 2) DEFAULT 1.0, -- Multiplicador de pontos bônus
  
  -- Ordem e status
  tier_order INTEGER NOT NULL DEFAULT 0, -- Ordem de exibição (0 = mais baixo)
  is_active BOOLEAN DEFAULT true,
  
  -- Metadados
  icon VARCHAR(255), -- URL do ícone do tier
  color VARCHAR(50), -- Cor do tier (hex)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_min_points_non_negative CHECK (min_points >= 0),
  CONSTRAINT check_discount_percentage CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  CONSTRAINT check_multiplier_positive CHECK (bonus_points_multiplier > 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_min_points ON loyalty_tiers(min_points);
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_active ON loyalty_tiers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_order ON loyalty_tiers(tier_order);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_loyalty_tier_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_loyalty_tier_timestamp
BEFORE UPDATE ON loyalty_tiers
FOR EACH ROW
EXECUTE FUNCTION update_loyalty_tier_timestamp();

-- Inserir tiers padrão
INSERT INTO loyalty_tiers (name, description, min_points, max_points, tier_order, discount_percentage, benefits, icon, color)
VALUES
  ('Bronze', 'Nível inicial do programa de fidelidade', 0, 999, 1, 0, '{"welcome_bonus": true}', 'bronze', '#CD7F32'),
  ('Silver', 'Nível intermediário com benefícios adicionais', 1000, 4999, 2, 5, '{"priority_support": true, "exclusive_offers": true}', 'silver', '#C0C0C0'),
  ('Gold', 'Nível avançado com grandes benefícios', 5000, 14999, 3, 10, '{"free_shipping": true, "priority_support": true, "exclusive_offers": true, "bonus_multiplier": 1.2}', 'gold', '#FFD700'),
  ('Platinum', 'Nível premium com benefícios exclusivos', 15000, 49999, 4, 15, '{"free_shipping": true, "priority_support": true, "exclusive_offers": true, "bonus_multiplier": 1.5, "concierge_service": true}', 'platinum', '#E5E4E2'),
  ('Diamond', 'Nível máximo com todos os benefícios', 50000, NULL, 5, 20, '{"free_shipping": true, "priority_support": true, "exclusive_offers": true, "bonus_multiplier": 2.0, "concierge_service": true, "vip_events": true}', 'diamond', '#B9F2FF')
ON CONFLICT (name) DO NOTHING;

-- Comentários
COMMENT ON TABLE loyalty_tiers IS 'Níveis/Tiers do programa de fidelidade';
COMMENT ON COLUMN loyalty_tiers.benefits IS 'Benefícios do tier em formato JSON';
COMMENT ON COLUMN loyalty_tiers.tier_order IS 'Ordem de exibição (menor = mais baixo)';

