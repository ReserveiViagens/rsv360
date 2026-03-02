/**
 * ✅ TAREFA MEDIUM-4: Migration para Background Check
 * Cria tabelas para armazenar verificações de antecedentes
 */

-- Tabela principal de background checks
CREATE TABLE IF NOT EXISTS background_checks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'serasa', -- serasa, clearsale, etc.
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, rejected
  check_type VARCHAR(50) NOT NULL DEFAULT 'basic', -- basic, criminal, credit, full
  cpf VARCHAR(14) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  request_id VARCHAR(255), -- ID retornado pelo provider
  score INTEGER, -- Score de confiança (0-1000)
  risk_level VARCHAR(20), -- low, medium, high
  result_data JSONB, -- Dados completos retornados pelo provider
  notes TEXT,
  requested_by INTEGER REFERENCES users(id),
  reviewed_by INTEGER REFERENCES users(id),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  expires_at TIMESTAMP, -- Validade do check (ex: 90 dias)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider, check_type, cpf)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_background_checks_user_id ON background_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_background_checks_status ON background_checks(status);
CREATE INDEX IF NOT EXISTS idx_background_checks_cpf ON background_checks(cpf);
CREATE INDEX IF NOT EXISTS idx_background_checks_requested_at ON background_checks(requested_at);

-- Tabela de histórico de checks (auditoria)
CREATE TABLE IF NOT EXISTS background_check_history (
  id SERIAL PRIMARY KEY,
  check_id INTEGER NOT NULL REFERENCES background_checks(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- requested, status_changed, reviewed, expired
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  performed_by INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para histórico
CREATE INDEX IF NOT EXISTS idx_background_check_history_check_id ON background_check_history(check_id);

-- Tabela de configuração de providers
CREATE TABLE IF NOT EXISTS background_check_providers (
  id SERIAL PRIMARY KEY,
  provider_name VARCHAR(50) NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT true,
  api_key VARCHAR(255),
  api_secret VARCHAR(255),
  api_url VARCHAR(500),
  cost_per_check DECIMAL(10, 2),
  check_types JSONB, -- ['basic', 'criminal', 'credit', 'full']
  config JSONB, -- Configurações específicas do provider
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir providers padrão
INSERT INTO background_check_providers (provider_name, enabled, check_types, config)
VALUES 
  ('serasa', true, '["basic", "credit", "full"]', '{"api_version": "v1", "timeout": 30000}'),
  ('clearsale', true, '["basic", "criminal", "full"]', '{"api_version": "v2", "timeout": 30000}'),
  ('mock', true, '["basic", "criminal", "credit", "full"]', '{"mock_mode": true}')
ON CONFLICT (provider_name) DO NOTHING;

-- Comentários
COMMENT ON TABLE background_checks IS 'Armazena verificações de antecedentes de usuários';
COMMENT ON TABLE background_check_history IS 'Histórico de auditoria de background checks';
COMMENT ON TABLE background_check_providers IS 'Configuração de providers de background check';

