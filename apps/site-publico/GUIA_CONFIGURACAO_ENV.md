# 📋 Guia de Configuração do .env.local

## ⚠️ IMPORTANTE

O arquivo `.env.local` não está versionado por segurança. Você precisa criá-lo manualmente copiando do `env.example`.

## 📝 Passos para Configurar

1. **Copie o arquivo de exemplo:**
   ```bash
   cp env.example .env.local
   ```

2. **Edite o `.env.local` e configure as variáveis:**

### 🔐 SMTP (Email)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app  # Use senha de app do Gmail
EMAIL_FROM=noreply@rsv360.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Para Gmail:**
- Ative "Senhas de app" em: https://myaccount.google.com/apppasswords
- Use a senha de app gerada no `SMTP_PASS`

### 💳 Mercado Pago

```env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_...  # Do painel do Mercado Pago
MERCADO_PAGO_PUBLIC_KEY=APP_USR_...    # Do painel do Mercado Pago
MERCADO_PAGO_WEBHOOK_SECRET=...        # Configure no painel
```

**Como obter:**
1. Acesse: https://www.mercadopago.com.br/developers
2. Crie uma aplicação
3. Copie o Access Token e Public Key
4. Configure o webhook URL: `http://seu-dominio.com/api/webhooks/mercadopago`

### 🔑 OAuth Google

```env
GOOGLE_CLIENT_ID=...                   # Do Google Cloud Console
GOOGLE_CLIENT_SECRET=...               # Do Google Cloud Console
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

**Como obter:**
1. Acesse: https://console.cloud.google.com
2. Crie um projeto
3. Ative "Google+ API"
4. Crie credenciais OAuth 2.0
5. Adicione URI de redirecionamento autorizado

### 📘 OAuth Facebook

```env
FACEBOOK_APP_ID=...                    # Do Facebook Developers
FACEBOOK_APP_SECRET=...                # Do Facebook Developers
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback
```

**Como obter:**
1. Acesse: https://developers.facebook.com
2. Crie um app
3. Adicione produto "Facebook Login"
4. Configure URLs de redirecionamento

### 🗺️ Google Maps

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

**Como obter:**
1. Acesse: https://console.cloud.google.com
2. Ative "Maps JavaScript API"
3. Crie uma chave de API
4. Configure restrições (opcional)

## ✅ Verificação

Após configurar, reinicie o servidor:

```bash
npm run dev
```

Verifique os logs para confirmar que as variáveis foram carregadas corretamente.

