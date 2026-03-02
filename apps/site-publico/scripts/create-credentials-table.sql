-- ✅ TABELA DE CREDENCIAIS
-- Criar tabela para armazenar credenciais de forma segura

CREATE TABLE IF NOT EXISTS credentials (
  id SERIAL PRIMARY KEY,
  service VARCHAR(100) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  encrypted BOOLEAN DEFAULT true,
  iv VARCHAR(64), -- Initialization vector para criptografia
  tag VARCHAR(64), -- Auth tag para criptografia
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service, key)
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_credentials_service ON credentials(service);
CREATE INDEX IF NOT EXISTS idx_credentials_service_key ON credentials(service, key);

-- Comentários
COMMENT ON TABLE credentials IS 'Armazena credenciais de serviços externos de forma criptografada';
COMMENT ON COLUMN credentials.service IS 'Nome do serviço (smtp, mercadopago, google, etc.)';
COMMENT ON COLUMN credentials.key IS 'Chave da credencial (host, port, user, password, etc.)';
COMMENT ON COLUMN credentials.value IS 'Valor da credencial (criptografado se encrypted=true)';
COMMENT ON COLUMN credentials.encrypted IS 'Se true, o valor está criptografado';
COMMENT ON COLUMN credentials.iv IS 'Initialization vector para descriptografia';
COMMENT ON COLUMN credentials.tag IS 'Auth tag para verificação de integridade';

