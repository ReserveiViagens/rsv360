-- Fase 4 coexistência — códigos SSO one-time S1 (:5000) → S2 (:3000)
CREATE TABLE IF NOT EXISTS auth_sso_codes (
  id SERIAL PRIMARY KEY,
  code_hash VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  external_user_id VARCHAR(255),
  return_url TEXT,
  expires_at TIMESTAMP NOT NULL,
  consumed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_auth_sso_codes_expires ON auth_sso_codes(expires_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_auth_sso_codes_email ON auth_sso_codes(email);
