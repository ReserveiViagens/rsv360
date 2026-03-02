# 🚀 GUIA COMPLETO: Como Iniciar o ngrok

## 📋 PRÉ-REQUISITOS

- ✅ ngrok instalado (já verificado: INSTALADO)
- ✅ Servidor Next.js rodando na porta 3000
- ✅ Conta ngrok (gratuita ou paga)

---

## 🎯 PASSO A PASSO

### 1. Verificar se o Servidor está Rodando

```powershell
# Verificar porta 3000
Get-NetTCPConnection -LocalPort 3000
```

Se não estiver rodando, inicie o servidor:
```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
npm run dev
```

---

### 2. Iniciar o ngrok

**Comando Básico:**
```powershell
ngrok http 3000
```

**Comando com Authtoken (se configurado):**
```powershell
ngrok http 3000 --authtoken SEU_TOKEN_AQUI
```

**Comando com Domínio Fixo (se tiver plano pago):**
```powershell
ngrok http 3000 --domain=seu-dominio.ngrok.app
```

---

### 3. Obter a URL do ngrok

Após iniciar, o ngrok mostrará algo como:

```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
```

**URL do Webhook do Mercado Pago:**
```
https://abc123.ngrok-free.app/api/webhooks/mercadopago
```

---

### 4. Configurar no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Vá em **Notificações** → **Webhooks**
3. Cole a URL: `https://[seu-dominio-ngrok].ngrok-free.app/api/webhooks/mercadopago`
4. Salve as configurações

---

## ⚙️ OPÇÕES AVANÇADAS

### Iniciar em Background (PowerShell)

```powershell
Start-Process ngrok -ArgumentList "http 3000"
```

### Iniciar com Configuração Específica

```powershell
ngrok http 3000 --region=sa  # Região: sa (América do Sul)
```

### Verificar Status do ngrok

Acesse: http://localhost:4040 (Interface Web do ngrok)

---

## 🔧 TROUBLESHOOTING

### Problema: ngrok não inicia

**Solução:**
1. Verificar se o servidor está rodando na porta 3000
2. Verificar se há outro processo usando a porta 4040 (interface do ngrok)
3. Tentar: `ngrok http 3000 --log=stdout` para ver logs

### Problema: URL muda a cada reinício

**Solução:**
- Use plano pago do ngrok para domínio fixo
- Ou configure authtoken para URLs mais estáveis

### Problema: Webhook não recebe notificações

**Solução:**
1. Verificar se a URL está correta no Mercado Pago
2. Verificar se o servidor está acessível via ngrok
3. Testar manualmente: `curl https://[url-ngrok]/api/webhooks/mercadopago`

---

## 📝 COMANDOS ÚTEIS

```powershell
# Iniciar ngrok
ngrok http 3000

# Iniciar com região específica
ngrok http 3000 --region=sa

# Iniciar com authtoken
ngrok http 3000 --authtoken=SEU_TOKEN

# Verificar status
# Acesse: http://localhost:4040

# Parar ngrok
# Pressione Ctrl+C no terminal onde está rodando
```

---

## 🎯 EXEMPLO COMPLETO

```powershell
# 1. Certifique-se que o servidor está rodando
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
npm run dev

# 2. Em outro terminal, inicie o ngrok
ngrok http 3000

# 3. Copie a URL HTTPS gerada
# Exemplo: https://abc123.ngrok-free.app

# 4. Use no Mercado Pago:
# https://abc123.ngrok-free.app/api/webhooks/mercadopago
```

---

## ⚠️ IMPORTANTE

1. **URL Temporária:** URLs gratuitas do ngrok mudam a cada reinício
2. **Limite Gratuito:** Plano gratuito tem limites de conexões
3. **HTTPS:** ngrok sempre fornece HTTPS (necessário para webhooks)
4. **Túnel Ativo:** Mantenha o ngrok rodando enquanto testa webhooks

---

## 🔗 LINKS ÚTEIS

- **Dashboard ngrok:** http://localhost:4040
- **Documentação:** https://ngrok.com/docs
- **Mercado Pago Webhooks:** https://www.mercadopago.com.br/developers/panel/app

---

**Status:** ✅ ngrok instalado e pronto para uso

