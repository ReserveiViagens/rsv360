/**
 * ✅ TAREFA MEDIUM-6: Migration para melhorar compartilhamento de localização
 * Adiciona tabelas e campos para privacidade e melhorias
 */

-- Tabela de configurações de privacidade de localização
CREATE TABLE IF NOT EXISTS location_privacy_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id VARCHAR(255) NOT NULL,
  privacy_level VARCHAR(20) NOT NULL DEFAULT 'friends', -- public, friends, private
  visible_to INTEGER[], -- IDs de usuários que podem ver
  auto_stop_after INTEGER, -- Parar automaticamente após X minutos
  min_accuracy INTEGER DEFAULT 50, -- Precisão mínima aceitável (metros)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, group_id)
);

-- Adicionar campos de privacidade na tabela shared_locations (se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shared_locations' AND column_name = 'privacy_level'
  ) THEN
    ALTER TABLE shared_locations 
    ADD COLUMN privacy_level VARCHAR(20) DEFAULT 'friends',
    ADD COLUMN visible_to INTEGER[],
    ADD COLUMN accuracy_improved BOOLEAN DEFAULT false,
    ADD COLUMN geocoding_attempts INTEGER DEFAULT 0;
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_location_privacy_user_group ON location_privacy_settings(user_id, group_id);
CREATE INDEX IF NOT EXISTS idx_shared_locations_privacy ON shared_locations(privacy_level, user_id);

-- Tabela de histórico de localizações (para análise e privacidade)
CREATE TABLE IF NOT EXISTS location_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2),
  address TEXT,
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  privacy_level VARCHAR(20) DEFAULT 'friends',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_location_history_user_group ON location_history(user_id, group_id, shared_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_history_shared_at ON location_history(shared_at DESC);

-- Comentários
COMMENT ON TABLE location_privacy_settings IS 'Configurações de privacidade para compartilhamento de localização';
COMMENT ON TABLE location_history IS 'Histórico de localizações compartilhadas (para análise e auditoria)';

