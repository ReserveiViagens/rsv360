-- Migration: Criar tabelas website_content e properties
-- Banco: rsv360
-- Porta: 5433
-- Data: 2025-01-05

-- ============================================
-- 1. Criar tabela website_content
-- ============================================
CREATE TABLE IF NOT EXISTS website_content (
    id SERIAL PRIMARY KEY,
    page_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    images JSONB,
    metadata JSONB,
    seo_data JSONB,
    status VARCHAR(20) DEFAULT 'active',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT unq_website_content_page_content UNIQUE (page_type, content_id)
);

-- Índices para website_content
CREATE INDEX IF NOT EXISTS idx_website_content_page_type ON website_content(page_type);
CREATE INDEX IF NOT EXISTS idx_website_content_status ON website_content(status);
CREATE INDEX IF NOT EXISTS idx_website_content_order ON website_content(order_index);
CREATE INDEX IF NOT EXISTS idx_website_content_page_status ON website_content(page_type, status);

-- ============================================
-- 2. Criar tabela properties
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL,
    address_street VARCHAR(255),
    address_number VARCHAR(50),
    address_complement VARCHAR(255),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100) NOT NULL,
    address_state VARCHAR(50) NOT NULL,
    address_zip_code VARCHAR(20),
    address_country VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    bedrooms INTEGER NOT NULL DEFAULT 0,
    bathrooms INTEGER NOT NULL DEFAULT 0,
    beds INTEGER NOT NULL DEFAULT 0,
    max_guests INTEGER NOT NULL DEFAULT 1,
    area_sqm DECIMAL(10, 2),
    amenities JSONB DEFAULT '{}',
    base_price_per_night DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    cleaning_fee DECIMAL(10, 2) DEFAULT 0,
    service_fee_percentage DECIMAL(5, 2) DEFAULT 0,
    min_stay_nights INTEGER DEFAULT 1,
    max_stay_nights INTEGER,
    check_in_time VARCHAR(10) DEFAULT '14:00',
    check_out_time VARCHAR(10) DEFAULT '11:00',
    status VARCHAR(20) DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    is_instant_book BOOLEAN DEFAULT FALSE,
    cancellation_policy VARCHAR(50) DEFAULT 'moderate',
    images JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para properties
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(address_city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(address_state);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);

-- ============================================
-- 3. Criar tabela website_settings (opcional)
-- ============================================
CREATE TABLE IF NOT EXISTS website_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_website_settings_key ON website_settings(setting_key);

-- ============================================
-- Comentários nas tabelas
-- ============================================
COMMENT ON TABLE website_content IS 'Conteúdo dinâmico do website (hotéis, promoções, atrações, etc.)';
COMMENT ON TABLE properties IS 'Propriedades/hotéis disponíveis para reserva';
COMMENT ON TABLE website_settings IS 'Configurações gerais do website';

COMMENT ON COLUMN website_content.page_type IS 'Tipo: hotels, promotions, attractions, tickets, etc.';
COMMENT ON COLUMN website_content.content_id IS 'Identificador único do item de conteúdo';
COMMENT ON COLUMN website_content.status IS 'Status: active, inactive, draft';

COMMENT ON COLUMN properties.property_type IS 'Tipo: hotel, apartment, house, villa, etc.';
COMMENT ON COLUMN properties.status IS 'Status: active, inactive, maintenance';

-- ============================================
-- Verificação
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Tabelas website_content e properties criadas com sucesso!';
END $$;
