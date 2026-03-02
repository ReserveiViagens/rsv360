-- Migration 007: Criar tabelas de Marketplace Multi-Hotéis
-- Data: 22/01/2025
-- Descrição: Criação das tabelas para marketplace com comissão de 8%

-- Tabela de listagens no marketplace
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  accommodation_id INTEGER REFERENCES accommodations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 8.00, -- Taxa de comissão em %
  base_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, active, inactive
  approval_date TIMESTAMP,
  approved_by INTEGER,
  rejection_reason TEXT,
  ranking_score DECIMAL(10,2) DEFAULT 0, -- Score baseado em RevPAR, ocupação e reviews
  total_views INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_enterprise_id ON marketplace_listings(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_property_id ON marketplace_listings(property_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_accommodation_id ON marketplace_listings(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_ranking_score ON marketplace_listings(ranking_score DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON marketplace_listings(created_at DESC);

-- Tabela de pedidos do marketplace
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  base_price DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL, -- Comissão calculada
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
  commission_paid BOOLEAN DEFAULT false,
  commission_paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_listing_id ON marketplace_orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_customer_id ON marketplace_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_booking_id ON marketplace_orders(booking_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON marketplace_orders(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_payment_status ON marketplace_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_check_in ON marketplace_orders(check_in);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_check_out ON marketplace_orders(check_out);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_created_at ON marketplace_orders(created_at DESC);

-- Tabela de comissões do marketplace
CREATE TABLE IF NOT EXISTS marketplace_commissions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  enterprise_id INTEGER NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
  paid_at TIMESTAMP,
  payout_id INTEGER, -- Referência para tabela de payouts (se existir)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_marketplace_commissions_order_id ON marketplace_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_commissions_listing_id ON marketplace_commissions(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_commissions_enterprise_id ON marketplace_commissions(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_commissions_status ON marketplace_commissions(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_commissions_paid_at ON marketplace_commissions(paid_at DESC);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_orders_updated_at BEFORE UPDATE ON marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_commissions_updated_at BEFORE UPDATE ON marketplace_commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE marketplace_listings IS 'Tabela de listagens no marketplace multi-hotéis';
COMMENT ON TABLE marketplace_orders IS 'Tabela de pedidos do marketplace';
COMMENT ON TABLE marketplace_commissions IS 'Tabela de comissões do marketplace (8%)';
