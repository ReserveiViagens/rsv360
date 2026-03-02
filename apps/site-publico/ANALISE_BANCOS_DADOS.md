# 🔍 ANÁLISE: BANCOS DE DADOS NO pgAdmin vs SCRIPTS

**Data:** 2025-01-30  
**Análise:** Comparação entre bancos visíveis no pgAdmin e mencionados nos scripts

---

## 📊 BANCOS DE DADOS VISÍVEIS NO pgAdmin

### Servidor: "PostgreSQL 18" e "localhost"
Ambos os servidores mostram os mesmos 4 bancos:

1. ✅ **`onboarding_rsv_db`** - Presente
2. ✅ **`postgis_36_sample`** - Presente (banco de exemplo PostGIS)
3. ✅ **`postgres`** - Presente (banco padrão do PostgreSQL)
4. ✅ **`rsv360_ecosystem`** - Presente

---

## 📋 BANCOS MENCIONADOS NOS SCRIPTS

### Scripts PowerShell e Guias:
- **`rsv_360_db`** - Mencionado em:
  - `scripts/executar-todos-sql-scripts.ps1`
  - `scripts/executar-sql-scripts.ps1`
  - `GUIA_COMPLETO_EXECUCAO_SQL.md`
  - `RESUMO_RAPIDO_SQL.md`

### Código da Aplicação:
- **`onboarding_rsv_db`** - Usado como padrão em:
  - `lib/db.ts` (linha 13)
  - `app/api/contracts/route.ts`
  - `app/api/smartlocks/route.ts`
  - `lib/smartlock-integration.ts`

---

## ⚠️ PROBLEMA IDENTIFICADO

### Inconsistência de Nomes:

| Local | Banco Mencionado | Status |
|-------|-----------------|--------|
| Scripts SQL | `rsv_360_db` | ❌ **NÃO EXISTE** no pgAdmin |
| Código App | `onboarding_rsv_db` | ✅ **EXISTE** no pgAdmin |
| pgAdmin | `rsv360_ecosystem` | ✅ **EXISTE** mas não usado |

**Conclusão:** Os scripts estão configurados para usar `rsv_360_db`, mas esse banco **NÃO EXISTE** no seu pgAdmin!

---

## ✅ SOLUÇÃO

Você tem 3 opções:

### Opção 1: Usar `onboarding_rsv_db` (RECOMENDADO)
Este é o banco que já existe e está sendo usado pelo código da aplicação.

**Como fazer:**
1. Execute os scripts especificando o banco correto:
```powershell
.\scripts\executar-todos-sql-scripts.ps1 -DBName "onboarding_rsv_db" -DBPassword "sua_senha"
```

2. Ou via psql:
```powershell
$env:PGPASSWORD = "sua_senha"
psql -U postgres -d onboarding_rsv_db -f scripts/create-database-indexes.sql
```

### Opção 2: Criar o banco `rsv_360_db`
Se preferir usar o nome mencionado nos scripts:

**Como fazer:**
1. No pgAdmin:
   - Clique com botão direito em **Databases**
   - Selecione **Create** → **Database**
   - Nome: `rsv_360_db`
   - Owner: `postgres`
   - Clique em **Save**

2. Depois execute os scripts normalmente:
```powershell
.\scripts\executar-todos-sql-scripts.ps1 -DBPassword "sua_senha"
```

### Opção 3: Usar `rsv360_ecosystem`
Se este for o banco principal do projeto:

**Como fazer:**
```powershell
.\scripts\executar-todos-sql-scripts.ps1 -DBName "rsv360_ecosystem" -DBPassword "sua_senha"
```

---

## 🎯 RECOMENDAÇÃO

**Use `onboarding_rsv_db`** porque:
- ✅ Já existe no seu pgAdmin
- ✅ Já está configurado no código (`lib/db.ts`)
- ✅ Evita criar banco novo
- ✅ Mantém consistência com o código existente

---

## 📝 ATUALIZAÇÃO DOS SCRIPTS

Se quiser usar `onboarding_rsv_db` como padrão, posso atualizar os scripts para usar este banco automaticamente.

**Quer que eu atualize os scripts?**

---

## ✅ VERIFICAÇÃO FINAL

### Bancos Disponíveis no pgAdmin:
- ✅ `onboarding_rsv_db` ← **RECOMENDADO**
- ✅ `rsv360_ecosystem` ← Alternativa
- ❌ `rsv_360_db` ← **NÃO EXISTE** (precisa criar ou usar outro)

### Servidores Disponíveis:
- ✅ `PostgreSQL 18`
- ✅ `localhost`

**Ambos os servidores têm os mesmos bancos.**

---

## 🚀 PRÓXIMOS PASSOS

1. **Decida qual banco usar:**
   - `onboarding_rsv_db` (recomendado)
   - `rsv360_ecosystem`
   - Criar `rsv_360_db`

2. **Execute os scripts SQL:**
   ```powershell
   # Se usar onboarding_rsv_db:
   .\scripts\executar-todos-sql-scripts.ps1 -DBName "onboarding_rsv_db" -DBPassword "sua_senha"
   
   # Se usar rsv360_ecosystem:
   .\scripts\executar-todos-sql-scripts.ps1 -DBName "rsv360_ecosystem" -DBPassword "sua_senha"
   ```

3. **Verifique as tabelas criadas:**
   - No pgAdmin: **Databases** → **[seu_banco]** → **Schemas** → **public** → **Tables**

---

**Documento criado:** 2025-01-30  
**Status:** ⚠️ Ação necessária - Escolher banco correto

