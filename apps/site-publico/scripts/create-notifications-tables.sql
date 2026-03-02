-- ✅ ITENS 25-30: TABELAS DE NOTIFICAÇÕES
-- Criar tabelas para sistema completo de notificações

-- 1. Tabela de notificações in-app
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'push', 'in_app'
  category VARCHAR(50), -- 'booking', 'payment', 'message', 'system', 'promotion'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Dados adicionais (links, actions, etc.)
  read_at TIMESTAMP,
  read_by_user BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  sent_successfully BOOLEAN DEFAULT false,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_by_user);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 2. Tabela de preferências de notificação
CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  email_booking BOOLEAN DEFAULT true,
  email_payment BOOLEAN DEFAULT true,
  email_message BOOLEAN DEFAULT true,
  email_system BOOLEAN DEFAULT true,
  email_promotion BOOLEAN DEFAULT false,
  sms_enabled BOOLEAN DEFAULT false,
  sms_booking BOOLEAN DEFAULT false,
  sms_payment BOOLEAN DEFAULT true,
  sms_message BOOLEAN DEFAULT false,
  sms_system BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_booking BOOLEAN DEFAULT false,
  whatsapp_payment BOOLEAN DEFAULT false,
  whatsapp_message BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  push_booking BOOLEAN DEFAULT true,
  push_payment BOOLEAN DEFAULT true,
  push_message BOOLEAN DEFAULT true,
  push_system BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  in_app_booking BOOLEAN DEFAULT true,
  in_app_payment BOOLEAN DEFAULT true,
  in_app_message BOOLEAN DEFAULT true,
  in_app_system BOOLEAN DEFAULT true,
  quiet_hours_start TIME, -- Ex: '22:00'
  quiet_hours_end TIME, -- Ex: '08:00'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_prefs FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id);

-- 3. Tabela de FCM tokens (Firebase Cloud Messaging)
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  device_type VARCHAR(50), -- 'ios', 'android', 'web'
  device_id VARCHAR(255),
  device_name VARCHAR(255),
  app_version VARCHAR(50),
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_fcm FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user ON fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON fcm_tokens(token);

-- 4. Tabela de fila de notificações (para processamento assíncrono)
CREATE TABLE IF NOT EXISTS notification_queue (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'push'
  payload JSONB NOT NULL,
  priority INTEGER DEFAULT 5, -- 1-10, 10 = mais alta
  scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed'
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_queue FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(processing_status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_priority ON notification_queue(priority DESC);

-- 5. Tabela de templates de notificação
CREATE TABLE IF NOT EXISTS notification_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'push'
  category VARCHAR(50) NOT NULL,
  subject VARCHAR(255), -- Para email
  body_template TEXT NOT NULL,
  variables JSONB, -- Variáveis disponíveis no template
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_category ON notification_templates(category);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_notification_prefs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_prefs_timestamp
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_prefs_timestamp();

-- Comentários
COMMENT ON TABLE notifications IS 'Notificações in-app do sistema';
COMMENT ON TABLE notification_preferences IS 'Preferências de notificação por usuário';
COMMENT ON TABLE fcm_tokens IS 'Tokens FCM para push notifications';
COMMENT ON TABLE notification_queue IS 'Fila de processamento de notificações';
COMMENT ON TABLE notification_templates IS 'Templates de notificações';

