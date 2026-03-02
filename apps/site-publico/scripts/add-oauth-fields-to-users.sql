-- Adicionar campos OAuth à tabela users
-- Execute este script se a tabela users já existir

-- Adicionar colunas OAuth (se não existirem)
DO $$ 
BEGIN
    -- Adicionar coluna oauth_provider
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'oauth_provider') THEN
        ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50) NULL;
    END IF;

    -- Adicionar coluna oauth_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'oauth_id') THEN
        ALTER TABLE users ADD COLUMN oauth_id VARCHAR(255) NULL;
    END IF;

    -- Adicionar coluna oauth_email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'oauth_email') THEN
        ALTER TABLE users ADD COLUMN oauth_email VARCHAR(255) NULL;
    END IF;

    -- Criar índice composto para busca rápida
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                   WHERE indexname = 'idx_users_oauth') THEN
        CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
    END IF;

    -- Criar índice para oauth_email
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                   WHERE indexname = 'idx_users_oauth_email') THEN
        CREATE INDEX idx_users_oauth_email ON users(oauth_email);
    END IF;
END $$;

-- Tornar password_hash opcional (para usuários OAuth)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'password_hash' 
               AND is_nullable = 'NO') THEN
        ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
    END IF;
END $$;

