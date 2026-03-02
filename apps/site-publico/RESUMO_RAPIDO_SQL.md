# ⚡ RESUMO RÁPIDO - EXECUÇÃO SQL

**Para instruções detalhadas, veja:** `GUIA_COMPLETO_EXECUCAO_SQL.md`

---

## 🚀 EXECUÇÃO RÁPIDA (3 Opções)

### Opção 1: Script Automatizado (Mais Fácil)
```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
.\scripts\executar-todos-sql-scripts.ps1
# Digite a senha quando solicitado
```

### Opção 2: pgAdmin (Recomendado)
1. Abra **pgAdmin**
2. Conecte-se ao **rsv_360_db**
3. Abra **Query Tool**
4. Execute cada script na ordem abaixo

### Opção 3: psql (Linha de Comando)
```powershell
$env:PGPASSWORD = "sua_senha"
psql -U postgres -d onboarding_rsv_db -f scripts/create-database-indexes.sql
# Repita para cada script abaixo
```

---

## 📋 LISTA DE SCRIPTS (Ordem de Execução)

### Fase 1: Base (4 scripts)
1. ✅ `scripts/create-database-indexes.sql`
2. ✅ `scripts/create-logs-table.sql`
3. ✅ `scripts/create-notification-queue-table.sql`
4. ✅ `scripts/create-rate-limit-tables.sql`

### Fase 2: Dependem de `users` (6 scripts)
5. ✅ `scripts/create-credentials-table.sql`
6. ✅ `scripts/create-saved-searches-table.sql`
7. ✅ `scripts/create-2fa-tables.sql`
8. ✅ `scripts/create-audit-logs-table.sql`
9. ✅ `scripts/create-lgpd-tables.sql`
10. ✅ `scripts/create-trip-planning-tables.sql`

### Fase 3: Dependem de outras tabelas (1 script)
11. ✅ `scripts/create-group-chat-polls-table.sql`

---

## ✅ VERIFICAÇÃO RÁPIDA

Após executar, verifique no pgAdmin:
- **Schemas** → **public** → **Tables**
- Deve ter 16+ tabelas novas criadas

---

## ⚠️ PROBLEMAS COMUNS

**Erro: "relation already exists"**
→ Ignorar (tabela já existe)

**Erro: "psql: command not found"**
→ Use pgAdmin ou especifique caminho completo

**Erro: "password authentication failed"**
→ Verifique a senha do PostgreSQL

---

**Tempo estimado:** 15-30 minutos  
**Dificuldade:** Fácil

