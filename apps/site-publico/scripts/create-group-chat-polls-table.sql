-- ✅ TABELA PARA POLLS NO CHAT EM GRUPO

CREATE TABLE IF NOT EXISTS group_chat_polls (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES group_chat_messages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array de {id, text, votes}
  multiple_choice BOOLEAN DEFAULT false,
  expires_at TIMESTAMP,
  votes JSONB DEFAULT '[]', -- Array de {userId, email, optionIds}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_group_chat_polls_message ON group_chat_polls(message_id);
CREATE INDEX idx_group_chat_polls_expires ON group_chat_polls(expires_at);

