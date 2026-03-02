# ✅ CHECKLIST DE CONFIGURAÇÃO - INTEGRAÇÕES

**Data:** 2025-01-XX  
**Status:** 📋 Pronto para Configurar

---

## 🎯 OBJETIVO

Configurar todas as integrações necessárias para o sistema RSV 360° funcionar completamente.

---

## 📋 CHECKLIST

### **1. Preparação** ⏳

- [ ] Ler `GUIA_CONFIGURACAO_INTEGRACOES.md`
- [ ] Ter credenciais prontas (ou links para obtê-las)
- [ ] Terminal aberto no diretório do projeto

### **2. Executar Script** ⏳

- [ ] Executar: `node scripts/configurar-integracao-completa.js`
- [ ] Responder às perguntas do script
- [ ] Verificar se `.env.local` foi atualizado

### **3. Configurar Integrações** ⏳

#### **SMTP (Email)**
- [ ] Obter senha de app do Gmail (ou outro provedor)
- [ ] Configurar no script
- [ ] Testar envio de email

#### **Mercado Pago**
- [ ] Criar aplicação no Mercado Pago
- [ ] Obter Access Token e Public Key
- [ ] Configurar no script
- [ ] (Opcional) Configurar webhook

#### **OAuth Google**
- [ ] Criar projeto no Google Cloud
- [ ] Ativar APIs necessárias
- [ ] Criar credenciais OAuth 2.0
- [ ] Configurar no script

#### **OAuth Facebook**
- [ ] Criar app no Facebook Developers
- [ ] Adicionar produto "Facebook Login"
- [ ] Obter App ID e App Secret
- [ ] Configurar no script

#### **Google Maps**
- [ ] Ativar Maps JavaScript API
- [ ] Criar chave de API
- [ ] Configurar no script

### **4. Verificação** ⏳

- [ ] Verificar se `.env.local` contém todas as variáveis
- [ ] Reiniciar servidor: `npm run dev`
- [ ] Testar funcionalidades:
  - [ ] Envio de email
  - [ ] Login com Google
  - [ ] Login com Facebook
  - [ ] Mapas carregando
  - [ ] Pagamentos (se configurado)

---

## 🚀 COMANDOS RÁPIDOS

### **Executar Script:**
```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
node scripts/configurar-integracao-completa.js
```

### **Verificar .env.local:**
```powershell
# Verificar se arquivo existe e tem conteúdo
Get-Content .env.local | Select-String "SMTP_HOST|MERCADO_PAGO|GOOGLE_CLIENT|FACEBOOK_APP|GOOGLE_MAPS"
```

### **Reiniciar Servidor:**
```powershell
npm run dev
```

### **Testar Integrações:**
```powershell
# Testar email
node scripts/testar-email.js

# Testar Mercado Pago
node scripts/testar-mercadopago.js

# Testar OAuth
node scripts/testar-oauth.js
```

---

## 📖 DOCUMENTAÇÃO

- **Guia Completo:** `GUIA_CONFIGURACAO_INTEGRACOES.md`
- **Guia Geral:** `GUIA_CONFIGURACAO_ENV.md`
- **Resumo:** `RESUMO_IMPLEMENTACAO_COMPLETA.md`

---

## ⚠️ IMPORTANTE

1. **Nunca commite `.env.local` no Git!**
2. **Mantenha as credenciais seguras**
3. **Use senhas de app para Gmail** (não a senha normal)
4. **Restrinja chaves de API** quando possível
5. **Teste cada integração após configurar**

---

## 🆘 PRECISA DE AJUDA?

Consulte `GUIA_CONFIGURACAO_INTEGRACOES.md` para:
- Instruções detalhadas passo a passo
- Links diretos para obter credenciais
- Solução de problemas comuns
- Exemplos de configuração

---

**Boa sorte!** 🚀

