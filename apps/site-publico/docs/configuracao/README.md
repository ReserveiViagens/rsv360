# 📚 ÁREA DE CONFIGURAÇÃO - GUIA COMPLETO

**Bem-vindo à área de configuração do RSV 360!**

Esta área contém todos os guias necessários para configurar o projeto do zero.

---

## 📋 GUIA RÁPIDO

### Para começar rapidamente:

1. **Configurar PostgreSQL** → [GUIA_POSTGRESQL.md](./GUIA_POSTGRESQL.md)
2. **Obter Chaves de API** → [GUIA_CHAVES_API.md](./GUIA_CHAVES_API.md)
3. **Executar Setup** → `npm run setup`

---

## 📖 DOCUMENTOS DISPONÍVEIS

### 🗄️ [GUIA_POSTGRESQL.md](./GUIA_POSTGRESQL.md)
**Configuração do Banco de Dados**

- ✅ Verificar instalação do PostgreSQL
- ✅ Criar banco de dados
- ✅ Obter credenciais
- ✅ Configurar DATABASE_URL no .env
- ✅ Testar conexão
- ✅ Troubleshooting completo

**Tempo:** 10-15 minutos  
**Dificuldade:** ⭐⭐ Média

---

### 🔑 [GUIA_CHAVES_API.md](./GUIA_CHAVES_API.md)
**Obter e Configurar Chaves de API**

- ✅ Google Maps API (obrigatória)
- ✅ Google Vision API (opcional)
- ✅ Stripe Payment Gateway (obrigatória)
- ✅ Mercado Pago (opcional)
- ✅ Configurar no .env
- ✅ Validar configuração

**Tempo:** 30-60 minutos  
**Dificuldade:** ⭐⭐⭐ Média-Alta

---

## 🚀 ORDEM DE EXECUÇÃO RECOMENDADA

### 1️⃣ Configurar PostgreSQL (OBRIGATÓRIO)

```bash
# Seguir: docs/configuracao/GUIA_POSTGRESQL.md
# Resultado: DATABASE_URL configurada no .env
```

**Checklist:**
- [ ] PostgreSQL instalado e rodando
- [ ] Banco `rsv360_dev` criado
- [ ] DATABASE_URL configurada no .env
- [ ] Teste de conexão passou

---

### 2️⃣ Obter Chaves de API (OBRIGATÓRIO para funcionalidades)

```bash
# Seguir: docs/configuracao/GUIA_CHAVES_API.md
# Resultado: Chaves de API configuradas no .env
```

**Checklist:**
- [ ] Google Maps API Key obtida
- [ ] Stripe Secret Key obtida
- [ ] Chaves adicionadas no .env
- [ ] Validação passou

---

### 3️⃣ Executar Setup Completo

```bash
# Validar ambiente
npm run validate:env

# Executar setup (valida + migra + seed)
npm run setup

# Testar integrações
npm run test:integrations
```

**Checklist:**
- [ ] Validação passou
- [ ] Migrations executadas
- [ ] Seed executado
- [ ] Testes de integração passaram

---

## 📊 STATUS DA CONFIGURAÇÃO

### Variáveis Obrigatórias

- [ ] `DATABASE_URL` - Banco de dados PostgreSQL
- [ ] `JWT_SECRET` - Secret para autenticação
- [ ] `NEXT_PUBLIC_API_URL` - URL da API backend
- [ ] `GOOGLE_MAPS_API_KEY` - Google Maps (obrigatória para geocodificação)
- [ ] `STRIPE_SECRET_KEY` - Stripe (obrigatória para pagamentos)

### Variáveis Opcionais (Recomendadas)

- [ ] `GOOGLE_VISION_API_KEY` - Análise de imagens
- [ ] `MERCADOPAGO_ACCESS_TOKEN` - Alternativa ao Stripe
- [ ] `REDIS_URL` - Cache (opcional)
- [ ] `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Email (opcional)

---

## 🔍 VALIDAÇÃO RÁPIDA

Execute para verificar o status:

```bash
npm run validate:env
```

**Resultado esperado:**
```
✅ DATABASE_URL
✅ JWT_SECRET
✅ NEXT_PUBLIC_API_URL
✅ GOOGLE_MAPS_API_KEY
✅ STRIPE_SECRET_KEY
...
✅ Todas as variáveis obrigatórias estão definidas!
```

---

## 🆘 PRECISA DE AJUDA?

### Problemas Comuns

1. **PostgreSQL não conecta**
   - Ver: [GUIA_POSTGRESQL.md - Troubleshooting](./GUIA_POSTGRESQL.md#troubleshooting)

2. **Chaves de API não funcionam**
   - Ver: [GUIA_CHAVES_API.md - Segurança](./GUIA_CHAVES_API.md#segurança)

3. **Setup falha**
   - Verificar logs do script
   - Executar `npm run validate:env` primeiro

### Documentação Adicional

- **Guia Completo de Configuração:** `GUIA_CONFIGURACAO_ENV_COMPLETO.md` (raiz do projeto)
- **Scripts de Setup:** `scripts/setup-auto.ps1`
- **Validação:** `scripts/validate-env.js`

---

## 📝 CHECKLIST COMPLETO

### Pré-requisitos
- [ ] Node.js instalado (v18+)
- [ ] PostgreSQL instalado e rodando
- [ ] Conta Google Cloud (para APIs do Google)
- [ ] Conta Stripe (para pagamentos)

### Configuração
- [ ] PostgreSQL configurado ([GUIA_POSTGRESQL.md](./GUIA_POSTGRESQL.md))
- [ ] Chaves de API obtidas ([GUIA_CHAVES_API.md](./GUIA_CHAVES_API.md))
- [ ] Arquivo `.env` configurado
- [ ] Validação passou (`npm run validate:env`)

### Execução
- [ ] Setup executado (`npm run setup`)
- [ ] Migrations aplicadas
- [ ] Seed executado
- [ ] Testes de integração passaram

---

## 🎯 PRÓXIMOS PASSOS

Após completar a configuração:

1. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Executar testes:**
   ```bash
   npm test
   ```

3. **Verificar documentação do projeto:**
   - `README.md` (raiz)
   - `PLANO_EXECUCAO_COMPLETO.md`

---

**Última atualização:** 2025-12-13  
**Versão:** 1.0.0

