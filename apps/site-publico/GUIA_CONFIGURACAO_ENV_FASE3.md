# 🔧 GUIA DE CONFIGURAÇÃO - VARIÁVEIS DE AMBIENTE FASE 3

**Data:** 2025-12-13  
**Status:** ✅ FASE 3 Concluída - Configuração Necessária

---

## 📋 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

### 1. SMTP (Para Emails)

**Arquivo:** `.env`

```env
# Configuração SMTP para envio de emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
EMAIL_FROM=noreply@rsv360.com
```

**Como obter:**

#### Gmail:
1. Acesse: https://myaccount.google.com/apppasswords
2. Gere uma "Senha de app" para "Email"
3. Use essa senha em `SMTP_PASS`

#### Outros provedores:
- **Outlook:** `smtp-mail.outlook.com:587`
- **SendGrid:** Use API Key em `SMTP_PASS`
- **Mailgun:** Use credenciais do Mailgun

---

### 2. Webhook da Seguradora

**Arquivo:** `.env`

```env
# Opção 1: Webhook (Recomendado)
INSURANCE_WEBHOOK_URL=https://seguradora.com/webhook/claims

# Opção 2: Email (Fallback)
INSURANCE_NOTIFICATION_EMAIL=insurance@rsv360.com
```

**Como configurar:**

#### Webhook (Recomendado):
1. Configure o endpoint na seguradora
2. O sistema enviará POST com:
   ```json
   {
     "event": "claim_created",
     "claim_number": "CLM-1234567890-ABC",
     "policy_id": 123,
     "claim_type": "cancellation",
     "claimed_amount": 500.00,
     "incident_date": "2025-12-13T10:00:00Z"
   }
   ```

#### Email (Fallback):
- Use se webhook não estiver disponível
- Emails serão enviados para `INSURANCE_NOTIFICATION_EMAIL`

---

## 🔧 CONFIGURAÇÃO PASSO A PASSO

### Passo 1: Copiar `.env.example`

```bash
cp .env.example .env
```

### Passo 2: Editar `.env`

Adicione as seguintes variáveis:

```env
# ============================================
# SMTP - EMAIL CONFIGURATION
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app_aqui
EMAIL_FROM=noreply@rsv360.com

# ============================================
# INSURANCE - SEGURADORA
# ============================================
# Opção 1: Webhook (recomendado)
INSURANCE_WEBHOOK_URL=https://seguradora.com/webhook/claims

# Opção 2: Email (fallback)
INSURANCE_NOTIFICATION_EMAIL=insurance@rsv360.com
```

### Passo 3: Validar Configuração

Execute o script de validação:

```bash
npm run validate:env
```

---

## ✅ TESTES DE FUNCIONALIDADES

### 1. Testar Email de Confirmação de Sinistro

**Como testar:**
1. Criar um sinistro via API ou interface
2. Verificar se email foi enviado para o usuário
3. Verificar logs do servidor

**Comando:**
```bash
# Verificar logs
npm run dev
# Criar sinistro e verificar email
```

### 2. Testar Notificação para Seguradora

**Como testar:**
1. Criar um sinistro
2. Verificar webhook ou email enviado
3. Verificar logs

**Comando:**
```bash
# Verificar logs
npm run dev
# Criar sinistro e verificar notificação
```

### 3. Testar Confirmação de Pagamento

**Como testar:**
1. Aprovar um sinistro
2. Processar pagamento
3. Verificar email de confirmação

**Comando:**
```bash
# Verificar logs
npm run dev
# Processar pagamento e verificar email
```

### 4. Testar Expiração de Incentivos

**Como testar:**
1. Conceder incentivo de cada tipo
2. Verificar data de expiração calculada
3. Validar lógica de expiração

**Comando:**
```bash
# Testar via API ou diretamente no código
```

---

## 🧪 SCRIPT DE TESTE COMPLETO

Crie um arquivo `scripts/test-fase3-features.js`:

```javascript
require('dotenv').config();
const { sendEmail } = require('../lib/email');

async function testEmail() {
  console.log('📧 Testando envio de email...');
  const result = await sendEmail(
    'teste@example.com',
    'Teste FASE 3',
    '<h1>Teste de Email</h1><p>Este é um teste da FASE 3.</p>'
  );
  console.log(result ? '✅ Email enviado!' : '❌ Falha no envio');
}

async function testWebhook() {
  console.log('🔗 Testando webhook da seguradora...');
  if (process.env.INSURANCE_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.INSURANCE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test',
          claim_number: 'TEST-123',
        }),
      });
      console.log('✅ Webhook testado:', response.status);
    } catch (error) {
      console.log('❌ Erro no webhook:', error.message);
    }
  } else {
    console.log('⚠️ INSURANCE_WEBHOOK_URL não configurado');
  }
}

async function runTests() {
  await testEmail();
  await testWebhook();
}

runTests();
```

Execute:
```bash
node scripts/test-fase3-features.js
```

---

## 📊 CHECKLIST DE CONFIGURAÇÃO

- [ ] `.env` criado a partir de `.env.example`
- [ ] `SMTP_HOST` configurado
- [ ] `SMTP_PORT` configurado
- [ ] `SMTP_USER` configurado
- [ ] `SMTP_PASS` configurado (senha de app)
- [ ] `EMAIL_FROM` configurado
- [ ] `INSURANCE_WEBHOOK_URL` configurado (ou `INSURANCE_NOTIFICATION_EMAIL`)
- [ ] Validação executada: `npm run validate:env`
- [ ] Teste de email executado
- [ ] Teste de webhook executado

---

## 🚀 PRÓXIMOS PASSOS

Após configurar as variáveis de ambiente:

1. **Testar funcionalidades:**
   - ✅ Email de confirmação de sinistro
   - ✅ Notificação para seguradora
   - ✅ Confirmação de pagamento
   - ✅ Expiração de incentivos

2. **Continuar com outras fases:**
   - FASE 4: APIs Faltantes (já concluída)
   - FASE 5: Integrações Externas (já concluída)
   - FASE 6: Componentes Frontend (já concluída)
   - FASE 7: Scripts e Configuração (já concluída)
   - Outras melhorias e otimizações

---

**Última Atualização:** 2025-12-13  
**Status:** ✅ Guia de Configuração Criado

