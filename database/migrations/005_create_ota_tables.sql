-- Migration 005: Criar tabelas de OTA Integration
-- Data: 22/01/2025
-- Descrição: Criação das tabelas para integração com OTAs (Booking.com, Expedia, etc.)

-- Tabela de conexões OTA
CREATE TABLE IF NOT EXISTS ota_connections (
  id SERIAL PRIMARY KEY,
  ota_name VARCHAR(100) NOT NULL, -- booking, expedia, airbnb, vrbo, etc.
  api_key VARCHAR(255) NOT NULL,
  api_secret VARCHAR(255) NOT NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  accommodation_id INTEGER REFERENCES accommodations(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, error, testing
  last_sync_at TIMESTAMP,
  sync_frequency INTEGER DEFAULT 15, -- Intervalo de sincronização em minutos
  auto_sync BOOLEAN DEFAULT true,
  sync_availability BOOLEAN DEFAULT true,
  sync_reservations BOOLEAN DEFAULT true,
  sync_pricing BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER,
  UNIQUE(ota_name, property_id, accommodation_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ota_connections_ota_name ON ota_connections(ota_name);
CREATE INDEX IF NOT EXISTS idx_ota_connections_property_id ON ota_connections(property_id);
CREATE INDEX IF NOT EXISTS idx_ota_connections_accommodation_id ON ota_connections(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_ota_connections_status ON ota_connections(status);
CREATE INDEX IF NOT EXISTS idx_ota_connections_last_sync_at ON ota_connections(last_sync_at);

-- Tabela de reservas OTA
CREATE TABLE IF NOT EXISTS ota_reservations (
  id SERIAL PRIMARY KEY,
  ota_connection_id INTEGER NOT NULL REFERENCES ota_connections(id) ON DELETE CASCADE,
  ota_reservation_id VARCHAR(255) NOT NULL, -- ID da reserva na OTA
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled, modified, pending
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  special_requests TEXT,
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ota_connection_id, ota_reservation_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ota_reservations_ota_connection_id ON ota_reservations(ota_connection_id);
CREATE INDEX IF NOT EXISTS idx_ota_reservations_ota_reservation_id ON ota_reservations(ota_reservation_id);
CREATE INDEX IF NOT EXISTS idx_ota_reservations_booking_id ON ota_reservations(booking_id);
CREATE INDEX IF NOT EXISTS idx_ota_reservations_status ON ota_reservations(status);
CREATE INDEX IF NOT EXISTS idx_ota_reservations_check_in ON ota_reservations(check_in);
CREATE INDEX IF NOT EXISTS idx_ota_reservations_check_out ON ota_reservations(check_out);
CREATE INDEX IF NOT EXISTS idx_ota_reservations_synced_at ON ota_reservations(synced_at DESC);

-- Tabela de logs de sincronização OTA
CREATE TABLE IF NOT EXISTS ota_sync_logs (
  id SERIAL PRIMARY KEY,
  ota_connection_id INTEGER NOT NULL REFERENCES ota_connections(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL, -- availability, reservations, pricing, inventory
  status VARCHAR(50) NOT NULL, -- success, error, partial
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  errors TEXT,
  warnings TEXT,
  started_at TIMESTAMP NOT NULL,
  finished_at TIMESTAMP,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ota_sync_logs_ota_connection_id ON ota_sync_logs(ota_connection_id);
CREATE INDEX IF NOT EXISTS idx_ota_sync_logs_sync_type ON ota_sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_ota_sync_logs_status ON ota_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_ota_sync_logs_started_at ON ota_sync_logs(started_at DESC);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_ota_connections_updated_at BEFORE UPDATE ON ota_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ota_reservations_updated_at BEFORE UPDATE ON ota_reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE ota_connections IS 'Tabela de conexões com OTAs (Booking.com, Expedia, etc.)';
COMMENT ON TABLE ota_reservations IS 'Tabela de reservas sincronizadas das OTAs';
COMMENT ON TABLE ota_sync_logs IS 'Tabela de logs de sincronização com OTAs';
