-- ===================================================================
-- TABELA DE RESERVAS (BOOKINGS)
-- Sistema RSV 360 - Reservas de Hotéis
-- ===================================================================

-- Criar tabela de reservas
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
    customer_id INTEGER, -- FK para tabela users (opcional)
    
    -- Preços
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    taxes DECIMAL(10, 2) DEFAULT 0,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Pagamento
    payment_method VARCHAR(20) NOT NULL, -- 'pix', 'card', 'boleto'
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'refunded', 'cancelled'
    payment_info JSONB, -- QR Code, token, etc.
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed', 'checked_in', 'checked_out'
    
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_item ON bookings(booking_type, item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Tabela de pagamentos (histórico)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Informações do pagamento
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    
    -- Gateway
    gateway VARCHAR(50), -- 'mercadopago', 'stripe', etc.
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    
    -- PIX
    pix_qr_code TEXT,
    pix_qr_code_image TEXT, -- Base64
    pix_expires_at TIMESTAMP,
    
    -- Cartão
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    installments INTEGER DEFAULT 1,
    
    -- Boleto
    boleto_barcode VARCHAR(255),
    boleto_due_date DATE,
    boleto_url TEXT,
    
    -- Metadados
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    
    CHECK (amount > 0),
    CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction ON payments(gateway_transaction_id);

-- Tabela de usuários (simplificada)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    document VARCHAR(50),
    password_hash VARCHAR(255), -- Para autenticação futura
    role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'admin', 'staff'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'banned'
    
    -- Metadados
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar código de reserva único
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_code VARCHAR(50);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Formato: RSV-YYYYMMDD-HHMMSS-RANDOM
        new_code := 'RSV-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || 
                    TO_CHAR(CURRENT_TIMESTAMP, 'HH24MISS') || '-' ||
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_code = new_code) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Comentários nas tabelas
COMMENT ON TABLE bookings IS 'Tabela principal de reservas do sistema';
COMMENT ON TABLE payments IS 'Histórico de pagamentos das reservas';
COMMENT ON TABLE users IS 'Usuários do sistema (clientes e administradores)';

