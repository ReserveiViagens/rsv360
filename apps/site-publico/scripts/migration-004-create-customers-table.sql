-- ✅ Migration 004: Criar tabela customers
-- Tabela de clientes para referências em outras migrations
-- Data: 2025-12-16

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Informações básicas
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  document VARCHAR(50), -- CPF, CNPJ, etc.
  document_type VARCHAR(20), -- 'cpf', 'cnpj', 'passport', etc.
  
  -- Endereço
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(50),
  address_country VARCHAR(50) DEFAULT 'Brazil',
  address_zip_code VARCHAR(20),
  
  -- Dados adicionais
  birth_date DATE,
  gender VARCHAR(20), -- 'male', 'female', 'other', 'prefer_not_to_say'
  nationality VARCHAR(50),
  
  -- Preferências e configurações
  language VARCHAR(10) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Status e verificação
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_token VARCHAR(255),
  verified_at TIMESTAMP,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_is_verified ON customers(is_verified);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_customers_updated_at();

-- Comentários
COMMENT ON TABLE customers IS 'Tabela de clientes para referências em outras migrations';
COMMENT ON COLUMN customers.user_id IS 'Referência opcional para tabela users';
COMMENT ON COLUMN customers.document IS 'CPF, CNPJ, Passaporte, etc.';
COMMENT ON COLUMN customers.metadata IS 'Dados adicionais flexíveis em formato JSON';
