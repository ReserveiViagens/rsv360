# 🚀 ATIVAÇÃO DE CREDENCIAIS DE PRODUÇÃO - MERCADO PAGO

**Data:** 2025-01-XX  
**Sistema:** RSV 360° - Sistema de Reservas

---

## ⚠️ IMPORTANTE: USE CREDENCIAIS DE TESTE PRIMEIRO!

### **🔴 NÃO ATIVE PRODUÇÃO AGORA!**

**Por quê?**
- ✅ Credenciais de **TESTE** são suficientes para desenvolvimento
- ✅ Não processam pagamentos reais
- ✅ Não cobram taxas
- ✅ Você pode testar tudo sem risco

**Ative produção apenas quando:**
- ✅ Sistema estiver 100% testado
- ✅ Site estiver no ar (com domínio real)
- ✅ Pronto para receber pagamentos reais

---

## 📋 O QUE PREENCHER (SE QUISER ATIVAR AGORA)

### **1. Setor:**
✅ **Transporte / Turismo** (já selecionado - correto!)

### **2. Categoria:**
Escolha uma dessas opções (as mais adequadas):

**Opções recomendadas:**
- ✅ **Hospedagem / Hotéis**
- ✅ **Turismo / Viagens**
- ✅ **Serviços de Turismo**
- ✅ **Aluguel de Temporada**

**Se não tiver essas opções, escolha:**
- ✅ **Serviços**
- ✅ **Outros**

### **3. Site (obrigatório):**

**⚠️ PROBLEMA:** Você precisa de um site real!

**Opções:**

#### **Opção A: Usar domínio temporário (Para teste)**
```
https://seu-dominio.vercel.app
https://seu-dominio.netlify.app
```
(Se você já fez deploy)

#### **Opção B: Usar domínio de desenvolvimento**
```
https://rsv360-dev.seudominio.com
```
(Se você tem subdomínio)

#### **Opção C: Pular por enquanto**
- ✅ **NÃO ative produção agora**
- ✅ Use apenas credenciais de **TESTE**
- ✅ Ative produção quando tiver domínio real

---

## 🎯 RECOMENDAÇÃO

### **✅ NÃO ATIVE PRODUÇÃO AGORA!**

**Motivos:**
1. ✅ Você ainda está em desenvolvimento (`localhost:3000`)
2. ✅ Credenciais de TESTE são suficientes
3. ✅ Você pode testar tudo sem risco
4. ✅ Ative produção quando o site estiver no ar

---

## 📋 O QUE FAZER AGORA

### **PASSO 1: Usar Credenciais de TESTE**

1. **Na página da aplicação, vá na aba "Credenciais de teste"**
2. **Copie:**
   - Access Token (começa com `TEST-`)
   - Public Key (começa com `TEST-`)

3. **Configure no sistema:**
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=TEST-seu_token_aqui
   MERCADO_PAGO_PUBLIC_KEY=TEST-sua_chave_publica_aqui
   ```

4. **Teste tudo com credenciais de teste!**

---

### **PASSO 2: Ativar Produção DEPOIS**

Quando estiver pronto para produção:

1. **Tenha um domínio real** (ex: `https://rsv360.com.br`)
2. **Site funcionando** em produção
3. **Sistema testado** completamente
4. **Aí sim, ative as credenciais de produção**

---

## 🔄 DIFERENÇA ENTRE TESTE E PRODUÇÃO

### **Credenciais de TESTE:**
- ✅ Começam com `TEST-`
- ✅ Não processam pagamentos reais
- ✅ Não cobram taxas
- ✅ Use para desenvolvimento
- ✅ **Use AGORA!**

### **Credenciais de PRODUÇÃO:**
- ✅ Começam com `APP_USR-`
- ✅ Processam pagamentos reais
- ✅ Cobram taxas reais
- ✅ Use apenas em produção
- ⚠️ **NÃO use agora!**

---

## ✅ CHECKLIST

### **Para Desenvolvimento (AGORA):**
- [x] Usar credenciais de TESTE
- [x] Testar com cartões de teste
- [x] Validar todo o fluxo
- [x] Não ativar produção ainda

### **Para Produção (DEPOIS):**
- [ ] Site com domínio real
- [ ] Sistema 100% testado
- [ ] SSL configurado (HTTPS)
- [ ] Webhook configurado com URL real
- [ ] Aí sim, ativar credenciais de produção

---

## 🎯 O QUE FAZER AGORA

### **1. NÃO preencha o formulário de produção**
- ✅ Feche essa tela ou clique em "Voltar"
- ✅ Vá para a aba "Credenciais de teste"

### **2. Use credenciais de TESTE**
- ✅ Copie Access Token (TEST-...)
- ✅ Copie Public Key (TEST-...)
- ✅ Configure no sistema

### **3. Teste tudo**
- ✅ Teste PIX
- ✅ Teste Cartão (com cartões de teste)
- ✅ Teste Boleto
- ✅ Valide webhooks

### **4. Ative produção DEPOIS**
- ✅ Quando site estiver no ar
- ✅ Quando sistema estiver testado
- ✅ Quando tiver domínio real

---

## 📖 DOCUMENTAÇÃO

- **Guia Completo:** `GUIA_MERCADO_PAGO_PASSO_A_PASSO.md`
- **Próximos Passos:** `PROXIMOS_PASSOS_MERCADO_PAGO.md`

---

## 🎉 CONCLUSÃO

### **✅ NÃO ATIVE PRODUÇÃO AGORA!**

**Use credenciais de TESTE primeiro:**
1. ✅ Vá na aba "Credenciais de teste"
2. ✅ Copie Access Token e Public Key
3. ✅ Configure no sistema
4. ✅ Teste tudo
5. ✅ Ative produção quando estiver pronto!

---

**Resumo: Use TESTE agora, produção depois!** 🚀

