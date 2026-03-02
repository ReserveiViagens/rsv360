-- ✅ Migration 007: Criar tabela group_chat_messages
-- Tabela de mensagens de chat em grupo para referências em outras migrations
-- Data: 2025-12-16

CREATE TABLE IF NOT EXISTS group_chat_messages (
  id SERIAL PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Conteúdo da mensagem
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'location', 'poll', 'system')),
  content TEXT NOT NULL,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  -- Status
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_group_id ON group_chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_user_id ON group_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_booking_id ON group_chat_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_created_at ON group_chat_messages(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_group_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_chat_messages_updated_at
BEFORE UPDATE ON group_chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_group_chat_messages_updated_at();

-- Comentários
COMMENT ON TABLE group_chat_messages IS 'Tabela de mensagens de chat em grupo para referências em outras migrations';

