-- ===================================================================
-- SCRIPT: Criar tabela user_profiles para perfil completo de usuário
-- Sistema RSV 360 - Perfil de Host/Usuário para Aluguel por Temporada
-- ===================================================================

-- Criar tabela de perfis de usuário (extensão da tabela users)
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Nome e Foto
    username VARCHAR(100) UNIQUE,
    avatar_url TEXT,
    profile_picture TEXT,
    company_logo TEXT,
    
    -- Biografia e Descrição
    bio TEXT,
    description TEXT,
    short_description VARCHAR(500),
    tagline VARCHAR(200),
    
    -- Informações de Contato
    website_url TEXT,
    booking_url TEXT,
    whatsapp VARCHAR(50),
    
    -- Localização
    location VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Brasil',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Informações de Negócio
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    tax_id VARCHAR(50), -- CNPJ
    business_registration VARCHAR(100),
    years_experience INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    
    -- Propriedades
    property_count INTEGER DEFAULT 0,
    max_guests INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    
    -- Mídia (JSONB para arrays)
    profile_photos JSONB DEFAULT '[]',
    property_photos JSONB DEFAULT '[]',
    video_urls JSONB DEFAULT '[]',
    gallery JSONB DEFAULT '[]',
    
    -- Categorias e Serviços
    categories JSONB DEFAULT '[]', -- ['cabanas', 'apartamentos', 'casas']
    services JSONB DEFAULT '[]', -- ['limpeza', 'transporte', 'café da manhã']
    specialties JSONB DEFAULT '[]', -- ['luxo', 'romântico', 'família']
    amenities JSONB DEFAULT '[]', -- ['piscina', 'wifi', 'ar condicionado']
    property_features JSONB DEFAULT '[]', -- ['vista para o mar', 'varanda']
    property_types JSONB DEFAULT '[]', -- ['casa', 'apartamento', 'chalé']
    
    -- Redes Sociais
    social_media JSONB DEFAULT '{}', -- {"facebook": "...", "instagram": "..."}
    
    -- Estatísticas e Reputação
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    response_rate DECIMAL(5, 2) DEFAULT 0, -- 0-100%
    response_time INTEGER, -- tempo médio em minutos
    total_bookings INTEGER DEFAULT 0,
    cancellation_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Preferências
    language VARCHAR(10) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    currency VARCHAR(3) DEFAULT 'BRL',
    notification_preferences JSONB DEFAULT '{}',
    
    -- Metadados extras
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(city, state);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verified ON user_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_rating ON user_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_type ON user_profiles(business_type);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE user_profiles IS 'Perfis completos de usuários/hosts para aluguel por temporada';
COMMENT ON COLUMN user_profiles.categories IS 'Categorias do negócio: ["cabanas", "apartamentos", "casas"]';
COMMENT ON COLUMN user_profiles.services IS 'Serviços extras oferecidos: ["limpeza", "transporte", "café da manhã"]';
COMMENT ON COLUMN user_profiles.social_media IS 'Links de redes sociais: {"facebook": "...", "instagram": "..."}';

-- Exemplo de dados JSONB:
-- categories: ["cabanas", "apartamentos", "casas de temporada"]
-- services: ["limpeza diária", "transporte do aeroporto", "café da manhã", "concierge"]
-- social_media: {"facebook": "https://facebook.com/...", "instagram": "https://instagram.com/..."}
-- gallery: [{"type": "photo", "url": "...", "caption": "..."}, {"type": "video", "url": "..."}]

