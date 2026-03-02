-- ✅ ITEM 16: TABELAS DE SPLIT PAYMENT
-- Criar tabelas para divisão de pagamentos

-- 1. Tabela principal de split payments
CREATE TABLE IF NOT EXISTS split_payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL,
  payment_id INTEGER,
  total_amount DECIMAL(10, 2) NOT NULL,
  split_type VARCHAR(20) DEFAULT 'equal' CHECK (split_type IN ('equal', 'percentage', 'custom')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'completed', 'cancelled')),
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Referências
  CONSTRAINT fk_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_split_payments_booking ON split_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_split_payments_status ON split_payments(status);

-- 2. Participantes do split payment
CREATE TABLE IF NOT EXISTS split_payment_participants (
  id SERIAL PRIMARY KEY,
  split_payment_id INTEGER NOT NULL REFERENCES split_payments(id) ON DELETE CASCADE,
  user_id INTEGER,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  percentage DECIMAL(5, 2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'paid', 'cancelled')),
  payment_method VARCHAR(50),
  payment_token VARCHAR(255),
  paid_at TIMESTAMP,
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  invitation_sent_at TIMESTAMP,
  invitation_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Referência ao usuário (opcional)
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_split_participants_split ON split_payment_participants(split_payment_id);
CREATE INDEX IF NOT EXISTS idx_split_participants_user ON split_payment_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_split_participants_email ON split_payment_participants(email);
CREATE INDEX IF NOT EXISTS idx_split_participants_token ON split_payment_participants(invitation_token);
CREATE INDEX IF NOT EXISTS idx_split_participants_status ON split_payment_participants(status);

-- 3. Histórico de pagamentos
CREATE TABLE IF NOT EXISTS split_payment_history (
  id SERIAL PRIMARY KEY,
  split_payment_id INTEGER NOT NULL REFERENCES split_payments(id) ON DELETE CASCADE,
  participant_id INTEGER NOT NULL REFERENCES split_payment_participants(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  gateway_transaction_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  gateway_response JSONB,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_split_history_split ON split_payment_history(split_payment_id);
CREATE INDEX IF NOT EXISTS idx_split_history_participant ON split_payment_history(participant_id);
CREATE INDEX IF NOT EXISTS idx_split_history_status ON split_payment_history(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_split_payment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_split_payment_timestamp
BEFORE UPDATE ON split_payments
FOR EACH ROW
EXECUTE FUNCTION update_split_payment_timestamp();

CREATE TRIGGER trigger_update_split_participant_timestamp
BEFORE UPDATE ON split_payment_participants
FOR EACH ROW
EXECUTE FUNCTION update_split_payment_timestamp();

-- Função para atualizar status do split payment baseado nos participantes
CREATE OR REPLACE FUNCTION update_split_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  total_participants INTEGER;
  paid_participants INTEGER;
  split_status VARCHAR(20);
BEGIN
  -- Contar participantes
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'paid')
  INTO total_participants, paid_participants
  FROM split_payment_participants
  WHERE split_payment_id = NEW.split_payment_id;
  
  -- Determinar status
  IF paid_participants = 0 THEN
    split_status := 'pending';
  ELSIF paid_participants = total_participants THEN
    split_status := 'completed';
  ELSE
    split_status := 'partial';
  END IF;
  
  -- Atualizar status do split payment
  UPDATE split_payments
  SET status = split_status, updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.split_payment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_split_status
AFTER INSERT OR UPDATE ON split_payment_participants
FOR EACH ROW
EXECUTE FUNCTION update_split_payment_status();

-- Comentários
COMMENT ON TABLE split_payments IS 'Divisão de pagamentos para reservas em grupo';
COMMENT ON TABLE split_payment_participants IS 'Participantes de um split payment';
COMMENT ON TABLE split_payment_history IS 'Histórico de pagamentos dos participantes';

