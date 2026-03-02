-- ============================================
-- SCRIPT PARA CRIAR BANCO DE DADOS RSV360_DEV
-- ============================================
-- Execute este script no pgAdmin 4 ou via psql
-- ============================================

-- Criar banco de dados se não existir
CREATE DATABASE rsv360_dev
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Comentário no banco
COMMENT ON DATABASE rsv360_dev IS 'Banco de dados do sistema RSV 360 - Ambiente de Desenvolvimento';

-- Verificar se foi criado
SELECT datname, datowner, encoding 
FROM pg_database 
WHERE datname = 'rsv360_dev';

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Banco de dados rsv360_dev criado com sucesso!';
    RAISE NOTICE '   Owner: postgres';
    RAISE NOTICE '   Encoding: UTF8';
END $$;

