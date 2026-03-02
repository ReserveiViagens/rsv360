-- ✅ FASE 4: MIGRATION 015 - CREATE INSURANCE TABLES
-- Tabelas para sistema de seguro de viagem

-- ============================================
-- TABELA: insurance_policies (Apólices de Seguro)
-- ============================================
CREATE TABLE IF NOT EXISTS insurance_policies (
  id SERIAL PRIMARY KEY,
  
  -- Relacionamento
  booking_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
  -- Dados da apólice
  policy_number VARCHAR(100) UNIQUE NOT NULL,
  insurance_provider VARCHAR(100) NOT NULL, -- 'rsv360', 'external'
  coverage_type VARCHAR(50) CHECK (coverage_type IN (
    'basic', 'standard', 'premium', 'comprehensive'
  )),
  
  -- Cobertura
  coverage_amount DECIMAL(10, 2) NOT NULL,
  premium_amount DECIMAL(10, 2) NOT NULL,
  deductible DECIMAL(10, 2) DEFAULT 0,
  
  -- Período
  coverage_start_date DATE NOT NULL,
  coverage_end_date DATE NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active', 'expired', 'cancelled', 'claimed'
  )),
  
  -- Dados do segurado
  insured_name VARCHAR(255) NOT NULL,
  insured_document VARCHAR(20),
  insured_email VARCHAR(255),
  insured_phone VARCHAR(20),
  
  -- Metadados
  policy_details JSONB, -- Detalhes específicos da apólice
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_insurance_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_insurance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: insurance_claims (Sinistros)
-- ============================================
CREATE TABLE IF NOT EXISTS insurance_claims (
  id SERIAL PRIMARY KEY,
  
  -- Relacionamento
  policy_id INTEGER NOT NULL,
  booking_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
  -- Dados do sinistro
  claim_number VARCHAR(100) UNIQUE NOT NULL,
  claim_type VARCHAR(50) CHECK (claim_type IN (
    'cancellation', 'medical', 'baggage', 'trip_delay', 
    'accident', 'other'
  )),
  
  -- Descrição
  description TEXT NOT NULL,
  incident_date DATE NOT NULL,
  incident_location VARCHAR(255),
  
  -- Valor
  claimed_amount DECIMAL(10, 2) NOT NULL,
  approved_amount DECIMAL(10, 2),
  rejected_amount DECIMAL(10, 2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'approved', 'rejected', 'paid', 'closed'
  )),
  
  -- Documentos
  documents JSONB, -- Array de URLs de documentos
  evidence_files JSONB, -- Array de arquivos de evidência
  
  -- Revisão
  reviewed_by INTEGER,
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Pagamento
  payment_date DATE,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  -- Metadados
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_claim_policy FOREIGN KEY (policy_id) REFERENCES insurance_policies(id) ON DELETE CASCADE,
  CONSTRAINT fk_claim_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_claim_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_claim_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_insurance_policies_booking ON insurance_policies(booking_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_user ON insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_number ON insurance_policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy ON insurance_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_booking ON insurance_claims(booking_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_user ON insurance_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_number ON insurance_claims(claim_number);

-- Triggers
CREATE OR REPLACE FUNCTION update_insurance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_insurance_policy_timestamp
BEFORE UPDATE ON insurance_policies
FOR EACH ROW
EXECUTE FUNCTION update_insurance_timestamp();

CREATE TRIGGER trigger_update_insurance_claim_timestamp
BEFORE UPDATE ON insurance_claims
FOR EACH ROW
EXECUTE FUNCTION update_insurance_timestamp();

-- Comentários
COMMENT ON TABLE insurance_policies IS 'Apólices de seguro de viagem';
COMMENT ON TABLE insurance_claims IS 'Sinistros e reclamações de seguro';

