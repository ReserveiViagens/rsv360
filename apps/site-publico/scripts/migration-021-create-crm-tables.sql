/**
 * Migration 021: Sistema CRM - Tabelas Adicionais
 * Adiciona tabelas complementares ao CRM criado na migration-009
 * 
 * NOTA: As tabelas interactions, segments, customer_segments, campaigns e campaign_recipients
 * já foram criadas na migration-009. Esta migration adiciona apenas:
 * - customer_profiles: Perfis estendidos de clientes
 * - customer_preferences: Preferências específicas de clientes
 */

-- ============================================
-- TABELA: customer_profiles
-- Perfis estendidos de clientes com informações adicionais
-- ============================================
CREATE TABLE IF NOT EXISTS customer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE, -- Se existir tabela customers
  preferences JSONB DEFAULT '{}', -- Preferências gerais do cliente
  loyalty_tier VARCHAR(50) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  total_spent DECIMAL(12, 2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  last_booking_at TIMESTAMP,
  first_booking_at TIMESTAMP,
  average_booking_value DECIMAL(10, 2) DEFAULT 0,
  lifetime_value DECIMAL(12, 2) DEFAULT 0,
  churn_risk_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  engagement_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  tags TEXT[], -- Tags para segmentação rápida
  notes TEXT, -- Notas internas sobre o cliente
  metadata JSONB DEFAULT '{}', -- Dados adicionais flexíveis
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para customer_profiles
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_customer_id ON customer_profiles(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_loyalty_tier ON customer_profiles(loyalty_tier);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_total_spent ON customer_profiles(total_spent DESC);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_tags ON customer_profiles USING GIN(tags);

-- ============================================
-- TABELA: customer_preferences
-- Preferências específicas de clientes
-- ============================================
CREATE TABLE IF NOT EXISTS customer_preferences (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE, -- Se existir tabela customers
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Alternativa se não houver customers
  preference_key VARCHAR(100) NOT NULL, -- Ex: 'room_type', 'breakfast', 'wifi', 'parking', etc.
  preference_value TEXT NOT NULL, -- Valor da preferência (pode ser JSON string)
  preference_type VARCHAR(50) DEFAULT 'string', -- 'string', 'boolean', 'number', 'json'
  category VARCHAR(50), -- 'accommodation', 'services', 'communication', 'marketing', etc.
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(50), -- 'explicit', 'inferred', 'behavioral', 'default'
  confidence DECIMAL(5, 2) DEFAULT 100, -- 0-100, confiança na preferência
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constraints únicos com WHERE (usando índices parciais)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_preferences_customer_key 
  ON customer_preferences(customer_id, preference_key) 
  WHERE customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_preferences_user_key 
  ON customer_preferences(user_id, preference_key) 
  WHERE user_id IS NOT NULL;

-- Índices para customer_preferences
CREATE INDEX IF NOT EXISTS idx_customer_preferences_customer_id ON customer_preferences(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_user_id ON customer_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_key ON customer_preferences(preference_key);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_category ON customer_preferences(category);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_active ON customer_preferences(is_active);

-- ============================================
-- TRIGGERS: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas novas tabelas
CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_preferences_updated_at BEFORE UPDATE ON customer_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================
COMMENT ON TABLE customer_profiles IS 'Perfis estendidos de clientes com informações adicionais para CRM';
COMMENT ON TABLE customer_preferences IS 'Preferências específicas de clientes';
