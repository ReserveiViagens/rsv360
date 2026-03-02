-- ✅ ITEM 44: MIGRATION 003 - CREATE OWNERS
-- Tabela owners com relacionamentos e validações

CREATE TABLE IF NOT EXISTS owners (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE, -- Relacionamento com users
  company_name VARCHAR(255),
  legal_name VARCHAR(255) NOT NULL, -- Razão social ou nome completo
  document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('cpf', 'cnpj', 'passport')),
  document_number VARCHAR(50) NOT NULL UNIQUE,
  
  -- Contato
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  mobile_phone VARCHAR(50),
  
  -- Endereço
  address_street VARCHAR(255),
  address_number VARCHAR(50),
  address_complement VARCHAR(255),
  address_neighborhood VARCHAR(255),
  address_city VARCHAR(255),
  address_state VARCHAR(2),
  address_zip_code VARCHAR(20),
  address_country VARCHAR(100) DEFAULT 'Brasil',
  
  -- Informações bancárias (opcional, para pagamentos)
  bank_name VARCHAR(255),
  bank_agency VARCHAR(50),
  bank_account VARCHAR(50),
  bank_account_type VARCHAR(20) CHECK (bank_account_type IN ('checking', 'savings')),
  pix_key VARCHAR(255),
  
  -- Status e configurações
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMP,
  verified_by INTEGER,
  
  -- Comissão e taxas
  commission_rate DECIMAL(5, 2) DEFAULT 15.00, -- Taxa de comissão padrão (%)
  payment_method VARCHAR(50) DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'pix', 'check')),
  payment_terms INTEGER DEFAULT 30, -- Dias para pagamento
  
  -- Metadados
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relacionamentos
  CONSTRAINT fk_owner_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_owners_user ON owners(user_id);
CREATE INDEX IF NOT EXISTS idx_owners_document ON owners(document_number);
CREATE INDEX IF NOT EXISTS idx_owners_email ON owners(email);
CREATE INDEX IF NOT EXISTS idx_owners_status ON owners(status);
CREATE INDEX IF NOT EXISTS idx_owners_verification ON owners(verification_status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_owners_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_owners_timestamp
BEFORE UPDATE ON owners
FOR EACH ROW
EXECUTE FUNCTION update_owners_timestamp();

-- Validação de CPF/CNPJ (pode ser adicionada como constraint ou função)
-- Por enquanto, apenas estrutura básica

-- Comentários
COMMENT ON TABLE owners IS 'Proprietários de propriedades';
COMMENT ON COLUMN owners.document_type IS 'Tipo de documento: CPF, CNPJ ou Passaporte';
COMMENT ON COLUMN owners.verification_status IS 'Status de verificação do proprietário';

