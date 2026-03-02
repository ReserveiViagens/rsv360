# ✅ GUIA CORRIGIDO - EXECUÇÃO SQL COM BANCO CORRETO

**Data:** 2025-01-30  
**Status:** ✅ **CORRIGIDO** - Usando banco correto do pgAdmin

---

## 🎯 BANCO DE DADOS CORRETO

Após análise do seu pgAdmin, identifiquei que você tem:

### ✅ Bancos Disponíveis:
- **`onboarding_rsv_db`** ← **USE ESTE** (já está no código)
- `rsv360_ecosystem` (alternativa)
- `postgres` (banco padrão)
- `postgis_36_sample` (exemplo)

### ❌ Banco que NÃO existe:
- `rsv_360_db` (mencionado nos scripts antigos)

---

## 🚀 EXECUÇÃO RÁPIDA (CORRIGIDA)

### Opção 1: Script Automatizado (RECOMENDADO)
```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
.\scripts\executar-todos-sql-scripts.ps1 -DBName "onboarding_rsv_db"
# Digite a senha quando solicitado
```

### Opção 2: pgAdmin
1. Abra **pgAdmin**
2. Conecte-se ao servidor **"localhost"** ou **"PostgreSQL 18"**
3. Expanda: **Databases** → **onboarding_rsv_db**
4. Clique com botão direito → **Query Tool**
5. Execute cada script na ordem abaixo

### Opção 3: psql
```powershell
$env:PGPASSWORD = "sua_senha"
psql -U postgres -d onboarding_rsv_db -f scripts/create-database-indexes.sql
# Repita para cada script
```

---

## 📋 LISTA DE SCRIPTS (Ordem de Execução)

### Fase 1: Base (4 scripts)
```powershell
psql -U postgres -d onboarding_rsv_db -f scripts/create-database-indexes.sql
psql -U postgres -d onboarding_rsv_db -f scripts/create-logs-table.sql
psql -U postgres -d onboarding_rsv_db -f scripts/create-notification-queue-table.sql
psql -U postgres -d onboarding_rsv_db -f scripts/create-rate-limit-tables.sql
```

### Fase 2: Dependem de `users` (6 scripts)
```powershell
psql -U postgres -d onboarding_rsv_db -f scripts/create-credentials-table.sql
psql -U postgres -d onboarding_rsv_db -f scripts/create-saved-searches-table.sql
psql -U postgres -d onboarding_rsv_db -f scripts/create-2fa-tables.sql
psql -U postgres -d onboarding_rsv_db -f scripts/create-audit-logs-table.sql
psql -U postgres -d onboarding_rsv_db -f scripts/create-lgpd-tables.sql
psql -U postgres -d onboarding_rsv_db -f scripts/create-trip-planning-tables.sql
```

### Fase 3: Dependem de outras tabelas (1 script)
```powershell
psql -U postgres -d onboarding_rsv_db -f scripts/create-group-chat-polls-table.sql
```

---

## ✅ VERIFICAÇÃO

Após executar, verifique no pgAdmin:
- **Databases** → **onboarding_rsv_db** → **Schemas** → **public** → **Tables**

Deve ter 16+ tabelas novas criadas.

---

## 📝 NOTA IMPORTANTE

**Scripts atualizados para usar `onboarding_rsv_db` por padrão!**

Se preferir usar `rsv360_ecosystem`, especifique:
```powershell
.\scripts\executar-todos-sql-scripts.ps1 -DBName "rsv360_ecosystem"
```

---

**Documento criado:** 2025-01-30  
**Status:** ✅ Corrigido e pronto para uso

