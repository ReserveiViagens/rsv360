-- ✅ ÍNDICES ESTRATÉGICOS PARA OTIMIZAÇÃO
-- Execute este script para melhorar a performance das queries mais comuns

-- Índices para tabela de reservas (bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created ON bookings(status, created_at);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_bookings_property_status ON bookings(property_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);

-- Índices para tabela de propriedades (properties)
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_city_status ON properties(city, status);

-- Índices para tabela de usuários (users)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);

-- Índices para tabela de pagamentos (payments)
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at);

-- Índices para tabela de disponibilidade (availability)
CREATE INDEX IF NOT EXISTS idx_availability_property_id ON availability(property_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);
CREATE INDEX IF NOT EXISTS idx_availability_property_date ON availability(property_id, date);
CREATE INDEX IF NOT EXISTS idx_availability_available ON availability(is_available) WHERE is_available = true;

-- Índices para tabela de eventos locais (local_events)
CREATE INDEX IF NOT EXISTS idx_local_events_location ON local_events(location);
CREATE INDEX IF NOT EXISTS idx_local_events_start_date ON local_events(start_date);
CREATE INDEX IF NOT EXISTS idx_local_events_source ON local_events(source);
CREATE INDEX IF NOT EXISTS idx_local_events_location_date ON local_events(location, start_date);

-- Índices para tabela de preços de competidores (competitor_prices)
CREATE INDEX IF NOT EXISTS idx_competitor_prices_item_id ON competitor_prices(item_id);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_scraped_at ON competitor_prices(scraped_at);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_item_date ON competitor_prices(item_id, scraped_at);

-- Índices para tabela de logs de aplicação (application_logs)
CREATE INDEX IF NOT EXISTS idx_application_logs_level ON application_logs(level);
CREATE INDEX IF NOT EXISTS idx_application_logs_created_at ON application_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_application_logs_level_created ON application_logs(level, created_at);

-- Índices para tabela de credenciais do sistema (system_credentials)
CREATE INDEX IF NOT EXISTS idx_system_credentials_key ON system_credentials(key);
CREATE INDEX IF NOT EXISTS idx_system_credentials_updated_at ON system_credentials(updated_at);

-- Comentários
COMMENT ON INDEX idx_bookings_property_status IS 'Otimiza busca de reservas por propriedade e status';
COMMENT ON INDEX idx_bookings_dates IS 'Otimiza busca de disponibilidade por período';
COMMENT ON INDEX idx_properties_city_status IS 'Otimiza busca de propriedades por cidade e status';
COMMENT ON INDEX idx_availability_property_date IS 'Otimiza verificação de disponibilidade';

-- Estatísticas atualizadas
ANALYZE bookings;
ANALYZE properties;
ANALYZE users;
ANALYZE payments;
ANALYZE availability;
ANALYZE local_events;
ANALYZE competitor_prices;
ANALYZE application_logs;
ANALYZE system_credentials;

