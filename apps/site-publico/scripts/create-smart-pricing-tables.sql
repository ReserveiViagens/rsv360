-- ✅ ITENS 31-35: TABELAS DE SMART PRICING AI
-- Criar tabelas para sistema de precificação inteligente

-- 1. Tabela de histórico de preços
CREATE TABLE IF NOT EXISTS pricing_history (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  final_price DECIMAL(10, 2) NOT NULL,
  price_factors JSONB, -- Fatores que influenciaram o preço
  weather_data JSONB, -- Dados do clima
  event_data JSONB, -- Dados de eventos
  competitor_data JSONB, -- Dados de competidores
  demand_level VARCHAR(50), -- 'low', 'medium', 'high', 'very_high'
  season VARCHAR(50), -- 'low', 'high', 'peak'
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- CONSTRAINT fk_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  -- Comentado - item_id referencia website_content(id) ou outra tabela
);

CREATE INDEX IF NOT EXISTS idx_pricing_history_item ON pricing_history(item_id);
CREATE INDEX IF NOT EXISTS idx_pricing_history_date ON pricing_history(date);
CREATE INDEX IF NOT EXISTS idx_pricing_history_item_date ON pricing_history(item_id, date);

-- 2. Tabela de cache de dados climáticos
CREATE TABLE IF NOT EXISTS weather_cache (
  id SERIAL PRIMARY KEY,
  location VARCHAR(255) NOT NULL, -- Cidade, coordenadas, etc.
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  weather_data JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  -- CONSTRAINT unique_location_date UNIQUE(location, DATE(cached_at))
  -- Comentado - DATE() não pode ser usado em UNIQUE constraint
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_location ON weather_cache(location);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather_cache(expires_at);

-- 3. Tabela de eventos locais (Google Calendar, Eventbrite)
CREATE TABLE IF NOT EXISTS local_events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(50), -- 'concert', 'festival', 'sports', 'conference', 'other'
  source VARCHAR(50) NOT NULL, -- 'google_calendar', 'eventbrite', 'manual'
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_date DATE NOT NULL,
  end_date DATE,
  expected_attendance INTEGER,
  impact_on_pricing VARCHAR(50), -- 'low', 'medium', 'high'
  price_multiplier DECIMAL(5, 2) DEFAULT 1.0, -- Multiplicador de preço
  description TEXT,
  external_id VARCHAR(255), -- ID do evento no sistema externo
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_local_events_location ON local_events(location);
CREATE INDEX IF NOT EXISTS idx_local_events_dates ON local_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_local_events_source ON local_events(source);
CREATE INDEX IF NOT EXISTS idx_local_events_external_id ON local_events(external_id);

-- 4. Tabela de dados de competidores
CREATE TABLE IF NOT EXISTS competitor_prices (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  competitor_name VARCHAR(100) NOT NULL, -- 'airbnb', 'booking', 'expedia', etc.
  competitor_item_id VARCHAR(255), -- ID do item no site do competidor
  competitor_url TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BRL',
  availability_status VARCHAR(50), -- 'available', 'limited', 'unavailable'
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scraped_data JSONB, -- Dados completos do scraping
  
  -- CONSTRAINT fk_item_competitor FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  -- Comentado - item_id referencia website_content(id) ou outra tabela
);

CREATE INDEX IF NOT EXISTS idx_competitor_prices_item ON competitor_prices(item_id);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_competitor ON competitor_prices(competitor_name);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_scraped ON competitor_prices(scraped_at DESC);

-- 5. Tabela de configurações de precificação dinâmica
CREATE TABLE IF NOT EXISTS dynamic_pricing_config (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  weather_impact BOOLEAN DEFAULT true,
  weather_multiplier DECIMAL(5, 2) DEFAULT 1.0,
  event_impact BOOLEAN DEFAULT true,
  event_multiplier DECIMAL(5, 2) DEFAULT 1.0,
  competitor_impact BOOLEAN DEFAULT true,
  competitor_multiplier DECIMAL(5, 2) DEFAULT 1.0,
  demand_impact BOOLEAN DEFAULT true,
  demand_multiplier DECIMAL(5, 2) DEFAULT 1.0,
  season_impact BOOLEAN DEFAULT true,
  season_multiplier DECIMAL(5, 2) DEFAULT 1.0,
  min_price_multiplier DECIMAL(5, 2) DEFAULT 0.5, -- Preço mínimo (50% do base)
  max_price_multiplier DECIMAL(5, 2) DEFAULT 2.0, -- Preço máximo (200% do base)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- CONSTRAINT fk_item_config FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  -- Comentado - item_id referencia website_content(id) ou outra tabela
  CONSTRAINT unique_item_config UNIQUE(item_id)
);

CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_config_item ON dynamic_pricing_config(item_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_pricing_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pricing_config_timestamp
BEFORE UPDATE ON dynamic_pricing_config
FOR EACH ROW
EXECUTE FUNCTION update_pricing_config_timestamp();

CREATE TRIGGER trigger_update_local_events_timestamp
BEFORE UPDATE ON local_events
FOR EACH ROW
EXECUTE FUNCTION update_pricing_config_timestamp();

-- Comentários
COMMENT ON TABLE pricing_history IS 'Histórico de preços para análise de tendências';
COMMENT ON TABLE weather_cache IS 'Cache de dados climáticos da OpenWeather';
COMMENT ON TABLE local_events IS 'Eventos locais que impactam precificação';
COMMENT ON TABLE competitor_prices IS 'Preços de competidores (scraping)';
COMMENT ON TABLE dynamic_pricing_config IS 'Configurações de precificação dinâmica por item';

