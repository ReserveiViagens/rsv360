-- ============================================
-- MIGRATION 018: HOST POINTS SYSTEM
-- ============================================
-- Descrição: Sistema completo de pontos para hosts
-- Data: 2025-12-12
-- Autor: RSV 360 Team
-- Dependências: migration-017 (users table)
-- ============================================

-- Criar ENUM para tipo de pontos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'points_type_enum') THEN
        CREATE TYPE points_type_enum AS ENUM (
            'earned',      -- Pontos ganhos
            'spent',       -- Pontos gastos
            'expired',     -- Pontos expirados
            'bonus',       -- Bônus especial
            'refunded'     -- Pontos reembolsados
        );
    END IF;
END
$$;

-- Criar ENUM para fonte de pontos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'points_source_enum') THEN
        CREATE TYPE points_source_enum AS ENUM (
            'booking',              -- Reserva completada
            'rating',               -- Avaliação recebida
            'referral',             -- Indicação de novo host
            'promotion',            -- Promoção especial
            'verification',         -- Verificação de propriedade
            'superhost',            -- Status de Superhost
            'review_quality',       -- Qualidade de reviews
            'response_rate',        -- Taxa de resposta
            'cancellation',         -- Taxa de cancelamento baixa
            'manual_adjustment',    -- Ajuste manual
            'welcome_bonus',        -- Bônus de boas-vindas
            'anniversary',          -- Aniversário na plataforma
            'milestone'             -- Marco alcançado
        );
    END IF;
END
$$;

-- ============================================
-- TABELA: host_points
-- ============================================

CREATE TABLE IF NOT EXISTS host_points (
    -- Identificação
    id BIGSERIAL PRIMARY KEY,
    host_id INTEGER NOT NULL,
    
    -- Pontos
    points INTEGER NOT NULL DEFAULT 0,
    points_type points_type_enum NOT NULL DEFAULT 'earned',
    
    -- Origem
    source points_source_enum NOT NULL,
    source_id INTEGER,              -- ID da origem (booking_id, rating_id, etc)
    source_reference VARCHAR(255),   -- Referência adicional
    
    -- Descrição e metadados
    description TEXT,
    metadata JSONB DEFAULT '{}',     -- Dados adicionais
    
    -- Expiração
    expires_at TIMESTAMP WITH TIME ZONE,
    expired BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE, -- Visível para o host
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,              -- Admin que criou (se manual)
    
    -- Constraints
    CONSTRAINT fk_host_points_host 
        FOREIGN KEY (host_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT chk_points_not_zero 
        CHECK (points != 0),
    
    CONSTRAINT chk_earned_positive 
        CHECK (
            points_type != 'earned' OR 
            (points_type = 'earned' AND points > 0)
        ),
    
    CONSTRAINT chk_spent_negative 
        CHECK (
            points_type != 'spent' OR 
            (points_type = 'spent' AND points < 0)
        )
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Índice principal por host
CREATE INDEX IF NOT EXISTS idx_host_points_host 
    ON host_points(host_id);

-- Índice por tipo de pontos
CREATE INDEX IF NOT EXISTS idx_host_points_type 
    ON host_points(points_type);

-- Índice por fonte
CREATE INDEX IF NOT EXISTS idx_host_points_source 
    ON host_points(source);

-- Índice por status ativo
CREATE INDEX IF NOT EXISTS idx_host_points_active 
    ON host_points(is_active) 
    WHERE is_active = TRUE;

-- Índice por expiração
CREATE INDEX IF NOT EXISTS idx_host_points_expires 
    ON host_points(expires_at) 
    WHERE expires_at IS NOT NULL AND NOT expired;

-- Índice composto para busca eficiente
CREATE INDEX IF NOT EXISTS idx_host_points_host_active_expires 
    ON host_points(host_id, is_active, expires_at) 
    WHERE is_active = TRUE;

-- Índice para auditoria
CREATE INDEX IF NOT EXISTS idx_host_points_created_at 
    ON host_points(created_at DESC);

-- Índice GIN para metadata JSONB
CREATE INDEX IF NOT EXISTS idx_host_points_metadata 
    ON host_points USING GIN (metadata);

-- ============================================
-- TRIGGER: Update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_host_points_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_host_points_timestamp ON host_points;

CREATE TRIGGER trigger_update_host_points_timestamp
    BEFORE UPDATE ON host_points
    FOR EACH ROW
    EXECUTE FUNCTION update_host_points_timestamp();

-- ============================================
-- FUNÇÃO: Calcular total de pontos de um host
-- ============================================

CREATE OR REPLACE FUNCTION calculate_host_total_points(p_host_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT COALESCE(SUM(points), 0) INTO v_total
    FROM host_points 
    WHERE host_id = p_host_id 
      AND is_active = TRUE 
      AND NOT expired
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FUNÇÃO: Calcular pontos disponíveis (não expirados)
-- ============================================

CREATE OR REPLACE FUNCTION calculate_host_available_points(p_host_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_available INTEGER;
BEGIN
    SELECT COALESCE(SUM(points), 0) INTO v_available
    FROM host_points 
    WHERE host_id = p_host_id 
      AND is_active = TRUE 
      AND NOT expired
      AND points_type IN ('earned', 'bonus', 'refunded')
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);
    
    RETURN v_available;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FUNÇÃO: Expirar pontos automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION expire_host_points()
RETURNS INTEGER AS $$
DECLARE
    v_expired_count INTEGER;
BEGIN
    -- Marcar pontos expirados
    UPDATE host_points
    SET expired = TRUE,
        updated_at = CURRENT_TIMESTAMP
    WHERE expires_at IS NOT NULL
      AND expires_at <= CURRENT_TIMESTAMP
      AND NOT expired
      AND is_active = TRUE;
    
    GET DIAGNOSTICS v_expired_count = ROW_COUNT;
    
    RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: Adicionar pontos a um host
-- ============================================

CREATE OR REPLACE FUNCTION add_host_points(
    p_host_id INTEGER,
    p_points INTEGER,
    p_source points_source_enum,
    p_source_id INTEGER DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_expires_in_days INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS BIGINT AS $$
DECLARE
    v_point_id BIGINT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Validar pontos positivos
    IF p_points <= 0 THEN
        RAISE EXCEPTION 'Points must be positive';
    END IF;
    
    -- Calcular data de expiração se especificada
    IF p_expires_in_days IS NOT NULL THEN
        v_expires_at := CURRENT_TIMESTAMP + (p_expires_in_days || ' days')::INTERVAL;
    END IF;
    
    -- Inserir pontos
    INSERT INTO host_points (
        host_id,
        points,
        points_type,
        source,
        source_id,
        description,
        expires_at,
        metadata
    ) VALUES (
        p_host_id,
        p_points,
        'earned',
        p_source,
        p_source_id,
        p_description,
        v_expires_at,
        p_metadata
    )
    RETURNING id INTO v_point_id;
    
    RETURN v_point_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: Gastar pontos de um host
-- ============================================

CREATE OR REPLACE FUNCTION spend_host_points(
    p_host_id INTEGER,
    p_points INTEGER,
    p_source points_source_enum,
    p_source_id INTEGER DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS BIGINT AS $$
DECLARE
    v_point_id BIGINT;
    v_available INTEGER;
BEGIN
    -- Validar pontos positivos
    IF p_points <= 0 THEN
        RAISE EXCEPTION 'Points must be positive';
    END IF;
    
    -- Verificar se há pontos suficientes
    v_available := calculate_host_available_points(p_host_id);
    IF v_available < p_points THEN
        RAISE EXCEPTION 'Insufficient points. Available: %, Required: %', 
            v_available, p_points;
    END IF;
    
    -- Inserir gasto de pontos (negativo)
    INSERT INTO host_points (
        host_id,
        points,
        points_type,
        source,
        source_id,
        description,
        metadata
    ) VALUES (
        p_host_id,
        -p_points,
        'spent',
        p_source,
        p_source_id,
        p_description,
        p_metadata
    )
    RETURNING id INTO v_point_id;
    
    RETURN v_point_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: Obter histórico de pontos
-- ============================================

CREATE OR REPLACE FUNCTION get_host_points_history(
    p_host_id INTEGER,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    points INTEGER,
    points_type points_type_enum,
    source points_source_enum,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    expired BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hp.id,
        hp.points,
        hp.points_type,
        hp.source,
        hp.description,
        hp.created_at,
        hp.expires_at,
        hp.expired
    FROM host_points hp
    WHERE hp.host_id = p_host_id
      AND hp.is_active = TRUE
      AND hp.is_visible = TRUE
    ORDER BY hp.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- VIEW: Resumo de pontos por host
-- ============================================

CREATE OR REPLACE VIEW host_points_summary AS
SELECT 
    host_id,
    COUNT(*) as total_transactions,
    COALESCE(SUM(CASE WHEN points_type = 'earned' THEN points ELSE 0 END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN points_type = 'spent' THEN ABS(points) ELSE 0 END), 0) as total_spent,
    COALESCE(SUM(CASE WHEN expired THEN ABS(points) ELSE 0 END), 0) as total_expired,
    calculate_host_total_points(host_id) as current_balance,
    calculate_host_available_points(host_id) as available_balance,
    MAX(created_at) as last_transaction_at
FROM host_points
WHERE is_active = TRUE
GROUP BY host_id;

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Comentário: Adicionar pontos de boas-vindas para hosts existentes
-- UNCOMMENT para aplicar:
/*
INSERT INTO host_points (host_id, points, points_type, source, description)
SELECT 
    id,
    100,
    'earned',
    'welcome_bonus',
    'Bônus de boas-vindas RSV 360'
FROM users
WHERE role = 'host'
  AND id NOT IN (SELECT DISTINCT host_id FROM host_points);
*/

-- ============================================
-- COMENTÁRIOS E NOTAS
-- ============================================

COMMENT ON TABLE host_points IS 'Sistema de pontos para hosts com suporte a ganho, gasto e expiração';
COMMENT ON COLUMN host_points.points IS 'Quantidade de pontos (positivo para ganho, negativo para gasto)';
COMMENT ON COLUMN host_points.points_type IS 'Tipo de transação de pontos';
COMMENT ON COLUMN host_points.source IS 'Origem dos pontos';
COMMENT ON COLUMN host_points.expires_at IS 'Data de expiração dos pontos (NULL = nunca expira)';
COMMENT ON COLUMN host_points.metadata IS 'Dados adicionais em formato JSON';

COMMENT ON FUNCTION calculate_host_total_points(INTEGER) IS 'Calcula o total de pontos ativos de um host';
COMMENT ON FUNCTION add_host_points(INTEGER, INTEGER, points_source_enum, INTEGER, TEXT, INTEGER, JSONB) IS 'Adiciona pontos a um host';
COMMENT ON FUNCTION spend_host_points(INTEGER, INTEGER, points_source_enum, INTEGER, TEXT, JSONB) IS 'Gasta pontos de um host (valida saldo suficiente)';

-- ============================================
-- MIGRATION COMPLETA ✅
-- ============================================

