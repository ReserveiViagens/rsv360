-- ✅ ITENS 55-62: MIGRATION 010 - CREATE ANALYTICS & REPORTS TABLES
-- Tabelas para Analytics, Relatórios e Agendamento

-- ============================================
-- TABELA: scheduled_reports (Agendamento de Relatórios)
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Tipo de relatório
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
    'revenue', 'occupancy', 'bookings', 'customers', 'campaigns', 'custom'
  )),
  format VARCHAR(20) NOT NULL CHECK (format IN ('pdf', 'excel', 'csv', 'json')),
  
  -- Configurações do relatório
  report_config JSONB NOT NULL, -- Filtros, parâmetros, etc.
  
  -- Agendamento
  schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN (
    'once', 'daily', 'weekly', 'monthly', 'custom'
  )),
  schedule_config JSONB, -- Configuração do agendamento (dias, horários, etc.)
  next_run_at TIMESTAMP NOT NULL,
  last_run_at TIMESTAMP,
  
  -- Destinatários
  recipients JSONB NOT NULL, -- Array de emails
  subject VARCHAR(255),
  message TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  is_enabled BOOLEAN DEFAULT true,
  
  -- Estatísticas
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  failed_runs INTEGER DEFAULT 0,
  last_error TEXT,
  
  -- Metadados
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_scheduled_report_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de histórico de execuções
CREATE TABLE IF NOT EXISTS report_executions (
  id SERIAL PRIMARY KEY,
  scheduled_report_id INTEGER NOT NULL,
  
  -- Execução
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  
  -- Resultado
  status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  file_path VARCHAR(500), -- Caminho do arquivo gerado
  file_size_bytes BIGINT,
  record_count INTEGER,
  
  -- Erros
  error_message TEXT,
  error_stack TEXT,
  
  -- Metadados
  metadata JSONB,
  
  CONSTRAINT fk_report_execution_report FOREIGN KEY (scheduled_report_id) REFERENCES scheduled_reports(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_status ON scheduled_reports(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run_at) WHERE is_enabled = true AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_type ON scheduled_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_report_executions_report ON report_executions(scheduled_report_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_status ON report_executions(status);
CREATE INDEX IF NOT EXISTS idx_report_executions_started ON report_executions(started_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_scheduled_reports_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scheduled_reports_timestamp
BEFORE UPDATE ON scheduled_reports
FOR EACH ROW
EXECUTE FUNCTION update_scheduled_reports_timestamp();

-- Função para calcular próxima execução
CREATE OR REPLACE FUNCTION calculate_next_run(
  p_schedule_type VARCHAR(50),
  p_schedule_config JSONB,
  p_current_run TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
RETURNS TIMESTAMP AS $$
DECLARE
  v_next_run TIMESTAMP;
  v_time TIME;
  v_days INTEGER[];
  v_day_of_week INTEGER;
  v_day_of_month INTEGER;
BEGIN
  CASE p_schedule_type
    WHEN 'once' THEN
      -- Executar apenas uma vez (já passou)
      RETURN NULL;
    
    WHEN 'daily' THEN
      -- Diariamente no horário especificado
      v_time := COALESCE((p_schedule_config->>'time')::TIME, '09:00:00'::TIME);
      v_next_run := (p_current_run::DATE + INTERVAL '1 day')::DATE + v_time;
      RETURN v_next_run;
    
    WHEN 'weekly' THEN
      -- Semanalmente em dias específicos
      v_days := ARRAY(SELECT jsonb_array_elements_text(p_schedule_config->'days'))::INTEGER[];
      v_time := COALESCE((p_schedule_config->>'time')::TIME, '09:00:00'::TIME);
      
      -- Encontrar próximo dia da semana
      FOR i IN 0..6 LOOP
        v_day_of_week := EXTRACT(DOW FROM p_current_run + (i || ' days')::INTERVAL)::INTEGER;
        IF v_day_of_week = ANY(v_days) THEN
          v_next_run := (p_current_run::DATE + (i || ' days')::INTERVAL)::DATE + v_time;
          IF v_next_run > p_current_run THEN
            RETURN v_next_run;
          END IF;
        END IF;
      END LOOP;
      
      -- Se não encontrou, pegar o primeiro dia da próxima semana
      v_next_run := (p_current_run::DATE + INTERVAL '7 days')::DATE + v_time;
      RETURN v_next_run;
    
    WHEN 'monthly' THEN
      -- Mensalmente em dia específico
      v_day_of_month := COALESCE((p_schedule_config->>'day')::INTEGER, 1);
      v_time := COALESCE((p_schedule_config->>'time')::TIME, '09:00:00'::TIME);
      
      -- Próximo mês no dia especificado
      v_next_run := (DATE_TRUNC('month', p_current_run) + INTERVAL '1 month')::DATE + (v_day_of_month - 1 || ' days')::INTERVAL + v_time;
      RETURN v_next_run;
    
    ELSE
      RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE scheduled_reports IS 'Relatórios agendados para execução automática';
COMMENT ON TABLE report_executions IS 'Histórico de execuções de relatórios agendados';
COMMENT ON FUNCTION calculate_next_run IS 'Calcula a próxima data/hora de execução baseado no tipo de agendamento';

