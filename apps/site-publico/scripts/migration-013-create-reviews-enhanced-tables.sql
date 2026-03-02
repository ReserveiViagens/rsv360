-- ✅ ITENS 75-78: MIGRATION 013 - CREATE ENHANCED REVIEWS TABLES
-- Tabelas para melhorias no sistema de reviews

-- ============================================
-- TABELA: review_photos (Fotos de Reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS review_photos (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL,
  
  -- Dados da foto
  photo_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  photo_order INTEGER DEFAULT 0,
  
  -- Moderação
  moderation_status VARCHAR(50) DEFAULT 'pending' CHECK (moderation_status IN (
    'pending', 'approved', 'rejected', 'flagged'
  )),
  moderation_notes TEXT,
  moderated_by INTEGER,
  moderated_at TIMESTAMP,
  
  -- Metadados
  file_size INTEGER, -- em bytes
  width INTEGER,
  height INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_review_photo_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_photo_moderator FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABELA: review_moderation (Moderação de Reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS review_moderation (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'flagged', 'edited'
  )),
  
  -- Ações
  action_taken VARCHAR(50), -- 'approve', 'reject', 'edit', 'flag', 'delete'
  action_reason TEXT,
  
  -- Moderador
  moderated_by INTEGER,
  moderated_at TIMESTAMP,
  
  -- Notas
  moderation_notes TEXT,
  auto_moderated BOOLEAN DEFAULT false, -- Se foi moderado automaticamente
  
  -- Histórico
  previous_status VARCHAR(50),
  previous_content TEXT, -- Conteúdo anterior (se editado)
  
  -- Metadados
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_review_moderation_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_moderation_moderator FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABELA: review_responses (Respostas de Hosts)
-- ============================================
CREATE TABLE IF NOT EXISTS review_responses (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL,
  
  -- Respondente
  responder_id INTEGER NOT NULL,
  responder_type VARCHAR(50) DEFAULT 'host' CHECK (responder_type IN (
    'host', 'owner', 'manager', 'admin'
  )),
  
  -- Resposta
  response_text TEXT NOT NULL,
  
  -- Status
  is_public BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT true,
  
  -- Notificações
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP,
  
  -- Metadados
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_review_response_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_response_responder FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_review_response UNIQUE(review_id) -- Uma resposta por review
);

-- ============================================
-- TABELA: review_verification (Verificação de Reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS review_verification (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL,
  
  -- Status de verificação
  is_verified BOOLEAN DEFAULT false,
  verification_type VARCHAR(50) CHECK (verification_type IN (
    'booking', 'stay', 'manual', 'automated'
  )),
  
  -- Dados de verificação
  verified_booking_id INTEGER, -- ID da reserva que verifica o review
  verified_stay_date DATE, -- Data da estadia verificada
  verification_score DECIMAL(3, 2), -- Score de confiança (0-1)
  
  -- Badges
  badges VARCHAR(50)[], -- Array de badges: ['verified_stay', 'verified_booking', 'trusted_reviewer']
  
  -- Verificador
  verified_by INTEGER, -- Admin que verificou manualmente
  verified_at TIMESTAMP,
  
  -- Metadados
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_review_verification_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_verification_booking FOREIGN KEY (verified_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_review_verification_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_review_verification UNIQUE(review_id)
);

-- ============================================
-- TABELA: review_flags (Sinalizações de Reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS review_flags (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL,
  
  -- Sinalizador
  flagged_by INTEGER NOT NULL,
  flag_reason VARCHAR(50) NOT NULL CHECK (flag_reason IN (
    'spam', 'inappropriate', 'fake', 'offensive', 'irrelevant', 'other'
  )),
  flag_description TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'reviewed', 'resolved', 'dismissed'
  )),
  
  -- Revisão
  reviewed_by INTEGER,
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  
  -- Metadados
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_review_flag_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_flag_user FOREIGN KEY (flagged_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_flag_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_review_photos_review ON review_photos(review_id);
CREATE INDEX IF NOT EXISTS idx_review_photos_moderation ON review_photos(moderation_status) WHERE moderation_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_review_moderation_review ON review_moderation(review_id);
CREATE INDEX IF NOT EXISTS idx_review_moderation_status ON review_moderation(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_review_moderation_moderator ON review_moderation(moderated_by);
CREATE INDEX IF NOT EXISTS idx_review_responses_review ON review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_responder ON review_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_review_verification_review ON review_verification(review_id);
CREATE INDEX IF NOT EXISTS idx_review_verification_verified ON review_verification(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_review_flags_review ON review_flags(review_id);
CREATE INDEX IF NOT EXISTS idx_review_flags_status ON review_flags(status) WHERE status = 'pending';

-- Triggers
CREATE OR REPLACE FUNCTION update_review_moderation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_moderation_timestamp
BEFORE UPDATE ON review_moderation
FOR EACH ROW
EXECUTE FUNCTION update_review_moderation_timestamp();

CREATE TRIGGER trigger_update_review_responses_timestamp
BEFORE UPDATE ON review_responses
FOR EACH ROW
EXECUTE FUNCTION update_review_moderation_timestamp();

CREATE TRIGGER trigger_update_review_verification_timestamp
BEFORE UPDATE ON review_verification
FOR EACH ROW
EXECUTE FUNCTION update_review_moderation_timestamp();

CREATE TRIGGER trigger_update_review_flags_timestamp
BEFORE UPDATE ON review_flags
FOR EACH ROW
EXECUTE FUNCTION update_review_moderation_timestamp();

-- Função para atualizar status do review quando moderado
CREATE OR REPLACE FUNCTION update_review_status_on_moderation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE reviews SET is_approved = true WHERE id = NEW.review_id;
  ELSIF NEW.status = 'rejected' THEN
    UPDATE reviews SET is_approved = false WHERE id = NEW.review_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_status_on_moderation
AFTER UPDATE ON review_moderation
FOR EACH ROW
WHEN (NEW.status != OLD.status)
EXECUTE FUNCTION update_review_status_on_moderation();

-- Comentários
COMMENT ON TABLE review_photos IS 'Fotos anexadas a reviews';
COMMENT ON TABLE review_moderation IS 'Histórico de moderação de reviews';
COMMENT ON TABLE review_responses IS 'Respostas de hosts/proprietários a reviews';
COMMENT ON TABLE review_verification IS 'Verificação e badges de reviews';
COMMENT ON TABLE review_flags IS 'Sinalizações de reviews por usuários';

