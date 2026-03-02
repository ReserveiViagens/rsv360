-- =====================================================
-- Migration: The Global Route Exchange
-- Sistema de Bolsa de Valores de Destinos
-- =====================================================

-- 1. Tabela de Mercados de Destinos
CREATE TABLE IF NOT EXISTS route_exchange_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_code VARCHAR(10) UNIQUE NOT NULL, -- Ex: PAR, TYO, DXB
  destination_name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  category VARCHAR(50) NOT NULL, -- hotel, flight, package, activity
  base_currency VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, closed
  metadata JSONB, -- Informações adicionais (clima, segurança, etc)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de Bids (Ordens de Compra)
CREATE TABLE IF NOT EXISTS route_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES route_exchange_markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bid_type VARCHAR(20) NOT NULL, -- market, limit, stop
  bid_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL, -- Número de pessoas/quartos/passagens
  max_price DECIMAL(10,2), -- Para limit orders
  travel_dates JSONB NOT NULL, -- {check_in, check_out, flexible: boolean}
  requirements JSONB, -- Requisitos específicos (hotel 5*, transfer, etc)
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, matched, cancelled, expired
  verification_hash VARCHAR(64), -- Proof of Transparency
  expires_at TIMESTAMP,
  matched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de Asks (Ordens de Venda)
CREATE TABLE IF NOT EXISTS route_asks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES route_exchange_markets(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL, -- Fornecedor/Operadora
  ask_type VARCHAR(20) NOT NULL, -- market, limit
  ask_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  min_price DECIMAL(10,2), -- Para limit orders
  availability_dates JSONB NOT NULL, -- Datas disponíveis
  supplier_info JSONB, -- Informações do fornecedor (rating, certificações)
  status VARCHAR(20) DEFAULT 'active', -- active, matched, cancelled, expired
  verification_hash VARCHAR(64), -- Proof of Transparency
  expires_at TIMESTAMP,
  matched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabela de Matches (Negócios Fechados - Strikes)
CREATE TABLE IF NOT EXISTS route_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID REFERENCES route_bids(id) ON DELETE SET NULL,
  ask_id UUID REFERENCES route_asks(id) ON DELETE SET NULL,
  market_id UUID REFERENCES route_exchange_markets(id) ON DELETE CASCADE,
  strike_price DECIMAL(10,2) NOT NULL,
  spread DECIMAL(10,2) NOT NULL, -- Margem do sistema
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL, -- Taxa do sistema
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, paid, cancelled
  payment_status VARCHAR(20) DEFAULT 'pending',
  verification_hash VARCHAR(64) NOT NULL, -- Hash do match completo
  matched_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabela de RFPs (Request for Proposal - Licitações)
CREATE TABLE IF NOT EXISTS route_rfps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  destination_code VARCHAR(10),
  travel_dates JSONB NOT NULL,
  requirements JSONB NOT NULL, -- Requisitos técnicos dinâmicos
  budget_range JSONB, -- {min, max}
  participants_count INTEGER NOT NULL,
  category VARCHAR(50), -- group_travel, corporate, event
  status VARCHAR(20) DEFAULT 'open', -- open, bidding, closed, awarded
  bidding_deadline TIMESTAMP NOT NULL,
  auto_attach_requirements BOOLEAN DEFAULT true, -- Dynamic RFQ
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Tabela de Propostas de RFP
CREATE TABLE IF NOT EXISTS route_rfp_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID REFERENCES route_rfps(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL,
  proposal_data JSONB NOT NULL, -- Dados completos da proposta
  total_price DECIMAL(10,2) NOT NULL,
  quality_score DECIMAL(3,2), -- Score de qualidade (0-5)
  price_score DECIMAL(3,2), -- Score de preço (0-5)
  combined_score DECIMAL(3,2), -- Score combinado
  status VARCHAR(20) DEFAULT 'submitted', -- submitted, shortlisted, awarded, rejected
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Tabela de Histórico de Preços (Para Candlesticks)
CREATE TABLE IF NOT EXISTS route_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES route_exchange_markets(id) ON DELETE CASCADE,
  period_start TIMESTAMP NOT NULL, -- Início do período (hora, dia, semana)
  period_type VARCHAR(10) NOT NULL, -- hour, day, week, month
  open_price DECIMAL(10,2) NOT NULL,
  high_price DECIMAL(10,2) NOT NULL,
  low_price DECIMAL(10,2) NOT NULL,
  close_price DECIMAL(10,2) NOT NULL,
  volume INTEGER NOT NULL, -- Número de matches
  total_value DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Tabela de Logs de Verificação (Proof of Transparency)
CREATE TABLE IF NOT EXISTS route_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL, -- bid, ask, match
  entity_id UUID NOT NULL,
  verification_hash VARCHAR(64) NOT NULL,
  previous_hash VARCHAR(64), -- Para cadeia de verificação
  data_snapshot JSONB NOT NULL, -- Snapshot dos dados no momento
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para Order Book (queries rápidas de bids/asks)
CREATE INDEX IF NOT EXISTS idx_bids_market_status ON route_bids(market_id, status);
CREATE INDEX IF NOT EXISTS idx_bids_price ON route_bids(bid_price DESC);
CREATE INDEX IF NOT EXISTS idx_bids_user ON route_bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_status_created ON route_bids(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_asks_market_status ON route_asks(market_id, status);
CREATE INDEX IF NOT EXISTS idx_asks_price ON route_asks(ask_price ASC);
CREATE INDEX IF NOT EXISTS idx_asks_supplier ON route_asks(supplier_id);
CREATE INDEX IF NOT EXISTS idx_asks_status_created ON route_asks(status, created_at DESC);

-- Índices para Matches
CREATE INDEX IF NOT EXISTS idx_matches_market ON route_matches(market_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON route_matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_matched_at ON route_matches(matched_at DESC);

-- Índices para Price History (gráficos)
CREATE INDEX IF NOT EXISTS idx_price_history_market_period ON route_price_history(market_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_period_type ON route_price_history(period_type, period_start DESC);

-- Índices para RFPs
CREATE INDEX IF NOT EXISTS idx_rfps_status_deadline ON route_rfps(status, bidding_deadline);
CREATE INDEX IF NOT EXISTS idx_rfps_client ON route_rfps(client_id);
CREATE INDEX IF NOT EXISTS idx_rfps_destination ON route_rfps(destination_code);

-- Índices para Propostas
CREATE INDEX IF NOT EXISTS idx_proposals_rfp ON route_rfp_proposals(rfp_id);
CREATE INDEX IF NOT EXISTS idx_proposals_supplier ON route_rfp_proposals(supplier_id);
CREATE INDEX IF NOT EXISTS idx_proposals_score ON route_rfp_proposals(combined_score DESC);

-- Índices para Verificação
CREATE INDEX IF NOT EXISTS idx_verification_entity ON route_verification_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_verification_hash ON route_verification_logs(verification_hash);

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE route_exchange_markets IS 'Mercados de destinos disponíveis na bolsa';
COMMENT ON TABLE route_bids IS 'Ordens de compra (Bids) dos viajantes';
COMMENT ON TABLE route_asks IS 'Ordens de venda (Asks) dos fornecedores';
COMMENT ON TABLE route_matches IS 'Negócios fechados (Strikes) quando bid e ask se encontram';
COMMENT ON TABLE route_rfps IS 'Request for Proposal - Licitações de viagens';
COMMENT ON TABLE route_rfp_proposals IS 'Propostas dos fornecedores para RFPs';
COMMENT ON TABLE route_price_history IS 'Histórico de preços para gráficos de candlesticks';
COMMENT ON TABLE route_verification_logs IS 'Logs de verificação para Proof of Transparency';
