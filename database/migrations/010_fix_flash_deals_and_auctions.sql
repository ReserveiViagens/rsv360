-- =============================================================================
-- Migration 010: Corrigir Flash Deals e Auctions (winner_id)
-- Data: 28/01/2026
-- Descrição: Cria tabela flash_deals se não existir e adiciona winner_id em auctions
-- Execute: psql -U postgres -d rsv_360_ecosystem -f 010_fix_flash_deals_and_auctions.sql
-- Ou via Node: node scripts/executar-migration-flash-deals.js
-- =============================================================================

-- 1. Garantir que a função update_updated_at_column existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. CRIAR TABELA flash_deals (se não existir)
CREATE TABLE IF NOT EXISTS flash_deals (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER,
  property_id INTEGER,
  accommodation_id INTEGER,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER NOT NULL DEFAULT 0,
  max_discount INTEGER NOT NULL DEFAULT 50,
  discount_increment INTEGER DEFAULT 5,
  increment_interval INTEGER DEFAULT 60,
  units_available INTEGER NOT NULL DEFAULT 1,
  units_sold INTEGER DEFAULT 0,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- FKs opcionais - flash_deals funciona sem elas (colunas nullable)

-- Índices para flash_deals
CREATE INDEX IF NOT EXISTS idx_flash_deals_enterprise_id ON flash_deals(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_flash_deals_property_id ON flash_deals(property_id);
CREATE INDEX IF NOT EXISTS idx_flash_deals_accommodation_id ON flash_deals(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_flash_deals_status ON flash_deals(status);
CREATE INDEX IF NOT EXISTS idx_flash_deals_start_date ON flash_deals(start_date);
CREATE INDEX IF NOT EXISTS idx_flash_deals_end_date ON flash_deals(end_date);

-- Trigger para flash_deals
DROP TRIGGER IF EXISTS update_flash_deals_updated_at ON flash_deals;
CREATE TRIGGER update_flash_deals_updated_at BEFORE UPDATE ON flash_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE flash_deals IS 'Tabela de flash deals - ofertas relâmpago com desconto progressivo';

-- 3. ADICIONAR winner_id à tabela auctions (se não existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auctions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'auctions' AND column_name = 'winner_id') THEN
      ALTER TABLE auctions ADD COLUMN winner_id INTEGER;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        BEGIN
          ALTER TABLE auctions ADD CONSTRAINT fk_auctions_winner 
            FOREIGN KEY (winner_id) REFERENCES customers(id) ON DELETE SET NULL;
        EXCEPTION WHEN OTHERS THEN
          NULL; -- Ignora se FK falhar (ex: tipos incompatíveis)
        END;
      END IF;
      CREATE INDEX IF NOT EXISTS idx_auctions_winner_id ON auctions(winner_id);
    END IF;
    
    -- Adicionar winner_bid_id se não existir (sem FK - bids pode ter UUID)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'auctions' AND column_name = 'winner_bid_id') THEN
      ALTER TABLE auctions ADD COLUMN winner_bid_id INTEGER;
    END IF;
  END IF;
END $$;

-- 4. Garantir que bids tem customer_id (para compatibilidade - sem FK se falhar)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bids') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'bids' AND column_name = 'customer_id') THEN
      ALTER TABLE bids ADD COLUMN customer_id INTEGER;
    END IF;
  END IF;
END $$;
