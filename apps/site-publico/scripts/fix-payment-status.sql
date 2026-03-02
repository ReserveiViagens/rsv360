-- ===================================================================
-- SCRIPT DE CORREÇÃO: Adicionar coluna payment_status à tabela payments
-- Execute este script se a coluna payment_status não existir
-- ===================================================================

-- Verificar e adicionar a coluna payment_status se não existir
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
        
        RAISE NOTICE 'Coluna payment_status adicionada à tabela payments';
    ELSE
        RAISE NOTICE 'Coluna payment_status já existe na tabela payments';
    END IF;
END $$;

-- Adicionar constraint CHECK se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'payments' 
        AND constraint_name = 'check_payment_status'
    ) THEN
        ALTER TABLE payments 
        ADD CONSTRAINT check_payment_status 
        CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'cancelled', 'failed'));
        
        RAISE NOTICE 'Constraint check_payment_status adicionada';
    ELSE
        RAISE NOTICE 'Constraint check_payment_status já existe';
    END IF;
END $$;

-- Atualizar registros existentes para 'pending' se estiverem NULL
UPDATE payments 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;

-- Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Verificar resultado
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'payments' 
AND column_name = 'payment_status';

