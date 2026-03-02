-- ✅ TABELAS PARA COMPLIANCE LGPD
-- Suporta consentimentos, exportação e direito ao esquecimento

CREATE TABLE IF NOT EXISTS user_consents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('cookies', 'marketing', 'analytics', 'necessary')),
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMP,
  revoked_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, consent_type)
);

CREATE TABLE IF NOT EXISTS privacy_policies (
  id SERIAL PRIMARY KEY,
  version VARCHAR(20) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar colunas de anonimização nas tabelas existentes (se não existirem)
DO $$ 
BEGIN
  -- Adicionar coluna deleted_at em users se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'deleted_at') THEN
    ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
  END IF;

  -- Adicionar coluna anonymized_at em users se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'anonymized_at') THEN
    ALTER TABLE users ADD COLUMN anonymized_at TIMESTAMP;
  END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_consents_user ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON user_consents(consent_type, granted);
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_anonymized ON users(anonymized_at);

-- Comentários
COMMENT ON TABLE user_consents IS 'Consentimentos LGPD dos usuários';
COMMENT ON TABLE privacy_policies IS 'Versões da política de privacidade';

