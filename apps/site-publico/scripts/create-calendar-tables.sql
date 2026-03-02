-- ============================================
-- TABELAS PARA CALENDÁRIO AVANÇADO E PREÇOS DINÂMICOS
-- ============================================

-- Tabela: property_calendars (Calendário de propriedades)
CREATE TABLE IF NOT EXISTS property_calendars (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  
  -- Datas bloqueadas (JSONB array de objetos {start, end, reason, type})
  blocked_dates JSONB DEFAULT '[]',
  
  -- Preços dinâmicos (JSONB array de objetos {date, price, multiplier, reason})
  dynamic_rates JSONB DEFAULT '[]',
  
  -- Regras (JSONB objeto com min_nights, max_nights, checkin_days, checkout_days, etc)
  rules JSONB DEFAULT '{
    "min_nights": 1,
    "max_nights": 365,
    "checkin_days": [0,1,2,3,4,5,6],
    "checkout_days": [0,1,2,3,4,5,6],
    "advance_booking_days": 365,
    "same_day_booking": true,
    "buffer_days": 0
  }',
  
  -- Taxas extras (JSONB objeto)
  extra_fees JSONB DEFAULT '{
    "cleaning_fee": 0,
    "cleaning_fee_per_night": false,
    "guest_extra_fee": 0,
    "pet_fee": 0,
    "security_deposit": 0,
    "city_tax": 0,
    "service_fee_percent": 0
  }',
  
  -- Descontos (JSONB array de objetos {nights, discount_percent})
  discounts JSONB DEFAULT '[]',
  
  -- Sincronização iCal
  ical_url TEXT,
  ical_export_enabled BOOLEAN DEFAULT false,
  ical_import_enabled BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP,
  
  -- Preços inteligentes
  smart_pricing_enabled BOOLEAN DEFAULT false,
  base_price DECIMAL(10,2),
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT fk_property_calendars_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_property_calendars_property_id ON property_calendars(property_id);
CREATE INDEX IF NOT EXISTS idx_property_calendars_blocked_dates ON property_calendars USING GIN (blocked_dates);
CREATE INDEX IF NOT EXISTS idx_property_calendars_dynamic_rates ON property_calendars USING GIN (dynamic_rates);

-- Tabela: blocked_dates (Datas bloqueadas - para queries rápidas)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  calendar_id INTEGER REFERENCES property_calendars(id) ON DELETE CASCADE,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  reason VARCHAR(255),
  type VARCHAR(50) DEFAULT 'maintenance' CHECK (type IN ('maintenance', 'booking', 'blocked', 'event', 'custom')),
  
  source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'ical', 'booking', 'ota', 'calendar')),
  source_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_blocked_dates_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT chk_blocked_dates_range CHECK (end_date >= start_date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_blocked_dates_property_id ON blocked_dates(property_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_dates ON blocked_dates(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_type ON blocked_dates(type);

-- Tabela: events_calendar (Eventos para preços dinâmicos)
CREATE TABLE IF NOT EXISTS events_calendar (
  id SERIAL PRIMARY KEY,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'BR',
  
  -- Multiplicador de preço (ex: 2.5 = 250% do preço base)
  price_multiplier DECIMAL(5,2) DEFAULT 1.0,
  
  -- Tipo de evento
  event_type VARCHAR(50) DEFAULT 'local' CHECK (event_type IN ('national', 'local', 'regional', 'seasonal')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_events_calendar_range CHECK (end_date >= start_date),
  CONSTRAINT chk_events_calendar_multiplier CHECK (price_multiplier > 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_events_calendar_dates ON events_calendar(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_calendar_city ON events_calendar(city, state);
CREATE INDEX IF NOT EXISTS idx_events_calendar_type ON events_calendar(event_type);

-- Tabela: pricing_rules (Regras de precificação por propriedade)
CREATE TABLE IF NOT EXISTS pricing_rules (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  calendar_id INTEGER REFERENCES property_calendars(id) ON DELETE CASCADE,
  
  -- Tipo de regra
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('weekend', 'weekday', 'season', 'event', 'occupancy', 'lead_time', 'length_stay')),
  
  -- Parâmetros da regra (JSONB)
  parameters JSONB NOT NULL,
  
  -- Multiplicador ou valor fixo
  price_adjustment_type VARCHAR(20) DEFAULT 'multiplier' CHECK (price_adjustment_type IN ('multiplier', 'fixed', 'percent')),
  price_adjustment_value DECIMAL(10,2) NOT NULL,
  
  -- Prioridade (quanto maior, mais importante)
  priority INTEGER DEFAULT 0,
  
  -- Ativo
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_pricing_rules_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pricing_rules_property_id ON pricing_rules(property_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_type ON pricing_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(is_active);

-- Tabela: access_logs (Logs de acesso para fechaduras inteligentes)
CREATE TABLE IF NOT EXISTS access_logs (
  id SERIAL PRIMARY KEY,
  
  property_id INTEGER NOT NULL,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  lock_id VARCHAR(255),
  lock_type VARCHAR(50) CHECK (lock_type IN ('yale', 'august', 'igloohome', 'schlage', 'remotelock', 'other')),
  
  access_type VARCHAR(50) DEFAULT 'pin' CHECK (access_type IN ('pin', 'key', 'card', 'app', 'remote')),
  pin_code VARCHAR(20),
  
  action VARCHAR(50) NOT NULL CHECK (action IN ('granted', 'revoked', 'used', 'expired', 'failed')),
  
  accessed_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_access_logs_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_access_logs_property_id ON access_logs(property_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_booking_id ON access_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed_at ON access_logs(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_lock_id ON access_logs(lock_id);

-- Tabela: smart_locks (Configuração de fechaduras inteligentes)
CREATE TABLE IF NOT EXISTS smart_locks (
  id SERIAL PRIMARY KEY,
  
  property_id INTEGER NOT NULL,
  
  lock_type VARCHAR(50) NOT NULL CHECK (lock_type IN ('yale', 'august', 'igloohome', 'schlage', 'remotelock', 'other')),
  lock_name VARCHAR(255),
  
  -- Credenciais da API (criptografadas)
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  device_id VARCHAR(255),
  
  -- Configurações
  pin_length INTEGER DEFAULT 6,
  pin_duration_hours INTEGER DEFAULT 48,
  auto_revoke BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_smart_locks_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_smart_locks_property_id ON smart_locks(property_id);
CREATE INDEX IF NOT EXISTS idx_smart_locks_type ON smart_locks(lock_type);
CREATE INDEX IF NOT EXISTS idx_smart_locks_active ON smart_locks(is_active);

-- Inserir eventos nacionais e de Caldas Novas
INSERT INTO events_calendar (name, description, start_date, end_date, city, state, country, price_multiplier, event_type) VALUES
-- Eventos Nacionais 2025
('Confraternização Universal', 'Feriado Nacional', '2025-01-01', '2025-01-01', NULL, NULL, 'BR', 2.0, 'national'),
('Carnaval', 'Feriado Nacional', '2025-03-03', '2025-03-04', NULL, NULL, 'BR', 2.8, 'national'),
('Paixão de Cristo', 'Feriado Nacional', '2025-04-18', '2025-04-18', NULL, NULL, 'BR', 2.2, 'national'),
('Tiradentes', 'Feriado Nacional', '2025-04-21', '2025-04-21', NULL, NULL, 'BR', 1.8, 'national'),
('Dia do Trabalho', 'Feriado Nacional', '2025-05-01', '2025-05-01', NULL, NULL, 'BR', 1.9, 'national'),
('Corpus Christi', 'Feriado Nacional', '2025-06-19', '2025-06-19', NULL, NULL, 'BR', 2.0, 'national'),
('Independência', 'Feriado Nacional', '2025-09-07', '2025-09-07', NULL, NULL, 'BR', 2.1, 'national'),
('Nossa Senhora Aparecida', 'Feriado Nacional', '2025-10-12', '2025-10-12', NULL, NULL, 'BR', 1.7, 'national'),
('Finados', 'Feriado Nacional', '2025-11-02', '2025-11-02', NULL, NULL, 'BR', 1.8, 'national'),
('Proclamação República', 'Feriado Nacional', '2025-11-15', '2025-11-15', NULL, NULL, 'BR', 1.6, 'national'),
('Consciência Negra', 'Feriado Nacional', '2025-11-20', '2025-11-20', NULL, NULL, 'BR', 1.5, 'national'),
('Natal', 'Feriado Nacional', '2025-12-25', '2025-12-25', NULL, NULL, 'BR', 2.5, 'national'),
-- Eventos Nacionais 2026
('Ano Novo 2026', 'Feriado Nacional', '2026-01-01', '2026-01-01', NULL, NULL, 'BR', 3.0, 'national'),
('Carnaval 2026', 'Feriado Nacional', '2026-02-16', '2026-02-17', NULL, NULL, 'BR', 2.8, 'national'),
-- Eventos Caldas Novas 2025
('Caldas Country Festival', 'Festival sertanejo com 25k+ pessoas', '2025-11-21', '2025-11-22', 'Caldas Novas', 'GO', 'BR', 2.2, 'local'),
('Caldas Paradise Réveillon', '3 dias de shows no Water Park', '2025-12-31', '2026-01-02', 'Caldas Novas', 'GO', 'BR', 3.5, 'local'),
('Caldas Rodeo Festival', 'Rodeio com touros - PBR', '2025-09-11', '2025-09-13', 'Caldas Novas', 'GO', 'BR', 2.0, 'local'),
('Carnaval Caldas Novas', 'Desfile na Av. Orozimbo Correia Neto', '2025-02-28', '2025-03-04', 'Caldas Novas', 'GO', 'BR', 2.8, 'local'),
('Natal na Praça', 'Filmes natalinos + Cine Goiás Itinerante', '2025-12-01', '2025-12-02', 'Caldas Novas', 'GO', 'BR', 1.8, 'local'),
('Festa do Divino', 'Feriado Municipal', '2025-05-21', '2025-05-21', 'Caldas Novas', 'GO', 'BR', 1.9, 'local'),
('Caldas Country Show', 'Shows com artistas nacionais', '2025-10-01', '2025-10-05', 'Caldas Novas', 'GO', 'BR', 2.1, 'local'),
('Water Park Events', 'Eventos sazonais no complexo termal', '2025-12-01', '2026-03-31', 'Caldas Novas', 'GO', 'BR', 1.5, 'seasonal'),
('Feriado Municipal Fundação', 'Comemoração da cidade', '2025-11-21', '2025-11-21', 'Caldas Novas', 'GO', 'BR', 1.7, 'local'),
('Semana das Águas Quentes', 'Festival termal com promoções', '2025-06-15', '2025-06-22', 'Caldas Novas', 'GO', 'BR', 2.0, 'local'),
('Expo Caldas', 'Feira agropecuária regional', '2025-08-01', '2025-08-05', 'Caldas Novas', 'GO', 'BR', 1.6, 'local'),
('Festival de Inverno Caldas', 'Música e cultura no frio goiano', '2025-07-01', '2025-07-10', 'Caldas Novas', 'GO', 'BR', 2.3, 'local'),
('Corpus Christi Local', 'Tapetes de serragem nas ruas termais', '2025-06-19', '2025-06-19', 'Caldas Novas', 'GO', 'BR', 1.8, 'local'),
('São João Caldas', 'Fogueiras e quadrilhas na praça', '2025-06-24', '2025-06-24', 'Caldas Novas', 'GO', 'BR', 1.9, 'local'),
('Dia das Mães/Pais Eventos', 'Promoções familiares nos parques', '2025-05-11', '2025-05-11', 'Caldas Novas', 'GO', 'BR', 1.4, 'local')
ON CONFLICT DO NOTHING;

-- Comentários
COMMENT ON TABLE property_calendars IS 'Calendário e configurações de preços dinâmicos por propriedade';
COMMENT ON TABLE blocked_dates IS 'Datas bloqueadas para queries rápidas';
COMMENT ON TABLE events_calendar IS 'Eventos nacionais e locais para cálculo de preços dinâmicos';
COMMENT ON TABLE pricing_rules IS 'Regras de precificação customizadas por propriedade';
COMMENT ON TABLE access_logs IS 'Logs de acesso para fechaduras inteligentes';
COMMENT ON TABLE smart_locks IS 'Configuração de fechaduras inteligentes por propriedade';

