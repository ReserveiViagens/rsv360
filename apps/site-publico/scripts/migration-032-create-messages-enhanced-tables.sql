-- ✅ ITENS 79-81: MIGRATION 014 - CREATE ENHANCED MESSAGES TABLES
-- Tabelas para melhorias no sistema de mensagens

-- ============================================
-- TABELA: message_templates (Templates de Mensagens)
-- ============================================
CREATE TABLE IF NOT EXISTS message_templates (
  id SERIAL PRIMARY KEY,
  
  -- Dados do template
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) CHECK (category IN (
    'greeting', 'booking_confirmation', 'check_in', 'check_out', 
    'cancellation', 'support', 'promotion', 'custom'
  )),
  
  -- Conteúdo
  subject VARCHAR(255),
  content TEXT NOT NULL,
  
  -- Variáveis disponíveis
  available_variables VARCHAR(50)[], -- ['guest_name', 'property_name', 'check_in', etc.]
  
  -- Aplicação
  applicable_to VARCHAR(50) CHECK (applicable_to IN ('all', 'properties', 'bookings')),
  applicable_properties INTEGER[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false, -- Se pode ser usado por todos ou apenas criador
  
  -- Criador
  created_by INTEGER,
  
  -- Estatísticas
  usage_count INTEGER DEFAULT 0,
  
  -- Metadados
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_message_template_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABELA: quick_replies (Respostas Rápidas)
-- ============================================
CREATE TABLE IF NOT EXISTS quick_replies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  
  -- Resposta
  label VARCHAR(100) NOT NULL, -- Nome curto da resposta
  message TEXT NOT NULL,
  
  -- Categoria
  category VARCHAR(50), -- 'greeting', 'booking', 'support', etc.
  
  -- Ordem
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Estatísticas
  usage_count INTEGER DEFAULT 0,
  
  -- Metadados
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_quick_reply_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: message_search_index (Índice de Busca)
-- ============================================
CREATE TABLE IF NOT EXISTS message_search_index (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL,
  chat_id INTEGER NOT NULL,
  
  -- Conteúdo indexado
  search_text TEXT, -- Conteúdo da mensagem para busca full-text
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  
  -- Metadados para filtros
  message_type VARCHAR(50), -- 'text', 'image', 'file', 'system'
  created_at TIMESTAMP,
  
  -- Índice GIN para busca full-text
  search_vector tsvector,
  
  CONSTRAINT fk_message_search_message FOREIGN KEY (message_id) REFERENCES group_chat_messages(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_search_chat FOREIGN KEY (chat_id) REFERENCES group_chats(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: message_exports (Exportações de Conversas)
-- ============================================
CREATE TABLE IF NOT EXISTS message_exports (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL,
  
  -- Exportação
  export_type VARCHAR(50) NOT NULL CHECK (export_type IN ('pdf', 'csv', 'json', 'txt')),
  file_url VARCHAR(500),
  file_size INTEGER, -- em bytes
  
  -- Filtros aplicados
  date_from DATE,
  date_to DATE,
  sender_ids INTEGER[],
  message_types VARCHAR(50)[],
  
  -- Status
  status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Criador
  created_by INTEGER NOT NULL,
  
  -- Metadados
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  CONSTRAINT fk_message_export_chat FOREIGN KEY (chat_id) REFERENCES group_chats(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_export_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_message_templates_public ON message_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_quick_replies_user ON quick_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_replies_active ON quick_replies(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_message_search_index_chat ON message_search_index(chat_id);
CREATE INDEX IF NOT EXISTS idx_message_search_index_message ON message_search_index(message_id);
CREATE INDEX IF NOT EXISTS idx_message_search_index_vector ON message_search_index USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_message_search_index_created ON message_search_index(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_exports_chat ON message_exports(chat_id);
CREATE INDEX IF NOT EXISTS idx_message_exports_status ON message_exports(status) WHERE status = 'processing';
CREATE INDEX IF NOT EXISTS idx_message_exports_creator ON message_exports(created_by);

-- Triggers
CREATE OR REPLACE FUNCTION update_message_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_template_timestamp
BEFORE UPDATE ON message_templates
FOR EACH ROW
EXECUTE FUNCTION update_message_template_timestamp();

CREATE TRIGGER trigger_update_quick_reply_timestamp
BEFORE UPDATE ON quick_replies
FOR EACH ROW
EXECUTE FUNCTION update_message_template_timestamp();

-- Função para atualizar índice de busca quando mensagem é criada/atualizada
CREATE OR REPLACE FUNCTION update_message_search_index()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO message_search_index (message_id, chat_id, search_text, sender_name, sender_email, message_type, created_at, search_vector)
  SELECT 
    NEW.id,
    NEW.chat_id,
    NEW.content,
    u.name,
    u.email,
    NEW.message_type,
    NEW.created_at,
    to_tsvector('portuguese', COALESCE(NEW.content, ''))
  FROM users u
  WHERE u.id = NEW.sender_id
  ON CONFLICT (message_id) DO UPDATE SET
    search_text = EXCLUDED.search_text,
    search_vector = to_tsvector('portuguese', COALESCE(EXCLUDED.search_text, ''));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar índice quando mensagem é criada/atualizada
-- (Assumindo que group_chat_messages já existe)
-- CREATE TRIGGER trigger_update_message_search_index
-- AFTER INSERT OR UPDATE ON group_chat_messages
-- FOR EACH ROW
-- EXECUTE FUNCTION update_message_search_index();

-- Função para incrementar contador de uso de template
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_templates
  SET usage_count = usage_count + 1
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar contador de uso de resposta rápida
CREATE OR REPLACE FUNCTION increment_quick_reply_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quick_replies
  SET usage_count = usage_count + 1
  WHERE id = NEW.quick_reply_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE message_templates IS 'Templates de mensagens reutilizáveis';
COMMENT ON TABLE quick_replies IS 'Respostas rápidas personalizadas por usuário';
COMMENT ON TABLE message_search_index IS 'Índice de busca full-text para mensagens';
COMMENT ON TABLE message_exports IS 'Histórico de exportações de conversas';

