# 📋 GUIA COMPLETO - EXECUÇÃO DE SCRIPTS SQL

**Data:** 2025-01-30  
**Versão:** 1.0  
**Status:** Guia Detalhado Passo a Passo

---

## 🎯 OBJETIVO

Este guia fornece instruções detalhadas para executar **TODOS** os scripts SQL necessários para o funcionamento completo do sistema RSV 360°.

---

## 📊 RESUMO DOS SCRIPTS

**Total de Scripts:** 11 scripts principais  
**Prioridade:** Alta (necessários para funcionalidades avançadas)  
**Tempo estimado:** 15-30 minutos

---

## ⚙️ PRÉ-REQUISITOS

### 1. PostgreSQL Instalado
- ✅ PostgreSQL 12+ instalado
- ✅ Serviço PostgreSQL rodando
- ✅ Acesso ao banco de dados `rsv_360_db`

### 2. Credenciais Necessárias
- **Usuário:** `postgres` (ou seu usuário)
- **Senha:** Sua senha do PostgreSQL
- **Database:** `onboarding_rsv_db` (ou `rsv360_ecosystem` se preferir)

### 3. Ferramentas Disponíveis
Escolha uma das opções:
- **pgAdmin** (Recomendado - Interface gráfica)
- **psql** (Linha de comando)
- **Script PowerShell** (Automatizado)

---

## 📝 LISTA COMPLETA DE SCRIPTS

### 🔴 PRIORIDADE ALTA (Funcionalidades Críticas)

#### 1. Índices do Banco de Dados
**Arquivo:** `scripts/create-database-indexes.sql`  
**Descrição:** Cria índices essenciais para performance  
**Dependências:** Nenhuma  
**Tempo:** ~2 minutos

#### 2. Tabela de Credenciais
**Arquivo:** `scripts/create-credentials-table.sql`  
**Descrição:** Armazena credenciais criptografadas (Airbnb, Cloudbeds, etc.)  
**Dependências:** Tabela `users` deve existir  
**Tempo:** ~1 minuto

#### 3. Tabela de Logs
**Arquivo:** `scripts/create-logs-table.sql`  
**Descrição:** Armazena logs da aplicação (Sentry/LogRocket)  
**Dependências:** Nenhuma  
**Tempo:** ~1 minuto

#### 4. Fila de Notificações
**Arquivo:** `scripts/create-notification-queue-table.sql`  
**Descrição:** Fila assíncrona de notificações  
**Dependências:** Nenhuma  
**Tempo:** ~1 minuto

#### 5. Buscas Salvas
**Arquivo:** `scripts/create-saved-searches-table.sql`  
**Descrição:** Armazena buscas salvas dos usuários  
**Dependências:** Tabela `users` deve existir  
**Tempo:** ~1 minuto

### 🟡 PRIORIDADE MÉDIA (Segurança e Compliance)

#### 6. Autenticação 2FA
**Arquivo:** `scripts/create-2fa-tables.sql`  
**Descrição:** Tabelas para autenticação de dois fatores  
**Dependências:** Tabela `users` deve existir  
**Tempo:** ~2 minutos

#### 7. Logs de Auditoria
**Arquivo:** `scripts/create-audit-logs-table.sql`  
**Descrição:** Registra todas as ações dos usuários  
**Dependências:** Tabela `users` deve existir  
**Tempo:** ~2 minutos

#### 8. Compliance LGPD
**Arquivo:** `scripts/create-lgpd-tables.sql`  
**Descrição:** Tabelas para conformidade com LGPD  
**Dependências:** Tabela `users` deve existir  
**Tempo:** ~2 minutos

#### 9. Rate Limiting
**Arquivo:** `scripts/create-rate-limit-tables.sql`  
**Descrição:** Controle de taxa de requisições  
**Dependências:** Nenhuma  
**Tempo:** ~1 minuto

### 🟢 PRIORIDADE BAIXA (Funcionalidades Avançadas)

#### 10. Planejamento de Viagem
**Arquivo:** `scripts/create-trip-planning-tables.sql`  
**Descrição:** Tabelas para planejamento colaborativo de viagens  
**Dependências:** Tabela `users` deve existir  
**Tempo:** ~3 minutos

#### 11. Polls no Chat
**Arquivo:** `scripts/create-group-chat-polls-table.sql`  
**Descrição:** Tabela para enquetes no chat em grupo  
**Dependências:** Tabela `group_chat_messages` deve existir  
**Tempo:** ~1 minuto

---

## 🚀 MÉTODO 1: EXECUÇÃO VIA pgAdmin (RECOMENDADO)

### Passo 1: Abrir pgAdmin
1. Abra o **pgAdmin**
2. Conecte-se ao servidor PostgreSQL
3. Expanda: **Servers** → **PostgreSQL** → **Databases**
4. Clique com botão direito em **`rsv_360_db`**
5. Selecione **Query Tool**

### Passo 2: Executar Scripts (Ordem Recomendada)

#### Script 1: Índices
```sql
-- Copie e cole o conteúdo de: scripts/create-database-indexes.sql
-- Clique em "Execute" (F5)
```

#### Script 2: Credenciais
```sql
-- Copie e cole o conteúdo de: scripts/create-credentials-table.sql
-- Clique em "Execute" (F5)
```

#### Script 3: Logs
```sql
-- Copie e cole o conteúdo de: scripts/create-logs-table.sql
-- Clique em "Execute" (F5)
```

#### Script 4: Notificações
```sql
-- Copie e cole o conteúdo de: scripts/create-notification-queue-table.sql
-- Clique em "Execute" (F5)
```

#### Script 5: Buscas Salvas
```sql
-- Copie e cole o conteúdo de: scripts/create-saved-searches-table.sql
-- Clique em "Execute" (F5)
```

#### Script 6: 2FA
```sql
-- Copie e cole o conteúdo de: scripts/create-2fa-tables.sql
-- Clique em "Execute" (F5)
```

#### Script 7: Auditoria
```sql
-- Copie e cole o conteúdo de: scripts/create-audit-logs-table.sql
-- Clique em "Execute" (F5)
```

#### Script 8: LGPD
```sql
-- Copie e cole o conteúdo de: scripts/create-lgpd-tables.sql
-- Clique em "Execute" (F5)
```

#### Script 9: Rate Limiting
```sql
-- Copie e cole o conteúdo de: scripts/create-rate-limit-tables.sql
-- Clique em "Execute" (F5)
```

#### Script 10: Planejamento de Viagem
```sql
-- Copie e cole o conteúdo de: scripts/create-trip-planning-tables.sql
-- Clique em "Execute" (F5)
```

#### Script 11: Polls no Chat
```sql
-- Copie e cole o conteúdo de: scripts/create-group-chat-polls-table.sql
-- Clique em "Execute" (F5)
```

### Passo 3: Verificar Execução
Após cada script, verifique:
- ✅ Mensagem "Query returned successfully"
- ✅ Sem erros na aba "Messages"
- ✅ Tabelas criadas (verifique em: **Schemas** → **public** → **Tables**)

---

## 💻 MÉTODO 2: EXECUÇÃO VIA psql (Linha de Comando)

### Passo 1: Abrir Terminal PowerShell
1. Pressione `Win + X`
2. Selecione **Windows PowerShell** ou **Terminal**
3. Navegue até o diretório do projeto:
```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
```

### Passo 2: Configurar Variável de Ambiente
```powershell
$env:PGPASSWORD = "sua_senha_aqui"
```

### Passo 3: Executar Scripts (Ordem Recomendada)

#### Script 1: Índices
```powershell
psql -U postgres -d onboarding_rsv_db -f scripts/create-database-indexes.sql
```

#### Script 2: Credenciais
```powershell
psql -U postgres -d rsv_360_db -f scripts/create-credentials-table.sql
```

#### Script 3: Logs
```powershell
psql -U postgres -d rsv_360_db -f scripts/create-logs-table.sql
```

#### Script 4: Notificações
```powershell
psql -U postgres -d rsv_360_db -f scripts/create-notification-queue-table.sql
```

#### Script 5: Buscas Salvas
```powershell
psql -U postgres -d rsv_360_db -f scripts/create-saved-searches-table.sql
```

#### Script 6: 2FA
```powershell
psql -U postgres -d rsv_360_db -f scripts/create-2fa-tables.sql
```

#### Script 7: Auditoria
```powershell
psql -U postgres -d rsv_360_db -f scripts/create-audit-logs-table.sql
```

#### Script 8: LGPD
```powershell
psql -U postgres -d rsv_360_db -f scripts/create-lgpd-tables.sql
```

#### Script 9: Rate Limiting
```powershell
psql -U postgres -d rsv_360_db -f scripts/create-rate-limit-tables.sql
```

#### Script 10: Planejamento de Viagem
```powershell
psql -U postgres -d rsv_360_db -f scripts/create-trip-planning-tables.sql
```

#### Script 11: Polls no Chat
```powershell
psql -U postgres -d rsv_360_db -f scripts/create-group-chat-polls-table.sql
```

### Passo 4: Verificar Execução
Após cada comando, verifique:
- ✅ Mensagem "CREATE TABLE" ou "CREATE INDEX"
- ✅ Sem mensagens de erro
- ✅ Retorno ao prompt do PowerShell

---

## 🤖 MÉTODO 3: EXECUÇÃO AUTOMATIZADA (PowerShell Script)

### Passo 1: Abrir Terminal PowerShell
```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
```

### Passo 2: Executar Script Automatizado
```powershell
.\scripts\executar-sql-scripts.ps1 -DBPassword "sua_senha_aqui"
```

**Nota:** O script tentará executar todos os scripts SQL automaticamente.

### Passo 3: Verificar Execução
O script mostrará o resultado de cada execução.

---

## 📋 ORDEM DE EXECUÇÃO RECOMENDADA

Execute os scripts nesta ordem para evitar problemas de dependências:

### Fase 1: Base (Sem Dependências)
1. ✅ `create-database-indexes.sql`
2. ✅ `create-logs-table.sql`
3. ✅ `create-notification-queue-table.sql`
4. ✅ `create-rate-limit-tables.sql`

### Fase 2: Dependem de `users`
5. ✅ `create-credentials-table.sql`
6. ✅ `create-saved-searches-table.sql`
7. ✅ `create-2fa-tables.sql`
8. ✅ `create-audit-logs-table.sql`
9. ✅ `create-lgpd-tables.sql`
10. ✅ `create-trip-planning-tables.sql`

### Fase 3: Dependem de Outras Tabelas
11. ✅ `create-group-chat-polls-table.sql` (depende de `group_chat_messages`)

---

## ✅ VERIFICAÇÃO PÓS-EXECUÇÃO

### Verificar Tabelas Criadas

#### Via pgAdmin:
1. Abra pgAdmin
2. Navegue: **Servers** → **PostgreSQL** → **Databases** → **onboarding_rsv_db** → **Schemas** → **public** → **Tables**
3. Verifique se as seguintes tabelas existem:
   - ✅ `credentials`
   - ✅ `application_logs`
   - ✅ `notification_queue`
   - ✅ `saved_searches`
   - ✅ `two_factor_auth`
   - ✅ `two_factor_backup_codes`
   - ✅ `audit_logs`
   - ✅ `lgpd_consents`
   - ✅ `lgpd_data_requests`
   - ✅ `rate_limit_attempts`
   - ✅ `trip_plans`
   - ✅ `trip_members`
   - ✅ `trip_tasks`
   - ✅ `trip_itinerary`
   - ✅ `trip_expenses`
   - ✅ `trip_expense_splits`
   - ✅ `group_chat_polls`

#### Via psql:
```sql
-- Conectar ao banco
psql -U postgres -d rsv_360_db

-- Listar tabelas
\dt

-- Verificar tabela específica
\d credentials
\d application_logs
\d notification_queue
-- ... etc
```

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Erro: "relation already exists"
**Causa:** Tabela já existe no banco  
**Solução:** 
- Opção 1: Ignorar (tabela já criada)
- Opção 2: Remover tabela e recriar:
```sql
DROP TABLE IF EXISTS nome_da_tabela CASCADE;
-- Depois execute o script novamente
```

### Erro: "relation 'users' does not exist"
**Causa:** Tabela `users` não existe  
**Solução:** 
- Execute primeiro os scripts de criação de tabelas básicas
- Ou crie a tabela `users` manualmente

### Erro: "permission denied"
**Causa:** Usuário sem permissões  
**Solução:**
```sql
-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE rsv_360_db TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
```

### Erro: "psql: command not found"
**Causa:** PostgreSQL não está no PATH  
**Solução:**
```powershell
# Adicionar ao PATH temporariamente
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
# Ou usar caminho completo
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d rsv_360_db -f scripts/create-database-indexes.sql
```

### Erro: "FATAL: password authentication failed"
**Causa:** Senha incorreta  
**Solução:**
- Verifique a senha do PostgreSQL
- Use pgAdmin para testar a conexão
- Ou redefina a senha:
```sql
ALTER USER postgres WITH PASSWORD 'nova_senha';
```

---

## 📊 CHECKLIST DE EXECUÇÃO

Use este checklist para acompanhar o progresso:

### Fase 1: Base
- [ ] `create-database-indexes.sql`
- [ ] `create-logs-table.sql`
- [ ] `create-notification-queue-table.sql`
- [ ] `create-rate-limit-tables.sql`

### Fase 2: Dependem de users
- [ ] `create-credentials-table.sql`
- [ ] `create-saved-searches-table.sql`
- [ ] `create-2fa-tables.sql`
- [ ] `create-audit-logs-table.sql`
- [ ] `create-lgpd-tables.sql`
- [ ] `create-trip-planning-tables.sql`

### Fase 3: Dependem de outras tabelas
- [ ] `create-group-chat-polls-table.sql`

### Verificação Final
- [ ] Todas as tabelas criadas
- [ ] Índices criados
- [ ] Sem erros no banco
- [ ] Testes podem ser executados

---

## 🎯 PRÓXIMOS PASSOS APÓS EXECUÇÃO

Após executar todos os scripts SQL:

1. **Executar Testes:**
```bash
npm test tests/integration/enhanced-services.test.ts
```

2. **Testar Rotas API:**
```bash
npm run dev
# Testar endpoints em http://localhost:3000
```

3. **Verificar Funcionalidades:**
- Acessar `/admin/credenciais` e testar salvamento
- Criar wishlist e testar votação
- Criar split payment
- Testar chat em grupo

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Verifique os logs:**
   - pgAdmin: Aba "Messages"
   - psql: Mensagens no terminal

2. **Consulte a documentação:**
   - `GUIA_EXECUCAO_SQL_POSTGRESQL.md`
   - `PROBLEMA_AUTENTICACAO_POSTGRES.md`

3. **Execute verificação:**
```sql
-- Verificar se tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'credentials',
  'application_logs',
  'notification_queue',
  'saved_searches',
  'two_factor_auth',
  'audit_logs',
  'lgpd_consents',
  'rate_limit_attempts',
  'trip_plans',
  'group_chat_polls'
);
```

---

## ✅ CONCLUSÃO

Após executar todos os scripts SQL:

- ✅ **11 tabelas criadas**
- ✅ **Índices otimizados**
- ✅ **Sistema pronto para uso**
- ✅ **Testes podem ser executados**
- ✅ **Funcionalidades avançadas habilitadas**

**Tempo total estimado:** 15-30 minutos  
**Dificuldade:** Fácil a Média

---

**Documento criado:** 2025-01-30  
**Versão:** 1.0  
**Status:** ✅ Guia Completo

