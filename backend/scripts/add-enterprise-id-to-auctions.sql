-- Script para adicionar enterprise_id à tabela auctions (se necessário)
-- Execute manualmente se a migration não puder rodar: psql -U postgres -d rsv360 -f scripts/add-enterprise-id-to-auctions.sql

-- Criar tabela enterprises se não existir
CREATE TABLE IF NOT EXISTS enterprises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address_city VARCHAR(100),
  address_state VARCHAR(50),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar enterprise_id à auctions se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auctions' AND column_name = 'enterprise_id'
  ) THEN
    ALTER TABLE auctions ADD COLUMN enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE SET NULL;
  END IF;
END $$;
