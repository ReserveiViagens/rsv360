-- Migration 003: Criar tabelas de Leilões (NTX)
-- Data: 22/01/2025
-- Descrição: Criação das tabelas para sistema de leilões e Nexus Travel Exchange

-- Tabela de leilões
CREATE TABLE IF NOT EXISTS auctions (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  accommodation_id INTEGER REFERENCES accommodations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  min_increment DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  reserve_price DECIMAL(10,2),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, finished, cancelled
  winner_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  winner_bid_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_auctions_enterprise_id ON auctions(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_auctions_property_id ON auctions(property_id);
CREATE INDEX IF NOT EXISTS idx_auctions_accommodation_id ON auctions(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_start_date ON auctions(start_date);
CREATE INDEX IF NOT EXISTS idx_auctions_end_date ON auctions(end_date);
CREATE INDEX IF NOT EXISTS idx_auctions_winner_id ON auctions(winner_id);

-- Tabela de lances
CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, outbid
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_customer_id ON bids(customer_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(amount DESC);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at DESC);

-- Adicionar foreign key para winner_bid_id na tabela auctions
ALTER TABLE auctions 
ADD CONSTRAINT fk_auctions_winner_bid 
FOREIGN KEY (winner_bid_id) REFERENCES bids(id) ON DELETE SET NULL;

-- Tabela de pedidos (Asks) para NTX
CREATE TABLE IF NOT EXISTS asks (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  accommodation_id INTEGER REFERENCES accommodations(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  max_price DECIMAL(10,2) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) DEFAULT 'active', -- active, matched, expired, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_asks_enterprise_id ON asks(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_asks_property_id ON asks(property_id);
CREATE INDEX IF NOT EXISTS idx_asks_accommodation_id ON asks(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_asks_customer_id ON asks(customer_id);
CREATE INDEX IF NOT EXISTS idx_asks_status ON asks(status);
CREATE INDEX IF NOT EXISTS idx_asks_max_price ON asks(max_price);
CREATE INDEX IF NOT EXISTS idx_asks_check_in ON asks(check_in);
CREATE INDEX IF NOT EXISTS idx_asks_check_out ON asks(check_out);

-- Tabela de matches (NTX)
CREATE TABLE IF NOT EXISTS marketmatches (
  id SERIAL PRIMARY KEY,
  bid_id INTEGER REFERENCES bids(id) ON DELETE SET NULL,
  ask_id INTEGER REFERENCES asks(id) ON DELETE SET NULL,
  auction_id INTEGER REFERENCES auctions(id) ON DELETE SET NULL,
  price DECIMAL(10,2) NOT NULL,
  matched_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, expired
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_marketmatches_bid_id ON marketmatches(bid_id);
CREATE INDEX IF NOT EXISTS idx_marketmatches_ask_id ON marketmatches(ask_id);
CREATE INDEX IF NOT EXISTS idx_marketmatches_auction_id ON marketmatches(auction_id);
CREATE INDEX IF NOT EXISTS idx_marketmatches_status ON marketmatches(status);
CREATE INDEX IF NOT EXISTS idx_marketmatches_matched_at ON marketmatches(matched_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asks_updated_at BEFORE UPDATE ON asks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketmatches_updated_at BEFORE UPDATE ON marketmatches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE auctions IS 'Tabela de leilões de acomodações';
COMMENT ON TABLE bids IS 'Tabela de lances em leilões';
COMMENT ON TABLE asks IS 'Tabela de pedidos (asks) para NTX - leilões reversos';
COMMENT ON TABLE marketmatches IS 'Tabela de matches entre bids e asks no NTX';
