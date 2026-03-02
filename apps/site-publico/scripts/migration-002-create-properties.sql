-- ✅ ITEM 43: MIGRATION 002 - CREATE PROPERTIES
-- Tabela properties completa com relacionamentos e índices

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50) NOT NULL, -- 'apartment', 'house', 'hotel', 'resort', 'cabin', 'villa', 'other'
  address_street VARCHAR(255),
  address_number VARCHAR(50),
  address_complement VARCHAR(255),
  address_neighborhood VARCHAR(255),
  address_city VARCHAR(255) NOT NULL,
  address_state VARCHAR(2) NOT NULL,
  address_zip_code VARCHAR(20),
  address_country VARCHAR(100) DEFAULT 'Brasil',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Características
  bedrooms INTEGER DEFAULT 0,
  bathrooms DECIMAL(3, 1) DEFAULT 0,
  beds INTEGER DEFAULT 0,
  max_guests INTEGER NOT NULL DEFAULT 1,
  area_sqm DECIMAL(10, 2),
  
  -- Amenidades (JSONB para flexibilidade)
  amenities JSONB,
  
  -- Preços
  base_price_per_night DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BRL',
  cleaning_fee DECIMAL(10, 2) DEFAULT 0,
  service_fee_percentage DECIMAL(5, 2) DEFAULT 10.00,
  
  -- Regras
  min_stay_nights INTEGER DEFAULT 1,
  max_stay_nights INTEGER,
  check_in_time TIME DEFAULT '15:00',
  check_out_time TIME DEFAULT '11:00',
  
  -- Status e configurações
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'pending_approval')),
  is_featured BOOLEAN DEFAULT false,
  is_instant_book BOOLEAN DEFAULT false,
  cancellation_policy VARCHAR(50) DEFAULT 'moderate' CHECK (cancellation_policy IN ('flexible', 'moderate', 'strict', 'super_strict')),
  
  -- Imagens
  images JSONB, -- Array de URLs de imagens
  
  -- Metadados
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relacionamentos
  CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties(address_city, address_state);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_properties_created ON properties(created_at DESC);

-- Índice GIN para busca em JSONB
CREATE INDEX IF NOT EXISTS idx_properties_amenities_gin ON properties USING GIN(amenities);
CREATE INDEX IF NOT EXISTS idx_properties_metadata_gin ON properties USING GIN(metadata);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_properties_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_properties_timestamp
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_properties_timestamp();

-- Comentários
COMMENT ON TABLE properties IS 'Propriedades disponíveis para reserva';
COMMENT ON COLUMN properties.amenities IS 'Array JSON de amenidades (ex: ["wifi", "pool", "parking"])';
COMMENT ON COLUMN properties.images IS 'Array JSON de URLs de imagens';
COMMENT ON COLUMN properties.metadata IS 'Dados adicionais em formato JSON';

