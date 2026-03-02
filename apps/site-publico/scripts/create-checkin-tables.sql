-- ============================================
-- TABELAS PARA CHECK-IN ONLINE E CONTRATO DIGITAL
-- ============================================

-- Tabela: checkins (Check-ins online)
CREATE TABLE IF NOT EXISTS checkins (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Status do check-in
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  -- Datas
  scheduled_checkin_date DATE NOT NULL,
  scheduled_checkin_time TIME,
  actual_checkin_date DATE,
  actual_checkin_time TIME,
  
  -- Documentos enviados
  documents_submitted BOOLEAN DEFAULT false,
  documents_verified BOOLEAN DEFAULT false,
  documents_verified_by INTEGER REFERENCES users(id),
  documents_verified_at TIMESTAMP,
  
  -- Contrato
  contract_signed BOOLEAN DEFAULT false,
  contract_signed_at TIMESTAMP,
  contract_signature_data JSONB,
  
  -- PIN da fechadura (se aplicável)
  lock_pin VARCHAR(20),
  lock_pin_expires_at TIMESTAMP,
  lock_pin_used BOOLEAN DEFAULT false,
  
  -- Instruções
  instructions_sent BOOLEAN DEFAULT false,
  instructions_sent_at TIMESTAMP,
  
  -- Verificação de identidade
  identity_verified BOOLEAN DEFAULT false,
  identity_verification_provider VARCHAR(50) CHECK (identity_verification_provider IN ('unico', 'idwall', 'manual', 'none')),
  identity_verification_data JSONB,
  
  -- Observações
  host_notes TEXT,
  guest_notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_checkins_booking_id ON checkins(booking_id);
CREATE INDEX IF NOT EXISTS idx_checkins_property_id ON checkins(property_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_status ON checkins(status);
CREATE INDEX IF NOT EXISTS idx_checkins_scheduled_date ON checkins(scheduled_checkin_date);

-- Tabela: checkin_documents (Documentos do check-in)
CREATE TABLE IF NOT EXISTS checkin_documents (
  id SERIAL PRIMARY KEY,
  checkin_id INTEGER NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Tipo de documento
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('rg', 'cpf', 'cnh', 'passport', 'selfie', 'contract', 'other')),
  
  -- Arquivo
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Verificação
  is_verified BOOLEAN DEFAULT false,
  verified_by INTEGER REFERENCES users(id),
  verified_at TIMESTAMP,
  verification_notes TEXT,
  
  -- OCR/Extracted data (se aplicável)
  extracted_data JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_checkin_documents_checkin_id ON checkin_documents(checkin_id);
CREATE INDEX IF NOT EXISTS idx_checkin_documents_booking_id ON checkin_documents(booking_id);
CREATE INDEX IF NOT EXISTS idx_checkin_documents_type ON checkin_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_checkin_documents_verified ON checkin_documents(is_verified);

-- Tabela: contracts (Contratos digitais)
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tipo de contrato
  contract_type VARCHAR(50) DEFAULT 'rental' CHECK (contract_type IN ('rental', 'short_term', 'long_term', 'commercial', 'custom')),
  
  -- Template usado
  template_id VARCHAR(100),
  template_version VARCHAR(20),
  
  -- Conteúdo do contrato
  contract_content TEXT NOT NULL,
  contract_html TEXT,
  contract_pdf_path TEXT,
  
  -- Assinaturas
  host_signed BOOLEAN DEFAULT false,
  host_signed_at TIMESTAMP,
  host_signature_data JSONB,
  
  guest_signed BOOLEAN DEFAULT false,
  guest_signed_at TIMESTAMP,
  guest_signature_data JSONB,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'cancelled', 'expired')),
  
  -- Validade
  valid_from DATE,
  valid_until DATE,
  expires_at TIMESTAMP,
  
  -- Notificações
  sent_to_host BOOLEAN DEFAULT false,
  sent_to_guest BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  signed_at TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_contracts_booking_id ON contracts(booking_id);
CREATE INDEX IF NOT EXISTS idx_contracts_property_id ON contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_contracts_host_id ON contracts(host_id);
CREATE INDEX IF NOT EXISTS idx_contracts_guest_id ON contracts(guest_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_expires_at ON contracts(expires_at);

-- Tabela: identity_verifications (Verificações de identidade)
CREATE TABLE IF NOT EXISTS identity_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Provedor
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('unico', 'idwall', 'manual', 'other')),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'expired')),
  
  -- Dados da verificação
  verification_data JSONB NOT NULL,
  verification_result JSONB,
  
  -- Documentos
  selfie_path TEXT,
  document_front_path TEXT,
  document_back_path TEXT,
  
  -- Score de confiança (0-100)
  confidence_score INTEGER,
  
  -- Aprovado por
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_booking_id ON identity_verifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_status ON identity_verifications(status);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_provider ON identity_verifications(provider);

-- Comentários
COMMENT ON TABLE checkins IS 'Check-ins online com upload de documentos e assinatura de contrato';
COMMENT ON TABLE checkin_documents IS 'Documentos enviados durante o check-in';
COMMENT ON TABLE contracts IS 'Contratos digitais assinados eletronicamente';
COMMENT ON TABLE identity_verifications IS 'Verificações de identidade via Unico/IDwall';

