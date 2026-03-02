-- ✅ TABELA DE MÉTRICAS DE PERFORMANCE
-- Criar tabela para armazenar métricas de performance do cliente

CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  page_load DECIMAL(10, 2),
  fcp DECIMAL(10, 2), -- First Contentful Paint
  lcp DECIMAL(10, 2), -- Largest Contentful Paint
  tti DECIMAL(10, 2), -- Time to Interactive
  tbt DECIMAL(10, 2), -- Total Blocking Time
  cls DECIMAL(10, 4), -- Cumulative Layout Shift
  fid DECIMAL(10, 2), -- First Input Delay
  memory_used BIGINT,
  memory_total BIGINT,
  memory_limit BIGINT,
  api_stats JSONB,
  user_agent TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_url ON performance_metrics(url);

-- Comentários
COMMENT ON TABLE performance_metrics IS 'Armazena métricas de performance coletadas do cliente';
COMMENT ON COLUMN performance_metrics.page_load IS 'Tempo total de carregamento da página (ms)';
COMMENT ON COLUMN performance_metrics.lcp IS 'Largest Contentful Paint (ms)';
COMMENT ON COLUMN performance_metrics.fid IS 'First Input Delay (ms)';
COMMENT ON COLUMN performance_metrics.cls IS 'Cumulative Layout Shift (score)';

