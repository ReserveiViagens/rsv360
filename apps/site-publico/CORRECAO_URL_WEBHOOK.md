# ⚠️ CORREÇÃO URGENTE: URL DO WEBHOOK

**Data:** 2025-01-XX  
**Problema:** URL com `https://` está incorreta

---

## 🔴 ERRO ATUAL

```
https://localhost:3000/api/webhooks/mercadopago
```

**❌ ESTÁ ERRADO!**

---

## ✅ CORREÇÃO

### **Na tela do Mercado Pago:**

1. **Clique no campo "URL para teste"**
2. **Apague tudo**
3. **Digite exatamente isto:**

```
http://localhost:3000/api/webhooks/mercadopago
```

**⚠️ IMPORTANTE:**
- Use `http://` (sem o 's')
- NÃO use `https://`
- `localhost` não tem SSL, então não pode usar HTTPS

---

## 📋 PASSO A PASSO VISUAL

### **1. Localizar o campo:**
- Procure: **"URL para teste"**
- Está escrito: `https://localhost:3000/api/webhooks/mercadopago`

### **2. Corrigir:**
- **Selecione todo o texto** no campo
- **Apague** (Delete ou Backspace)
- **Digite novamente:**

```
http://localhost:3000/api/webhooks/mercadopago
```

### **3. Verificar:**
- Certifique-se de que está `http://` (sem 's')
- Certifique-se de que está `localhost:3000` (sem porta diferente)
- Certifique-se de que termina com `/api/webhooks/mercadopago`

---

## ✅ CONFIGURAÇÃO CORRETA COMPLETA

### **URL para teste:**
```
http://localhost:3000/api/webhooks/mercadopago
```

### **Eventos para marcar:**
- ✅ **Pagamentos** (obrigatório)
- ✅ **Vinculação de aplicações** (recomendado)
- ✅ **Alertas de fraude** (recomendado)
- ✅ **Reclamações** (recomendado)
- ✅ **Contestações** (recomendado)

### **Assinatura secreta:**
- ✅ Revele o secret (clique em "Mostrar" ou "Revelar")
- ✅ Copie o secret completo

---

## 🎯 O QUE FAZER AGORA

### **1. Corrigir URL:**
```
❌ https://localhost:3000/api/webhooks/mercadopago
✅ http://localhost:3000/api/webhooks/mercadopago
```

### **2. Selecionar Eventos:**
- Marque: Pagamentos, Vinculação, Alertas, Reclamações, Contestações

### **3. Copiar Secret:**
- Revele e copie o secret

### **4. Salvar:**
- Clique em "Salvar configurações"

---

## ⚠️ POR QUE NÃO FUNCIONA COM HTTPS?

### **HTTPS requer:**
- ✅ Certificado SSL válido
- ✅ Domínio real (não localhost)
- ✅ Configuração de servidor

### **Localhost:**
- ❌ Não tem certificado SSL
- ❌ Não é um domínio real
- ❌ Só funciona com HTTP

### **Solução:**
- ✅ Use `http://` para desenvolvimento local
- ✅ Use `https://` apenas quando site estiver em produção (com domínio real)

---

## 🔄 SE AINDA DER ERRO

### **Opção 1: Usar ngrok (Para testar webhook)**

Se você quiser testar o webhook funcionando:

1. **Instalar ngrok:**
   - Baixe: https://ngrok.com/download
   - Ou: `choco install ngrok` (se tiver Chocolatey)

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

### **Opção 2: Pular Webhook por Enquanto**

- ✅ Configure o webhook, mas não teste agora
- ✅ O sistema funciona sem webhook (mas é recomendado)
- ✅ Teste depois quando site estiver no ar

---

## 📋 CHECKLIST FINAL

- [ ] **URL corrigida:** `http://localhost:3000/api/webhooks/mercadopago`
- [ ] **Eventos selecionados:** Pagamentos + recomendados
- [ ] **Secret copiado:** Revele e copie
- [ ] **Salvar:** Clique em "Salvar configurações"

---

## 🎯 RESUMO

### **CORREÇÃO:**
```
❌ https://localhost:3000/api/webhooks/mercadopago
✅ http://localhost:3000/api/webhooks/mercadopago
```

**Mude `https://` para `http://`!**

---

**Resumo: Remova o 's' do https e use http://** 🚀

