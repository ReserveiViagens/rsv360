# 🔧 GUIA COMPLETO DE CONFIGURAÇÃO - .env

**Data:** 2025-12-13  
**Objetivo:** Configurar todas as variáveis de ambiente necessárias

> 📚 **Para guias detalhados passo a passo, consulte:**
> - **PostgreSQL:** [`docs/configuracao/GUIA_POSTGRESQL.md`](../docs/configuracao/GUIA_POSTGRESQL.md)
> - **Chaves de API:** [`docs/configuracao/GUIA_CHAVES_API.md`](../docs/configuracao/GUIA_CHAVES_API.md)

---

## 📋 ÍNDICE

1. [Configurar DATABASE_URL](#1-configurar-database_url)
2. [Obter Chaves de API](#2-obter-chaves-de-api)
3. [Configurar .env](#3-configurar-env)
4. [Validar Configuração](#4-validar-configuração)
5. [Executar Setup](#5-executar-setup)

---

## 1. CONFIGURAR DATABASE_URL

### Opção A: String de Conexão Completa (Recomendado)

```bash
DATABASE_URL=postgresql://usuario:senha@localhost:5432/rsv360_dev
```

**Exemplo:**
```bash
DATABASE_URL=postgresql://postgres:minhasenha123@localhost:5432/rsv360_dev
```

### Opção B: Variáveis Individuais

Se preferir usar variáveis individuais, configure:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rsv360_dev
DB_USER=postgres
DB_PASSWORD=minhasenha123
```

### Como Obter as Credenciais:

1. **Se você já tem PostgreSQL instalado:**
   - Usuário padrão: `postgres`
   - Senha: a que você configurou durante a instalação
   - Porta padrão: `5432`

2. **Se você usa Docker:**
   ```bash
   docker run --name postgres-rsv360 \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=minhasenha123 \
     -e POSTGRES_DB=rsv360_dev \
     -p 5432:5432 \
     -d postgres:15
   ```

3. **Se você usa um serviço cloud (AWS RDS, Azure, etc.):**
   - Use a string de conexão fornecida pelo serviço
   - Exemplo AWS: `postgresql://usuario:senha@seu-endpoint.rds.amazonaws.com:5432/rsv360_dev`

---

## 2. OBTER CHAVES DE API

### 2.1 Google Maps API Key

**Passo a Passo:**

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Ative a **Maps JavaScript API** e **Geocoding API**
4. Vá em **Credenciais** → **Criar credenciais** → **Chave de API**
5. Copie a chave (formato: `AIzaSyC...`)

**Adicionar ao .env:**
```bash
GOOGLE_MAPS_API_KEY=AIzaSyC_sua_chave_aqui
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_sua_chave_aqui
```

**Custo:** Primeiros $200/mês são gratuitos

---

### 2.2 Google Vision API Key

**Passo a Passo:**

1. No mesmo projeto do Google Cloud
2. Ative a **Cloud Vision API**
3. Vá em **Credenciais** → **Criar credenciais** → **Chave de API**
4. Copie a chave

**Adicionar ao .env:**
```bash
GOOGLE_VISION_API_KEY=sua_chave_aqui
```

**OU usar Service Account (Recomendado para produção):**

1. Vá em **IAM & Admin** → **Service Accounts**
2. Crie uma nova conta de serviço
3. Baixe o arquivo JSON de credenciais
4. Coloque em um local seguro (ex: `C:\credentials\google-vision.json`)

**Adicionar ao .env:**
```bash
GOOGLE_APPLICATION_CREDENTIALS=C:\credentials\google-vision.json
```

**Custo:** Primeiros 1.000 requisições/mês são gratuitas

---

### 2.3 Stripe Secret Key

**Passo a Passo:**

1. Acesse: https://dashboard.stripe.com/
2. Faça login ou crie uma conta
3. Vá em **Developers** → **API keys**
4. Copie a **Secret key** (formato: `sk_test_...` para teste ou `sk_live_...` para produção)

**Adicionar ao .env:**
```bash
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
STRIPE_PUBLIC_KEY=pk_test_sua_chave_aqui
```

**Para Webhook:**
1. Vá em **Developers** → **Webhooks**
2. Adicione endpoint: `https://seu-dominio.com/api/webhooks/stripe`
3. Copie o **Signing secret** (formato: `whsec_...`)

**Adicionar ao .env:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_aqui
```

**Custo:** 2.9% + R$ 0,30 por transação bem-sucedida

---

### 2.4 Mercado Pago Access Token

**Passo a Passo:**

1. Acesse: https://www.mercadopago.com.br/developers/
2. Faça login ou crie uma conta
3. Vá em **Suas integrações** → **Criar aplicação**
4. Copie o **Access Token** (formato: `APP_USR_...`)

**Adicionar ao .env:**
```bash
MERCADOPAGO_ACCESS_TOKEN=APP_USR_sua_chave_aqui
MERCADO_PAGO_PUBLIC_KEY=APP_USR_sua_chave_aqui
```

**Para Webhook:**
1. Configure a URL do webhook na aplicação
2. Copie o secret se fornecido

**Adicionar ao .env:**
```bash
MERCADOPAGO_WEBHOOK_SECRET=seu_secret_aqui
```

**Custo:** 4.99% + R$ 0,39 por transação

---

## 3. CONFIGURAR .env

### 3.1 Editar o Arquivo .env

Abra o arquivo `.env` no editor de texto e preencha as variáveis:

```bash
# ===========================================
# BANCO DE DADOS (OBRIGATÓRIO)
# ===========================================
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/rsv360_dev

# OU use variáveis individuais:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=rsv360_dev
# DB_USER=postgres
# DB_PASSWORD=SUA_SENHA

# ===========================================
# AUTENTICAÇÃO (OBRIGATÓRIO)
# ===========================================
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_minimo_32_caracteres

# ===========================================
# API BACKEND (OBRIGATÓRIO)
# ===========================================
NEXT_PUBLIC_API_URL=http://localhost:5002
PORT=5002

# ===========================================
# GOOGLE MAPS API (OBRIGATÓRIO para geocodificação)
# ===========================================
GOOGLE_MAPS_API_KEY=AIzaSyC_SUA_CHAVE_AQUI
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_SUA_CHAVE_AQUI

# ===========================================
# GOOGLE VISION API (OPCIONAL - para análise de imagens)
# ===========================================
GOOGLE_VISION_API_KEY=SUA_CHAVE_AQUI
# OU use Service Account:
# GOOGLE_APPLICATION_CREDENTIALS=C:\caminho\para\credentials.json

# ===========================================
# STRIPE (OBRIGATÓRIO para pagamentos)
# ===========================================
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_AQUI
STRIPE_PUBLIC_KEY=pk_test_SUA_CHAVE_AQUI
STRIPE_WEBHOOK_SECRET=whsec_SUA_CHAVE_AQUI

# ===========================================
# MERCADO PAGO (OPCIONAL - alternativa ao Stripe)
# ===========================================
MERCADOPAGO_ACCESS_TOKEN=APP_USR_SUA_CHAVE_AQUI
MERCADO_PAGO_PUBLIC_KEY=APP_USR_SUA_CHAVE_AQUI
MERCADOPAGO_WEBHOOK_SECRET=SEU_SECRET_AQUI

# ===========================================
# REDIS (OPCIONAL - para cache)
# ===========================================
REDIS_URL=redis://localhost:6379

# ===========================================
# EMAIL SMTP (OPCIONAL)
# ===========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
EMAIL_FROM=noreply@rsv360.com
```

### 3.2 Template Rápido

Copie e cole no seu `.env`:

```bash
# BANCO DE DADOS
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/rsv360_dev

# AUTENTICAÇÃO
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_minimo_32_caracteres_aleatorios

# API
NEXT_PUBLIC_API_URL=http://localhost:5002
PORT=5002

# GOOGLE MAPS
GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI

# GOOGLE VISION (opcional)
GOOGLE_VISION_API_KEY=SUA_CHAVE_AQUI

# STRIPE
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_AQUI
STRIPE_PUBLIC_KEY=pk_test_SUA_CHAVE_AQUI

# MERCADO PAGO (opcional)
MERCADOPAGO_ACCESS_TOKEN=APP_USR_SUA_CHAVE_AQUI

# REDIS (opcional)
REDIS_URL=redis://localhost:6379
```

---

## 4. VALIDAR CONFIGURAÇÃO

Após preencher o `.env`, valide:

```bash
npm run validate:env
```

**Resultado Esperado:**
```
✅ DATABASE_URL
✅ JWT_SECRET
✅ NEXT_PUBLIC_API_URL
✅ GOOGLE_MAPS_API_KEY
✅ STRIPE_SECRET_KEY
...
✅ Todas as variáveis obrigatórias estão definidas!
```

---

## 5. EXECUTAR SETUP

Após validar, execute o setup completo:

```bash
npm run setup
```

**O que o setup faz:**
1. ✅ Valida variáveis de ambiente (`validate:env`)
2. ✅ Executa migrations (`migrate`)
3. ✅ Insere dados iniciais (`seed`)

**Tempo estimado:** 2-5 minutos

---

## 🔍 TROUBLESHOOTING

### Erro: "autenticação do tipo senha falhou"

**Solução:**
- Verifique se a senha do PostgreSQL está correta
- Verifique se o usuário existe: `psql -U postgres -c "\du"`
- Verifique se o banco existe: `psql -U postgres -c "\l"`

### Erro: "DATABASE_URL não está definida"

**Solução:**
- Verifique se o arquivo `.env` está na raiz do projeto
- Verifique se não há espaços antes/ depois do `=`
- Reinicie o terminal após editar `.env`

### Erro: "Cannot find module"

**Solução:**
- Execute `npm install` para instalar dependências
- Verifique se está no diretório correto

### Erro: "Google Maps API key invalid"

**Solução:**
- Verifique se a chave está correta (sem espaços)
- Verifique se as APIs estão ativadas no Google Cloud Console
- Verifique se há restrições de IP/domínio na chave

---

## 📝 CHECKLIST FINAL

Antes de executar `npm run setup`, verifique:

- [ ] `DATABASE_URL` configurada corretamente
- [ ] `JWT_SECRET` tem pelo menos 32 caracteres
- [ ] `NEXT_PUBLIC_API_URL` configurada
- [ ] `GOOGLE_MAPS_API_KEY` obtida e configurada
- [ ] `STRIPE_SECRET_KEY` obtida e configurada (ou Mercado Pago)
- [ ] Arquivo `.env` salvo
- [ ] `npm run validate:env` passou sem erros

---

## 🚀 PRÓXIMOS PASSOS

Após configurar tudo:

1. **Validar ambiente:**
   ```bash
   npm run validate:env
   ```

2. **Executar setup:**
   ```bash
   npm run setup
   ```

3. **Testar integrações:**
   ```bash
   npm run test:integrations
   ```

4. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

---

**Última atualização:** 2025-12-13
