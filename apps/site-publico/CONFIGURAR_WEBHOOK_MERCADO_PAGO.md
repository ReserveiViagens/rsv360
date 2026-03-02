# 🔔 CONFIGURAR WEBHOOK DO MERCADO PAGO

**Data:** 2025-01-XX  
**Sistema:** RSV 360° - Sistema de Reservas

---

## ⚠️ CORREÇÃO IMPORTANTE: URL ESTÁ ERRADA!

### **❌ ERRADO:**
```
https://localhost:3000/api/webhooks/mercadopago
```

### **✅ CORRETO:**
```
http://localhost:3000/api/webhooks/mercadopago
```

**Por quê?**
- `localhost` não tem SSL (certificado HTTPS)
- Use `http://` (sem o 's') para desenvolvimento local
- `https://` só funciona com domínio real e SSL configurado

---

## 📋 CONFIGURAÇÃO CORRETA

### **1. URL para Teste:**

**Corrija para:**
```
http://localhost:3000/api/webhooks/mercadopago
```

**⚠️ IMPORTANTE:**
- Remova o `s` do `https`
- Use `http://` (sem SSL)
- Mantenha o resto: `localhost:3000/api/webhooks/mercadopago`

---

### **2. Eventos Recomendados para Checkout Transparente:**

Marque estes eventos:

#### **✅ OBRIGATÓRIOS:**
- ✅ **Payments** - Notificações de pagamentos
  - ✅ `payment.created` - Quando pagamento é criado
  - ✅ `payment.updated` - Quando status do pagamento muda
  - ✅ `payment.approved` - Quando pagamento é aprovado
  - ✅ `payment.rejected` - Quando pagamento é rejeitado

#### **✅ RECOMENDADOS:**
- ✅ **Application linking** - Vinculação de aplicação
- ✅ **Fraud alerts** - Alertas de fraude
- ✅ **Complaints** - Reclamações
- ✅ **Objections** - Objeções/chargebacks

#### **⚠️ OPCIONAIS (Não marque agora):**
- ⚠️ Card Updater
- ⚠️ Order (Mercado Pago)
- ⚠️ Shipping (Mercado Pago)
- ⚠️ Plans and subscriptions
- ⚠️ Point Integrations
- ⚠️ Delivery (proximity marketplace)
- ⚠️ Wallet Connect
- ⚠️ Commercial orders

---

### **3. Secret Signature:**

1. **O Mercado Pago já gerou um secret** (mostrado como `•••••••••`)
2. **Clique em "Revelar"** ou **"Mostrar"** para ver o secret completo
3. **Copie o secret completo!** (Você vai precisar)

**Formato do secret:**
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### **Na tela do Mercado Pago:**

- [ ] **Corrigir URL:** `http://localhost:3000/api/webhooks/mercadopago`
- [ ] **Selecionar eventos:**
  - [ ] Payments (obrigatório)
  - [ ] Application linking (recomendado)
  - [ ] Fraud alerts (recomendado)
  - [ ] Complaints (recomendado)
  - [ ] Objections (recomendado)
- [ ] **Revelar e copiar Secret Signature**
- [ ] **Clicar em "Save settings"**

---

## 🔧 ONDE COLOCAR O SECRET

### **Opção 1: Usar o Script Interativo**

```powershell
node scripts/configurar-integracao-completa.js
```

O script vai perguntar e você cola o secret.

### **Opção 2: Editar Manualmente**

No arquivo `.env.local`:

```env
MERCADO_PAGO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🧪 TESTAR O WEBHOOK

### **Opção 1: Simular Notificação (Recomendado)**

1. Na tela do Mercado Pago, clique em **"Simulate notification"**
2. Escolha um evento (ex: `payment.created`)
3. Clique em **"Enviar"**
4. Verifique se seu servidor recebeu a notificação

### **Opção 2: Testar com Pagamento Real**

1. Faça um pagamento de teste
2. O webhook será chamado automaticamente
3. Verifique os logs do servidor

---

## ⚠️ IMPORTANTE: WEBHOOK LOCAL

### **Problema:**
`localhost` não é acessível publicamente!

O Mercado Pago precisa conseguir acessar sua URL, mas `localhost` só funciona na sua máquina.

### **Soluções:**

#### **Opção A: Usar ngrok (Recomendado para teste)**

1. **Instalar ngrok:**
   ```powershell
   # Baixe de: https://ngrok.com/download
   # Ou use: choco install ngrok
   ```

2. **Executar ngrok:**
   ```powershell
   ngrok http 3000
   ```

3. **Copiar URL do ngrok:**
   ```
   https://xxxx-xxxx-xxxx.ngrok.io
   ```

4. **Usar no webhook:**
   ```
   https://xxxx-xxxx-xxxx.ngrok.io/api/webhooks/mercadopago
   ```

#### **Opção B: Deploy Temporário**

1. Fazer deploy do site (Vercel, Netlify, etc.)
2. Usar URL de produção no webhook
3. Testar webhook

#### **Opção C: Pular Webhook por Enquanto**

- ✅ Configure o webhook, mas não teste agora
- ✅ Teste depois quando site estiver no ar
- ✅ O sistema funciona sem webhook (mas é recomendado)

---

## 📋 CONFIGURAÇÃO FINAL

### **URL Corrigida:**
```
http://localhost:3000/api/webhooks/mercadopago
```

### **Eventos Selecionados:**
- ✅ Payments
- ✅ Application linking
- ✅ Fraud alerts
- ✅ Complaints
- ✅ Objections

### **Secret Signature:**
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🚀 PRÓXIMOS PASSOS

### **1. Corrigir URL**
- ✅ Mude de `https://` para `http://`
- ✅ Mantenha: `localhost:3000/api/webhooks/mercadopago`

### **2. Selecionar Eventos**
- ✅ Marque os eventos recomendados acima

### **3. Copiar Secret**
- ✅ Revele o secret
- ✅ Copie completo

### **4. Salvar**
- ✅ Clique em "Save settings"

### **5. Configurar no Sistema**
- ✅ Adicione o secret no `.env.local`
- ✅ Ou use o script de configuração

---

## 🆘 PROBLEMAS COMUNS

### **Erro: "URL não acessível"**
- ✅ Use ngrok para expor localhost
- ✅ Ou configure webhook depois (quando site estiver no ar)

### **Erro: "Webhook não recebido"**
- ✅ Verifique se servidor está rodando
- ✅ Verifique se URL está correta
- ✅ Use ngrok para testar

### **Erro: "Secret inválido"**
- ✅ Certifique-se de copiar o secret completo
- ✅ Não adicione espaços extras
- ✅ Use o secret da aba correta (teste ou produção)

---

## 📖 DOCUMENTAÇÃO

- **Guia Completo:** `GUIA_MERCADO_PAGO_PASSO_A_PASSO.md`
- **Próximos Passos:** `PROXIMOS_PASSOS_MERCADO_PAGO.md`

---

## 🎯 RESUMO

### **Correções Necessárias:**

1. **URL:** `https://` → `http://`
2. **Eventos:** Marque Payments + recomendados
3. **Secret:** Copie o secret completo
4. **Salvar:** Clique em "Save settings"

---

**Resumo: Corrija a URL para `http://` e selecione os eventos recomendados!** 🚀

