-- Migration 026: Criar tabelas para logs de auditoria
-- Data: 2025-01-XX
-- Descrição: Tabelas para registro completo de auditoria

-- Tabela principal de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- Pode referenciar users(id) ou customers(id) se existir
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- create, update, delete, read, login, logout, etc.
    resource VARCHAR(100) NOT NULL, -- booking, customer, property, etc.
    resource_id VARCHAR(255), -- ID do recurso afetado
    ip_address VARCHAR(45),
    user_agent TEXT,
    method VARCHAR(10), -- HTTP method
    endpoint TEXT, -- API endpoint
    status_code INTEGER,
    request_body JSONB,
    response_body JSONB,
    changes JSONB, -- Para updates: { field: { old: value, new: value } }
    metadata JSONB, -- Informações adicionais
    severity VARCHAR(20) NOT NULL DEFAULT 'info', -- info, warning, error, critical
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER, -- ms
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);

-- Índice composto para buscas comuns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_resource ON audit_logs(user_id, resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_action ON audit_logs(resource, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_severity ON audit_logs(timestamp, severity);

-- Particionamento por mês (opcional, para melhor performance com muitos logs)
-- CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Comentários
COMMENT ON TABLE audit_logs IS 'Logs completos de auditoria para compliance e segurança';
COMMENT ON COLUMN audit_logs.action IS 'Ação realizada: create, update, delete, read, login, logout, etc.';
COMMENT ON COLUMN audit_logs.resource IS 'Recurso afetado: booking, customer, property, etc.';
COMMENT ON COLUMN audit_logs.changes IS 'Mudanças realizadas (apenas para updates): { field: { old: value, new: value } }';
COMMENT ON COLUMN audit_logs.severity IS 'Severidade: info, warning, error, critical';
COMMENT ON COLUMN audit_logs.duration IS 'Duração da operação em milissegundos';

-- Função para limpar logs antigos automaticamente (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    -- Deletar logs com mais de 1 ano (ajustar conforme necessário)
    DELETE FROM audit_logs 
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '1 year'
    AND severity = 'info'; -- Manter logs críticos por mais tempo
END;
$$ LANGUAGE plpgsql;

-- Agendar limpeza automática (requer pg_cron extension)
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * 0', 'SELECT cleanup_old_audit_logs()');

