-- ✅ ITEM 19: TABELAS DE CONVITES DIGITAIS
-- Criar tabelas para convites de viagem

-- 1. Tabela principal de convites
CREATE TABLE IF NOT EXISTS trip_invitations (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER,
  wishlist_id INTEGER,
  trip_name VARCHAR(255),
  invited_by INTEGER NOT NULL,
  invited_email VARCHAR(255) NOT NULL,
  invited_name VARCHAR(255),
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  invitation_type VARCHAR(50) DEFAULT 'booking' CHECK (invitation_type IN ('booking', 'wishlist', 'trip', 'split_payment')),
  message TEXT,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  declined_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Referências
  CONSTRAINT fk_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist FOREIGN KEY (wishlist_id) REFERENCES shared_wishlists(id) ON DELETE CASCADE,
  CONSTRAINT fk_inviter FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trip_invitations_token ON trip_invitations(token);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_booking ON trip_invitations(booking_id);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_wishlist ON trip_invitations(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_email ON trip_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_status ON trip_invitations(status);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_expires ON trip_invitations(expires_at);

-- 2. Histórico de convites (para auditoria)
CREATE TABLE IF NOT EXISTS trip_invitation_history (
  id SERIAL PRIMARY KEY,
  invitation_id INTEGER NOT NULL REFERENCES trip_invitations(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'sent', 'viewed', 'accepted', 'declined', 'expired', 'cancelled'
  performed_by INTEGER,
  performed_by_email VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invitation_history_invitation ON trip_invitation_history(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_history_action ON trip_invitation_history(action);

-- Trigger para atualizar status quando expira
CREATE OR REPLACE FUNCTION update_expired_invitations()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trip_invitations
  SET 
    status = 'expired',
    updated_at = CURRENT_TIMESTAMP
  WHERE status = 'pending' 
    AND expires_at < CURRENT_TIMESTAMP;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_invitation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invitation_timestamp
BEFORE UPDATE ON trip_invitations
FOR EACH ROW
EXECUTE FUNCTION update_invitation_timestamp();

-- Comentários
COMMENT ON TABLE trip_invitations IS 'Convites digitais para reservas, wishlists, viagens, etc.';
COMMENT ON TABLE trip_invitation_history IS 'Histórico de ações dos convites';

