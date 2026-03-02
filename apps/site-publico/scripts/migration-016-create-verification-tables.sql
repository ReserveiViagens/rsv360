-- ✅ FASE 4: MIGRATION 016 - CREATE VERIFICATION TABLES
-- Tabelas para verificação de propriedades

-- ============================================
-- TABELA: property_verifications (Verificações de Propriedades)
-- ============================================
CREATE TABLE IF NOT EXISTS property_verifications (
  id SERIAL PRIMARY KEY,
  
  -- Relacionamento
  property_id INTEGER NOT NULL,
  requested_by INTEGER NOT NULL, -- Host que solicitou
  
  -- Status da verificação
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_review', 'approved', 'rejected', 'expired'
  )),
  
  -- Tipo de verificação
  verification_type VARCHAR(50) CHECK (verification_type IN (
    'identity', 'address', 'ownership', 'business', 'comprehensive'
  )),
  
  -- Documentos
  identity_document_url VARCHAR(500), -- CPF/CNPJ
  address_proof_url VARCHAR(500), -- Comprovante de endereço
  ownership_proof_url VARCHAR(500), -- Comprovante de propriedade
  business_license_url VARCHAR(500), -- Licença comercial (se aplicável)
  additional_documents JSONB, -- Array de URLs de documentos adicionais
  
  -- Fotos
  property_photos JSONB, -- Array de URLs de fotos da propriedade
  exterior_photos JSONB, -- Fotos do exterior
  interior_photos JSONB, -- Fotos do interior
  
  -- Informações de verificação
  verified_address TEXT, -- Endereço verificado
  verified_coordinates POINT, -- Coordenadas verificadas (lat, lng)
  verified_owner_name VARCHAR(255), -- Nome do proprietário verificado
  
  -- Revisão
  reviewed_by INTEGER, -- Admin que revisou
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Badge/Status
  verification_badge VARCHAR(50), -- 'verified', 'super_host', 'premium'
  badge_expires_at TIMESTAMP,
  
  -- Metadados
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- Data de expiração da verificação
  
  CONSTRAINT fk_verification_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT fk_verification_requester FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_verification_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABELA: verification_history (Histórico de Verificações)
-- ============================================
CREATE TABLE IF NOT EXISTS verification_history (
  id SERIAL PRIMARY KEY,
  verification_id INTEGER NOT NULL,
  
  -- Mudança
  action VARCHAR(50) NOT NULL, -- 'created', 'status_changed', 'document_added', 'reviewed'
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  
  -- Detalhes
  description TEXT,
  changed_by INTEGER,
  
  -- Metadados
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_verification_history_verification FOREIGN KEY (verification_id) REFERENCES property_verifications(id) ON DELETE CASCADE,
  CONSTRAINT fk_verification_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_property_verifications_property ON property_verifications(property_id);
CREATE INDEX IF NOT EXISTS idx_property_verifications_status ON property_verifications(status);
CREATE INDEX IF NOT EXISTS idx_property_verifications_requester ON property_verifications(requested_by);
CREATE INDEX IF NOT EXISTS idx_property_verifications_reviewer ON property_verifications(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_property_verifications_badge ON property_verifications(verification_badge);
CREATE INDEX IF NOT EXISTS idx_verification_history_verification ON verification_history(verification_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_created ON verification_history(created_at DESC);

-- Triggers
CREATE OR REPLACE FUNCTION update_verification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_verification_timestamp
BEFORE UPDATE ON property_verifications
FOR EACH ROW
EXECUTE FUNCTION update_verification_timestamp();

-- Função para registrar histórico automaticamente
CREATE OR REPLACE FUNCTION log_verification_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO verification_history (verification_id, action, new_status, changed_by, description)
    VALUES (NEW.id, 'created', NEW.status, NEW.requested_by, 'Verificação criada');
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO verification_history (verification_id, action, old_status, new_status, changed_by, description)
      VALUES (NEW.id, 'status_changed', OLD.status, NEW.status, NEW.reviewed_by, 
              'Status alterado de ' || OLD.status || ' para ' || NEW.status);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_verification_history
AFTER INSERT OR UPDATE ON property_verifications
FOR EACH ROW
EXECUTE FUNCTION log_verification_history();

-- Comentários
COMMENT ON TABLE property_verifications IS 'Verificações de propriedades';
COMMENT ON TABLE verification_history IS 'Histórico de mudanças em verificações';

