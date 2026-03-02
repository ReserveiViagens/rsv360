-- TABELAS DE SMART PRICING AI
-- Criar tabelas para sistema de precificacao inteligente

-- 1. Tabela de historico de precos
CREATE TABLE IF NOT EXISTS pricing_history (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  final_price DECIMAL(10, 2) NOT NULL,
  price_factors JSONB,
  weather_data JSONB,
  event_data JSONB,
  competitor_data JSONB,
  demand_level VARCHAR(50),
  season VARCHAR(50),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pricing_history_item ON pricing_history(item_id);
CREATE INDEX IF NOT EXISTS idx_pricing_history_date ON pricing_history(date);
CREATE INDEX IF NOT EXISTS idx_pricing_history_item_date ON pricing_history(item_id, date);

-- 2. Tabela de cache de dados climaticos
CREATE TABLE IF NOT EXISTS weather_cache (
  id SERIAL PRIMARY KEY,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  weather_data JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_location ON weather_cache(location);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather_cache(expires_at);

-- 3. Tabela de eventos locais
CREATE TABLE IF NOT EXISTS local_events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(50),
  source VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_date DATE NOT NULL,
  end_date DATE,
  expected_attendance INTEGER,
  impact_on_pricing VARCHAR(50),
  price_multiplier DECIMAL(5, 2) DEFAULT 1.0,
  description TEXT,
  external_id VARCHAR(255),
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
  competitor_name VARCHAR(100) NOT NULL,
  competitor_item_id VARCHAR(255),
  competitor_url TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BRL',
  availability_status VARCHAR(50),
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scraped_data JSONB
);

CREATE INDEX IF NOT EXISTS idx_competitor_prices_item ON competitor_prices(item_id);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_competitor ON competitor_prices(competitor_name);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_scraped ON competitor_prices(scraped_at DESC);

-- 5. Tabela de configuracoes de precificacao dinamica
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
  min_price_multiplier DECIMAL(5, 2) DEFAULT 0.5,
  max_price_multiplier DECIMAL(5, 2) DEFAULT 2.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id)
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

