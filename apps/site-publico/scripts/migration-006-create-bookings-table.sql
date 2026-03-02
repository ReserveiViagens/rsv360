-- ✅ Migration 006: Criar tabela bookings
-- Tabela de reservas para referências em outras migrations
-- Data: 2025-12-16

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_code VARCHAR(50) UNIQUE NOT NULL,
  booking_type VARCHAR(20) NOT NULL DEFAULT 'hotel',
  item_id INTEGER NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  
  -- Datas
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  
  -- Hóspedes
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER DEFAULT 0,
  infants INTEGER DEFAULT 0,
  total_guests INTEGER NOT NULL,
  
  -- Cliente
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_document VARCHAR(50),
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Preços
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  taxes DECIMAL(10, 2) DEFAULT 0,
  service_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Pagamento
  payment_method VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_info JSONB,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Observações
  special_requests TEXT,
  notes TEXT,
  
  -- Metadados
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  checked_in_at TIMESTAMP,
  checked_out_at TIMESTAMP,
  
  -- Constraints
  CHECK (adults > 0),
  CHECK (total >= 0),
  CHECK (check_out > check_in),
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'checked_in', 'checked_out')),
  CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'cancelled')),
  CHECK (payment_method IN ('pix', 'card', 'boleto', 'cash'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_item ON bookings(booking_type, item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_bookings_updated_at();

-- Comentários
COMMENT ON TABLE bookings IS 'Tabela de reservas para referências em outras migrations';

