-- ✅ Migration 033: Criar tabela shared_locations
-- Tabela de localizações compartilhadas para referências em outras migrations
-- Data: 2025-12-16
-- Deve ser executada antes de migration-034-improve-location-sharing.sql

CREATE TABLE IF NOT EXISTS shared_locations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id VARCHAR(255) NOT NULL,
  
  -- Coordenadas
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2), -- Precisão em metros
  altitude DECIMAL(8, 2),
  heading DECIMAL(5, 2), -- Direção em graus (0-360)
  speed DECIMAL(6, 2), -- Velocidade em m/s
  
  -- Endereço
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50),
  postal_code VARCHAR(20),
  
  -- Metadados
  device_info JSONB DEFAULT '{}',
  battery_level INTEGER, -- 0-100
  is_moving BOOLEAN DEFAULT false,
  
  -- Privacidade (campos básicos, migration-034 adiciona mais)
  privacy_level VARCHAR(20) DEFAULT 'friends',
  
  -- Timestamps
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_shared_locations_user_id ON shared_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_locations_group_id ON shared_locations(group_id);
CREATE INDEX IF NOT EXISTS idx_shared_locations_shared_at ON shared_locations(shared_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_locations_privacy ON shared_locations(privacy_level);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_shared_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shared_locations_updated_at
BEFORE UPDATE ON shared_locations
FOR EACH ROW
EXECUTE FUNCTION update_shared_locations_updated_at();

-- Comentários
COMMENT ON TABLE shared_locations IS 'Tabela de localizações compartilhadas para referências em outras migrations';
COMMENT ON COLUMN shared_locations.group_id IS 'ID do grupo (booking, trip, etc.)';
COMMENT ON COLUMN shared_locations.privacy_level IS 'Nível de privacidade: public, friends, private';
