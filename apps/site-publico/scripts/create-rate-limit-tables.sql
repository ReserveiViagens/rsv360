-- ✅ TABELAS PARA RATE LIMITING
-- Suporta whitelist, blacklist e logging

CREATE TABLE IF NOT EXISTS rate_limit_whitelist (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rate_limit_blacklist (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  expires_at TIMESTAMP, -- NULL = permanente
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- IP, userId, etc.
  endpoint VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_rate_limit_whitelist_ip ON rate_limit_whitelist(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limit_blacklist_ip ON rate_limit_blacklist(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limit_blacklist_expires ON rate_limit_blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_identifier ON rate_limit_logs(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_endpoint ON rate_limit_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_created ON rate_limit_logs(created_at);

-- Comentários
COMMENT ON TABLE rate_limit_whitelist IS 'IPs que não são afetados por rate limiting';
COMMENT ON TABLE rate_limit_blacklist IS 'IPs bloqueados permanentemente ou temporariamente';
COMMENT ON TABLE rate_limit_logs IS 'Log de bloqueios de rate limiting';

