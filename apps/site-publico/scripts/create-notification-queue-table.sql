-- ✅ TABELA DE FILA DE NOTIFICAÇÕES
-- Armazena notificações pendentes para processamento assíncrono

CREATE TABLE IF NOT EXISTS notification_queue (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  template_id VARCHAR(255) NOT NULL,
  type TEXT NOT NULL, -- JSON array de canais ['email', 'sms', 'whatsapp', 'push']
  variables JSONB NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  scheduled_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notification_queue_priority ON notification_queue(priority, status, created_at);

-- Comentários
COMMENT ON TABLE notification_queue IS 'Fila de notificações para processamento assíncrono';
COMMENT ON COLUMN notification_queue.type IS 'Array JSON de canais: ["email", "sms", "whatsapp", "push"]';
COMMENT ON COLUMN notification_queue.variables IS 'Variáveis para substituição no template (JSON)';
COMMENT ON COLUMN notification_queue.priority IS 'Prioridade: low, normal, high, urgent';

