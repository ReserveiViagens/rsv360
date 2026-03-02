-- ✅ ITEM 23: TABELAS DE REFRESH TOKENS
-- Criar tabelas para refresh tokens e rate limiting

-- 1. Tabela de refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  token_family VARCHAR(255) NOT NULL, -- Para rotação de tokens
  device_info JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  revoked_reason VARCHAR(255),
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Referências
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(token_family);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- 2. Tabela de rate limiting (para autenticação)
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- IP, email, user_id
  identifier_type VARCHAR(50) NOT NULL, -- 'ip', 'email', 'user_id'
  action VARCHAR(50) NOT NULL, -- 'login', 'register', 'refresh', 'password_reset'
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  blocked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_rate_limit UNIQUE(identifier, identifier_type, action)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON auth_rate_limits(identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_action ON auth_rate_limits(action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON auth_rate_limits(blocked_until);

-- 3. Tabela de tentativas de login (para segurança)
CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON login_attempts(created_at);

-- Trigger para limpar tentativas antigas (mais de 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM login_attempts
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE refresh_tokens IS 'Refresh tokens para renovação de acesso';
COMMENT ON TABLE auth_rate_limits IS 'Rate limiting para ações de autenticação';
COMMENT ON TABLE login_attempts IS 'Histórico de tentativas de login para segurança';

