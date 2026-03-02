-- Migration 018: Sistema de Webhooks
-- Cria tabelas para gerenciar webhooks (enviar e receber)

-- Tabela para webhooks configurados (para enviar notificações)
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL, -- Array de eventos: ['booking.created', 'payment.completed', etc.]
    secret VARCHAR(255) NOT NULL, -- Secret para assinatura HMAC
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT webhook_url_length CHECK (LENGTH(url) >= 10 AND LENGTH(url) <= 500),
    CONSTRAINT webhook_events_not_empty CHECK (array_length(events, 1) > 0)
);

-- Índices para webhook_subscriptions
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_user_id ON webhook_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_is_active ON webhook_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_events ON webhook_subscriptions USING GIN(events);

-- Tabela para histórico de webhooks enviados
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'success', 'failed', 'retrying'
    response_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para webhook_deliveries
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_subscription_id ON webhook_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at) WHERE status = 'retrying';

-- Tabela para webhooks recebidos (de serviços externos)
CREATE TABLE IF NOT EXISTS webhook_received (
    id SERIAL PRIMARY KEY,
    source VARCHAR(100) NOT NULL, -- 'kakau', 'klarna', 'google_calendar', etc.
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    signature VARCHAR(500), -- Assinatura HMAC recebida
    is_verified BOOLEAN DEFAULT false,
    is_processed BOOLEAN DEFAULT false,
    processing_error TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para webhook_received
CREATE INDEX IF NOT EXISTS idx_webhook_received_source ON webhook_received(source);
CREATE INDEX IF NOT EXISTS idx_webhook_received_event_type ON webhook_received(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_received_is_processed ON webhook_received(is_processed);
CREATE INDEX IF NOT EXISTS idx_webhook_received_created_at ON webhook_received(created_at);

-- Tabela para idempotência (evitar processar mesmo evento duas vezes)
CREATE TABLE IF NOT EXISTS webhook_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL UNIQUE, -- ID único do evento (da fonte externa)
    source VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT webhook_events_unique UNIQUE(event_id, source)
);

-- Índice para webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_source_event_id ON webhook_events(source, event_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_webhook_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_webhook_subscriptions_updated_at
    BEFORE UPDATE ON webhook_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_webhook_subscriptions_updated_at();

-- Comentários
COMMENT ON TABLE webhook_subscriptions IS 'Webhooks configurados pelos usuários para receber notificações';
COMMENT ON TABLE webhook_deliveries IS 'Histórico de tentativas de entrega de webhooks';
COMMENT ON TABLE webhook_received IS 'Webhooks recebidos de serviços externos';
COMMENT ON TABLE webhook_events IS 'Controle de idempotência para eventos';

