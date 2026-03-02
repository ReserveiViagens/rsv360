-- ============================================
-- MIGRATION 019: INCENTIVE PROGRAMS SYSTEM
-- ============================================
-- Descrição: Sistema configurável de programas de incentivo
-- Data: 2025-12-12
-- Autor: RSV 360 Team
-- Dependências: migration-018 (host_points table)
-- ============================================

-- Criar ENUM para tipo de programa
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_type_enum') THEN
        CREATE TYPE program_type_enum AS ENUM (
            'points',           -- Recompensa em pontos
            'discount',         -- Desconto em taxas
            'badge',            -- Badge/Conquista
            'feature',          -- Acesso a feature
            'commission',       -- Redução de comissão
            'priority',         -- Suporte prioritário
            'cash_bonus',       -- Bônus em dinheiro
            'visibility'        -- Maior visibilidade
        );
    END IF;
END
$$;

-- ============================================
-- TABELA: incentive_programs
-- ============================================

CREATE TABLE IF NOT EXISTS incentive_programs (
    -- Identificação
    id BIGSERIAL PRIMARY KEY,
    program_key VARCHAR(100) UNIQUE NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    program_description TEXT,
    program_type program_type_enum NOT NULL,
    
    -- Critérios de elegibilidade (JSONB)
    criteria JSONB NOT NULL DEFAULT '{}',
    
    -- Recompensa (JSONB)
    reward JSONB NOT NULL DEFAULT '{}',
    
    -- Status e vigência
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Limites de participação
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    max_rewards_per_host INTEGER DEFAULT 1,
    
    -- Prioridade e ordem
    priority INTEGER DEFAULT 0,      -- Maior = mais importante
    sort_order INTEGER DEFAULT 0,    -- Ordem de exibição
    
    -- Configurações adicionais
    auto_apply BOOLEAN DEFAULT FALSE, -- Aplicar automaticamente
    requires_approval BOOLEAN DEFAULT FALSE,
    notification_enabled BOOLEAN DEFAULT TRUE,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    -- Constraints
    CONSTRAINT chk_dates_valid 
        CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at),
    
    CONSTRAINT chk_max_participants_positive 
        CHECK (max_participants IS NULL OR max_participants > 0),
    
    CONSTRAINT chk_current_participants_valid 
        CHECK (current_participants >= 0),
    
    CONSTRAINT chk_priority_valid 
        CHECK (priority >= 0)
);

-- ============================================
-- TABELA: host_program_enrollments
-- ============================================
-- Registra participação de hosts em programas

CREATE TABLE IF NOT EXISTS host_program_enrollments (
    -- Identificação
    id BIGSERIAL PRIMARY KEY,
    host_id INTEGER NOT NULL,
    program_id BIGINT NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'enrolled',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Recompensas recebidas
    rewards_received INTEGER DEFAULT 0,
    last_reward_at TIMESTAMP WITH TIME ZONE,
    
    -- Progresso (se aplicável)
    progress JSONB DEFAULT '{}',
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_enrollment_host 
        FOREIGN KEY (host_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_enrollment_program 
        FOREIGN KEY (program_id) 
        REFERENCES incentive_programs(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_host_program 
        UNIQUE (host_id, program_id)
);

-- ============================================
-- ÍNDICES: incentive_programs
-- ============================================

-- Índice por chave única
CREATE UNIQUE INDEX IF NOT EXISTS idx_programs_key 
    ON incentive_programs(program_key);

-- Índice por tipo
CREATE INDEX IF NOT EXISTS idx_programs_type 
    ON incentive_programs(program_type);

-- Índice por status ativo
CREATE INDEX IF NOT EXISTS idx_programs_active 
    ON incentive_programs(is_active) 
    WHERE is_active = TRUE;

-- Índice por datas de vigência
CREATE INDEX IF NOT EXISTS idx_programs_dates 
    ON incentive_programs(starts_at, ends_at);

-- Índice por prioridade
CREATE INDEX IF NOT EXISTS idx_programs_priority 
    ON incentive_programs(priority DESC);

-- Índice GIN para criteria JSONB
CREATE INDEX IF NOT EXISTS idx_programs_criteria 
    ON incentive_programs USING GIN (criteria);

-- Índice GIN para tags array
CREATE INDEX IF NOT EXISTS idx_programs_tags 
    ON incentive_programs USING GIN (tags);

-- ============================================
-- ÍNDICES: host_program_enrollments
-- ============================================

CREATE INDEX IF NOT EXISTS idx_enrollments_host 
    ON host_program_enrollments(host_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_program 
    ON host_program_enrollments(program_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_status 
    ON host_program_enrollments(status);

CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at 
    ON host_program_enrollments(enrolled_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_programs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_programs_timestamp ON incentive_programs;
CREATE TRIGGER trigger_update_programs_timestamp
    BEFORE UPDATE ON incentive_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_programs_timestamp();

DROP TRIGGER IF EXISTS trigger_update_enrollments_timestamp ON host_program_enrollments;
CREATE TRIGGER trigger_update_enrollments_timestamp
    BEFORE UPDATE ON host_program_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_programs_timestamp();

-- ============================================
-- FUNÇÃO: Verificar elegibilidade de host
-- ============================================

CREATE OR REPLACE FUNCTION check_program_eligibility(
    p_host_id INTEGER,
    p_program_key VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_criteria JSONB;
    v_program_id BIGINT;
    v_host_score DECIMAL(5, 2);
    v_host_rating DECIMAL(3, 2);
    v_booking_count INTEGER;
    v_response_rate DECIMAL(5, 2);
    v_cancellation_rate DECIMAL(5, 2);
    v_member_since DATE;
    v_days_member INTEGER;
BEGIN
    -- Buscar programa e critérios
    SELECT id, criteria INTO v_program_id, v_criteria
    FROM incentive_programs
    WHERE program_key = p_program_key 
      AND is_active = TRUE
      AND (starts_at IS NULL OR starts_at <= CURRENT_TIMESTAMP)
      AND (ends_at IS NULL OR ends_at >= CURRENT_TIMESTAMP);
    
    IF v_criteria IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se já está inscrito
    IF EXISTS (
        SELECT 1 FROM host_program_enrollments
        WHERE host_id = p_host_id 
          AND program_id = v_program_id
          AND status = 'enrolled'
    ) THEN
        -- Já inscrito, verificar se ainda atende critérios
        NULL; -- Continuar verificação
    END IF;
    
    -- Verificar score mínimo
    IF v_criteria ? 'min_score' THEN
        v_host_score := calculate_host_score(p_host_id);
        IF v_host_score < (v_criteria->>'min_score')::DECIMAL THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Verificar rating mínimo
    IF v_criteria ? 'min_rating' THEN
        SELECT AVG(rating_value) INTO v_host_rating
        FROM host_ratings
        WHERE host_id = p_host_id 
          AND rating_type = 'overall';
        
        IF v_host_rating IS NULL OR 
           v_host_rating < (v_criteria->>'min_rating')::DECIMAL THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Verificar número mínimo de bookings
    IF v_criteria ? 'min_bookings' THEN
        SELECT COUNT(*) INTO v_booking_count
        FROM bookings
        WHERE owner_id = p_host_id 
          AND status IN ('confirmed', 'completed');
        
        IF v_booking_count < (v_criteria->>'min_bookings')::INTEGER THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Verificar taxa de resposta mínima
    IF v_criteria ? 'min_response_rate' THEN
        SELECT metric_value INTO v_response_rate
        FROM quality_metrics
        WHERE host_id = p_host_id 
          AND metric_type = 'response_rate'
        ORDER BY calculated_at DESC
        LIMIT 1;
        
        IF v_response_rate IS NULL OR 
           v_response_rate < (v_criteria->>'min_response_rate')::DECIMAL THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Verificar taxa de cancelamento máxima
    IF v_criteria ? 'max_cancellation_rate' THEN
        SELECT metric_value INTO v_cancellation_rate
        FROM quality_metrics
        WHERE host_id = p_host_id 
          AND metric_type = 'cancellation_rate'
        ORDER BY calculated_at DESC
        LIMIT 1;
        
        IF v_cancellation_rate IS NULL OR 
           v_cancellation_rate > (v_criteria->>'max_cancellation_rate')::DECIMAL THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Verificar tempo mínimo como membro
    IF v_criteria ? 'min_days_member' THEN
        SELECT created_at::DATE INTO v_member_since
        FROM users
        WHERE id = p_host_id;
        
        v_days_member := CURRENT_DATE - v_member_since;
        
        IF v_days_member < (v_criteria->>'min_days_member')::INTEGER THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Todas as verificações passaram
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FUNÇÃO: Listar programas elegíveis para host
-- ============================================

CREATE OR REPLACE FUNCTION get_eligible_programs(p_host_id INTEGER)
RETURNS TABLE (
    program_id BIGINT,
    program_key VARCHAR(100),
    program_name VARCHAR(255),
    program_type program_type_enum,
    reward JSONB,
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.program_key,
        p.program_name,
        p.program_type,
        p.reward,
        p.priority
    FROM incentive_programs p
    WHERE p.is_active = TRUE
      AND (p.starts_at IS NULL OR p.starts_at <= CURRENT_TIMESTAMP)
      AND (p.ends_at IS NULL OR p.ends_at >= CURRENT_TIMESTAMP)
      AND (p.max_participants IS NULL OR p.current_participants < p.max_participants)
      AND check_program_eligibility(p_host_id, p.program_key)
    ORDER BY p.priority DESC, p.sort_order ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FUNÇÃO: Aplicar recompensa de programa
-- ============================================

CREATE OR REPLACE FUNCTION apply_program_reward(
    p_host_id INTEGER,
    p_program_id BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_program RECORD;
    v_enrollment_id BIGINT;
    v_reward JSONB;
BEGIN
    -- Buscar programa
    SELECT * INTO v_program
    FROM incentive_programs
    WHERE id = p_program_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Program not found';
    END IF;
    
    v_reward := v_program.reward;
    
    -- Verificar tipo de recompensa
    CASE v_program.program_type
        WHEN 'points' THEN
            -- Adicionar pontos
            PERFORM add_host_points(
                p_host_id,
                (v_reward->>'points')::INTEGER,
                'promotion',
                p_program_id,
                'Programa: ' || v_program.program_name,
                (v_reward->>'expires_in_days')::INTEGER,
                v_reward
            );
        
        WHEN 'discount' THEN
            -- Aplicar desconto (seria implementado em outro lugar)
            NULL;
        
        WHEN 'badge' THEN
            -- Conceder badge (seria implementado em outro lugar)
            NULL;
        
        ELSE
            -- Outros tipos de recompensa
            NULL;
    END CASE;
    
    -- Registrar na tabela de enrollments
    INSERT INTO host_program_enrollments (
        host_id,
        program_id,
        rewards_received,
        last_reward_at
    ) VALUES (
        p_host_id,
        p_program_id,
        1,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (host_id, program_id) DO UPDATE
    SET rewards_received = host_program_enrollments.rewards_received + 1,
        last_reward_at = CURRENT_TIMESTAMP;
    
    -- Incrementar contador de participantes
    UPDATE incentive_programs
    SET current_participants = current_participants + 1
    WHERE id = p_program_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW: Programas ativos
-- ============================================

CREATE OR REPLACE VIEW active_incentive_programs AS
SELECT 
    id,
    program_key,
    program_name,
    program_description,
    program_type,
    criteria,
    reward,
    starts_at,
    ends_at,
    max_participants,
    current_participants,
    CASE 
        WHEN max_participants IS NOT NULL 
        THEN (current_participants::DECIMAL / max_participants * 100)
        ELSE NULL 
    END as participation_percentage,
    priority,
    sort_order,
    auto_apply,
    tags
FROM incentive_programs
WHERE is_active = TRUE
  AND (starts_at IS NULL OR starts_at <= CURRENT_TIMESTAMP)
  AND (ends_at IS NULL OR ends_at >= CURRENT_TIMESTAMP)
ORDER BY priority DESC, sort_order ASC;

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Programa 1: Bônus de Boas-Vindas
INSERT INTO incentive_programs (
    program_key,
    program_name,
    program_description,
    program_type,
    criteria,
    reward,
    priority,
    auto_apply
) VALUES (
    'welcome_bonus',
    'Bônus de Boas-Vindas',
    'Receba 100 pontos ao se cadastrar como host',
    'points',
    '{"min_days_member": 0}'::JSONB,
    '{"points": 100, "expires_in_days": 365}'::JSONB,
    100,
    TRUE
) ON CONFLICT (program_key) DO NOTHING;

-- Programa 2: Superhost
INSERT INTO incentive_programs (
    program_key,
    program_name,
    program_description,
    program_type,
    criteria,
    reward,
    priority,
    auto_apply
) VALUES (
    'superhost_program',
    'Programa Superhost',
    'Hosts de excelência recebem 500 pontos + badge',
    'points',
    '{"min_score": 90, "min_rating": 4.8, "min_bookings": 10, "max_cancellation_rate": 5}'::JSONB,
    '{"points": 500, "badge": "superhost", "discount_percent": 10}'::JSONB,
    90,
    TRUE
) ON CONFLICT (program_key) DO NOTHING;

-- Programa 3: Resposta Rápida
INSERT INTO incentive_programs (
    program_key,
    program_name,
    program_description,
    program_type,
    criteria,
    reward,
    priority,
    auto_apply
) VALUES (
    'fast_response',
    'Resposta Rápida',
    'Responda em até 1 hora e ganhe pontos extras',
    'points',
    '{"min_response_rate": 95}'::JSONB,
    '{"points": 50, "expires_in_days": 180}'::JSONB,
    70,
    TRUE
) ON CONFLICT (program_key) DO NOTHING;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE incentive_programs IS 'Programas de incentivo configuráveis com critérios e recompensas';
COMMENT ON TABLE host_program_enrollments IS 'Registro de participação de hosts em programas';

COMMENT ON COLUMN incentive_programs.criteria IS 'Critérios de elegibilidade em formato JSONB';
COMMENT ON COLUMN incentive_programs.reward IS 'Recompensa do programa em formato JSONB';
COMMENT ON COLUMN incentive_programs.auto_apply IS 'Aplicar automaticamente quando host for elegível';

COMMENT ON FUNCTION check_program_eligibility(INTEGER, VARCHAR) IS 'Verifica se host atende critérios de um programa';
COMMENT ON FUNCTION get_eligible_programs(INTEGER) IS 'Lista programas elegíveis para um host';
COMMENT ON FUNCTION apply_program_reward(INTEGER, BIGINT) IS 'Aplica recompensa de programa a um host';

-- ============================================
-- MIGRATION COMPLETA ✅
-- ============================================

