# 🔧 GUIA COMPLETO - CONFIGURAÇÃO DE INTEGRAÇÕES

**Data:** 2025-01-XX  
**Status:** ✅ Script Pronto para Uso

---

## 📋 ÍNDICE

1. [Como Executar o Script](#como-executar-o-script)
2. [SMTP (Email)](#1-smtp-email)
3. [Mercado Pago](#2-mercado-pago)
4. [OAuth Google](#3-oauth-google)
5. [OAuth Facebook](#4-oauth-facebook)
6. [Google Maps](#5-google-maps)
7. [Verificação](#verificação)

---

## 🚀 COMO EXECUTAR O SCRIPT

### **Passo 1: Abrir Terminal**

```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
```

### **Passo 2: Executar Script**

```powershell
node scripts/configurar-integracao-completa.js
```

### **Passo 3: Seguir Instruções Interativas**

O script vai perguntar quais integrações você quer configurar e fornecer instruções passo a passo.

---

## 1. SMTP (Email)

### **📧 Configuração para Gmail**

#### **Passo 1: Ativar Senha de App**

1. Acesse: https://myaccount.google.com/apppasswords
2. Faça login na sua conta Google
3. Se não aparecer a opção "Senhas de app":
   - Ative a verificação em duas etapas primeiro: https://myaccount.google.com/security
4. Clique em "Selecionar app" → "Outro (nome personalizado)"
5. Digite: "RSV 360"
6. Clique em "Gerar"
7. **Copie a senha gerada** (16 caracteres, sem espaços)

#### **Passo 2: Configurar no Script**

Quando o script perguntar:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: seu_email@gmail.com
SMTP Password: [cole a senha de app gerada]
Email From: noreply@rsv360.com
```

#### **📧 Outros Provedores**

**Outlook/Hotmail:**
```
SMTP Host: smtp-mail.outlook.com
SMTP Port: 587
```

**Yahoo:**
```
SMTP Host: smtp.mail.yahoo.com
SMTP Port: 587
```

**SendGrid:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [sua API key do SendGrid]
```

---

## 2. Mercado Pago

### **💳 Como Obter Credenciais**

#### **Passo 1: Criar Conta**

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login ou crie uma conta
3. Vá em "Suas integrações"

#### **Passo 2: Criar Aplicação**

1. Clique em "Criar aplicação"
2. Preencha:
   - **Nome:** RSV 360
   - **Descrição:** Sistema de reservas
   - **Plataforma:** Web
3. Clique em "Criar"

#### **Passo 3: Obter Credenciais**

1. Na página da aplicação, você verá:
   - **Access Token** (começa com `APP_USR_...`)
   - **Public Key** (começa com `APP_USR_...`)
2. **Copie ambos**

#### **Passo 4: Configurar Webhook (Opcional)**

1. Na aplicação, vá em "Webhooks"
2. Adicione URL: `https://seu-dominio.com/api/webhooks/mercadopago`
3. Copie o **Webhook Secret**

#### **Passo 5: Configurar no Script**

```
Mercado Pago Access Token: APP_USR_...
Mercado Pago Public Key: APP_USR_...
Mercado Pago Webhook Secret: [opcional]
```

---

## 3. OAuth Google

### **🔐 Como Obter Credenciais**

#### **Passo 1: Criar Projeto**

1. Acesse: https://console.cloud.google.com
2. Clique em "Selecionar projeto" → "Novo projeto"
3. Nome: "RSV 360"
4. Clique em "Criar"

#### **Passo 2: Ativar APIs**

1. No menu lateral, vá em "APIs e Serviços" → "Biblioteca"
2. Procure e ative:
   - **Google+ API** (ou Google Identity)
   - **People API**

#### **Passo 3: Criar Credenciais OAuth**

1. Vá em "APIs e Serviços" → "Credenciais"
2. Clique em "Criar credenciais" → "ID do cliente OAuth"
3. Tipo de aplicativo: **Aplicativo da Web**
4. Nome: "RSV 360 Web Client"
5. **URIs de redirecionamento autorizados:**
   - `http://localhost:3000/api/auth/google/callback`
   - `https://seu-dominio.com/api/auth/google/callback`
6. Clique em "Criar"
7. **Copie:**
   - **ID do cliente** (Client ID)
   - **Chave secreta do cliente** (Client Secret)

#### **Passo 4: Configurar no Script**

```
Google Client ID: [cole o Client ID]
Google Client Secret: [cole o Client Secret]
Redirect URI: http://localhost:3000/api/auth/google/callback
```

---

## 4. OAuth Facebook

### **📘 Como Obter Credenciais**

#### **Passo 1: Criar App**

1. Acesse: https://developers.facebook.com
2. Faça login
3. Clique em "Meus Apps" → "Criar App"
4. Tipo: **Consumidor**
5. Nome: "RSV 360"
6. Clique em "Criar App"

#### **Passo 2: Adicionar Produto**

1. No painel do app, procure "Facebook Login"
2. Clique em "Configurar"
3. Escolha "Web" → "Continuar"

#### **Passo 3: Configurar URLs**

1. Vá em "Configurações" → "Básico"
2. **URLs de redirecionamento OAuth válidos:**
   - `http://localhost:3000/api/auth/facebook/callback`
   - `https://seu-dominio.com/api/auth/facebook/callback`
3. Salve

#### **Passo 4: Obter Credenciais**

1. Em "Configurações" → "Básico", você verá:
   - **ID do aplicativo** (App ID)
   - **Chave secreta do aplicativo** (App Secret)
2. **Copie ambos**

#### **Passo 5: Configurar no Script**

```
Facebook App ID: [cole o App ID]
Facebook App Secret: [cole o App Secret]
Redirect URI: http://localhost:3000/api/auth/facebook/callback
```

---

## 5. Google Maps

### **🗺️ Como Obter Chave de API**

#### **Passo 1: Criar Projeto (ou usar existente)**

1. Acesse: https://console.cloud.google.com
2. Selecione ou crie um projeto

#### **Passo 2: Ativar API**

1. Vá em "APIs e Serviços" → "Biblioteca"
2. Procure "Maps JavaScript API"
3. Clique em "Ativar"

#### **Passo 3: Criar Chave de API**

1. Vá em "APIs e Serviços" → "Credenciais"
2. Clique em "Criar credenciais" → "Chave de API"
3. **Copie a chave gerada**

#### **Passo 4: Restringir Chave (Recomendado)**

1. Clique na chave criada
2. Em "Restrições de aplicativo":
   - **Referenciadores de sites HTTP:** `http://localhost:3000/*`
   - **Referenciadores de sites HTTP:** `https://seu-dominio.com/*`
3. Em "Restrições de API":
   - Selecione "Restringir chave"
   - Marque apenas: "Maps JavaScript API"
4. Salve

#### **Passo 5: Configurar no Script**

```
Google Maps API Key: [cole a chave gerada]
```

---

## ✅ VERIFICAÇÃO

### **Após Configurar:**

1. **Verificar `.env.local`:**
   ```powershell
   # O arquivo deve ter todas as variáveis configuradas
   ```

2. **Reiniciar Servidor:**
   ```powershell
   npm run dev
   ```

3. **Testar Integrações:**

   **SMTP:**
   ```powershell
   node scripts/testar-email.js
   ```

   **Mercado Pago:**
   ```powershell
   node scripts/testar-mercadopago.js
   ```

   **OAuth:**
   ```powershell
   node scripts/testar-oauth.js
   ```

---

## 📝 EXEMPLO DE `.env.local` COMPLETO

```env
# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app_16_caracteres
EMAIL_FROM=noreply@rsv360.com

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_1234567890...
MERCADO_PAGO_PUBLIC_KEY=APP_USR_0987654321...
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abc123def456ghi789
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAbc123Def456Ghi789Jkl012Mno345Pqr
```

---

## ⚠️ IMPORTANTE

1. **Nunca commite `.env.local` no Git!**
2. **Use senhas de app para Gmail** (não a senha normal)
3. **Restrinja chaves de API** quando possível
4. **Use HTTPS em produção**
5. **Mantenha as credenciais seguras**

---

## 🆘 PROBLEMAS COMUNS

### **SMTP não funciona:**
- Verifique se a senha de app está correta
- Verifique se a verificação em duas etapas está ativa
- Teste com outro provedor

### **OAuth não funciona:**
- Verifique se as URLs de redirecionamento estão corretas
- Verifique se as APIs estão ativadas
- Verifique se o domínio está autorizado

### **Google Maps não carrega:**
- Verifique se a API está ativada
- Verifique se a chave está correta
- Verifique as restrições de referenciador

---

## 📖 DOCUMENTAÇÃO ADICIONAL

- `GUIA_CONFIGURACAO_ENV.md` - Guia geral
- `GUIA_COMPLETO_PROXIMOS_PASSOS.md` - Próximos passos
- `RESUMO_IMPLEMENTACAO_COMPLETA.md` - Resumo completo

---

**Boa sorte com a configuração!** 🚀

