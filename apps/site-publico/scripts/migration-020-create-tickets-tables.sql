/**
 * Migration 020: Sistema de Tickets de Suporte
 * Cria todas as tabelas necessárias para o sistema de tickets
 */

-- Tabela principal de tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'waiting_third_party', 'resolved', 'closed', 'cancelled')),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  source VARCHAR(50) DEFAULT 'web' CHECK (source IN ('web', 'email', 'phone', 'chat', 'api', 'other')),
  tags TEXT[], -- Array de tags
  metadata JSONB DEFAULT '{}',
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  closed_at TIMESTAMP,
  closed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sla_due_at TIMESTAMP, -- Prazo SLA
  sla_breached BOOLEAN DEFAULT false,
  first_response_at TIMESTAMP,
  first_response_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_sla_due_at ON support_tickets(sla_due_at) WHERE sla_due_at IS NOT NULL;

-- Tabela de comentários/respostas do ticket
CREATE TABLE IF NOT EXISTS ticket_comments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Se é comentário interno (não visível ao cliente)
  is_system BOOLEAN DEFAULT false, -- Se é comentário automático do sistema
  attachments JSONB DEFAULT '[]', -- Array de anexos
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_id ON ticket_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_created_at ON ticket_comments(created_at DESC);

-- Tabela de anexos do ticket
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  comment_id INTEGER REFERENCES ticket_comments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_comment_id ON ticket_attachments(comment_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_user_id ON ticket_attachments(user_id);

-- Tabela de histórico de mudanças do ticket
CREATE TABLE IF NOT EXISTS ticket_history (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_type VARCHAR(50) DEFAULT 'update' CHECK (change_type IN ('created', 'updated', 'status_changed', 'assigned', 'priority_changed', 'commented', 'closed', 'reopened')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket_id ON ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_changed_by ON ticket_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_ticket_history_created_at ON ticket_history(created_at DESC);

-- Tabela de SLA (Service Level Agreement)
CREATE TABLE IF NOT EXISTS ticket_sla (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  priority VARCHAR(20) NOT NULL,
  first_response_target_minutes INTEGER NOT NULL, -- Tempo alvo para primeira resposta (minutos)
  resolution_target_minutes INTEGER NOT NULL, -- Tempo alvo para resolução (minutos)
  first_response_at TIMESTAMP,
  first_response_met BOOLEAN,
  resolution_at TIMESTAMP,
  resolution_met BOOLEAN,
  breached_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ticket_sla_ticket_id ON ticket_sla(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_sla_priority ON ticket_sla(priority);
CREATE INDEX IF NOT EXISTS idx_ticket_sla_breached_at ON ticket_sla(breached_at) WHERE breached_at IS NOT NULL;

-- Função para gerar número único do ticket
CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS VARCHAR(50) AS $$
DECLARE
  new_number VARCHAR(50);
  exists_check INTEGER;
BEGIN
  LOOP
    -- Formato: TKT-YYYYMMDD-XXXXX
    new_number := 'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                  LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    
    SELECT COUNT(*) INTO exists_check 
    FROM support_tickets 
    WHERE ticket_number = new_number;
    
    EXIT WHEN exists_check = 0;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_ticket_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  NEW.last_activity_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ticket_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_updated_at();

-- Trigger para registrar histórico
CREATE OR REPLACE FUNCTION log_ticket_history() RETURNS TRIGGER AS $$
BEGIN
  -- Registrar criação
  IF TG_OP = 'INSERT' THEN
    INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value, change_type)
    VALUES (NEW.id, NEW.user_id, 'status', NULL, NEW.status, 'created');
    RETURN NEW;
  END IF;
  
  -- Registrar mudanças
  IF TG_OP = 'UPDATE' THEN
    -- Status
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.assigned_to, 'status', OLD.status, NEW.status, 'status_changed');
    END IF;
    
    -- Assign
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.assigned_to, 'assigned_to', 
              COALESCE(OLD.assigned_to::TEXT, 'unassigned'), 
              COALESCE(NEW.assigned_to::TEXT, 'unassigned'), 
              'assigned');
    END IF;
    
    -- Priority
    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
      INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.assigned_to, 'priority', OLD.priority, NEW.priority, 'priority_changed');
    END IF;
    
    -- Closed
    IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
      INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.closed_by, 'status', OLD.status, NEW.status, 'closed');
    END IF;
    
    -- Reopened
    IF NEW.status != 'closed' AND OLD.status = 'closed' THEN
      INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.assigned_to, 'status', OLD.status, NEW.status, 'reopened');
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_ticket_history
  AFTER INSERT OR UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION log_ticket_history();

-- Trigger para registrar comentários no histórico
CREATE OR REPLACE FUNCTION log_comment_history() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value, change_type)
    VALUES (NEW.ticket_id, NEW.user_id, 'comment', NULL, LEFT(NEW.comment, 100), 'commented');
    
    -- Atualizar last_activity_at do ticket
    UPDATE support_tickets 
    SET last_activity_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.ticket_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_comment_history
  AFTER INSERT ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION log_comment_history();

-- Comentários de inicialização
COMMENT ON TABLE support_tickets IS 'Tabela principal de tickets de suporte';
COMMENT ON TABLE ticket_comments IS 'Comentários e respostas dos tickets';
COMMENT ON TABLE ticket_attachments IS 'Anexos dos tickets e comentários';
COMMENT ON TABLE ticket_history IS 'Histórico de mudanças dos tickets';
COMMENT ON TABLE ticket_sla IS 'Controle de SLA (Service Level Agreement) dos tickets';

