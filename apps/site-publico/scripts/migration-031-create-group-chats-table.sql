-- ✅ Migration 031: Criar tabela group_chats
-- Tabela de grupos de chat para referências em outras migrations
-- Data: 2025-12-16
-- Deve ser executada antes de migration-032-create-messages-enhanced-tables.sql

CREATE TABLE IF NOT EXISTS group_chats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  chat_type VARCHAR(50) DEFAULT 'booking' CHECK (chat_type IN ('booking', 'wishlist', 'trip', 'custom')),
  is_private BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_group_chats_booking_id ON group_chats(booking_id);
CREATE INDEX IF NOT EXISTS idx_group_chats_chat_type ON group_chats(chat_type);
CREATE INDEX IF NOT EXISTS idx_group_chats_last_message_at ON group_chats(last_message_at);
CREATE INDEX IF NOT EXISTS idx_group_chats_created_by ON group_chats(created_by);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_group_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_chats_updated_at
BEFORE UPDATE ON group_chats
FOR EACH ROW
EXECUTE FUNCTION update_group_chats_updated_at();

-- Comentários
COMMENT ON TABLE group_chats IS 'Tabela de grupos de chat para referências em outras migrations';


