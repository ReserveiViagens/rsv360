-- ===================================================================
-- SCRIPT DE MIGRAÇÃO: Adicionar coluna payment_status à tabela payments
-- Execute este script se a coluna payment_status não existir
-- ===================================================================

-- Verificar se a coluna já existe e adicionar se não existir
DO $$ 
BEGIN
    -- Verificar se a coluna payment_status existe na tabela payments
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'payment_status'
    ) THEN
        -- Adicionar a coluna payment_status
        ALTER TABLE payments 
        ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
        
        -- Adicionar constraint CHECK
        ALTER TABLE payments 
        ADD CONSTRAINT check_payment_status 
        CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'cancelled', 'failed'));
        
        -- Criar índice para performance
        CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
        
        -- Atualizar registros existentes para 'pending' se estiverem NULL
        UPDATE payments 
        SET payment_status = 'pending' 
        WHERE payment_status IS NULL;
        
        RAISE NOTICE 'Coluna payment_status adicionada com sucesso à tabela payments';
    ELSE
        RAISE NOTICE 'Coluna payment_status já existe na tabela payments';
    END IF;
END $$;

-- Verificar se a coluna status existe (alguns sistemas usam 'status' em vez de 'payment_status')
DO $$ 
BEGIN
    -- Se existe 'status' mas não 'payment_status', podemos migrar os dados
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'status'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'payment_status'
    ) THEN
        -- Adicionar payment_status e copiar valores de status
        ALTER TABLE payments 
        ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
        
        UPDATE payments 
        SET payment_status = COALESCE(status, 'pending');
        
        ALTER TABLE payments 
        ADD CONSTRAINT check_payment_status 
        CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'cancelled', 'failed'));
        
        CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
        
        RAISE NOTICE 'Coluna payment_status criada e dados migrados de status';
    END IF;
END $$;

