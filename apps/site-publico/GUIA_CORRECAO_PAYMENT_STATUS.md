# 🔧 CORREÇÃO: Coluna payment_status não existe

## ❌ Problema
A coluna `payment_status` da relação `payments` não existe no banco de dados.

## ✅ Solução

### Opção 1: Executar Script SQL (Recomendado)

Execute o script de correção:

```bash
# No PostgreSQL
psql -U seu_usuario -d seu_banco -f scripts/fix-payment-status.sql
```

Ou execute diretamente no pgAdmin ou cliente SQL:

```sql
-- Adicionar coluna payment_status
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Adicionar constraint
ALTER TABLE payments 
ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'cancelled', 'failed'));

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Atualizar registros existentes
UPDATE payments 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;
```

### Opção 2: Recriar Tabela (Se não houver dados importantes)

Se a tabela `payments` estiver vazia ou você puder recriá-la:

```bash
# Executar o script completo
psql -U seu_usuario -d seu_banco -f scripts/create-bookings-table-minimal.sql
```

## 📋 Verificação

Após executar o script, verifique se a coluna foi criada:

```sql
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'payments' 
AND column_name = 'payment_status';
```

Deve retornar:
- `column_name`: payment_status
- `data_type`: character varying
- `column_default`: 'pending'

## 🚀 Próximos Passos

1. Execute o script de correção
2. Teste criar uma nova reserva
3. Verifique se o erro foi resolvido

## 📝 Nota

O script `fix-payment-status.sql` verifica automaticamente se a coluna já existe antes de tentar criá-la, então é seguro executá-lo múltiplas vezes.

