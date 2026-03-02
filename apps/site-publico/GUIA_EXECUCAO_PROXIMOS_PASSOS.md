# 🚀 GUIA DE EXECUÇÃO DOS PRÓXIMOS PASSOS

## 📋 ÍNDICE

1. [Executar Scripts SQL](#1-executar-scripts-sql)
2. [Configurar Variáveis de Ambiente](#2-configurar-variáveis-de-ambiente)
3. [Executar Testes](#3-executar-testes)

---

## 1️⃣ EXECUTAR SCRIPTS SQL

### Opção A: Script Automático (Recomendado)

```bash
# Certifique-se de que as variáveis de ambiente do banco estão configuradas
node scripts/run-all-sql-scripts.js
```

**Requisitos:**
- Variáveis de ambiente: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### Opção B: Execução Manual

Execute cada script SQL manualmente no seu cliente PostgreSQL:

```bash
# 1. Índices de banco de dados
psql -U postgres -d rsv_360_db -f scripts/create-database-indexes.sql

# 2. Fila de notificações
psql -U postgres -d rsv_360_db -f scripts/create-notification-queue-table.sql

# 3. Buscas salvas
psql -U postgres -d rsv_360_db -f scripts/create-saved-searches-table.sql

# 4. Tabelas 2FA
psql -U postgres -d rsv_360_db -f scripts/create-2fa-tables.sql

# 5. Logs de auditoria
psql -U postgres -d rsv_360_db -f scripts/create-audit-logs-table.sql

# 6. Tabelas LGPD
psql -U postgres -d rsv_360_db -f scripts/create-lgpd-tables.sql

# 7. Rate limiting
psql -U postgres -d rsv_360_db -f scripts/create-rate-limit-tables.sql
```

### Scripts SQL Criados:

1. ✅ `create-database-indexes.sql` - Índices para otimização
2. ✅ `create-notification-queue-table.sql` - Fila de notificações
3. ✅ `create-saved-searches-table.sql` - Buscas salvas
4. ✅ `create-2fa-tables.sql` - Autenticação de dois fatores
5. ✅ `create-audit-logs-table.sql` - Logs de auditoria
6. ✅ `create-lgpd-tables.sql` - Compliance LGPD
7. ✅ `create-rate-limit-tables.sql` - Rate limiting

---

## 2️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE

### Opção A: Script Interativo (PowerShell)

```powershell
.\scripts\setup-env-variables.ps1
```

O script irá:
- Criar `.env` se não existir (copiando de `env.example`)
- Solicitar valores para cada variável
- Atualizar o arquivo `.env` automaticamente

### Opção B: Edição Manual

Edite o arquivo `.env` e adicione/atualize as seguintes variáveis:

#### Redis (Obrigatório para cache)
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

#### Stripe (Opcional - para pagamentos)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### PayPal (Opcional - para pagamentos)
```env
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_ENVIRONMENT=sandbox  # ou 'production'
```

#### Booking.com (Opcional - para integração OTA)
```env
BOOKING_COM_CLIENT_ID=...
BOOKING_COM_CLIENT_SECRET=...
```

#### Expedia (Opcional - para integração OTA)
```env
EXPEDIA_CLIENT_ID=...
EXPEDIA_CLIENT_SECRET=...
```

### Como Obter as Credenciais:

#### Redis
- **Local:** Instale Redis localmente ou use Docker: `docker run -d -p 6379:6379 redis:7-alpine`
- **Produção:** Use serviço gerenciado (AWS ElastiCache, Redis Cloud, etc.)

#### Stripe
1. Acesse: https://dashboard.stripe.com/
2. Vá em **Developers > API keys**
3. Copie **Secret key** e **Webhook signing secret**

#### PayPal
1. Acesse: https://developer.paypal.com/
2. Crie uma aplicação
3. Copie **Client ID** e **Secret**

#### Booking.com
1. Acesse: https://admin.booking.com/
2. Vá em **API** ou entre em contato com suporte
3. Obtenha credenciais OAuth2

#### Expedia
1. Acesse: https://developer.expedia.com/
2. Crie uma conta de desenvolvedor
3. Obtenha credenciais OAuth2

---

## 3️⃣ EXECUTAR TESTES

### 3.1 Testes Unitários e de Integração

```bash
npm test
```

**O que será testado:**
- Testes unitários de serviços
- Testes de integração de APIs
- Validações e utilitários

### 3.2 Testes E2E com Playwright

**Instalar dependências do Playwright (se ainda não instalado):**
```bash
npx playwright install
```

**Executar testes E2E:**
```bash
npx playwright test
```

**Executar testes em modo UI (interativo):**
```bash
npx playwright test --ui
```

**Executar testes em navegador específico:**
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Ver relatório HTML:**
```bash
npx playwright show-report
```

### 3.3 Testes de Carga (Opcional)

**Instalar k6:**
- Windows: `choco install k6`
- Mac: `brew install k6`
- Linux: `sudo apt-get install k6`

**Executar testes de carga:**
```bash
k6 run tests/load/api-load.test.js
```

**Com variáveis customizadas:**
```bash
k6 run --env BASE_URL=http://localhost:3000 tests/load/api-load.test.js
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Após executar todos os passos, verifique:

- [ ] Scripts SQL executados sem erros
- [ ] Tabelas criadas no banco de dados
- [ ] Variáveis de ambiente configuradas no `.env`
- [ ] Redis acessível (se configurado)
- [ ] Testes unitários passando (`npm test`)
- [ ] Testes E2E passando (`npx playwright test`)
- [ ] Aplicação iniciando sem erros (`npm run dev`)

---

## 🐛 RESOLUÇÃO DE PROBLEMAS

### Erro ao executar scripts SQL

**Problema:** `password authentication failed`
- **Solução:** Verifique `DB_PASSWORD` no `.env`

**Problema:** `relation already exists`
- **Solução:** Tabela já existe, pode ignorar ou dropar antes

### Erro ao conectar ao Redis

**Problema:** `Redis connection failed`
- **Solução:** 
  - Verifique se Redis está rodando: `redis-cli ping`
  - Verifique `REDIS_HOST` e `REDIS_PORT` no `.env`
  - O sistema usará cache em memória como fallback

### Erro nos testes

**Problema:** `Cannot find module`
- **Solução:** Execute `npm install --legacy-peer-deps`

**Problema:** `Playwright browsers not installed`
- **Solução:** Execute `npx playwright install`

---

## 📚 PRÓXIMOS PASSOS (Após Testes)

1. **Configurar credenciais reais** nas páginas de admin (`/admin/credenciais`)
2. **Testar integrações** (Stripe, PayPal, Booking.com, Expedia)
3. **Configurar monitoramento** (Sentry, LogRocket)
4. **Preparar para deploy** (quando solicitado)

---

**Documento criado:** 2025-01-30  
**Versão:** 1.0

