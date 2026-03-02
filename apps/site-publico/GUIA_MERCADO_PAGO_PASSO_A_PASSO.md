# 💳 GUIA COMPLETO - COMO OBTER CREDENCIAIS DO MERCADO PAGO

**Data:** 2025-01-XX  
**Solução:** Checkout Transparente  
**Status:** 📋 Passo a Passo Detalhado

---

## 🎯 O QUE VOCÊ VAI PRECISAR

Para o **Checkout Transparente**, você precisa de:

1. ✅ **Access Token** (Token de Acesso) - Para o backend
2. ✅ **Public Key** (Chave Pública) - Para o frontend (opcional, se usar Bricks)
3. ✅ **Webhook Secret** (Chave do Webhook) - Para validar notificações

---

## 📋 PASSO A PASSO COMPLETO

### **PASSO 1: Acessar o Portal de Desenvolvedores**

1. Acesse: **https://www.mercadopago.com.br/developers**
2. Faça login com sua conta do Mercado Pago
   - Se não tiver conta, crie uma em: https://www.mercadopago.com.br

---

### **PASSO 2: Criar uma Aplicação**

1. No menu lateral, clique em **"Suas integrações"**
2. Clique no botão **"Criar aplicação"** (ou **"Criar nova aplicação"**)
3. Preencha os dados:

   **Nome da aplicação:**
   ```
   RSV 360° - Sistema de Reservas
   ```

   **Descrição:**
   ```
   Sistema de reservas e pagamentos para hotéis e pousadas
   ```

   **Site:**
   ```
   https://seu-dominio.com.br
   ```
   (ou `http://localhost:3000` para desenvolvimento)

   **Redirecionamento após pagamento:**
   ```
   https://seu-dominio.com.br/reservar/[id]/confirmacao
   ```
   (ou `http://localhost:3000/reservar/[id]/confirmacao` para desenvolvimento)

4. Clique em **"Criar"**

---

### **PASSO 3: Obter as Credenciais**

Após criar a aplicação, você verá duas abas:

#### **🔑 ABA "Credenciais de teste"** (Para desenvolvimento)

1. Clique na aba **"Credenciais de teste"**
2. Você verá:
   - **Public Key** (Chave pública)
   - **Access Token** (Token de acesso)

   **Copie ambos!**

#### **🔑 ABA "Credenciais de produção"** (Para produção)

1. Clique na aba **"Credenciais de produção"**
2. Você verá:
   - **Public Key** (Chave pública)
   - **Access Token** (Token de acesso)

   **⚠️ IMPORTANTE:** Use as credenciais de teste primeiro para testar!

---

### **PASSO 4: Configurar Webhook (Opcional mas Recomendado)**

1. Na página da aplicação, vá em **"Webhooks"** ou **"Notificações"**
2. Clique em **"Configurar webhook"**
3. Preencha:

   **URL do webhook:**
   ```
   https://seu-dominio.com.br/api/webhooks/mercadopago
   ```
   (ou `http://localhost:3000/api/webhooks/mercadopago` para desenvolvimento)

   **Eventos para receber:**
   - ✅ `payment`
   - ✅ `payment.created`
   - ✅ `payment.updated`

4. Clique em **"Salvar"**
5. **Copie a chave do webhook** (Webhook Secret) que será gerada

---

## 🔑 CREDENCIAIS QUE VOCÊ PRECISA

### **Para Desenvolvimento (Teste):**

```env
# Credenciais de TESTE
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

### **Para Produção:**

```env
# Credenciais de PRODUÇÃO
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxx
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret_producao_aqui
```

---

## 📝 ONDE COLOCAR AS CREDENCIAIS

### **Opção 1: Usar o Script Interativo (Recomendado)**

```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
node scripts/configurar-integracao-completa.js
```

O script vai perguntar e você só precisa colar as credenciais!

### **Opção 2: Editar Manualmente**

1. Abra o arquivo `.env.local` na raiz do projeto
2. Adicione as credenciais:

```env
# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=TEST-seu_token_aqui
MERCADO_PAGO_PUBLIC_KEY=TEST-sua_chave_publica_aqui
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

---

## 🧪 TESTAR AS CREDENCIAIS

### **Cartões de Teste do Mercado Pago:**

Para testar pagamentos, use estes cartões:

**Cartão Aprovado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Nome: APRO
Data: 11/25
```

**Cartão Recusado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Nome: OTHE
Data: 11/25
```

**PIX de Teste:**
- Use qualquer valor
- O QR Code será gerado (mas não será válido para pagamento real)

---

## 🔄 DIFERENÇA ENTRE TESTE E PRODUÇÃO

### **Credenciais de TESTE:**
- ✅ Começam com `TEST-`
- ✅ Não processam pagamentos reais
- ✅ Use para desenvolvimento
- ✅ Não cobra taxas

### **Credenciais de PRODUÇÃO:**
- ✅ Começam com `APP_USR-`
- ✅ Processam pagamentos reais
- ✅ Use apenas em produção
- ✅ Cobra taxas reais

---

## ⚠️ IMPORTANTE

1. **Nunca compartilhe suas credenciais!**
2. **Nunca commite `.env.local` no Git!**
3. **Use credenciais de teste primeiro!**
4. **Só mude para produção quando estiver pronto!**

---

## 🆘 PROBLEMAS COMUNS

### **Erro: "Invalid credentials"**
- Verifique se copiou o token completo
- Certifique-se de que não há espaços extras
- Use as credenciais da aba correta (teste ou produção)

### **Erro: "Webhook não funciona"**
- Verifique se a URL está acessível publicamente
- Para desenvolvimento, use ngrok ou similar
- Verifique se o webhook secret está correto

### **Erro: "Payment not found"**
- Certifique-se de estar usando as credenciais corretas
- Verifique se o payment_id existe
- Use as credenciais de teste para testar

---

## 📖 LINKS ÚTEIS

- **Portal de Desenvolvedores:** https://www.mercadopago.com.br/developers
- **Documentação:** https://www.mercadopago.com.br/developers/pt/docs
- **Checkout Transparente:** https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration
- **Cartões de Teste:** https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing

---

## ✅ CHECKLIST

- [ ] Criar conta no Mercado Pago
- [ ] Acessar portal de desenvolvedores
- [ ] Criar aplicação
- [ ] Copiar Access Token (teste)
- [ ] Copiar Public Key (teste)
- [ ] Configurar webhook
- [ ] Copiar Webhook Secret
- [ ] Adicionar credenciais no `.env.local`
- [ ] Testar pagamento com cartão de teste
- [ ] Testar PIX de teste

---

## 🚀 PRÓXIMO PASSO

Depois de obter as credenciais:

1. Execute o script de configuração:
   ```powershell
   node scripts/configurar-integracao-completa.js
   ```

2. Ou adicione manualmente no `.env.local`

3. Reinicie o servidor:
   ```powershell
   npm run dev
   ```

4. Teste um pagamento!

---

**Pronto! Agora você tem todas as credenciais necessárias!** 🎉

