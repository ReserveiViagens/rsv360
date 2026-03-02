# 🚀 GUIA COMPLETO - PRÓXIMOS PASSOS APÓS EXECUTAR SQL

**Data:** 2025-01-30  
**Status:** Guia Detalhado Passo a Passo

---

## 📋 RESUMO DOS PRÓXIMOS PASSOS

1. ✅ **Verificar tabelas criadas no pgAdmin**
2. ✅ **Executar testes: npm test**
3. ✅ **Testar funcionalidades no sistema**

---

## 1️⃣ VERIFICAR TABELAS CRIADAS NO pgAdmin

### Passo 1: Abrir pgAdmin
1. Abra o **pgAdmin 4**
2. Conecte-se ao servidor **"localhost"** ou **"PostgreSQL 18"**
3. Expanda: **Servers** → **[seu_servidor]** → **Databases**

### Passo 2: Selecionar o Banco
1. Expanda: **Databases** → **onboarding_rsv_db**
2. Expanda: **Schemas** → **public** → **Tables**

### Passo 3: Verificar Tabelas Criadas

Você deve ver as seguintes tabelas novas:

#### Fase 1: Base
- ✅ `application_logs` - Logs da aplicação
- ✅ `notification_queue` - Fila de notificações
- ✅ `rate_limit_attempts` - Tentativas de rate limiting
- ✅ Índices criados (verificar em: **Indexes**)

#### Fase 2: Dependem de users
- ✅ `credentials` - Credenciais criptografadas
- ✅ `saved_searches` - Buscas salvas
- ✅ `two_factor_auth` - Autenticação 2FA
- ✅ `two_factor_backup_codes` - Códigos de backup 2FA
- ✅ `audit_logs` - Logs de auditoria
- ✅ `lgpd_consents` - Consentimentos LGPD
- ✅ `lgpd_data_requests` - Solicitações LGPD
- ✅ `trip_plans` - Planos de viagem
- ✅ `trip_members` - Membros do plano
- ✅ `trip_tasks` - Tarefas do plano
- ✅ `trip_itinerary` - Itinerário
- ✅ `trip_expenses` - Despesas
- ✅ `trip_expense_splits` - Divisão de despesas

#### Fase 3: Dependem de outras tabelas
- ✅ `group_chat_polls` - Polls no chat (requer `group_chat_messages`)

### Passo 4: Verificar Estrutura de uma Tabela

1. Clique com botão direito em uma tabela (ex: `credentials`)
2. Selecione **Properties**
3. Vá na aba **Columns** para ver as colunas
4. Vá na aba **Indexes** para ver os índices

### Passo 5: Verificar Índices

1. Expanda: **Schemas** → **public** → **Indexes**
2. Deve haver vários índices criados, como:
   - `idx_credentials_service`
   - `idx_application_logs_level`
   - `idx_trip_plans_created_by`
   - etc.

### ✅ Checklist de Verificação

- [ ] Tabela `credentials` existe
- [ ] Tabela `application_logs` existe
- [ ] Tabela `notification_queue` existe
- [ ] Tabela `saved_searches` existe
- [ ] Tabela `two_factor_auth` existe
- [ ] Tabela `audit_logs` existe
- [ ] Tabela `lgpd_consents` existe
- [ ] Tabela `trip_plans` existe
- [ ] Tabela `trip_members` existe
- [ ] Tabela `trip_tasks` existe
- [ ] Tabela `trip_itinerary` existe
- [ ] Tabela `trip_expenses` existe
- [ ] Tabela `trip_expense_splits` existe
- [ ] Tabela `group_chat_polls` existe (se `group_chat_messages` existir)
- [ ] Índices criados

### 🔍 Query SQL para Verificar Todas as Tabelas

Execute no Query Tool do pgAdmin:

```sql
-- Listar todas as tabelas criadas pelos scripts
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'credentials',
  'application_logs',
  'notification_queue',
  'saved_searches',
  'two_factor_auth',
  'two_factor_backup_codes',
  'audit_logs',
  'lgpd_consents',
  'lgpd_data_requests',
  'rate_limit_attempts',
  'trip_plans',
  'trip_members',
  'trip_tasks',
  'trip_itinerary',
  'trip_expenses',
  'trip_expense_splits',
  'group_chat_polls'
)
ORDER BY table_name;
```

**Resultado esperado:** 17 linhas (ou 16 se `group_chat_polls` não puder ser criada)

---

## 2️⃣ EXECUTAR TESTES: npm test

### Passo 1: Verificar Configuração

1. Abra o terminal no diretório do projeto:
```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
```

2. Verifique se as dependências estão instaladas:
```powershell
npm list jest @jest/globals jest-environment-jsdom
```

Se não estiverem instaladas:
```powershell
npm install --save-dev jest @jest/globals jest-environment-jsdom @testing-library/react @testing-library/dom
```

### Passo 2: Configurar Variáveis de Ambiente

Crie ou atualize o arquivo `.env` com:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=onboarding_rsv_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=seu_jwt_secret_aqui

# Outras variáveis necessárias
NODE_ENV=test
```

### Passo 3: Executar Testes

#### Opção A: Todos os Testes
```powershell
npm test
```

#### Opção B: Testes Específicos
```powershell
# Testes de integração
npm test tests/integration/

# Testes de serviços avançados
npm test tests/integration/enhanced-services.test.ts

# Testes de API
npm test tests/integration/api.test.ts
```

#### Opção C: Com Cobertura
```powershell
npm test -- --coverage
```

### Passo 4: Interpretar Resultados

#### ✅ Sucesso
```
PASS  tests/integration/enhanced-services.test.ts
  Enhanced Services Integration Tests
    Enhanced Wishlist Voting
      ✓ should vote on wishlist item
      ✓ should get vote result
      ✓ should get wishlist ranking
    ...

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

#### ⚠️ Erros Comuns

**Erro: "relation does not exist"**
- **Causa:** Tabelas SQL não foram criadas
- **Solução:** Execute os scripts SQL primeiro

**Erro: "Cannot find module"**
- **Causa:** Dependências faltando
- **Solução:** `npm install`

**Erro: "Database connection failed"**
- **Causa:** Credenciais incorretas ou banco não existe
- **Solução:** Verifique `.env` e conexão com PostgreSQL

### Passo 5: Verificar Cobertura

```powershell
npm test -- --coverage
```

Verifique:
- **Statements:** % de código testado
- **Branches:** % de branches testadas
- **Functions:** % de funções testadas
- **Lines:** % de linhas testadas

**Meta:** > 70% de cobertura

### ✅ Checklist de Testes

- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Testes executados sem erros
- [ ] Todos os testes passaram
- [ ] Cobertura verificada

---

## 3️⃣ TESTAR FUNCIONALIDADES NO SISTEMA

### Passo 1: Iniciar o Servidor

#### Terminal 1: Servidor de Desenvolvimento
```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
npm run dev
```

Aguarde até ver:
```
✓ Ready in Xs
○ Local: http://localhost:3000
```

### Passo 2: Testar Funcionalidades Básicas

#### 2.1. Autenticação
1. Acesse: `http://localhost:3000/login`
2. Faça login com credenciais válidas
3. Verifique se redireciona para dashboard

#### 2.2. Dashboard
1. Acesse: `http://localhost:3000/admin/dashboard`
2. Verifique se métricas são exibidas
3. Verifique se gráficos carregam

### Passo 3: Testar Funcionalidades Avançadas

#### 3.1. Wishlists com Votação
1. Acesse: `http://localhost:3000/wishlists`
2. Crie uma nova wishlist
3. Adicione itens
4. Teste a votação:
   - Clique em "Aprovar", "Rejeitar" ou "Indeciso"
   - Verifique se os votos são atualizados
   - Verifique se o ranking é exibido

#### 3.2. Split Payment
1. Acesse: `http://localhost:3000/bookings/[id]/split-payment`
2. Crie um split payment
3. Adicione participantes
4. Teste o pagamento de um participante
5. Verifique se o status é atualizado

#### 3.3. Chat em Grupo Avançado
1. Acesse: `http://localhost:3000/group-chat/[id]`
2. Clique em "UI Avançada"
3. Envie mensagens
4. Teste reações (emoji)
5. Teste busca de mensagens
6. Crie uma poll (se disponível)

#### 3.4. Planejamento de Viagem
1. Acesse: `http://localhost:3000/trips`
2. Crie um novo plano de viagem
3. Adicione tarefas
4. Adicione itens ao itinerário
5. Adicione despesas
6. Verifique o resumo financeiro

#### 3.5. Analytics Avançado
1. Acesse: `http://localhost:3000/admin/analytics/advanced`
2. Selecione uma propriedade
3. Defina período (data início e fim)
4. Verifique as abas:
   - **Revenue Forecast** - Deve mostrar forecast
   - **Demand Heatmap** - Deve mostrar mapa de calor
   - **Competitor Benchmark** - Deve mostrar comparação

### Passo 4: Testar Integrações

#### 4.1. Credenciais
1. Acesse: `http://localhost:3000/admin/credenciais`
2. Vá na aba "Monitoramento"
3. Configure Sentry DSN (se tiver)
4. Configure LogRocket App ID (se tiver)
5. Teste os botões "Testar Sentry" e "Testar LogRocket"

#### 4.2. Integrações OTA
1. Acesse: `http://localhost:3000/admin/credenciais`
2. Configure credenciais do Airbnb
3. Configure credenciais do Cloudbeds
4. Teste a sincronização

### Passo 5: Testar APIs Diretamente

#### 5.1. Usando Postman ou curl

**Teste Wishlist Voting:**
```bash
curl http://localhost:3000/api/wishlists/1/vote?itemId=1&type=result
```

**Teste Split Payment:**
```bash
curl http://localhost:3000/api/split-payments?id=1
```

**Teste Trips:**
```bash
curl http://localhost:3000/api/trips?id=1
```

**Teste Analytics:**
```bash
curl "http://localhost:3000/api/analytics/forecast?propertyId=1&startDate=2025-07-01&endDate=2025-07-31"
```

#### 5.2. Verificar Respostas

Todas as respostas devem ter formato:
```json
{
  "success": true,
  "data": { ... }
}
```

### Passo 6: Verificar Logs

#### 6.1. Logs no Console
- Verifique o terminal onde o servidor está rodando
- Procure por erros ou avisos

#### 6.2. Logs no Banco de Dados
Execute no pgAdmin:
```sql
-- Ver últimos logs
SELECT * FROM application_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

#### 6.3. Logs do Sentry/LogRocket
- Se configurado, verifique o dashboard do Sentry
- Se configurado, verifique o dashboard do LogRocket

### ✅ Checklist de Testes de Funcionalidades

#### Funcionalidades Básicas
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Navegação funciona

#### Funcionalidades Avançadas
- [ ] Wishlists com votação funciona
- [ ] Split payment funciona
- [ ] Chat em grupo avançado funciona
- [ ] Planejamento de viagem funciona
- [ ] Analytics avançado funciona

#### Integrações
- [ ] Credenciais podem ser salvas
- [ ] Integrações OTA podem ser configuradas
- [ ] APIs retornam dados corretos

#### Logs e Monitoramento
- [ ] Logs são salvos no banco
- [ ] Sentry funciona (se configurado)
- [ ] LogRocket funciona (se configurado)

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Problema: Tabelas não aparecem no pgAdmin

**Solução:**
1. Verifique se executou os scripts SQL
2. Verifique se está no banco correto (`onboarding_rsv_db`)
3. Execute a query de verificação acima

### Problema: Testes falham

**Solução:**
1. Verifique se tabelas SQL foram criadas
2. Verifique variáveis de ambiente
3. Verifique conexão com banco
4. Execute: `npm install` para garantir dependências

### Problema: Servidor não inicia

**Solução:**
1. Verifique se porta 3000 está livre
2. Verifique variáveis de ambiente
3. Verifique logs de erro no console
4. Tente: `npm run build` e depois `npm start`

### Problema: APIs retornam erro 500

**Solução:**
1. Verifique logs no console do servidor
2. Verifique se tabelas existem
3. Verifique se credenciais estão corretas
4. Verifique logs no banco: `SELECT * FROM application_logs ORDER BY created_at DESC LIMIT 10`

---

## 📊 RESUMO DO PROGRESSO

### ✅ Concluído
- [x] Scripts SQL criados
- [x] Scripts atualizados com banco correto
- [x] Guias criados

### ⏳ Em Andamento
- [ ] Scripts SQL executados
- [ ] Tabelas verificadas
- [ ] Testes executados
- [ ] Funcionalidades testadas

---

## 🎯 ORDEM RECOMENDADA DE EXECUÇÃO

1. **Primeiro:** Executar scripts SQL
   ```powershell
   .\scripts\executar-todos-sql-scripts.ps1
   ```

2. **Segundo:** Verificar tabelas no pgAdmin
   - Use a query SQL fornecida acima

3. **Terceiro:** Executar testes
   ```powershell
   npm test
   ```

4. **Quarto:** Iniciar servidor e testar
   ```powershell
   npm run dev
   ```

---

**Documento criado:** 2025-01-30  
**Versão:** 1.0  
**Status:** ✅ Guia Completo

