# ⚠️ FASE 1: EXECUÇÃO MANUAL DAS MIGRATIONS

**Data:** 2025-12-13  
**Status:** ⚠️ REQUER CONFIGURAÇÃO DE BANCO DE DADOS  
**Motivo:** Autenticação PostgreSQL necessária

---

## 🔍 PROBLEMA IDENTIFICADO

A execução automática das migrations falhou devido a:
- ❌ Autenticação PostgreSQL não configurada
- ❌ Banco de dados `rsv360_dev` pode não existir
- ❌ Credenciais não disponíveis no ambiente

**Erro:**
```
autenticação do tipo senha falhou para o usuário "postgres"
```

---

## ✅ VALIDAÇÃO DE SINTAXE: PASSOU

Ambas as migrations foram **validadas com sucesso**:

- ✅ Migration 018: `host_points` - **VÁLIDA**
- ✅ Migration 019: `incentive_programs` - **VÁLIDA**

---

## 📋 COMO EXECUTAR MANUALMENTE

### Opção 1: Via pgAdmin

1. Abrir pgAdmin 4
2. Conectar ao servidor PostgreSQL
3. Selecionar banco de dados `rsv360_dev` (ou criar se não existir)
4. Abrir Query Tool
5. Copiar conteúdo de `scripts/migration-018-create-host-points-table.sql`
6. Executar (F5)
7. Repetir para `scripts/migration-019-create-incentive-programs-table.sql`

### Opção 2: Via psql (Terminal)

```bash
# Configurar variável de ambiente
$env:DATABASE_URL="postgresql://usuario:senha@localhost:5432/rsv360_dev"

# Executar migration 018
psql -U postgres -d rsv360_dev -f scripts/migration-018-create-host-points-table.sql

# Executar migration 019
psql -U postgres -d rsv360_dev -f scripts/migration-019-create-incentive-programs-table.sql
```

### Opção 3: Via Script Node.js (Após Configurar DATABASE_URL)

```bash
# Configurar DATABASE_URL primeiro
$env:DATABASE_URL="postgresql://usuario:senha@localhost:5432/rsv360_dev"

# Executar
npm run migration:execute:018
npm run migration:execute:019
npm run migration:test:functions
```

---

## ✅ VALIDAÇÃO PÓS-EXECUÇÃO

Após executar as migrations, validar:

```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('host_points', 'incentive_programs', 'host_program_enrollments');

-- Verificar funções
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%host_points%' OR routine_name LIKE '%program%';

-- Verificar views
SELECT table_name FROM information_schema.views 
WHERE table_name IN ('host_points_summary', 'active_incentive_programs');

-- Testar função
SELECT calculate_host_total_points(1);
SELECT check_program_eligibility(1, 'welcome_bonus');
```

---

## 📝 PRÓXIMOS PASSOS

Após executar as migrations manualmente:

1. ✅ Validar criação de objetos
2. ✅ Testar funções SQL
3. ✅ Continuar com FASE 2 (já implementada)
4. ✅ Continuar com FASE 3

---

**Nota:** As funções da FASE 2 já foram implementadas e estão prontas para uso assim que as migrations forem executadas.

---

**Última Atualização:** 2025-12-13

