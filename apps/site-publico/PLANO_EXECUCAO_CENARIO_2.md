# 🔧 PLANO DE EXECUÇÃO - CENÁRIO 2: CORRIGIR SISTEMA EXISTENTE

**Baseado em:** PLANO_CORRECAO_INTEGRADO_RSV360.md  
**Data de Início:** 2025-12-12  
**Status:** 🚀 EM EXECUÇÃO

---

## 📊 VISÃO GERAL

Este plano aplica as correções do **PLANO_CORRECAO_INTEGRADO_RSV360.md** seguindo o **CENÁRIO 2** do **INDICE_MESTRE.md**.

### Estratégia

```
FASE 1: CORREÇÕES CRÍTICAS (Semana 1-2) - 40h
├── DIA 1: Erros Bloqueantes SQL (8h)
├── DIA 2: Arquivos Críticos Faltantes (8h)
└── DIA 3-4: Testes Falhando (16h)

FASE 2: CORREÇÕES ALTAS (Semana 3-4) - 56h
├── DIA 5-6: Integrações Prioritárias
├── DIA 7-8: APIs Faltantes
└── DIA 9-10: Componentes Essenciais

FASE 3: POLIMENTO (Semana 5-6) - 64h
└── Funcionalidades médias e baixas
```

---

## 🎯 DIA 1: ERROS BLOQUEANTES SQL (8 HORAS)

### ✅ ERRO 1: `pg_catalog.extract` - VALIDAR CORREÇÃO

**Status:** ✅ Correção já aplicada  
**Arquivo:** `lib/smart-pricing-service.ts`  
**Linhas:** 822-823, 890-891

**Validação Necessária:**
1. ✅ Verificar se casting está correto
2. ⏳ Adicionar teste específico para demand multiplier
3. ⏳ Validar em ambiente real

**Ação Imediata:**
- Adicionar teste específico conforme plano
- Validar query SQL funciona

---

### 🚨 ERRO 2: `data.map is not a function`

**Status:** ⏳ PENDENTE  
**Arquivo:** `backend/src/routes/website-real.js:472-490`  
**Causa:** `getDataCollection` retorna objeto ao invés de array

**Ação:**
- Localizar arquivo
- Corrigir retorno para sempre ser array
- Adicionar testes

---

### 🚨 ERRO 3-5: Validação Split Payment

**Status:** ⏳ PENDENTE  
**Arquivo:** `lib/group-travel/split-payment-service.ts`

**Problemas:**
1. Schema Zod não trata campos opcionais
2. `sendReminder` - Split não está pendente
3. Performance tests falhando

**Ação:**
- Corrigir schemas Zod com `.optional().nullish()`
- Ajustar validação de status em `sendReminder`
- Revisar thresholds de performance

---

## 📁 DIA 2: ARQUIVOS CRÍTICOS FALTANTES (8 HORAS)

### Lista de Arquivos a Criar (12 arquivos)

1. ⏳ `lib/group-travel/group-travel.service.ts` - Coordenador geral
2. ⏳ `lib/pricing/price-analytics.service.ts` - Analytics de pricing
3. ⏳ `lib/pricing/competitor-monitoring.service.ts` - Monitoramento
4. ⏳ `lib/pricing/demand-forecasting.service.ts` - Previsão
5. ⏳ `lib/insurance/insurance.service.ts` - Sistema de seguros
6. ⏳ `lib/insurance/insurance-claims.service.ts` - Sinistros
7. ⏳ `lib/verification/property-verification.service.ts` - Verificação
8. ⏳ `lib/quality/incentives.service.ts` - Incentivos
9. ⏳ `lib/calendar/group-calendar.service.ts` - Calendário
10. ⏳ `lib/payments/klarna-service.ts` - Pay Later
11. ⏳ `lib/external/smart-locks-service.ts` - Fechaduras
12. ⏳ `lib/external/serasa-service.ts` - Background check

**Template:** Usar template do PLANO_CORRECAO_INTEGRADO_RSV360.md

---

## 🧪 DIA 3-4: TESTES FALHANDO (16 HORAS)

### Categorização de Falhas

**CATEGORIA A: Imports incorretos (15 testes)**
- ⏳ permissions-flow.test.ts (7 testes)
- ⏳ group-chat-flow.test.ts (2 testes)
- ⏳ wishlist-flow.test.ts (2 testes)
- ⏳ outros E2E (4 testes)

**CATEGORIA B: Mocks incorretos (20 testes)**
- ⏳ vote-service.test.ts
- ⏳ split-payment-service.test.ts
- ⏳ outros serviços

**CATEGORIA C: Validação Zod (8 testes)**
- ⏳ split-payment-*.test.ts

**CATEGORIA D: Performance (6 testes)**
- ⏳ smart-pricing-performance.test.ts

---

## 📈 PROGRESSO

### Fase 1: Correções Críticas

| Item | Status | Progresso |
|------|--------|-----------|
| ERRO 1: EXTRACT | ✅ Completo | 100% - Teste adicionado |
| ERRO 2: data.map | ✅ Completo | 100% - Proteção adicionada |
| ERRO 3-5: Split Payment | ✅ Completo | 100% - sendReminder corrigido |
| Arquivos Faltantes | ⏳ Pendente | 0% |
| Testes Falhando | ⏳ Pendente | 0% |

**Total Fase 1:** 60% completo (3/5 itens)

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **AGORA:** Adicionar teste para `calculateDemandMultiplier`
2. **HOJE:** Corrigir ERRO 2 (data.map)
3. **HOJE:** Corrigir ERRO 3-5 (Split Payment)
4. **AMANHÃ:** Criar arquivos críticos faltantes
5. **AMANHÃ:** Corrigir testes falhando

---

## 📝 NOTAS DE EXECUÇÃO

- Seguir metodologia CoT + ToT + SoT
- TDD obrigatório para todas as correções
- Commits pequenos e frequentes
- Validar cada passo antes de prosseguir

---

**Última Atualização:** 2025-12-12  
**Próxima Revisão:** Após DIA 1 completo

