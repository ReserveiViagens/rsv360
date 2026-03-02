-- ✅ TAREFA HIGH-3: Migration para Relatórios de ROI de Precificação
-- Cria tabelas para histórico e cálculo de ROI

-- Tabela de histórico de ROI
CREATE TABLE IF NOT EXISTS pricing_roi_history (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  base_revenue DECIMAL(10,2) DEFAULT 0.00, -- Receita sem smart pricing
  smart_pricing_revenue DECIMAL(10,2) DEFAULT 0.00, -- Receita com smart pricing
  revenue_increase DECIMAL(10,2) DEFAULT 0.00, -- Aumento de receita
  revenue_increase_percentage DECIMAL(5,2) DEFAULT 0.00, -- % de aumento
  bookings_count INTEGER DEFAULT 0, -- Número de reservas
  avg_price DECIMAL(10,2) DEFAULT 0.00, -- Preço médio
  smart_pricing_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(property_id, period_start, period_end)
);

-- Tabela de métricas de ROI por período
CREATE TABLE IF NOT EXISTS pricing_roi_metrics (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  revenue_without_smart_pricing DECIMAL(10,2) DEFAULT 0.00,
  revenue_with_smart_pricing DECIMAL(10,2) DEFAULT 0.00,
  bookings_without_smart_pricing INTEGER DEFAULT 0,
  bookings_with_smart_pricing INTEGER DEFAULT 0,
  avg_price_without_smart_pricing DECIMAL(10,2) DEFAULT 0.00,
  avg_price_with_smart_pricing DECIMAL(10,2) DEFAULT 0.00,
  conversion_rate_without DECIMAL(5,2) DEFAULT 0.00,
  conversion_rate_with DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(property_id, metric_date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pricing_roi_history_property ON pricing_roi_history(property_id);
CREATE INDEX IF NOT EXISTS idx_pricing_roi_history_period ON pricing_roi_history(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_pricing_roi_metrics_property ON pricing_roi_metrics(property_id);
CREATE INDEX IF NOT EXISTS idx_pricing_roi_metrics_date ON pricing_roi_metrics(metric_date);

-- Comentários
COMMENT ON TABLE pricing_roi_history IS 'Histórico de ROI de precificação por período';
COMMENT ON TABLE pricing_roi_metrics IS 'Métricas diárias de ROI de precificação';

