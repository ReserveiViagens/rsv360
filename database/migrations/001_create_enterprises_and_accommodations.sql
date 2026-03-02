-- ===================================================================
-- ARQUITETURA MULTI-ACOMODAÇÕES
-- Sistema hierárquico: Empreendimento > Propriedade > Acomodação > Quarto
-- ===================================================================

-- ===================================================================
-- 1. EMPREENDIMENTOS (Hotéis, Pousadas, Resorts, etc.)
-- ===================================================================

CREATE TABLE IF NOT EXISTS enterprises (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER,
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  description TEXT,
  enterprise_type VARCHAR(50) NOT NULL CHECK (enterprise_type IN (
    'hotel', 'pousada', 'resort', 'flat', 'chacara', 'hostel', 
    'apartment_hotel', 'resort_apartment', 'resort_house', 
    'hotel_house', 'airbnb', 'other'
  )),
  
  -- Endereço
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
  
  -- Contato
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Configurações
  check_in_time TIME DEFAULT '15:00',
  check_out_time TIME DEFAULT '11:00',
  cancellation_policy VARCHAR(50) DEFAULT 'moderate',
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'pending_approval')),
  is_featured BOOLEAN DEFAULT false,
  
  -- Imagens e mídia
  logo_url VARCHAR(500),
  images JSONB DEFAULT '[]',
  
  -- Metadados
  amenities JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_enterprise_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_enterprises_type ON enterprises(enterprise_type);
CREATE INDEX idx_enterprises_city ON enterprises(address_city);
CREATE INDEX idx_enterprises_status ON enterprises(status);

-- ===================================================================
-- 2. PROPRIEDADES (Apartamentos, Casas, Quartos dentro de Empreendimentos)
-- ===================================================================

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50) NOT NULL CHECK (property_type IN (
    'room', 'apartment', 'house', 'suite', 'villa', 'bungalow', 
    'chalet', 'cabin', 'studio', 'penthouse', 'other'
  )),
  
  -- Identificação
  room_number VARCHAR(50),
  floor_number INTEGER,
  building_name VARCHAR(255),
  
  -- Características
  bedrooms INTEGER DEFAULT 0,
  bathrooms DECIMAL(3, 1) DEFAULT 0,
  beds INTEGER DEFAULT 0,
  max_guests INTEGER NOT NULL DEFAULT 1,
  area_sqm DECIMAL(10, 2),
  
  -- Amenidades específicas da propriedade
  amenities JSONB DEFAULT '[]',
  
  -- Preços (podem herdar do empreendimento ou ter valores próprios)
  base_price_per_night DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'BRL',
  cleaning_fee DECIMAL(10, 2) DEFAULT 0,
  service_fee_percentage DECIMAL(5, 2),
  
  -- Regras específicas
  min_stay_nights INTEGER DEFAULT 1,
  max_stay_nights INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'reserved')),
  is_featured BOOLEAN DEFAULT false,
  is_instant_book BOOLEAN DEFAULT false,
  
  -- Imagens
  images JSONB DEFAULT '[]',
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_property_enterprise FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE
);

CREATE INDEX idx_properties_enterprise ON properties(enterprise_id);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_room_number ON properties(room_number);

-- ===================================================================
-- 3. ACOMODAÇÕES (Quartos individuais dentro de Propriedades)
-- ===================================================================

CREATE TABLE IF NOT EXISTS accommodations (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  accommodation_type VARCHAR(50) NOT NULL CHECK (accommodation_type IN (
    'single_room', 'double_room', 'twin_room', 'triple_room', 
    'quad_room', 'family_room', 'suite', 'apartment', 'house', 'other'
  )),
  
  -- Identificação
  room_number VARCHAR(50),
  floor_number INTEGER,
  
  -- Características
  bedrooms INTEGER DEFAULT 0,
  bathrooms DECIMAL(3, 1) DEFAULT 0,
  beds INTEGER DEFAULT 0,
  bed_type VARCHAR(50), -- 'single', 'double', 'queen', 'king', 'bunk'
  max_guests INTEGER NOT NULL DEFAULT 1,
  area_sqm DECIMAL(10, 2),
  
  -- Amenidades específicas
  amenities JSONB DEFAULT '[]',
  
  -- Preços (podem herdar da propriedade ou ter valores próprios)
  base_price_per_night DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'BRL',
  cleaning_fee DECIMAL(10, 2) DEFAULT 0,
  
  -- Regras específicas
  min_stay_nights INTEGER DEFAULT 1,
  max_stay_nights INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'reserved', 'cleaning')),
  is_featured BOOLEAN DEFAULT false,
  is_instant_book BOOLEAN DEFAULT false,
  
  -- Imagens
  images JSONB DEFAULT '[]',
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_accommodation_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE INDEX idx_accommodations_property ON accommodations(property_id);
CREATE INDEX idx_accommodations_type ON accommodations(accommodation_type);
CREATE INDEX idx_accommodations_status ON accommodations(status);
CREATE INDEX idx_accommodations_room_number ON accommodations(room_number);

-- ===================================================================
-- 4. RESERVAS (Atualizada para suportar hierarquia)
-- ===================================================================

-- Adicionar campos à tabela de reservas (se já existir)
DO $$ 
BEGIN
  -- Adicionar campos se não existirem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'enterprise_id') THEN
    ALTER TABLE bookings ADD COLUMN enterprise_id INTEGER;
    ALTER TABLE bookings ADD CONSTRAINT fk_booking_enterprise 
      FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE SET NULL;
    CREATE INDEX idx_bookings_enterprise ON bookings(enterprise_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'property_id') THEN
    ALTER TABLE bookings ADD COLUMN property_id INTEGER;
    ALTER TABLE bookings ADD CONSTRAINT fk_booking_property 
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;
    CREATE INDEX idx_bookings_property ON bookings(property_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'accommodation_id') THEN
    ALTER TABLE bookings ADD COLUMN accommodation_id INTEGER;
    ALTER TABLE bookings ADD CONSTRAINT fk_booking_accommodation 
      FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE SET NULL;
    CREATE INDEX idx_bookings_accommodation ON bookings(accommodation_id);
  END IF;
END $$;

-- ===================================================================
-- 5. DISPONIBILIDADE E PREÇOS DINÂMICOS
-- ===================================================================

CREATE TABLE IF NOT EXISTS accommodation_availability (
  id SERIAL PRIMARY KEY,
  accommodation_id INTEGER NOT NULL,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  price_override DECIMAL(10, 2), -- Preço específico para esta data
  min_stay_override INTEGER, -- Estadia mínima específica
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_availability_accommodation FOREIGN KEY (accommodation_id) 
    REFERENCES accommodations(id) ON DELETE CASCADE,
  CONSTRAINT uq_accommodation_date UNIQUE (accommodation_id, date)
);

CREATE INDEX idx_availability_accommodation ON accommodation_availability(accommodation_id);
CREATE INDEX idx_availability_date ON accommodation_availability(date);
CREATE INDEX idx_availability_available ON accommodation_availability(is_available);

-- ===================================================================
-- 6. REGRAS DE PREÇO (Sazonalidade, eventos, etc.)
-- ===================================================================

CREATE TABLE IF NOT EXISTS pricing_rules (
  id SERIAL PRIMARY KEY,
  accommodation_id INTEGER,
  property_id INTEGER,
  enterprise_id INTEGER,
  
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
    'seasonal', 'weekend', 'holiday', 'event', 'last_minute', 'early_bird', 'custom'
  )),
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Período
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Aplicação
  days_of_week INTEGER[], -- [1,2,3,4,5,6,7] onde 1=domingo
  min_stay_nights INTEGER,
  max_stay_nights INTEGER,
  
  -- Modificadores de preço
  price_modifier_type VARCHAR(50) CHECK (price_modifier_type IN ('fixed', 'percentage', 'multiplier')),
  price_modifier_value DECIMAL(10, 2),
  
  -- Prioridade (maior número = maior prioridade)
  priority INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_pricing_accommodation FOREIGN KEY (accommodation_id) 
    REFERENCES accommodations(id) ON DELETE CASCADE,
  CONSTRAINT fk_pricing_property FOREIGN KEY (property_id) 
    REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT fk_pricing_enterprise FOREIGN KEY (enterprise_id) 
    REFERENCES enterprises(id) ON DELETE CASCADE,
  
  -- Garantir que pelo menos um relacionamento existe
  CONSTRAINT chk_pricing_relation CHECK (
    (accommodation_id IS NOT NULL)::int + 
    (property_id IS NOT NULL)::int + 
    (enterprise_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX idx_pricing_rules_accommodation ON pricing_rules(accommodation_id);
CREATE INDEX idx_pricing_rules_property ON pricing_rules(property_id);
CREATE INDEX idx_pricing_rules_enterprise ON pricing_rules(enterprise_id);
CREATE INDEX idx_pricing_rules_dates ON pricing_rules(start_date, end_date);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active);

-- ===================================================================
-- 7. COMENTÁRIOS E TRIGGERS
-- ===================================================================

COMMENT ON TABLE enterprises IS 'Empreendimentos: Hotéis, Pousadas, Resorts, etc.';
COMMENT ON TABLE properties IS 'Propriedades dentro de empreendimentos: Apartamentos, Casas, Quartos';
COMMENT ON TABLE accommodations IS 'Acomodações individuais: Quartos específicos dentro de propriedades';
COMMENT ON TABLE accommodation_availability IS 'Disponibilidade e preços dinâmicos por data';
COMMENT ON TABLE pricing_rules IS 'Regras de preço: Sazonalidade, eventos, etc.';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enterprises_updated_at BEFORE UPDATE ON enterprises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accommodations_updated_at BEFORE UPDATE ON accommodations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON accommodation_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
