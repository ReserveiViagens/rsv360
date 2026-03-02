# 🗄️ INSTALAÇÃO DO BANCO DE DADOS - Sistema de Reservas

## 📋 Pré-requisitos

- PostgreSQL instalado e rodando
- Acesso ao banco de dados `onboarding_rsv_db`

## 🚀 Passos para Instalação

### 1. Conectar ao PostgreSQL

```bash
# Windows (PowerShell)
psql -U onboarding_rsv -d onboarding_rsv_db

# Ou usando pgAdmin
```

### 2. Executar o Script SQL

```bash
# No terminal do PostgreSQL
\i "D:\servidor RSV\Hotel-com-melhor-preco-main\scripts\create-bookings-table.sql"

# Ou copie e cole o conteúdo do arquivo no pgAdmin
```

### 3. Verificar Instalação

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bookings', 'payments', 'users');

-- Verificar estrutura da tabela bookings
\d bookings
```

## ✅ Tabelas Criadas

1. **bookings** - Reservas principais
2. **payments** - Histórico de pagamentos
3. **users** - Usuários do sistema

## 🔧 Correção: payment_status

Se você receber o erro "coluna payment_status da relação payments não existe", execute:

```bash
# Opção 1: Script PowerShell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main\scripts"
.\corrigir-payment-status.ps1

# Opção 2: SQL direto
psql -U seu_usuario -d seu_banco -f scripts/fix-payment-status.sql

# Opção 3: No pgAdmin
# Execute o conteúdo de: scripts/fix-payment-status.sql
```

Veja mais detalhes em: `GUIA_CORRECAO_PAYMENT_STATUS.md`

## 🔧 Configuração do .env.local

Adicione as seguintes variáveis no arquivo `.env.local`:

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=onboarding_rsv_db
DB_USER=onboarding_rsv
DB_PASSWORD=senha_segura_123

# JWT Secret (GERE UMA CHAVE SEGURA)
JWT_SECRET=sua_chave_secreta_aqui_mude_em_producao

# Mercado Pago (Opcional - para pagamentos reais)
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_chave_publica_aqui

# API URL (deixe vazio para usar rotas locais)
NEXT_PUBLIC_API_URL=
```

## 🧪 Testar a Instalação

Após executar o script, você pode testar criando uma reserva através da interface web.

