-- ✅ ITENS 63-70: MIGRATION 011 - CREATE OTA/PMS INTEGRATIONS TABLES
-- Tabelas para integrações Cloudbeds, Airbnb, Booking.com

-- ============================================
-- TABELA: integration_config (Configurações de Integrações)
-- ============================================
CREATE TABLE IF NOT EXISTS integration_config (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('pms', 'ota', 'channel_manager')),
  integration_name VARCHAR(100) NOT NULL, -- 'cloudbeds', 'airbnb', 'booking', etc.
  
  -- Credenciais (criptografadas)
  credentials JSONB NOT NULL, -- { api_key, api_secret, access_token, refresh_token, etc. }
  
  -- Configurações
  config JSONB, -- Configurações específicas da integração
  is_active BOOLEAN DEFAULT true,
  auto_sync BOOLEAN DEFAULT true,
  sync_interval_minutes INTEGER DEFAULT 15,
  
  -- Status
  last_sync_at TIMESTAMP,
  last_sync_status VARCHAR(50) CHECK (last_sync_status IN ('success', 'error', 'partial')),
  last_sync_error TEXT,
  
  -- Metadados
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_integration_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT unique_property_integration UNIQUE(property_id, integration_type, integration_name)
);

-- ============================================
-- TABELA: sync_logs (Logs de Sincronização)
-- ============================================
CREATE TABLE IF NOT EXISTS sync_logs (
  id SERIAL PRIMARY KEY,
  integration_config_id INTEGER NOT NULL,
  
  -- Tipo de sincronização
  sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN (
    'full', 'bookings', 'availability', 'pricing', 'inventory', 'reviews', 'messages'
  )),
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('import', 'export', 'bidirectional')),
  
  -- Resultado
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'error', 'partial', 'conflict')),
  records_processed INTEGER DEFAULT 0,
  records_successful INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  conflicts_detected INTEGER DEFAULT 0,
  
  -- Detalhes
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  error_message TEXT,
  error_details JSONB,
  
  -- Metadados
  metadata JSONB,
  
  CONSTRAINT fk_sync_log_integration FOREIGN KEY (integration_config_id) REFERENCES integration_config(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: sync_conflicts (Conflitos de Sincronização)
-- ============================================
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id SERIAL PRIMARY KEY,
  integration_config_id INTEGER NOT NULL,
  sync_log_id INTEGER,
  
  -- Tipo de conflito
  conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN (
    'booking_overlap', 'price_mismatch', 'availability_mismatch', 'status_mismatch', 'other'
  )),
  
  -- Entidades envolvidas
  entity_type VARCHAR(50) NOT NULL, -- 'booking', 'availability', 'price', etc.
  entity_id INTEGER, -- ID da entidade no RSV
  external_id VARCHAR(255), -- ID na plataforma externa
  
  -- Dados do conflito
  rsv_data JSONB, -- Dados do RSV
  external_data JSONB, -- Dados da plataforma externa
  conflict_details TEXT,
  
  -- Resolução
  resolution_status VARCHAR(50) DEFAULT 'pending' CHECK (resolution_status IN (
    'pending', 'resolved', 'ignored', 'manual_review'
  )),
  resolution_action VARCHAR(50), -- 'use_rsv', 'use_external', 'merge', 'manual'
  resolved_by INTEGER,
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  
  -- Metadados
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_conflict_integration FOREIGN KEY (integration_config_id) REFERENCES integration_config(id) ON DELETE CASCADE,
  CONSTRAINT fk_conflict_sync_log FOREIGN KEY (sync_log_id) REFERENCES sync_logs(id) ON DELETE SET NULL,
  CONSTRAINT fk_conflict_resolver FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABELA: external_bookings (Reservas Externas)
-- ============================================
CREATE TABLE IF NOT EXISTS external_bookings (
  id SERIAL PRIMARY KEY,
  integration_config_id INTEGER NOT NULL,
  booking_id INTEGER, -- ID da reserva no RSV (se sincronizada)
  
  -- Dados externos
  external_id VARCHAR(255) NOT NULL, -- ID na plataforma externa
  external_code VARCHAR(255), -- Código da reserva externa
  platform VARCHAR(50) NOT NULL, -- 'cloudbeds', 'airbnb', 'booking', etc.
  
  -- Dados da reserva
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER,
  status VARCHAR(50),
  total_amount DECIMAL(10, 2),
  currency VARCHAR(10),
  
  -- Dados do hóspede
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  
  -- Sincronização
  sync_status VARCHAR(50) DEFAULT 'pending' CHECK (sync_status IN (
    'pending', 'synced', 'conflict', 'failed', 'ignored'
  )),
  last_synced_at TIMESTAMP,
  
  -- Metadados
  raw_data JSONB, -- Dados completos da plataforma externa
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_external_booking_integration FOREIGN KEY (integration_config_id) REFERENCES integration_config(id) ON DELETE CASCADE,
  CONSTRAINT fk_external_booking_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT unique_external_booking UNIQUE(integration_config_id, external_id)
);

-- ============================================
-- TABELA: external_reviews (Reviews Externos)
-- ============================================
CREATE TABLE IF NOT EXISTS external_reviews (
  id SERIAL PRIMARY KEY,
  integration_config_id INTEGER NOT NULL,
  review_id INTEGER, -- ID do review no RSV (se sincronizado)
  
  -- Dados externos
  external_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  
  -- Dados do review
  rating DECIMAL(3, 2) NOT NULL,
  comment TEXT,
  reviewer_name VARCHAR(255),
  reviewer_avatar_url VARCHAR(500),
  review_date DATE,
  
  -- Sincronização
  sync_status VARCHAR(50) DEFAULT 'pending',
  last_synced_at TIMESTAMP,
  
  -- Metadados
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_external_review_integration FOREIGN KEY (integration_config_id) REFERENCES integration_config(id) ON DELETE CASCADE,
  CONSTRAINT unique_external_review UNIQUE(integration_config_id, external_id)
);

-- ============================================
-- TABELA: external_messages (Mensagens Externas)
-- ============================================
CREATE TABLE IF NOT EXISTS external_messages (
  id SERIAL PRIMARY KEY,
  integration_config_id INTEGER NOT NULL,
  message_id INTEGER, -- ID da mensagem no RSV (se sincronizada)
  
  -- Dados externos
  external_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  thread_id VARCHAR(255), -- ID da thread/conversa
  
  -- Dados da mensagem
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  sender_type VARCHAR(50) CHECK (sender_type IN ('guest', 'host', 'platform')),
  subject VARCHAR(255),
  content TEXT NOT NULL,
  message_date TIMESTAMP NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  
  -- Sincronização
  sync_status VARCHAR(50) DEFAULT 'pending',
  last_synced_at TIMESTAMP,
  
  -- Metadados
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_external_message_integration FOREIGN KEY (integration_config_id) REFERENCES integration_config(id) ON DELETE CASCADE,
  CONSTRAINT unique_external_message UNIQUE(integration_config_id, external_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_integration_config_property ON integration_config(property_id);
CREATE INDEX IF NOT EXISTS idx_integration_config_type_name ON integration_config(integration_type, integration_name);
CREATE INDEX IF NOT EXISTS idx_integration_config_active ON integration_config(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sync_logs_integration ON sync_logs(integration_config_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_date ON sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_integration ON sync_conflicts(integration_config_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(resolution_status) WHERE resolution_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_external_bookings_integration ON external_bookings(integration_config_id);
CREATE INDEX IF NOT EXISTS idx_external_bookings_booking ON external_bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_external_bookings_external ON external_bookings(external_id);
CREATE INDEX IF NOT EXISTS idx_external_bookings_dates ON external_bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_external_reviews_integration ON external_reviews(integration_config_id);
CREATE INDEX IF NOT EXISTS idx_external_messages_integration ON external_messages(integration_config_id);
CREATE INDEX IF NOT EXISTS idx_external_messages_thread ON external_messages(thread_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_integration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_integration_config_timestamp
BEFORE UPDATE ON integration_config
FOR EACH ROW
EXECUTE FUNCTION update_integration_timestamp();

CREATE TRIGGER trigger_update_sync_conflicts_timestamp
BEFORE UPDATE ON sync_conflicts
FOR EACH ROW
EXECUTE FUNCTION update_integration_timestamp();

CREATE TRIGGER trigger_update_external_bookings_timestamp
BEFORE UPDATE ON external_bookings
FOR EACH ROW
EXECUTE FUNCTION update_integration_timestamp();

CREATE TRIGGER trigger_update_external_reviews_timestamp
BEFORE UPDATE ON external_reviews
FOR EACH ROW
EXECUTE FUNCTION update_integration_timestamp();

CREATE TRIGGER trigger_update_external_messages_timestamp
BEFORE UPDATE ON external_messages
FOR EACH ROW
EXECUTE FUNCTION update_integration_timestamp();

-- Comentários
COMMENT ON TABLE integration_config IS 'Configurações de integrações OTA/PMS';
COMMENT ON TABLE sync_logs IS 'Logs de sincronização de integrações';
COMMENT ON TABLE sync_conflicts IS 'Conflitos detectados durante sincronização';
COMMENT ON TABLE external_bookings IS 'Reservas importadas de plataformas externas';
COMMENT ON TABLE external_reviews IS 'Reviews importados de plataformas externas';
COMMENT ON TABLE external_messages IS 'Mensagens importadas de plataformas externas';

