-- ✅ TABELAS PARA AUTENTICAÇÃO DE DOIS FATORES (2FA)
-- Suporta TOTP, SMS e Email 2FA

CREATE TABLE IF NOT EXISTS user_2fa (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  method VARCHAR(20) NOT NULL CHECK (method IN ('totp', 'sms', 'email')),
  secret TEXT, -- Secret para TOTP
  backup_codes JSONB, -- Backup codes para TOTP
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, method)
);

CREATE TABLE IF NOT EXISTS user_2fa_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  method VARCHAR(20) NOT NULL CHECK (method IN ('sms', 'email')),
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_2fa_user ON user_2fa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_enabled ON user_2fa(user_id, enabled);
CREATE INDEX IF NOT EXISTS idx_user_2fa_codes_user ON user_2fa_codes(user_id, method, used);
CREATE INDEX IF NOT EXISTS idx_user_2fa_codes_expires ON user_2fa_codes(expires_at);

-- Comentários
COMMENT ON TABLE user_2fa IS 'Configurações de 2FA dos usuários';
COMMENT ON TABLE user_2fa_codes IS 'Códigos temporários de 2FA (SMS/Email)';

