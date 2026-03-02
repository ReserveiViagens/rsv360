-- ✅ ITEM 18: TABELAS DE CHAT EM GRUPO
-- Criar tabelas para chat em grupo

-- 1. Tabela principal de grupos de chat
CREATE TABLE IF NOT EXISTS group_chats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  booking_id INTEGER,
  chat_type VARCHAR(50) DEFAULT 'booking' CHECK (chat_type IN ('booking', 'wishlist', 'trip', 'custom')),
  is_private BOOLEAN DEFAULT false,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP,
  
  -- Referências
  CONSTRAINT fk_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_group_chats_booking ON group_chats(booking_id);
CREATE INDEX IF NOT EXISTS idx_group_chats_type ON group_chats(chat_type);
CREATE INDEX IF NOT EXISTS idx_group_chats_last_message ON group_chats(last_message_at);

-- 2. Membros do grupo de chat
CREATE TABLE IF NOT EXISTS group_chat_members (
  id SERIAL PRIMARY KEY,
  group_chat_id INTEGER NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
  user_id INTEGER,
  email VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_at TIMESTAMP,
  is_muted BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_group_chat_members_group ON group_chat_members(group_chat_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_members_user ON group_chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_members_email ON group_chat_members(email);

-- Índices únicos parciais para garantir unicidade
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_member_user 
  ON group_chat_members(group_chat_id, user_id) 
  WHERE user_id IS NOT NULL;
  
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_member_email 
  ON group_chat_members(group_chat_id, email) 
  WHERE email IS NOT NULL;

-- 3. Mensagens do grupo
CREATE TABLE IF NOT EXISTS group_chat_messages (
  id SERIAL PRIMARY KEY,
  group_chat_id INTEGER NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
  sender_id INTEGER,
  sender_email VARCHAR(255),
  sender_name VARCHAR(255),
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachments JSONB,
  reply_to_message_id INTEGER REFERENCES group_chat_messages(id) ON DELETE SET NULL,
  edited_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Referência ao sender (flexível)
  CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_group_messages_chat ON group_chat_messages(group_chat_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender ON group_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created ON group_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_group_messages_reply ON group_chat_messages(reply_to_message_id);

-- 4. Leitura de mensagens (quem leu o quê)
CREATE TABLE IF NOT EXISTS group_chat_message_reads (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES group_chat_messages(id) ON DELETE CASCADE,
  user_id INTEGER,
  email VARCHAR(255),
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_message_reads_message ON group_chat_message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON group_chat_message_reads(user_id);

-- Índices únicos parciais para garantir unicidade de leitura
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_read_user 
  ON group_chat_message_reads(message_id, user_id) 
  WHERE user_id IS NOT NULL;
  
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_read_email 
  ON group_chat_message_reads(message_id, email) 
  WHERE email IS NOT NULL;

-- Trigger para atualizar last_message_at do grupo
CREATE OR REPLACE FUNCTION update_group_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE group_chats
  SET 
    last_message_at = NEW.created_at,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.group_chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_message
AFTER INSERT ON group_chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_group_chat_last_message();

-- Comentários
COMMENT ON TABLE group_chats IS 'Grupos de chat para reservas, wishlists, viagens, etc.';
COMMENT ON TABLE group_chat_members IS 'Membros dos grupos de chat';
COMMENT ON TABLE group_chat_messages IS 'Mensagens enviadas nos grupos';
COMMENT ON TABLE group_chat_message_reads IS 'Controle de leitura de mensagens';

