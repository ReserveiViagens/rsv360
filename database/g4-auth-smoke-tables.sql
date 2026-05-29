-- G4 API P0 smoke: tabelas mínimas de auth (idempotente)
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  identifier_type VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  blocked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_rate_limit UNIQUE(identifier, identifier_type, action)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON auth_rate_limits(identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_action ON auth_rate_limits(action);

CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
