-- ✅ TABELA PARA APPLICATION LOGS
-- Armazena logs de erro, warning e info para análise

CREATE TABLE IF NOT EXISTS application_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(20) NOT NULL CHECK (level IN ('error', 'warn', 'info', 'debug')),
  message TEXT NOT NULL,
  error_data JSONB,
  context_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_application_logs_level ON application_logs(level);
CREATE INDEX IF NOT EXISTS idx_application_logs_created_at ON application_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_application_logs_level_created ON application_logs(level, created_at);

-- Comentários
COMMENT ON TABLE application_logs IS 'Armazena logs da aplicação para monitoramento e debugging';
COMMENT ON COLUMN application_logs.level IS 'Nível do log: error, warn, info, debug';
COMMENT ON COLUMN application_logs.error_data IS 'Dados do erro em formato JSON (stack trace, etc.)';
COMMENT ON COLUMN application_logs.context_data IS 'Contexto adicional do log (userId, requestId, etc.)';

