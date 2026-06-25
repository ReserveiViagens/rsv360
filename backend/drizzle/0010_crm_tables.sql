-- 0010 CRM tables (site-publico migrations 004 + 009 + 021)
-- customers, interactions, segments, campaigns, customer_profiles, customer_preferences

-- âœ… Migration 004: Criar tabela customers
-- Tabela de clientes para referÃªncias em outras migrations
-- Data: 2025-12-16

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- InformaÃ§Ãµes bÃ¡sicas
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  document VARCHAR(50), -- CPF, CNPJ, etc.
  document_type VARCHAR(20), -- 'cpf', 'cnpj', 'passport', etc.
  
  -- EndereÃ§o
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(50),
  address_country VARCHAR(50) DEFAULT 'Brazil',
  address_zip_code VARCHAR(20),
  
  -- Dados adicionais
  birth_date DATE,
  gender VARCHAR(20), -- 'male', 'female', 'other', 'prefer_not_to_say'
  nationality VARCHAR(50),
  
  -- PreferÃªncias e configuraÃ§Ãµes
  language VARCHAR(10) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Status e verificaÃ§Ã£o
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_token VARCHAR(255),
  verified_at TIMESTAMP,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- Ãndices
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_is_verified ON customers(is_verified);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_customers_updated_at();

-- ComentÃ¡rios
COMMENT ON TABLE customers IS 'Tabela de clientes para referÃªncias em outras migrations';
COMMENT ON COLUMN customers.user_id IS 'ReferÃªncia opcional para tabela users';
COMMENT ON COLUMN customers.document IS 'CPF, CNPJ, Passaporte, etc.';
COMMENT ON COLUMN customers.metadata IS 'Dados adicionais flexÃ­veis em formato JSON';


-- âœ… ITENS 51-54: MIGRATION 009 - CREATE CRM TABLES
-- Tabelas para CRM de Clientes: InteraÃ§Ãµes, SegmentaÃ§Ã£o, Campanhas

-- ============================================
-- ITEM 51: TABELA INTERACTIONS (HistÃ³rico de InteraÃ§Ãµes)
-- ============================================
CREATE TABLE IF NOT EXISTS interactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER,
  user_id INTEGER, -- UsuÃ¡rio que realizou a interaÃ§Ã£o (se aplicÃ¡vel)
  
  -- Tipo e canal
  interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN (
    'email', 'phone', 'sms', 'whatsapp', 'chat', 'meeting', 'visit', 
    'booking', 'payment', 'review', 'complaint', 'support', 'other'
  )),
  channel VARCHAR(50) NOT NULL CHECK (channel IN (
    'email', 'phone', 'sms', 'whatsapp', 'chat', 'in_person', 'website', 
    'app', 'social_media', 'other'
  )),
  
  -- Detalhes
  subject VARCHAR(255),
  description TEXT,
  outcome VARCHAR(50) CHECK (outcome IN (
    'successful', 'pending', 'failed', 'no_response', 'rescheduled', 'cancelled'
  )),
  
  -- Metadados
  duration_minutes INTEGER, -- DuraÃ§Ã£o em minutos (para calls, meetings)
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Relacionamentos
  related_booking_id INTEGER,
  related_property_id INTEGER,
  related_campaign_id INTEGER, -- Se relacionado a uma campanha
  
  -- Timestamps
  interaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  scheduled_at TIMESTAMP, -- Para interaÃ§Ãµes agendadas
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relacionamentos
  CONSTRAINT fk_interaction_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_interaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_interaction_booking FOREIGN KEY (related_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_interaction_property FOREIGN KEY (related_property_id) REFERENCES properties(id) ON DELETE SET NULL
  -- CONSTRAINT fk_interaction_campaign serÃ¡ adicionado apÃ³s criaÃ§Ã£o da tabela campaigns
);

-- Ãndices para interactions
CREATE INDEX IF NOT EXISTS idx_interactions_customer ON interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_channel ON interactions(channel);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions(interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_booking ON interactions(related_booking_id);
CREATE INDEX IF NOT EXISTS idx_interactions_campaign ON interactions(related_campaign_id);

-- ============================================
-- ITEM 52: TABELA SEGMENTS (SegmentaÃ§Ã£o de Clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS segments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- CritÃ©rios de segmentaÃ§Ã£o (JSONB para flexibilidade)
  criteria JSONB NOT NULL, -- Ex: {"min_bookings": 3, "total_spent": 1000, "last_booking_days": 30}
  
  -- ConfiguraÃ§Ãµes
  is_active BOOLEAN DEFAULT true,
  is_auto_update BOOLEAN DEFAULT true, -- Atualizar automaticamente quando critÃ©rios mudarem
  
  -- EstatÃ­sticas
  customer_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP,
  
  -- Metadados
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_segment_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de associaÃ§Ã£o cliente-segmento
CREATE TABLE IF NOT EXISTS customer_segments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  segment_id INTEGER NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by INTEGER, -- Sistema ou usuÃ¡rio que adicionou
  is_manual BOOLEAN DEFAULT false, -- Se foi adicionado manualmente ou automaticamente
  
  CONSTRAINT fk_customer_segment_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_customer_segment_segment FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE,
  CONSTRAINT unique_customer_segment UNIQUE(customer_id, segment_id)
);

-- Ãndices para segments
CREATE INDEX IF NOT EXISTS idx_segments_active ON segments(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_customer_segments_customer ON customer_segments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_segment ON customer_segments(segment_id);

-- ============================================
-- ITEM 53: TABELA CAMPAIGNS (Campanhas de Marketing)
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Tipo e canal
  campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN (
    'email', 'sms', 'whatsapp', 'push', 'social_media', 'display', 'retargeting', 'other'
  )),
  channel VARCHAR(50) NOT NULL,
  
  -- SegmentaÃ§Ã£o
  target_segment_id INTEGER, -- Segmento alvo
  target_criteria JSONB, -- CritÃ©rios adicionais (se nÃ£o usar segmento)
  
  -- ConteÃºdo
  subject VARCHAR(255), -- Para email
  message TEXT NOT NULL,
  template_id VARCHAR(255), -- ID do template usado
  content JSONB, -- ConteÃºdo adicional (imagens, links, etc.)
  
  -- Agendamento
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
    'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'completed'
  )),
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- EstatÃ­sticas
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  converted_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0,
  
  -- ConfiguraÃ§Ãµes
  budget DECIMAL(10, 2), -- OrÃ§amento da campanha
  cost_per_click DECIMAL(10, 2),
  cost_per_conversion DECIMAL(10, 2),
  
  -- Metadados
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_campaign_segment FOREIGN KEY (target_segment_id) REFERENCES segments(id) ON DELETE SET NULL,
  CONSTRAINT fk_campaign_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de destinatÃ¡rios da campanha
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  
  -- Status de envio
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'delivered', 'opened', 'clicked', 'converted', 
    'bounced', 'failed', 'unsubscribed'
  )),
  
  -- Timestamps
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  converted_at TIMESTAMP,
  bounced_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  
  -- Metadados
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_campaign_recipient_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_campaign_recipient_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT unique_campaign_recipient UNIQUE(campaign_id, customer_id)
);

-- Ãndices para campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON campaigns(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_campaigns_segment ON campaigns(target_segment_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_customer ON campaign_recipients(customer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);

-- Adicionar constraint de foreign key para campaigns em interactions (apÃ³s criaÃ§Ã£o da tabela)
ALTER TABLE interactions 
ADD CONSTRAINT fk_interaction_campaign 
FOREIGN KEY (related_campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_crm_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_interactions_timestamp
BEFORE UPDATE ON interactions
FOR EACH ROW
EXECUTE FUNCTION update_crm_timestamp();

CREATE TRIGGER trigger_update_segments_timestamp
BEFORE UPDATE ON segments
FOR EACH ROW
EXECUTE FUNCTION update_crm_timestamp();

CREATE TRIGGER trigger_update_campaigns_timestamp
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION update_crm_timestamp();

-- Trigger para atualizar customer_count em segments
CREATE OR REPLACE FUNCTION update_segment_customer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE segments 
    SET customer_count = customer_count + 1, last_calculated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.segment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE segments 
    SET customer_count = GREATEST(customer_count - 1, 0), last_calculated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.segment_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_segment_count_insert
AFTER INSERT ON customer_segments
FOR EACH ROW
EXECUTE FUNCTION update_segment_customer_count();

CREATE TRIGGER trigger_update_segment_count_delete
AFTER DELETE ON customer_segments
FOR EACH ROW
EXECUTE FUNCTION update_segment_customer_count();

-- Trigger para atualizar estatÃ­sticas de campanha
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE campaigns 
    SET total_recipients = total_recipients + 1
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Atualizar contadores baseado em mudanÃ§as de status
    IF NEW.status = 'sent' AND (OLD.status IS NULL OR OLD.status != 'sent') THEN
      UPDATE campaigns SET sent_count = sent_count + 1 WHERE id = NEW.campaign_id;
    END IF;
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
      UPDATE campaigns SET delivered_count = delivered_count + 1 WHERE id = NEW.campaign_id;
    END IF;
    IF NEW.status = 'opened' AND (OLD.status IS NULL OR OLD.status != 'opened') THEN
      UPDATE campaigns SET opened_count = opened_count + 1 WHERE id = NEW.campaign_id;
    END IF;
    IF NEW.status = 'clicked' AND (OLD.status IS NULL OR OLD.status != 'clicked') THEN
      UPDATE campaigns SET clicked_count = clicked_count + 1 WHERE id = NEW.campaign_id;
    END IF;
    IF NEW.status = 'converted' AND (OLD.status IS NULL OR OLD.status != 'converted') THEN
      UPDATE campaigns SET converted_count = converted_count + 1 WHERE id = NEW.campaign_id;
    END IF;
    IF NEW.status = 'bounced' AND (OLD.status IS NULL OR OLD.status != 'bounced') THEN
      UPDATE campaigns SET bounce_count = bounce_count + 1 WHERE id = NEW.campaign_id;
    END IF;
    IF NEW.status = 'unsubscribed' AND (OLD.status IS NULL OR OLD.status != 'unsubscribed') THEN
      UPDATE campaigns SET unsubscribe_count = unsubscribe_count + 1 WHERE id = NEW.campaign_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_stats
AFTER INSERT OR UPDATE ON campaign_recipients
FOR EACH ROW
EXECUTE FUNCTION update_campaign_stats();

-- ComentÃ¡rios
COMMENT ON TABLE interactions IS 'HistÃ³rico de interaÃ§Ãµes com clientes';
COMMENT ON TABLE segments IS 'Segmentos de clientes para marketing';
COMMENT ON TABLE customer_segments IS 'AssociaÃ§Ã£o entre clientes e segmentos';
COMMENT ON TABLE campaigns IS 'Campanhas de marketing';
COMMENT ON TABLE campaign_recipients IS 'DestinatÃ¡rios e status de envio de campanhas';



/**
 * Migration 021: Sistema CRM - Tabelas Adicionais
 * Adiciona tabelas complementares ao CRM criado na migration-009
 * 
 * NOTA: As tabelas interactions, segments, customer_segments, campaigns e campaign_recipients
 * jÃ¡ foram criadas na migration-009. Esta migration adiciona apenas:
 * - customer_profiles: Perfis estendidos de clientes
 * - customer_preferences: PreferÃªncias especÃ­ficas de clientes
 */

-- ============================================
-- TABELA: customer_profiles
-- Perfis estendidos de clientes com informaÃ§Ãµes adicionais
-- ============================================
CREATE TABLE IF NOT EXISTS customer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE, -- Se existir tabela customers
  preferences JSONB DEFAULT '{}', -- PreferÃªncias gerais do cliente
  loyalty_tier VARCHAR(50) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  total_spent DECIMAL(12, 2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  last_booking_at TIMESTAMP,
  first_booking_at TIMESTAMP,
  average_booking_value DECIMAL(10, 2) DEFAULT 0,
  lifetime_value DECIMAL(12, 2) DEFAULT 0,
  churn_risk_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  engagement_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  tags TEXT[], -- Tags para segmentaÃ§Ã£o rÃ¡pida
  notes TEXT, -- Notas internas sobre o cliente
  metadata JSONB DEFAULT '{}', -- Dados adicionais flexÃ­veis
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ãndices para customer_profiles
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_customer_id ON customer_profiles(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_loyalty_tier ON customer_profiles(loyalty_tier);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_total_spent ON customer_profiles(total_spent DESC);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_tags ON customer_profiles USING GIN(tags);

-- ============================================
-- TABELA: customer_preferences
-- PreferÃªncias especÃ­ficas de clientes
-- ============================================
CREATE TABLE IF NOT EXISTS customer_preferences (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE, -- Se existir tabela customers
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Alternativa se nÃ£o houver customers
  preference_key VARCHAR(100) NOT NULL, -- Ex: 'room_type', 'breakfast', 'wifi', 'parking', etc.
  preference_value TEXT NOT NULL, -- Valor da preferÃªncia (pode ser JSON string)
  preference_type VARCHAR(50) DEFAULT 'string', -- 'string', 'boolean', 'number', 'json'
  category VARCHAR(50), -- 'accommodation', 'services', 'communication', 'marketing', etc.
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(50), -- 'explicit', 'inferred', 'behavioral', 'default'
  confidence DECIMAL(5, 2) DEFAULT 100, -- 0-100, confianÃ§a na preferÃªncia
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constraints Ãºnicos com WHERE (usando Ã­ndices parciais)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_preferences_customer_key 
  ON customer_preferences(customer_id, preference_key) 
  WHERE customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_preferences_user_key 
  ON customer_preferences(user_id, preference_key) 
  WHERE user_id IS NOT NULL;

-- Ãndices para customer_preferences
CREATE INDEX IF NOT EXISTS idx_customer_preferences_customer_id ON customer_preferences(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_user_id ON customer_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_key ON customer_preferences(preference_key);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_category ON customer_preferences(category);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_active ON customer_preferences(is_active);

-- ============================================
-- TRIGGERS: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas novas tabelas
CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_preferences_updated_at BEFORE UPDATE ON customer_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTÃRIOS NAS TABELAS
-- ============================================
COMMENT ON TABLE customer_profiles IS 'Perfis estendidos de clientes com informaÃ§Ãµes adicionais para CRM';
COMMENT ON TABLE customer_preferences IS 'PreferÃªncias especÃ­ficas de clientes';
