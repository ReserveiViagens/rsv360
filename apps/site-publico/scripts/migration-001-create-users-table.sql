-- ============================================
-- MIGRATION 001: CREATE USERS TABLE
-- ============================================
-- Descrição: Tabela principal de usuários do sistema
-- Data: 2025-12-13
-- Autor: RSV 360 Team
-- Dependências: Nenhuma (tabela base)
-- ============================================

-- Criar ENUMs para roles e status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM (
            'admin',
            'manager',
            'user',
            'guest',
            'owner',
            'customer',
            'staff'
        );
    END IF;
END
$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
        CREATE TYPE user_status_enum AS ENUM (
            'active',
            'inactive',
            'pending',
            'suspended'
        );
    END IF;
END
$$;

-- ============================================
-- TABELA: users
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    -- Identificação
    id SERIAL PRIMARY KEY,
    
    -- Autenticação
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Informações básicas
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    
    -- Roles e status
    role user_role_enum DEFAULT 'user',
    status user_status_enum DEFAULT 'active',
    
    -- Informações profissionais
    department VARCHAR(100),
    position VARCHAR(100),
    
    -- Informações pessoais
    birth_date DATE,
    bio TEXT,
    
    -- Preferências e permissões
    preferences JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{}',
    
    -- Localização e idioma
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    language VARCHAR(10) DEFAULT 'pt-BR',
    
    -- Verificação de email
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Recuperação de senha
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    
    -- Segurança e login
    last_login TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(45),
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Autenticação de dois fatores
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    recovery_codes JSONB,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Índice principal por email
CREATE INDEX IF NOT EXISTS idx_users_email 
    ON users(email);

-- Índice por role
CREATE INDEX IF NOT EXISTS idx_users_role 
    ON users(role);

-- Índice por status
CREATE INDEX IF NOT EXISTS idx_users_status 
    ON users(status);

-- Índice por department
CREATE INDEX IF NOT EXISTS idx_users_department 
    ON users(department);

-- Índice composto email + status (para busca rápida)
CREATE INDEX IF NOT EXISTS idx_users_email_status 
    ON users(email, status);

-- Índice por created_at (para ordenação)
CREATE INDEX IF NOT EXISTS idx_users_created_at 
    ON users(created_at DESC);

-- Índice GIN para preferences (busca em JSONB)
CREATE INDEX IF NOT EXISTS idx_users_preferences 
    ON users USING GIN (preferences);

-- Índice GIN para permissions (busca em JSONB)
CREATE INDEX IF NOT EXISTS idx_users_permissions 
    ON users USING GIN (permissions);

-- ============================================
-- TRIGGER: Update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_users_timestamp ON users;

CREATE TRIGGER trigger_update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_timestamp();

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema RSV 360';
COMMENT ON COLUMN users.id IS 'ID único do usuário (SERIAL)';
COMMENT ON COLUMN users.email IS 'Email único do usuário (usado para login)';
COMMENT ON COLUMN users.password_hash IS 'Hash da senha do usuário';
COMMENT ON COLUMN users.role IS 'Papel do usuário no sistema';
COMMENT ON COLUMN users.status IS 'Status atual do usuário';
COMMENT ON COLUMN users.preferences IS 'Preferências do usuário em formato JSONB';
COMMENT ON COLUMN users.permissions IS 'Permissões específicas do usuário em formato JSONB';

