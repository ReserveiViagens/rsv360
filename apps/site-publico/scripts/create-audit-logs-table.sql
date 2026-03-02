-- ✅ TABELA DE LOGS DE AUDITORIA
-- Rastreia todas as ações críticas do sistema

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id INTEGER,
  resource_name VARCHAR(255),
  changes JSONB, -- Mudanças feitas (old vs new)
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB, -- Metadados adicionais
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at);

-- Comentários
COMMENT ON TABLE audit_logs IS 'Logs de auditoria de todas as ações críticas do sistema';
COMMENT ON COLUMN audit_logs.changes IS 'Mudanças feitas no formato: {"campo": {"old": "valor_antigo", "new": "valor_novo"}}';
COMMENT ON COLUMN audit_logs.metadata IS 'Metadados adicionais da ação';

