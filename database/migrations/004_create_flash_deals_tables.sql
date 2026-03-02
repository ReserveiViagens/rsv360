-- Migration 004: Criar tabelas de Flash Deals, Express Deals e Pricebreakers
-- Data: 22/01/2025
-- Descrição: Criação das tabelas para ofertas relâmpago, expressas e quebra de preços

-- Tabela de Flash Deals
CREATE TABLE IF NOT EXISTS flash_deals (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  accommodation_id INTEGER REFERENCES accommodations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER NOT NULL DEFAULT 0, -- Desconto atual
  max_discount INTEGER NOT NULL DEFAULT 50, -- Desconto máximo
  discount_increment INTEGER DEFAULT 5, -- Incremento de desconto (em %)
  increment_interval INTEGER DEFAULT 60, -- Intervalo em minutos para incrementar desconto
  units_available INTEGER NOT NULL DEFAULT 1,
  units_sold INTEGER DEFAULT 0,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, sold_out, expired, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_flash_deals_enterprise_id ON flash_deals(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_flash_deals_property_id ON flash_deals(property_id);
CREATE INDEX IF NOT EXISTS idx_flash_deals_accommodation_id ON flash_deals(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_flash_deals_status ON flash_deals(status);
CREATE INDEX IF NOT EXISTS idx_flash_deals_start_date ON flash_deals(start_date);
CREATE INDEX IF NOT EXISTS idx_flash_deals_end_date ON flash_deals(end_date);

-- Tabela de Express Deals
CREATE TABLE IF NOT EXISTS express_deals (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  accommodation_id INTEGER REFERENCES accommodations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL, -- Preço fixo
  units_available INTEGER NOT NULL DEFAULT 1,
  units_sold INTEGER DEFAULT 0,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 2,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, sold_out, expired, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_express_deals_enterprise_id ON express_deals(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_express_deals_property_id ON express_deals(property_id);
CREATE INDEX IF NOT EXISTS idx_express_deals_accommodation_id ON express_deals(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_express_deals_status ON express_deals(status);
CREATE INDEX IF NOT EXISTS idx_express_deals_start_date ON express_deals(start_date);
CREATE INDEX IF NOT EXISTS idx_express_deals_end_date ON express_deals(end_date);
CREATE INDEX IF NOT EXISTS idx_express_deals_check_in ON express_deals(check_in);
CREATE INDEX IF NOT EXISTS idx_express_deals_check_out ON express_deals(check_out);

-- Tabela de Pricebreakers
CREATE TABLE IF NOT EXISTS pricebreakers (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  accommodation_id INTEGER REFERENCES accommodations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2) NOT NULL,
  break_price DECIMAL(10,2) NOT NULL, -- Preço quebrado
  break_trigger INTEGER NOT NULL DEFAULT 3, -- Número de unidades vendidas para ativar quebra
  units_sold INTEGER DEFAULT 0,
  units_available INTEGER NOT NULL DEFAULT 10,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, broken, sold_out, expired, cancelled
  broken_at TIMESTAMP, -- Quando a quebra foi ativada
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pricebreakers_enterprise_id ON pricebreakers(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_pricebreakers_property_id ON pricebreakers(property_id);
CREATE INDEX IF NOT EXISTS idx_pricebreakers_accommodation_id ON pricebreakers(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_pricebreakers_status ON pricebreakers(status);
CREATE INDEX IF NOT EXISTS idx_pricebreakers_start_date ON pricebreakers(start_date);
CREATE INDEX IF NOT EXISTS idx_pricebreakers_end_date ON pricebreakers(end_date);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_flash_deals_updated_at BEFORE UPDATE ON flash_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_express_deals_updated_at BEFORE UPDATE ON express_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricebreakers_updated_at BEFORE UPDATE ON pricebreakers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE flash_deals IS 'Tabela de flash deals - ofertas relâmpago com desconto progressivo';
COMMENT ON TABLE express_deals IS 'Tabela de express deals - ofertas expressas com preço fixo';
COMMENT ON TABLE pricebreakers IS 'Tabela de pricebreakers - quebra de preço automática';
