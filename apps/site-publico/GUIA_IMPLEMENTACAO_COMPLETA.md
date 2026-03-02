# 🚀 GUIA COMPLETO DE IMPLEMENTAÇÃO - FASE 1 E FASE 2

**Data:** 27/11/2025  
**Sistema:** RSV 360° - Implementações Avançadas  
**Status:** ✅ TODAS AS IMPLEMENTAÇÕES CRIADAS

---

## 📋 RESUMO DAS IMPLEMENTAÇÕES

### ✅ FASE 1 - IMPLEMENTADO (9/9 tarefas)

1. ✅ **Calendário Avançado + Preços Dinâmicos**
2. ✅ **Sincronização iCal bidirecional**
3. ✅ **WhatsApp Business API + 18 templates**
4. ✅ **Bot Telegram completo**
5. ✅ **Facebook Messenger + Instagram Direct**
6. ✅ **Check-in online + Contrato digital**
7. ✅ **Fechaduras Inteligentes**
8. ✅ **Verificação de Identidade**
9. ✅ **Deploy + Sentry** (estrutura criada)

---

## 🗄️ PASSO 1: EXECUTAR SCRIPTS SQL

### 1.1. Executar Scripts de Criação de Tabelas

```bash
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
node scripts/executar-todas-implementacoes.js
```

**Ou manualmente:**

```bash
# Via psql
psql -U seu_usuario -d seu_banco -f scripts/create-calendar-tables.sql
psql -U seu_usuario -d seu_banco -f scripts/create-checkin-tables.sql
```

**Tabelas criadas:**
- `property_calendars` - Calendário e preços dinâmicos
- `blocked_dates` - Datas bloqueadas
- `events_calendar` - Eventos para preços dinâmicos (15 eventos Caldas Novas já inseridos)
- `pricing_rules` - Regras de precificação
- `access_logs` - Logs de fechaduras
- `smart_locks` - Configuração de fechaduras
- `checkins` - Check-ins online
- `checkin_documents` - Documentos do check-in
- `contracts` - Contratos digitais
- `identity_verifications` - Verificações de identidade

---

## 📦 PASSO 2: INSTALAR DEPENDÊNCIAS

```bash
npm install --save ical-generator node-ical googleapis google-auth-library telegraf date-fns axios
```

**Dependências instaladas:**
- ✅ `ical-generator` - Geração de arquivos iCal
- ✅ `node-ical` - Parsing de arquivos iCal
- ✅ `googleapis` - Integração Google Calendar
- ✅ `google-auth-library` - Autenticação Google
- ✅ `telegraf` - Bot Telegram
- ✅ `date-fns` - Manipulação de datas
- ✅ `axios` - Requisições HTTP

---

## ⚙️ PASSO 3: CONFIGURAR VARIÁVEIS DE AMBIENTE

Adicione ao `.env.local`:

```env
# Calendário e Preços Dinâmicos
ICAL_SECRET=seu_secret_aqui_mude_em_producao

# Google Calendar
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# WhatsApp Business API
WHATSAPP_PHONE_ID=seu_phone_id
WHATSAPP_TOKEN=seu_whatsapp_token
META_VERIFY_TOKEN=seu_verify_token

# Telegram Bot
TELEGRAM_BOT_TOKEN=seu_telegram_bot_token

# Facebook Messenger + Instagram
MESSENGER_PAGE_ACCESS_TOKEN=seu_messenger_token
INSTAGRAM_ACCESS_TOKEN=seu_instagram_token

# Fechaduras Inteligentes
YALE_API_KEY=seu_yale_api_key
AUGUST_CLIENT_ID=seu_august_client_id
IGLOOHOME_API_KEY=seu_igloohome_api_key

# Verificação de Identidade
UNICO_API_KEY=seu_unico_api_key
IDWALL_API_KEY=seu_idwall_api_key
```

---

## 🔧 PASSO 4: CONFIGURAR BANCO DE DADOS

### 4.1. Adicionar campos OAuth ao users (se ainda não tiver)

```bash
node scripts/executar-oauth-fields.js
```

### 4.2. Adicionar campos para Google Calendar

```sql
-- Adicionar campos para tokens Google Calendar
ALTER TABLE users
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS instagram_id VARCHAR(255);
```

---

## 📱 PASSO 5: CONFIGURAR WHATSAPP BUSINESS API

### 5.1. Criar conta Meta Business
1. Acesse https://business.facebook.com
2. Crie uma conta Business
3. Vá em "Configurações" > "WhatsApp" > "API"

### 5.2. Obter credenciais
- `WHATSAPP_PHONE_ID` - ID do número de telefone
- `WHATSAPP_TOKEN` - Token de acesso
- `META_VERIFY_TOKEN` - Token de verificação (crie um aleatório)

### 5.3. Configurar webhook
- URL: `https://seusite.com/api/webhooks/meta`
- Token: O mesmo `META_VERIFY_TOKEN`
- Campos: `messages`

### 5.4. Aprovar templates WhatsApp
Acesse Meta Business Manager > WhatsApp > Templates e envie os 18 templates:

**Templates Base (12):**
1. `booking_confirmed` (TRANSACTIONAL)
2. `booking_payment_success` (TRANSACTIONAL)
3. `checkin_instructions` (TRANSACTIONAL)
4. `checkout_reminder` (TRANSACTIONAL)
5. `review_request` (TRANSACTIONAL)
6. `cancellation_confirmed` (TRANSACTIONAL)
7. `late_checkin_warning` (TRANSACTIONAL)
8. `birthday_discount` (MARKETING)
9. `last_minute_discount` (MARKETING)
10. `inquiry_auto_response` (UTILITY)
11. `payment_link` (TRANSACTIONAL)
12. `welcome_new_user` (TRANSACTIONAL)

**Templates Caldas Novas (6):**
13. `caldascountry_promo` (MARKETING)
14. `reveillon_paradise` (TRANSACTIONAL)
15. `carnaval_caldas` (MARKETING)
16. `natal_praça` (UTILITY)
17. `rodeo_festival` (TRANSACTIONAL)
18. `aguas_quentes_semana` (MARKETING)

**Formato dos templates:**
```
nome_template,TIPO,Conteúdo com {{1}} {{2}} etc
```

---

## 🤖 PASSO 6: CONFIGURAR BOT TELEGRAM

### 6.1. Criar bot
1. Fale com @BotFather no Telegram
2. Use `/newbot` e siga as instruções
3. Copie o token gerado

### 6.2. Configurar no .env.local
```env
TELEGRAM_BOT_TOKEN=seu_token_aqui
```

### 6.3. Iniciar bot
```bash
# Em produção, use PM2 ou similar
node -r ts-node/register lib/telegram-bot.ts
```

---

## 📘 PASSO 7: CONFIGURAR GOOGLE CALENDAR

### 7.1. Criar projeto no Google Cloud
1. Acesse https://console.cloud.google.com
2. Crie um novo projeto
3. Ative "Google Calendar API"

### 7.2. Configurar OAuth 2.0
1. Vá em "Credenciais" > "Criar credenciais" > "ID do cliente OAuth"
2. Tipo: "Aplicativo da Web"
3. URIs de redirecionamento: `http://localhost:3000/api/auth/google/callback`
4. Copie `Client ID` e `Client Secret`

### 7.3. Adicionar ao .env.local
```env
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

---

## 🔐 PASSO 8: CONFIGURAR FECHADURAS INTELIGENTES

### 8.1. Yale Assure Lock
1. Acesse https://developer.yalehome.com
2. Crie uma conta de desenvolvedor
3. Obtenha API Key
4. Adicione ao .env.local: `YALE_API_KEY=...`

### 8.2. August Smart Lock
1. Acesse https://developer.august.com
2. Registre-se no Partner Program
3. Obtenha Client ID
4. Adicione ao .env.local: `AUGUST_CLIENT_ID=...`

### 8.3. Igloohome
1. Acesse https://www.igloohome.co/api
2. Registre-se e obtenha API Key
3. Adicione ao .env.local: `IGLOOHOME_API_KEY=...`

---

## 🆔 PASSO 9: CONFIGURAR VERIFICAÇÃO DE IDENTIDADE

### 9.1. Unico (Recomendado para Brasil)
1. Acesse https://unico.io
2. Crie conta e obtenha API Key
3. Adicione ao .env.local: `UNICO_API_KEY=...`

### 9.2. IDwall (Alternativa)
1. Acesse https://idwall.co
2. Crie conta e obtenha API Key
3. Adicione ao .env.local: `IDWALL_API_KEY=...`

---

## 🧪 PASSO 10: TESTAR IMPLEMENTAÇÕES

### 10.1. Testar Calendário e Preços
```bash
# Acesse no navegador
http://localhost:3000/properties/[id]/calendar
```

### 10.2. Testar WhatsApp
```bash
# Envie mensagem para o número configurado
# O webhook deve responder automaticamente
```

### 10.3. Testar Telegram
```bash
# Fale com o bot no Telegram
# Use /start para iniciar
```

### 10.4. Testar Check-in
```bash
# Acesse
http://localhost:3000/checkin?booking_id=1
```

---

## 📊 PASSO 11: VERIFICAR IMPLEMENTAÇÕES

Execute o script de verificação:

```bash
node scripts/verificar-implementacoes.js
```

**Verificações:**
- ✅ Tabelas criadas
- ✅ APIs funcionando
- ✅ Componentes importados
- ✅ Variáveis de ambiente configuradas

---

## 🎯 PRÓXIMOS PASSOS

### Fase 2 (Jan-Fev/2026)
1. Multimoeda + IOF automático
2. Channel Manager completo (Airbnb API)
3. App Nativo React Native
4. Revenue Management com IA
5. Seguro de danos automático

---

## 📝 NOTAS IMPORTANTES

1. **Produção:** Altere todos os secrets e tokens antes de fazer deploy
2. **Webhooks:** Use ngrok para testar localmente: `ngrok http 3000`
3. **Templates WhatsApp:** Podem levar até 24h para aprovação
4. **Google Calendar:** Primeira autorização requer consentimento do usuário
5. **Fechaduras:** Teste com dispositivos reais antes de produção

---

## ✅ CHECKLIST FINAL

- [ ] Scripts SQL executados
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] WhatsApp Business API configurado
- [ ] Bot Telegram configurado
- [ ] Google Calendar configurado
- [ ] Fechaduras configuradas (opcional)
- [ ] Verificação de identidade configurada (opcional)
- [ ] Testes realizados
- [ ] Deploy realizado

---

**Status:** ✅ TODAS AS IMPLEMENTAÇÕES CRIADAS E PRONTAS PARA CONFIGURAÇÃO

**Tempo estimado para configuração completa:** 4-6 horas

**Tempo estimado para testes:** 2-3 horas

**Total:** 6-9 horas para ter tudo funcionando 100%

