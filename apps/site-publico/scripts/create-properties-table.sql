-- ============================================
-- TABELA: properties (Propriedades/Hotéis)
-- ============================================
-- Esta tabela é necessária para as foreign keys das novas tabelas

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  
  -- Informações básicas
  title VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'BR',
  
  -- Localização
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Características
  bedrooms INTEGER,
  bathrooms INTEGER,
  max_guests INTEGER DEFAULT 1,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Imagens e amenidades
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'pending')),
  
  -- Ratings
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_rating ON properties(rating DESC);

-- Comentários
COMMENT ON TABLE properties IS 'Propriedades/Hotéis disponíveis para reserva';

