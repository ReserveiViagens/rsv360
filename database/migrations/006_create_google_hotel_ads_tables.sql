-- Migration 006: Criar tabelas de Google Hotel Ads
-- Data: 22/01/2025
-- Descrição: Criação das tabelas para integração com Google Hotel Ads

-- Tabela de feeds XML do Google Hotel Ads
CREATE TABLE IF NOT EXISTS google_hotel_ads_feeds (
  id SERIAL PRIMARY KEY,
  feed_name VARCHAR(255) NOT NULL,
  feed_url VARCHAR(500), -- URL pública do feed
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, error
  last_generated_at TIMESTAMP,
  last_uploaded_at TIMESTAMP,
  generation_frequency INTEGER DEFAULT 60, -- Intervalo em minutos
  auto_generate BOOLEAN DEFAULT true,
  total_properties INTEGER DEFAULT 0,
  total_rooms INTEGER DEFAULT 0,
  errors TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_google_hotel_ads_feeds_property_id ON google_hotel_ads_feeds(property_id);
CREATE INDEX IF NOT EXISTS idx_google_hotel_ads_feeds_status ON google_hotel_ads_feeds(status);
CREATE INDEX IF NOT EXISTS idx_google_hotel_ads_feeds_last_generated_at ON google_hotel_ads_feeds(last_generated_at DESC);

-- Tabela de campanhas do Google Hotel Ads
CREATE TABLE IF NOT EXISTS google_hotel_ads_campaigns (
  id SERIAL PRIMARY KEY,
  feed_id INTEGER REFERENCES google_hotel_ads_feeds(id) ON DELETE CASCADE,
  campaign_name VARCHAR(255) NOT NULL,
  campaign_id VARCHAR(255), -- ID da campanha no Google Ads
  budget_daily DECIMAL(10,2),
  budget_monthly DECIMAL(10,2),
  target_countries TEXT[], -- Array de países
  target_cities TEXT[], -- Array de cidades
  status VARCHAR(50) DEFAULT 'active', -- active, paused, ended
  start_date DATE,
  end_date DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_google_hotel_ads_campaigns_feed_id ON google_hotel_ads_campaigns(feed_id);
CREATE INDEX IF NOT EXISTS idx_google_hotel_ads_campaigns_campaign_id ON google_hotel_ads_campaigns(campaign_id);
CREATE INDEX IF NOT EXISTS idx_google_hotel_ads_campaigns_status ON google_hotel_ads_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_google_hotel_ads_campaigns_start_date ON google_hotel_ads_campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_google_hotel_ads_campaigns_end_date ON google_hotel_ads_campaigns(end_date);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_google_hotel_ads_feeds_updated_at BEFORE UPDATE ON google_hotel_ads_feeds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_hotel_ads_campaigns_updated_at BEFORE UPDATE ON google_hotel_ads_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE google_hotel_ads_feeds IS 'Tabela de feeds XML para Google Hotel Ads';
COMMENT ON TABLE google_hotel_ads_campaigns IS 'Tabela de campanhas do Google Hotel Ads';
