-- ✅ ITEM 45: MIGRATION 005 - CREATE AVAILABILITY
-- Tabela availability com bloqueios e disponibilidade

CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  date DATE NOT NULL,
  
  -- Disponibilidade
  is_available BOOLEAN DEFAULT true,
  available_units INTEGER DEFAULT 1, -- Para propriedades com múltiplas unidades
  blocked_units INTEGER DEFAULT 0,
  
  -- Preço dinâmico para a data
  price_override DECIMAL(10, 2), -- Preço específico para esta data (sobrescreve base_price)
  min_stay_override INTEGER, -- Estadia mínima específica para esta data
  
  -- Bloqueios
  block_reason VARCHAR(255), -- 'maintenance', 'owner_block', 'booking', 'custom'
  block_type VARCHAR(50) DEFAULT 'manual' CHECK (block_type IN ('manual', 'automatic', 'maintenance', 'booking')),
  blocked_by INTEGER, -- Usuário que bloqueou
  blocked_at TIMESTAMP,
  
  -- Notas
  notes TEXT,
  
  -- Metadados
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relacionamentos
  CONSTRAINT fk_availability_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT fk_blocked_by FOREIGN KEY (blocked_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_property_date UNIQUE(property_id, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_availability_property ON availability(property_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);
CREATE INDEX IF NOT EXISTS idx_availability_property_date ON availability(property_id, date);
CREATE INDEX IF NOT EXISTS idx_availability_available ON availability(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_availability_block_type ON availability(block_type);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_availability_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_availability_timestamp
BEFORE UPDATE ON availability
FOR EACH ROW
EXECUTE FUNCTION update_availability_timestamp();

-- Função para verificar disponibilidade em um período
CREATE OR REPLACE FUNCTION check_availability_period(
  p_property_id INTEGER,
  p_check_in DATE,
  p_check_out DATE,
  p_units_needed INTEGER DEFAULT 1
)
RETURNS TABLE (
  available BOOLEAN,
  unavailable_dates DATE[],
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2)
) AS $$
DECLARE
  v_date DATE;
  v_unavailable_dates DATE[] := ARRAY[]::DATE[];
  v_available BOOLEAN := true;
  v_min_price DECIMAL(10, 2);
  v_max_price DECIMAL(10, 2);
BEGIN
  -- Verificar cada data no período
  FOR v_date IN SELECT generate_series(p_check_in, p_check_out - INTERVAL '1 day', INTERVAL '1 day')::DATE
  LOOP
    SELECT 
      is_available,
      available_units,
      COALESCE(price_override, 0)
    INTO 
      v_available,
      v_available,
      v_min_price
    FROM availability
    WHERE property_id = p_property_id AND date = v_date;
    
    -- Se não existe registro, considerar disponível
    IF NOT FOUND THEN
      CONTINUE;
    END IF;
    
    -- Verificar se está disponível e tem unidades suficientes
    IF NOT v_available OR (available_units - blocked_units) < p_units_needed THEN
      v_unavailable_dates := array_append(v_unavailable_dates, v_date);
      v_available := false;
    END IF;
  END LOOP;
  
  -- Calcular preços min/max
  SELECT 
    MIN(COALESCE(price_override, 0)),
    MAX(COALESCE(price_override, 0))
  INTO v_min_price, v_max_price
  FROM availability
  WHERE property_id = p_property_id 
    AND date BETWEEN p_check_in AND p_check_out - INTERVAL '1 day';
  
  RETURN QUERY SELECT 
    (array_length(v_unavailable_dates, 1) IS NULL),
    v_unavailable_dates,
    COALESCE(v_min_price, 0),
    COALESCE(v_max_price, 0);
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE availability IS 'Disponibilidade e bloqueios de propriedades por data';
COMMENT ON FUNCTION check_availability_period IS 'Verifica disponibilidade de uma propriedade em um período';

