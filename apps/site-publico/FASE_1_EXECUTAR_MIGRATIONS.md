# 🚀 FASE 1: EXECUTAR MIGRATIONS - GUIA COMPLETO

**Data:** 2025-12-13  
**Status:** ✅ Scripts Criados  
**Próximo Passo:** Executar validação e migrations

---

## 📋 SCRIPTS CRIADOS

### 1. Validação de Sintaxe

- ✅ `scripts/validate-migration-018.js` - Valida sintaxe da migration 018
- ✅ `scripts/validate-migration-019.js` - Valida sintaxe da migration 019
- ✅ `scripts/validate-all-migrations.js` - Valida ambas as migrations

### 2. Execução de Migrations

- ✅ `scripts/execute-migration-018.js` - Executa migration 018 e valida criação
- ✅ `scripts/execute-migration-019.js` - Executa migration 019 e valida criação

### 3. Testes de Funções

- ✅ `scripts/test-migration-functions.js` - Testa todas as funções SQL criadas

---

## 🎯 COMO EXECUTAR

### Opção 1: Executar Tudo de Uma Vez (Recomendado)

```bash
npm run migration:full
```

Este comando executa:
1. Validação de sintaxe de ambas as migrations
2. Execução da migration 018
3. Execução da migration 019
4. Testes de todas as funções SQL

---

### Opção 2: Executar Passo a Passo

#### Passo 1: Validar Sintaxe

```bash
# Validar migration 018
npm run migration:validate:018

# Validar migration 019
npm run migration:validate:019

# Ou validar ambas
npm run migration:validate:all
```

#### Passo 2: Executar Migrations

```bash
# Executar migration 018
npm run migration:execute:018

# Executar migration 019
npm run migration:execute:019
```

#### Passo 3: Testar Funções

```bash
npm run migration:test:functions
```

---

### Opção 3: Executar Manualmente (Node.js)

```bash
# Validar
node scripts/validate-migration-018.js
node scripts/validate-migration-019.js

# Executar
node scripts/execute-migration-018.js
node scripts/execute-migration-019.js

# Testar
node scripts/test-migration-functions.js
```

---

## ⚙️ CONFIGURAÇÃO

### Variável de Ambiente

Os scripts usam a variável de ambiente `DATABASE_URL`:

```bash
# Windows (PowerShell)
$env:DATABASE_URL="postgresql://postgres:senha@localhost:5432/rsv360_dev"

# Linux/Mac
export DATABASE_URL="postgresql://postgres:senha@localhost:5432/rsv360_dev"
```

**Valor padrão:** `postgresql://postgres:postgres@localhost:5432/rsv360_dev`

---

## 📊 O QUE OS SCRIPTS FAZEM

### 1. Validação de Sintaxe (`validate-migration-018.js` / `validate-migration-019.js`)

- ✅ Verifica se o arquivo existe
- ✅ Verifica se contém `CREATE TABLE`
- ✅ Verifica se contém ENUMs necessários
- ✅ Verifica se contém todas as funções SQL
- ✅ Verifica se contém views
- ✅ Verifica se contém triggers
- ✅ Verifica se contém índices
- ✅ Verifica se contém seed data (migration 019)

**Não executa SQL** - apenas valida o conteúdo do arquivo.

---

### 2. Execução de Migrations (`execute-migration-018.js` / `execute-migration-019.js`)

- ✅ Conecta ao banco de dados
- ✅ Executa o arquivo SQL completo
- ✅ Valida criação de tabelas
- ✅ Valida criação de ENUMs
- ✅ Valida criação de funções
- ✅ Valida criação de views
- ✅ Valida criação de índices
- ✅ Valida seed data (migration 019)
- ✅ Testa funções básicas

**Executa SQL** - cria todos os objetos no banco.

---

### 3. Testes de Funções (`test-migration-functions.js`)

- ✅ Testa `calculate_host_total_points`
- ✅ Testa `calculate_host_available_points`
- ✅ Testa `add_host_points`
- ✅ Testa `spend_host_points`
- ✅ Testa `expire_host_points`
- ✅ Testa `get_host_points_history`
- ✅ Testa `check_program_eligibility`
- ✅ Testa `get_eligible_programs`
- ✅ Testa `apply_program_reward`
- ✅ Testa views `host_points_summary` e `active_incentive_programs`

**Testa todas as funções** - verifica se funcionam corretamente.

---

## ✅ CHECKLIST DE EXECUÇÃO

### Antes de Executar

- [ ] PostgreSQL está rodando
- [ ] Banco de dados `rsv360_dev` existe
- [ ] Variável `DATABASE_URL` configurada (ou usar padrão)
- [ ] Migration 017 já foi executada (dependência)

### Durante a Execução

- [ ] Validar sintaxe: `npm run migration:validate:all`
- [ ] Executar migration 018: `npm run migration:execute:018`
- [ ] Executar migration 019: `npm run migration:execute:019`
- [ ] Testar funções: `npm run migration:test:functions`

### Após a Execução

- [ ] Verificar tabelas criadas no pgAdmin
- [ ] Verificar funções criadas no pgAdmin
- [ ] Verificar views criadas no pgAdmin
- [ ] Verificar programas iniciais (migration 019)
- [ ] Atualizar checklist no `PLANO_EXECUCAO_COMPLETO.md`

---

## 🐛 TROUBLESHOOTING

### Erro: "Connection refused"

**Causa:** PostgreSQL não está rodando ou porta incorreta.

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
# Windows
Get-Service -Name postgresql*

# Linux
sudo systemctl status postgresql
```

---

### Erro: "database does not exist"

**Causa:** Banco de dados `rsv360_dev` não existe.

**Solução:**
```sql
-- Criar banco de dados
CREATE DATABASE rsv360_dev;
```

---

### Erro: "relation already exists"

**Causa:** Migration já foi executada anteriormente.

**Solução:**
```sql
-- Verificar se tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('host_points', 'incentive_programs');

-- Se existirem, dropar antes de executar novamente (CUIDADO!)
DROP TABLE IF EXISTS host_program_enrollments CASCADE;
DROP TABLE IF EXISTS incentive_programs CASCADE;
DROP TABLE IF EXISTS host_points CASCADE;
DROP TYPE IF EXISTS program_type_enum CASCADE;
DROP TYPE IF EXISTS points_type_enum CASCADE;
DROP TYPE IF EXISTS points_source_enum CASCADE;
```

---

### Erro: "function does not exist" (durante testes)

**Causa:** Função depende de outra função que não existe (ex: `calculate_host_score`).

**Solução:** Isso é esperado se a função `calculate_host_score` não existir. Os testes continuarão normalmente.

---

## 📝 PRÓXIMOS PASSOS

Após executar as migrations com sucesso:

1. ✅ Atualizar checklist no `PLANO_EXECUCAO_COMPLETO.md`
2. ✅ Marcar FASE 1 como concluída
3. ✅ Iniciar FASE 2: TODOs Críticos

---

## 📞 SUPORTE

Se encontrar problemas:

1. Verificar logs dos scripts
2. Verificar conexão com banco de dados
3. Verificar se dependências (migration 017) foram executadas
4. Consultar `FASE_1_MIGRATIONS_RESUMO.md` para detalhes

---

**Última Atualização:** 2025-12-13

