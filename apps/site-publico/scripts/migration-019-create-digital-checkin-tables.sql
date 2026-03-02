-- ============================================
-- MIGRATION 019: CHECK-IN/CHECK-OUT DIGITAL
-- Sistema completo de check-in digital com QR codes
-- ============================================

-- Tabela: digital_checkins
-- Armazena informações principais do check-in digital
CREATE TABLE IF NOT EXISTS digital_checkins (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Código único do check-in (usado no QR code)
  check_in_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- QR code (base64 ou URL)
  qr_code TEXT,
  qr_code_url TEXT,
  
  -- Status do check-in
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Aguardando documentos
    'documents_pending', -- Documentos enviados, aguardando verificação
    'verified',          -- Documentos verificados
    'checked_in',        -- Check-in realizado
    'checked_out',       -- Check-out realizado
    'cancelled'          -- Cancelado
  )),
  
  -- Datas e horários
  check_in_at TIMESTAMP,
  check_out_at TIMESTAMP,
  
  -- Verificação de documentos
  documents_verified BOOLEAN DEFAULT false,
  documents_verified_at TIMESTAMP,
  documents_verified_by INTEGER REFERENCES users(id),
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para digital_checkins
CREATE INDEX IF NOT EXISTS idx_digital_checkins_booking_id ON digital_checkins(booking_id);
CREATE INDEX IF NOT EXISTS idx_digital_checkins_user_id ON digital_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_checkins_property_id ON digital_checkins(property_id);
CREATE INDEX IF NOT EXISTS idx_digital_checkins_check_in_code ON digital_checkins(check_in_code);
CREATE INDEX IF NOT EXISTS idx_digital_checkins_status ON digital_checkins(status);

-- Tabela: checkin_documents
-- Armazena documentos enviados durante o check-in
CREATE TABLE IF NOT EXISTS checkin_documents (
  id SERIAL PRIMARY KEY,
  checkin_id INTEGER NOT NULL REFERENCES digital_checkins(id) ON DELETE CASCADE,
  
  -- Tipo de documento
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'rg',           -- RG
    'cpf',          -- CPF
    'cnh',          -- CNH
    'passport',     -- Passaporte
    'selfie',       -- Selfie para verificação
    'proof_address', -- Comprovante de endereço
    'other'         -- Outro
  )),
  
  -- Informações do arquivo
  document_url TEXT NOT NULL,
  document_name VARCHAR(255),
  document_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Verificação
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  verified_by INTEGER REFERENCES users(id),
  verification_notes TEXT,
  
  -- Dados extraídos (OCR, etc)
  extracted_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para checkin_documents
CREATE INDEX IF NOT EXISTS idx_checkin_documents_checkin_id ON checkin_documents(checkin_id);
CREATE INDEX IF NOT EXISTS idx_checkin_documents_type ON checkin_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_checkin_documents_verified ON checkin_documents(is_verified);

-- Tabela: checkin_inspections
-- Armazena vistorias antes e depois do check-in
CREATE TABLE IF NOT EXISTS checkin_inspections (
  id SERIAL PRIMARY KEY,
  checkin_id INTEGER NOT NULL REFERENCES digital_checkins(id) ON DELETE CASCADE,
  
  -- Tipo de vistoria
  inspection_type VARCHAR(50) NOT NULL CHECK (inspection_type IN (
    'before_checkin',  -- Antes do check-in
    'after_checkout'   -- Depois do check-out
  )),
  
  -- Fotos (array de URLs)
  photos TEXT[],
  
  -- Notas e observações
  notes TEXT,
  damages TEXT, -- Danos encontrados (apenas para after_checkout)
  
  -- Realizado por
  inspected_by INTEGER REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para checkin_inspections
CREATE INDEX IF NOT EXISTS idx_checkin_inspections_checkin_id ON checkin_inspections(checkin_id);
CREATE INDEX IF NOT EXISTS idx_checkin_inspections_type ON checkin_inspections(inspection_type);

-- Tabela: checkin_access_codes
-- Armazena códigos de acesso (QR code, smart lock, etc)
CREATE TABLE IF NOT EXISTS checkin_access_codes (
  id SERIAL PRIMARY KEY,
  checkin_id INTEGER NOT NULL REFERENCES digital_checkins(id) ON DELETE CASCADE,
  
  -- Tipo de código
  code_type VARCHAR(50) NOT NULL CHECK (code_type IN (
    'qr',           -- QR Code
    'smart_lock',   -- Código de smart lock
    'pin',          -- PIN numérico
    'nfc',          -- NFC
    'other'         -- Outro
  )),
  
  -- Código de acesso
  code VARCHAR(255) NOT NULL,
  
  -- Validade
  expires_at TIMESTAMP,
  
  -- Status
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para checkin_access_codes
CREATE INDEX IF NOT EXISTS idx_checkin_access_codes_checkin_id ON checkin_access_codes(checkin_id);
CREATE INDEX IF NOT EXISTS idx_checkin_access_codes_code_type ON checkin_access_codes(code_type);
CREATE INDEX IF NOT EXISTS idx_checkin_access_codes_code ON checkin_access_codes(code);
CREATE INDEX IF NOT EXISTS idx_checkin_access_codes_expires_at ON checkin_access_codes(expires_at);

-- Comentários
COMMENT ON TABLE digital_checkins IS 'Check-ins digitais com QR codes e validação de documentos';
COMMENT ON TABLE checkin_documents IS 'Documentos enviados durante o processo de check-in';
COMMENT ON TABLE checkin_inspections IS 'Vistorias antes do check-in e depois do check-out';
COMMENT ON TABLE checkin_access_codes IS 'Códigos de acesso (QR codes, smart locks, etc) para check-in';

