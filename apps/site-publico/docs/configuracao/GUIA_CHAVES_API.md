# 🔑 GUIA COMPLETO: OBTER E CONFIGURAR CHAVES DE API

**Objetivo:** Obter e configurar todas as chaves de API necessárias  
**Tempo estimado:** 30-60 minutos  
**Dificuldade:** ⭐⭐⭐ Média-Alta

---

## 📋 ÍNDICE

1. [Google Maps API](#1-google-maps-api-obrigatória)
2. [Google Vision API](#2-google-vision-api-opcional)
3. [Stripe Payment Gateway](#3-stripe-payment-gateway-obrigatória)
4. [Mercado Pago](#4-mercado-pago-opcional)
5. [Configurar no .env](#5-configurar-no-env)
6. [Validar Configuração](#6-validar-configuração)

---

## 1. GOOGLE MAPS API (OBRIGATÓRIA)

### Por que é necessária?
- Geocodificação de endereços
- Verificação de localização
- Cálculo de distâncias
- Integração com mapas

### Passo a Passo

#### 1.1 Criar Conta no Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Clique em **"Criar Projeto"** ou selecione um existente
4. Nome do projeto: `RSV360` (ou outro nome)
5. Clique em **"Criar"**

#### 1.2 Ativar APIs Necessárias

1. No menu lateral, vá em **"APIs e Serviços"** → **"Biblioteca"**
2. Procure e ative:
   - ✅ **Maps JavaScript API**
   - ✅ **Geocoding API**
   - ✅ **Places API** (opcional, mas recomendado)

#### 1.3 Criar Chave de API

1. Vá em **"APIs e Serviços"** → **"Credenciais"**
2. Clique em **"Criar credenciais"** → **"Chave de API"**
3. Copie a chave gerada (formato: `AIzaSyC...`)
4. **IMPORTANTE:** Clique em **"Restringir chave"** para segurança:
   - **Restrições de aplicativo:** Restringir por HTTP referrers
   - **Referrers HTTP:** Adicione `http://localhost:3000/*` e `http://localhost:5002/*`
   - **Restrições de API:** Selecione apenas as APIs que você ativou

#### 1.4 Configurar no .env

```bash
GOOGLE_MAPS_API_KEY=AIzaSyC_SUA_CHAVE_AQUI
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_SUA_CHAVE_AQUI
```

**⚠️ IMPORTANTE:**
- Use `NEXT_PUBLIC_` para variáveis acessíveis no frontend
- Mantenha a mesma chave em ambas as variáveis

### Custo
- **Gratuito:** Primeiros $200/mês
- **Após:** $7 por 1.000 requisições

---

## 2. GOOGLE VISION API (OPCIONAL)

### Por que é necessária?
- Análise de imagens de propriedades
- Detecção de objetos
- Verificação de qualidade de fotos

### Passo a Passo

#### 2.1 Ativar API

1. No mesmo projeto do Google Cloud
2. Vá em **"APIs e Serviços"** → **"Biblioteca"**
3. Procure: **"Cloud Vision API"**
4. Clique em **"Ativar"**

#### 2.2 Criar Chave de API

1. Vá em **"APIs e Serviços"** → **"Credenciais"**
2. Clique em **"Criar credenciais"** → **"Chave de API"**
3. Copie a chave gerada
4. **OU** use Service Account (recomendado para produção):
   - **"Criar credenciais"** → **"Conta de serviço"**
   - Nome: `rsv360-vision`
   - Função: `Cloud Vision API User`
   - Baixar JSON de credenciais

#### 2.3 Configurar no .env

**Opção A: Chave de API**
```bash
GOOGLE_VISION_API_KEY=SUA_CHAVE_AQUI
```

**Opção B: Service Account (Recomendado)**
```bash
GOOGLE_APPLICATION_CREDENTIALS=C:\caminho\para\credentials.json
```

### Custo
- **Gratuito:** Primeiras 1.000 requisições/mês
- **Após:** $1,50 por 1.000 requisições

---

## 3. STRIPE PAYMENT GATEWAY (OBRIGATÓRIA)

### Por que é necessária?
- Processamento de pagamentos
- Checkout seguro
- Gerenciamento de assinaturas

### Passo a Passo

#### 3.1 Criar Conta no Stripe

1. Acesse: https://dashboard.stripe.com/register
2. Preencha os dados:
   - Email
   - Senha
   - País: **Brasil**
3. Verifique seu email

#### 3.2 Obter Chaves de Teste

1. Após login, você estará no **modo de teste** (Toggle no topo)
2. Vá em **"Developers"** → **"API keys"**
3. Você verá:
   - **Publishable key** (formato: `pk_test_...`)
   - **Secret key** (formato: `sk_test_...`) - Clique em **"Reveal"** para ver

#### 3.3 Configurar Webhook (Opcional mas Recomendado)

1. Vá em **"Developers"** → **"Webhooks"**
2. Clique em **"Add endpoint"**
3. URL do endpoint: `https://seu-dominio.com/api/webhooks/stripe`
4. Eventos para escutar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copie o **Signing secret** (formato: `REDACTED_WHSEC_...`)

#### 3.4 Configurar no .env

```bash
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_AQUI
STRIPE_PUBLIC_KEY=pk_test_SUA_CHAVE_AQUI
STRIPE_WEBHOOK_SECRET=REDACTED_WHSEC
```

### Custo
- **Taxa:** 2.9% + R$ 0,30 por transação bem-sucedida
- **Sem taxa de setup ou mensalidade**

### Modo Produção

Quando estiver pronto para produção:
1. Ative o **modo Live** no Stripe
2. Obtenha as chaves de produção (`sk_live_...` e `pk_live_...`)
3. Atualize o `.env` com as chaves de produção

---

## 4. MERCADO PAGO (OPCIONAL)

### Por que usar?
- Alternativa ao Stripe
- Popular no Brasil
- Suporte a PIX, Boleto, Cartão

### Passo a Passo

#### 4.1 Criar Conta no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/
2. Clique em **"Criar conta"** ou **"Entrar"**
3. Preencha os dados (CPF, email, senha)
4. Verifique seu email e telefone

#### 4.2 Criar Aplicação

1. Vá em **"Suas integrações"**
2. Clique em **"Criar aplicação"**
3. Preencha:
   - Nome: `RSV360`
   - Descrição: `Sistema de reservas de hotéis`
   - Site: `https://seu-dominio.com`
4. Clique em **"Criar"**

#### 4.3 Obter Credenciais

1. Na página da aplicação, você verá:
   - **Access Token** (formato: `APP_USR_...`)
   - **Public Key** (formato: `APP_USR_...`)
2. Copie ambos

#### 4.4 Configurar Webhook (Opcional)

1. Na aplicação, vá em **"Webhooks"**
2. Adicione URL: `https://seu-dominio.com/api/webhooks/mercadopago`
3. Selecione eventos para escutar
4. Copie o secret se fornecido

#### 4.5 Configurar no .env

```bash
MERCADOPAGO_ACCESS_TOKEN=APP_USR_SUA_CHAVE_AQUI
MERCADO_PAGO_PUBLIC_KEY=APP_USR_SUA_CHAVE_AQUI
MERCADOPAGO_WEBHOOK_SECRET=SEU_SECRET_AQUI
```

### Custo
- **Taxa:** 4.99% + R$ 0,39 por transação
- **PIX:** 0.99% + R$ 0,39

---

## 5. CONFIGURAR NO .ENV

### Passo 1: Abrir arquivo .env

```powershell
# No PowerShell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
notepad .env
# ou
code .env
```

### Passo 2: Adicionar Chaves

Localize ou adicione as seções:

```bash
# ===========================================
# GOOGLE MAPS API (OBRIGATÓRIA)
# ===========================================
GOOGLE_MAPS_API_KEY=AIzaSyC_SUA_CHAVE_AQUI
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_SUA_CHAVE_AQUI

# ===========================================
# GOOGLE VISION API (OPCIONAL)
# ===========================================
GOOGLE_VISION_API_KEY=SUA_CHAVE_AQUI
# OU use Service Account:
# GOOGLE_APPLICATION_CREDENTIALS=C:\caminho\para\credentials.json

# ===========================================
# STRIPE (OBRIGATÓRIA para pagamentos)
# ===========================================
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_AQUI
STRIPE_PUBLIC_KEY=pk_test_SUA_CHAVE_AQUI
STRIPE_WEBHOOK_SECRET=REDACTED_WHSEC

# ===========================================
# MERCADO PAGO (OPCIONAL - alternativa ao Stripe)
# ===========================================
MERCADOPAGO_ACCESS_TOKEN=APP_USR_SUA_CHAVE_AQUI
MERCADO_PAGO_PUBLIC_KEY=APP_USR_SUA_CHAVE_AQUI
MERCADOPAGO_WEBHOOK_SECRET=SEU_SECRET_AQUI
```

### Passo 3: Substituir Valores

Substitua `SUA_CHAVE_AQUI` pelas chaves reais que você obteve.

### Passo 4: Salvar

Salve o arquivo `.env` após editar.

---

## 6. VALIDAR CONFIGURAÇÃO

### Opção 1: Script de Validação

```bash
npm run validate:env
```

**Resultado esperado:**
```
✅ GOOGLE_MAPS_API_KEY
✅ STRIPE_SECRET_KEY
✅ STRIPE_PUBLIC_KEY
...
✅ Todas as variáveis obrigatórias estão definidas!
```

### Opção 2: Testar Integrações

```bash
npm run test:integrations
```

**Resultado esperado:**
```
✅ Google Maps API: Funcionando
✅ Stripe Payment Gateway: Funcionando
...
📊 RESUMO: 4/4 testes passaram
```

---

## ✅ CHECKLIST FINAL

Antes de continuar, verifique:

### Google Maps
- [ ] Conta Google Cloud criada
- [ ] Projeto criado
- [ ] APIs ativadas (Maps JavaScript, Geocoding)
- [ ] Chave de API criada
- [ ] Restrições configuradas (segurança)
- [ ] Chaves adicionadas no `.env`

### Stripe
- [ ] Conta Stripe criada
- [ ] Modo de teste ativo
- [ ] Secret Key obtida
- [ ] Public Key obtida
- [ ] Webhook configurado (opcional)
- [ ] Chaves adicionadas no `.env`

### Google Vision (Opcional)
- [ ] API ativada no Google Cloud
- [ ] Chave de API ou Service Account criada
- [ ] Credenciais adicionadas no `.env`

### Mercado Pago (Opcional)
- [ ] Conta Mercado Pago criada
- [ ] Aplicação criada
- [ ] Access Token obtido
- [ ] Public Key obtida
- [ ] Credenciais adicionadas no `.env`

---

## 🔒 SEGURANÇA

### Boas Práticas

1. **Nunca commite o arquivo `.env` no Git**
   - Verifique se está no `.gitignore`
   - Use `.env.example` como template

2. **Restrinja chaves de API**
   - Google Maps: Restrinja por HTTP referrers
   - Stripe: Use chaves de teste em desenvolvimento

3. **Rotacione chaves regularmente**
   - Especialmente se suspeitar de vazamento

4. **Use variáveis de ambiente em produção**
   - Não armazene chaves em código
   - Use serviços como AWS Secrets Manager, Azure Key Vault

---

## 🚀 PRÓXIMOS PASSOS

Após configurar todas as chaves:

1. **Validar:**
   ```bash
   npm run validate:env
   ```

2. **Testar integrações:**
   ```bash
   npm run test:integrations
   ```

3. **Executar setup completo:**
   ```bash
   npm run setup
   ```

---

## 📞 SUPORTE

### Google Cloud
- Documentação: https://cloud.google.com/docs
- Suporte: https://cloud.google.com/support

### Stripe
- Documentação: https://stripe.com/docs
- Suporte: https://support.stripe.com

### Mercado Pago
- Documentação: https://www.mercadopago.com.br/developers/pt/docs
- Suporte: https://www.mercadopago.com.br/developers/pt/support

---

**Última atualização:** 2025-12-13

