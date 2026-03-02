-- ✅ ITENS 51-54: MIGRATION 009 - CREATE CRM TABLES
-- Tabelas para CRM de Clientes: Interações, Segmentação, Campanhas

-- ============================================
-- ITEM 51: TABELA INTERACTIONS (Histórico de Interações)
-- ============================================
CREATE TABLE IF NOT EXISTS interactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER,
  user_id INTEGER, -- Usuário que realizou a interação (se aplicável)
  
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
  duration_minutes INTEGER, -- Duração em minutos (para calls, meetings)
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Relacionamentos
  related_booking_id INTEGER,
  related_property_id INTEGER,
  related_campaign_id INTEGER, -- Se relacionado a uma campanha
  
  -- Timestamps
  interaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  scheduled_at TIMESTAMP, -- Para interações agendadas
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relacionamentos
  CONSTRAINT fk_interaction_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_interaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_interaction_booking FOREIGN KEY (related_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_interaction_property FOREIGN KEY (related_property_id) REFERENCES properties(id) ON DELETE SET NULL
  -- CONSTRAINT fk_interaction_campaign será adicionado após criação da tabela campaigns
);

-- Índices para interactions
CREATE INDEX IF NOT EXISTS idx_interactions_customer ON interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_channel ON interactions(channel);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions(interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_booking ON interactions(related_booking_id);
CREATE INDEX IF NOT EXISTS idx_interactions_campaign ON interactions(related_campaign_id);

-- ============================================
-- ITEM 52: TABELA SEGMENTS (Segmentação de Clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS segments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Critérios de segmentação (JSONB para flexibilidade)
  criteria JSONB NOT NULL, -- Ex: {"min_bookings": 3, "total_spent": 1000, "last_booking_days": 30}
  
  -- Configurações
  is_active BOOLEAN DEFAULT true,
  is_auto_update BOOLEAN DEFAULT true, -- Atualizar automaticamente quando critérios mudarem
  
  -- Estatísticas
  customer_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP,
  
  -- Metadados
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_segment_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de associação cliente-segmento
CREATE TABLE IF NOT EXISTS customer_segments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  segment_id INTEGER NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by INTEGER, -- Sistema ou usuário que adicionou
  is_manual BOOLEAN DEFAULT false, -- Se foi adicionado manualmente ou automaticamente
  
  CONSTRAINT fk_customer_segment_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_customer_segment_segment FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE,
  CONSTRAINT unique_customer_segment UNIQUE(customer_id, segment_id)
);

-- Índices para segments
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
  
  -- Segmentação
  target_segment_id INTEGER, -- Segmento alvo
  target_criteria JSONB, -- Critérios adicionais (se não usar segmento)
  
  -- Conteúdo
  subject VARCHAR(255), -- Para email
  message TEXT NOT NULL,
  template_id VARCHAR(255), -- ID do template usado
  content JSONB, -- Conteúdo adicional (imagens, links, etc.)
  
  -- Agendamento
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
    'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'completed'
  )),
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Estatísticas
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  converted_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0,
  
  -- Configurações
  budget DECIMAL(10, 2), -- Orçamento da campanha
  cost_per_click DECIMAL(10, 2),
  cost_per_conversion DECIMAL(10, 2),
  
  -- Metadados
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_campaign_segment FOREIGN KEY (target_segment_id) REFERENCES segments(id) ON DELETE SET NULL,
  CONSTRAINT fk_campaign_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de destinatários da campanha
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

-- Índices para campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON campaigns(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_campaigns_segment ON campaigns(target_segment_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_customer ON campaign_recipients(customer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);

-- Adicionar constraint de foreign key para campaigns em interactions (após criação da tabela)
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

-- Trigger para atualizar estatísticas de campanha
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE campaigns 
    SET total_recipients = total_recipients + 1
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Atualizar contadores baseado em mudanças de status
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

-- Comentários
COMMENT ON TABLE interactions IS 'Histórico de interações com clientes';
COMMENT ON TABLE segments IS 'Segmentos de clientes para marketing';
COMMENT ON TABLE customer_segments IS 'Associação entre clientes e segmentos';
COMMENT ON TABLE campaigns IS 'Campanhas de marketing';
COMMENT ON TABLE campaign_recipients IS 'Destinatários e status de envio de campanhas';

