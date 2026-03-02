# 🧪 GUIA DE TESTES - RSV 360°

## 🚀 Início Rápido

### 1. Configurar .env.local

**Opção 1: Script Interativo (Recomendado)**
```bash
node scripts/configurar-env-interativo.js
```

**Opção 2: Manual**
1. Copie `env.example` para `.env.local`
2. Siga o guia: `GUIA_CONFIGURACAO_ENV_COMPLETO.md`

### 2. Iniciar Servidor

```bash
npm run dev
```

### 3. Verificar Funcionalidades

```bash
# Verificar dados de teste
node scripts/testar-funcionalidades.js

# Verificar URLs
node scripts/verificar-urls-teste.js
```

---

## 📋 URLs de Teste

### Frontend

- **Calendário:** http://localhost:3000/properties/1/calendar
- **Check-in:** http://localhost:3000/checkin?booking_id=1
- **Hotéis:** http://localhost:3000/hoteis

### APIs

- **Propriedades:** http://localhost:3000/api/properties
- **Eventos:** http://localhost:3000/api/events?start_date=2025-12-01&end_date=2025-12-31
- **Preços:** http://localhost:3000/api/properties/1/pricing?check_in=2025-12-01&check_out=2025-12-05

---

## 📚 Documentação

- **Guia Completo:** `DOCUMENTACAO_COMPLETA.md`
- **Guia de Configuração:** `GUIA_CONFIGURACAO_ENV_COMPLETO.md`
- **Guia Rápido de Testes:** `GUIA_RAPIDO_TESTES.md`
- **Análise do Sistema:** `ANALISE_COMPLETA_SISTEMA.md`

---

## ✅ Checklist

- [ ] `.env.local` configurado
- [ ] Servidor rodando (`npm run dev`)
- [ ] Banco de dados conectado
- [ ] Dados de teste criados
- [ ] URLs funcionando
- [ ] Sem erros no console

---

**Pronto para testar!** 🎉

