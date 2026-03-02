-- ✅ ITEM 46: MIGRATION 008 - CREATE SHARES
-- Tabela shares (cotas) com relacionamentos e validações

CREATE TABLE IF NOT EXISTS shares (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  owner_id INTEGER NOT NULL,
  
  -- Informações da cota
  share_percentage DECIMAL(5, 2) NOT NULL CHECK (share_percentage > 0 AND share_percentage <= 100),
  share_value DECIMAL(12, 2), -- Valor da cota (opcional)
  share_number VARCHAR(50), -- Número da cota (ex: "Cota 001")
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'sold', 'cancelled')),
  
  -- Transferência
  transferred_from INTEGER, -- ID da cota original (se foi transferida)
  transferred_to INTEGER, -- ID da nova cota (se foi transferida)
  transferred_at TIMESTAMP,
  transfer_reason TEXT,
  
  -- Validações
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  verified_by INTEGER,
  
  -- Metadados
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relacionamentos
  CONSTRAINT fk_share_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT fk_share_owner FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE,
  CONSTRAINT fk_transferred_from FOREIGN KEY (transferred_from) REFERENCES shares(id) ON DELETE SET NULL,
  CONSTRAINT fk_transferred_to FOREIGN KEY (transferred_to) REFERENCES shares(id) ON DELETE SET NULL,
  CONSTRAINT fk_verified_by_share FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_shares_property ON shares(property_id);
CREATE INDEX IF NOT EXISTS idx_shares_owner ON shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_shares_status ON shares(status);
CREATE INDEX IF NOT EXISTS idx_shares_transferred ON shares(transferred_from, transferred_to);

-- Trigger para validar que a soma das cotas não exceda 100%
CREATE OR REPLACE FUNCTION validate_shares_percentage()
RETURNS TRIGGER AS $$
DECLARE
  v_total_percentage DECIMAL(5, 2);
BEGIN
  -- Calcular total de cotas ativas para a propriedade
  SELECT COALESCE(SUM(share_percentage), 0)
  INTO v_total_percentage
  FROM shares
  WHERE property_id = NEW.property_id
    AND status = 'active'
    AND id != COALESCE(NEW.id, 0);
  
  -- Adicionar a nova cota
  v_total_percentage := v_total_percentage + NEW.share_percentage;
  
  -- Validar
  IF v_total_percentage > 100 THEN
    RAISE EXCEPTION 'A soma das cotas não pode exceder 100%%. Total atual: %', v_total_percentage;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_shares_percentage
BEFORE INSERT OR UPDATE ON shares
FOR EACH ROW
EXECUTE FUNCTION validate_shares_percentage();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_shares_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shares_timestamp
BEFORE UPDATE ON shares
FOR EACH ROW
EXECUTE FUNCTION update_shares_timestamp();

-- Tabela de histórico de transferências
CREATE TABLE IF NOT EXISTS share_transfers (
  id SERIAL PRIMARY KEY,
  share_id INTEGER NOT NULL,
  from_owner_id INTEGER,
  to_owner_id INTEGER NOT NULL,
  transfer_type VARCHAR(50) NOT NULL CHECK (transfer_type IN ('sale', 'gift', 'inheritance', 'other')),
  transfer_value DECIMAL(12, 2),
  transfer_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_transfer_share FOREIGN KEY (share_id) REFERENCES shares(id) ON DELETE CASCADE,
  CONSTRAINT fk_from_owner FOREIGN KEY (from_owner_id) REFERENCES owners(id) ON DELETE SET NULL,
  CONSTRAINT fk_to_owner FOREIGN KEY (to_owner_id) REFERENCES owners(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_share_transfers_share ON share_transfers(share_id);
CREATE INDEX IF NOT EXISTS idx_share_transfers_date ON share_transfers(transfer_date DESC);

-- Comentários
COMMENT ON TABLE shares IS 'Cotas de propriedades (para propriedades compartilhadas)';
COMMENT ON TABLE share_transfers IS 'Histórico de transferências de cotas';

