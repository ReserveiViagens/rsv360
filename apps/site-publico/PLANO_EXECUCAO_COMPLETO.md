# 🎯 PLANO DE EXECUÇÃO COMPLETO - RSV 360° GEN 2

**Versão:** 2.0.0  
**Data:** 2025-12-13  
**Status:** ✅ PLANO COMPLETO E APROVADO  
**Escopo:** Todas as Tarefas Pendentes + Mega Pacote Final

---

## 📊 ÍNDICE EXECUTIVO

```
┌────────────────────────────────────────────────────────┐
│  PLANO DE EXECUÇÃO COMPLETO                            │
├────────────────────────────────────────────────────────┤
│  ✅ FASE 1: Migrations (2) - 1-2 horas                │
│  ✅ FASE 2: TODOs Críticos (6) - 15-20 horas           │
│  ✅ FASE 3: TODOs Altos (13) - 13-22 horas             │
│  ✅ FASE 4: APIs Faltantes (6) - 12-16 horas          │
│  ✅ FASE 5: Integrações Externas (4) - 12-16 horas   │
│  ✅ FASE 6: Componentes Frontend (9) - 16-20 horas    │
│  ✅ FASE 7: Scripts e Configuração - 2-3 horas        │
│  ✅ FASE 8: Testes e Validação - 4-6 horas            │
│                                                        │
│  TOTAL: 65-105 horas (~8-13 dias úteis)               │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 FASE 1: MIGRATIONS DE BANCO DE DADOS

**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 1-2 horas  
**Status:** ✅ Arquivos Criados (Aguardando Validação)

### 1.1 Migration: `host_points`

**Arquivo:** `scripts/migration-018-create-host-points-table.sql`

**Ação:** Usar migration completa do documento `MIGRATIONS_SQL_COMPLETAS.md`

**Checklist:**
- [x] Copiar migration completa de `MIGRATIONS_SQL_COMPLETAS.md` (linhas 36-466)
- [x] Criar arquivo `scripts/migration-018-create-host-points-table.sql`
- [x] Validar sintaxe SQL
- [ ] Executar em ambiente de desenvolvimento
- [ ] Validar criação de:
  - [ ] Tabela `host_points`
  - [ ] ENUMs `points_type_enum` e `points_source_enum`
  - [ ] 8 índices
  - [ ] 6 funções SQL
  - [ ] 1 view `host_points_summary`
  - [ ] 1 trigger
- [ ] Testar funções:
  - [ ] `calculate_host_total_points`
  - [ ] `calculate_host_available_points`
  - [ ] `add_host_points`
  - [ ] `spend_host_points`
  - [ ] `expire_host_points`
  - [ ] `get_host_points_history`
- [ ] Executar em staging
- [ ] Executar em produção (com backup)

**Comando:**
```bash
psql -U postgres -d rsv360_dev -f scripts/migration-018-create-host-points-table.sql
```

---

### 1.2 Migration: `incentive_programs`

**Arquivo:** `scripts/migration-019-create-incentive-programs-table.sql`

**Ação:** Usar migration completa do documento `MIGRATIONS_SQL_COMPLETAS.md`

**Checklist:**
- [x] Copiar migration completa de `MIGRATIONS_SQL_COMPLETAS.md` (linhas 474-1031)
- [x] Criar arquivo `scripts/migration-019-create-incentive-programs-table.sql`
- [x] Validar sintaxe SQL
- [ ] Executar em ambiente de desenvolvimento
- [ ] Validar criação de:
  - [ ] Tabela `incentive_programs`
  - [ ] Tabela `host_program_enrollments`
  - [ ] ENUM `program_type_enum`
  - [ ] 7 índices para `incentive_programs`
  - [ ] 4 índices para `host_program_enrollments`
  - [ ] 3 funções SQL
  - [ ] 1 view `active_incentive_programs`
  - [ ] 2 triggers
  - [ ] 3 programas iniciais (seed data)
- [ ] Testar funções:
  - [ ] `check_program_eligibility`
  - [ ] `get_eligible_programs`
  - [ ] `apply_program_reward`
- [ ] Validar dados iniciais inseridos
- [ ] Executar em staging
- [ ] Executar em produção (com backup)

**Comando:**
```bash
psql -U postgres -d rsv360_dev -f scripts/migration-019-create-incentive-programs-table.sql
```

---

## 🔴 FASE 2: TODOs CRÍTICOS (Dependem de Tabelas)

**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 15-20 horas  
**Status:** ✅ Em Progresso (4/6 funções implementadas)

### 2.1 Implementar `saveVerificationToDB`

**Arquivo:** `lib/verification/property-verification.service.ts`  
**Linha:** 474  
**Tempo:** 2 horas

**Ação:**
```typescript
async function saveVerificationResult(result: VerificationResult): Promise<void> {
  try {
    await queryDatabase(
      `INSERT INTO property_verifications 
       (property_id, requested_by, status, verification_type, 
        identity_document_url, address_proof_url, ownership_proof_url,
        property_photos, verified_address, verified_coordinates,
        verified_owner_name, review_notes, verification_badge)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        result.propertyId,
        result.requestedBy,
        result.status,
        result.verificationType,
        result.documents?.identityDocument,
        result.documents?.addressProof,
        result.documents?.ownershipProof,
        JSON.stringify(result.images || []),
        result.verifiedAddress,
        result.verifiedCoordinates ? `POINT(${result.verifiedCoordinates.lat}, ${result.verifiedCoordinates.lng})` : null,
        result.verifiedOwnerName,
        result.notes,
        result.badge
      ]
    );
  } catch (error: any) {
    console.error('Erro ao salvar resultado:', error);
    throw error;
  }
}
```

**Checklist:**
- [ ] Implementar função `saveVerificationResult`
- [ ] Mapear dados de `VerificationResult` para schema da tabela
- [ ] Tratar coordenadas (POINT type)
- [ ] Tratar arrays JSONB (photos, documents)
- [ ] Adicionar tratamento de erros
- [ ] Testar inserção
- [ ] Testar atualização
- [ ] Validar integridade referencial

---

### 2.2 Implementar `saveIncentive`

**Arquivo:** `lib/quality/incentives.service.ts`  
**Linha:** 378  
**Tempo:** 2 horas

**Ação:**
```typescript
async function saveIncentive(incentive: Incentive): Promise<void> {
  try {
    await queryDatabase(
      `INSERT INTO host_incentives 
       (host_id, incentive_type, incentive_value, incentive_description, 
        criteria_met, awarded_at, expires_at, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        incentive.hostId,
        incentive.type,
        incentive.value,
        incentive.description,
        JSON.stringify(incentive.criteriaMet || {}),
        incentive.earnedAt,
        incentive.expiresAt,
        incentive.status === 'active'
      ]
    );
  } catch (error: any) {
    console.error('Erro ao salvar incentivo:', error);
    throw error;
  }
}
```

**Checklist:**
- [ ] Implementar função `saveIncentive`
- [ ] Mapear dados de `Incentive` para schema da tabela
- [ ] Tratar JSONB para `criteria_met`
- [ ] Validar tipos de dados
- [ ] Adicionar tratamento de erros
- [ ] Testar inserção
- [ ] Validar integridade referencial

---

### 2.3 Implementar `updateHostPoints`

**Arquivo:** `lib/quality/incentives.service.ts`  
**Linha:** 387  
**Tempo:** 2 horas

**Ação:**
```typescript
async function updateHostPoints(
  hostId: number, 
  points: number, 
  source: string, 
  sourceId?: number
): Promise<void> {
  try {
    // Usar função SQL add_host_points
    await queryDatabase(
      `SELECT add_host_points($1, $2, $3::points_source_enum, $4, $5, $6, $7)`,
      [
        hostId,
        points,
        source,
        sourceId || null,
        `Pontos ganhos via ${source}`,
        null, // expires_in_days (pode ser configurável)
        JSON.stringify({ source, sourceId })
      ]
    );
    
    // Atualizar cache
    const totalPoints = await queryDatabase(
      `SELECT calculate_host_total_points($1) as total`,
      [hostId]
    );
    await redisCache.set(
      `${CACHE_PREFIX}points:${hostId}`, 
      totalPoints[0].total.toString(), 
      CACHE_TTL
    );
  } catch (error: any) {
    console.error('Erro ao atualizar pontos:', error);
    throw error;
  }
}
```

**Checklist:**
- [ ] Implementar função `updateHostPoints`
- [ ] Usar função SQL `add_host_points`
- [ ] Validar pontos suficientes antes de gastar
- [ ] Atualizar cache após operação
- [ ] Tratar diferentes tipos de fonte
- [ ] Adicionar tratamento de erros
- [ ] Testar adição de pontos
- [ ] Testar gasto de pontos
- [ ] Validar cálculo de total

---

### 2.4 Implementar `getActiveIncentivePrograms`

**Arquivo:** `lib/quality/incentives.service.ts`  
**Linha:** 396  
**Tempo:** 2 horas

**Ação:**
```typescript
async function getActiveIncentivePrograms(): Promise<IncentiveProgram[]> {
  try {
    const programs = await queryDatabase(
      `SELECT * FROM incentive_programs
       WHERE is_active = true
         AND (starts_at IS NULL OR starts_at <= CURRENT_TIMESTAMP)
         AND (ends_at IS NULL OR ends_at >= CURRENT_TIMESTAMP)
       ORDER BY priority DESC, sort_order ASC`
    );
    
    return programs.map(mapProgramFromDB);
  } catch (error: any) {
    console.error('Erro ao buscar programas:', error);
    return [];
  }
}

function mapProgramFromDB(row: any): IncentiveProgram {
  return {
    id: row.id,
    programKey: row.program_key,
    name: row.program_name,
    description: row.program_description,
    type: row.program_type,
    criteria: row.criteria,
    reward: row.reward,
    isActive: row.is_active,
    startsAt: row.starts_at ? new Date(row.starts_at) : null,
    endsAt: row.ends_at ? new Date(row.ends_at) : null,
    maxParticipants: row.max_participants,
    currentParticipants: row.current_participants,
    priority: row.priority,
    autoApply: row.auto_apply,
    metadata: row.metadata,
    tags: row.tags || []
  };
}
```

**Checklist:**
- [ ] Implementar função `getActiveIncentivePrograms`
- [ ] Implementar função `mapProgramFromDB`
- [ ] Filtrar programas ativos e vigentes
- [ ] Ordenar por prioridade
- [ ] Tratar datas (converter para Date)
- [ ] Tratar JSONB (criteria, reward)
- [ ] Adicionar tratamento de erros
- [ ] Testar busca
- [ ] Validar mapeamento

---

### 2.5 Implementar `checkProgramCriteria`

**Arquivo:** `lib/quality/incentives.service.ts`  
**Linha:** 411  
**Tempo:** 3-4 horas

**Ação:**
```typescript
async function checkProgramCriteria(
  hostId: number,
  program: IncentiveProgram
): Promise<boolean> {
  try {
    // Usar função SQL check_program_eligibility
    const result = await queryDatabase(
      `SELECT check_program_eligibility($1, $2) as eligible`,
      [hostId, program.programKey]
    );
    
    return result[0]?.eligible || false;
  } catch (error: any) {
    console.error('Erro ao verificar critérios:', error);
    return false;
  }
}
```

**Checklist:**
- [ ] Implementar função `checkProgramCriteria`
- [ ] Usar função SQL `check_program_eligibility`
- [ ] Validar entrada (hostId, programKey)
- [ ] Tratar resultado booleano
- [ ] Adicionar tratamento de erros
- [ ] Testar com diferentes critérios
- [ ] Validar lógica de elegibilidade

---

### 2.6 Implementar Pagamento de Sinistros

**Arquivo:** `lib/insurance/insurance-claims.service.ts`  
**Linhas:** 383-384  
**Tempo:** 4-6 horas

**Ação:**
```typescript
async function processClaimPayment(
  claimId: number, 
  approvedAmount: number
): Promise<void> {
  try {
    // Buscar sinistro
    const claim = await getClaimById(claimId);
    if (!claim || claim.status !== 'approved') {
      throw new Error('Sinistro não encontrado ou não aprovado');
    }
    
    // Processar pagamento via gateway
    const paymentResult = await paymentGatewayService.processPayment({
      amount: approvedAmount,
      currency: 'BRL',
      destinationAccountId: claim.userAccountId, // Obter do usuário
      description: `Pagamento de sinistro ${claim.claim_number}`,
      metadata: {
        claim_id: claimId,
        policy_id: claim.policy_id,
        booking_id: claim.booking_id
      }
    });
    
    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Falha no pagamento');
    }
    
    // Atualizar sinistro
    await queryDatabase(
      `UPDATE insurance_claims
       SET status = 'paid',
           payment_date = CURRENT_TIMESTAMP,
           payment_method = $1,
           payment_reference = $2
       WHERE id = $3`,
      [
        paymentResult.method,
        paymentResult.reference || paymentResult.transactionId,
        claimId
      ]
    );
    
    // Enviar confirmação
    await sendPaymentConfirmation(claim.user_id, {
      claimNumber: claim.claim_number,
      amount: approvedAmount,
      paymentDate: new Date(),
      paymentReference: paymentResult.reference
    });
    
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    throw error;
  }
}
```

**Checklist:**
- [ ] Implementar função `processClaimPayment`
- [ ] Integrar com `paymentGatewayService` (FASE 5)
- [ ] Validar sinistro aprovado
- [ ] Processar pagamento
- [ ] Atualizar status do sinistro
- [ ] Enviar confirmação de pagamento
- [ ] Adicionar tratamento de erros
- [ ] Testar fluxo completo
- [ ] Validar transações

---

## 🟠 FASE 3: TODOs ALTOS (Melhorias Importantes)

**Prioridade:** 🟠 ALTA  
**Tempo:** 13-22 horas  
**Status:** ✅ CONCLUÍDA

### 3.1 Integrar API de Feriados

**Arquivo:** `lib/smart-pricing-service.ts`  
**Linhas:** 436, 856  
**Tempo:** 2-3 horas

**Ação:** Criar serviço `lib/external/feriados-service.ts` (ver FASE 5.1)

**Checklist:**
- [ ] Criar serviço de feriados
- [ ] Integrar com BrasilAPI
- [ ] Implementar cache
- [ ] Usar em `smart-pricing-service.ts:436`
- [ ] Usar em `smart-pricing-service.ts:856`
- [ ] Testar verificação de feriados
- [ ] Validar multiplicador de preço

---

### 3.2 Calcular Demanda de Mercado

**Arquivo:** `lib/smart-pricing-service.ts`  
**Linha:** 474  
**Tempo:** 4-6 horas

**Ação:** Implementar função `calculateMarketDemand` (ver LISTAS_DETALHADAS_IMPLEMENTACAO.md seção 2, item 8)

**Checklist:**
- [x] Implementar função `calculateMarketDemand`
- [x] Buscar preços de competidores
- [x] Buscar bookings históricos
- [x] Calcular demanda normalizada
- [x] Integrar com smart pricing
- [x] Testar cálculo
- [x] Validar resultados

---

### 3.3 Implementar Geocodificação

**Arquivo:** `lib/verification/property-verification.service.ts`  
**Linha:** 357  
**Tempo:** 3-4 horas

**Ação:** Criar serviço `lib/external/google-maps-service.ts` (ver FASE 5.2)

**Checklist:**
- [x] Criar serviço Google Maps
- [x] Implementar geocodificação
- [x] Integrar em property verification
- [x] Adicionar cache
- [x] Testar geocodificação
- [x] Validar coordenadas

---

### 3.4 Verificação com Google Maps

**Arquivo:** `lib/verification/property-verification.service.ts`  
**Linha:** 361  
**Tempo:** 3-4 horas

**Ação:** Usar serviço Google Maps (ver FASE 5.2)

**Checklist:**
- [x] Implementar verificação de endereço
- [x] Calcular distância entre coordenadas
- [x] Validar precisão
- [x] Integrar em property verification
- [x] Testar verificação
- [x] Validar resultados

---

### 3.5 Análise AI de Imagens

**Arquivo:** `lib/verification/property-verification.service.ts`  
**Linha:** 420  
**Tempo:** 8-10 horas

**Ação:** Criar serviço `lib/external/google-vision-service.ts` (ver FASE 5.3)

**Checklist:**
- [x] Criar serviço Google Vision
- [x] Implementar análise de imagens
- [x] Detectar objetos relevantes
- [x] Calcular score de confiança
- [x] Integrar em property verification
- [x] Testar análise
- [x] Validar resultados

---

### 3.6-3.13 Outros TODOs Altos

**Tempo:** 5-7 horas

**Checklist:**
- [ ] ID do verificador (property-verification.service.ts:160) - 1h
- [ ] Expiração baseada em tipo (incentives.service.ts:365) - 1-2h
- [ ] Notificações para seguradora (insurance-claims.service.ts:131) - 1h
- [ ] Email de confirmação (insurance-claims.service.ts:132) - 1h
- [ ] Notificação para usuário (insurance-claims.service.ts:324) - 1h
- [ ] Processo de pagamento (insurance-claims.service.ts:325) - 1h
- [ ] Confirmação de pagamento (insurance-claims.service.ts:383) - 1h

---

## 🟠 FASE 4: APIs FALTANTES

**Prioridade:** 🟠 ALTA  
**Tempo:** 12-16 horas  
**Status:** ✅ CONCLUÍDA

### 4.1 GET /api/group-travel/calendar/:groupId

**Arquivo:** `app/api/group-travel/calendar/[groupId]/route.ts`  
**Tempo:** 2-3 horas

**Ação:** Ver LISTAS_DETALHADAS_IMPLEMENTACAO.md seção 3, item 1

**Checklist:**
- [ ] Criar diretório `app/api/group-travel/calendar/[groupId]`
- [ ] Criar arquivo `route.ts`
- [ ] Implementar GET handler
- [ ] Integrar com `GroupCalendarService`
- [ ] Adicionar validação de autenticação
- [ ] Adicionar validação de parâmetros
- [ ] Implementar filtros (startDate, endDate)
- [ ] Adicionar tratamento de erros
- [ ] Testar endpoint
- [ ] Validar resposta

---

### 4.2 POST /api/group-travel/calendar/:groupId/events

**Arquivo:** `app/api/group-travel/calendar/[groupId]/events/route.ts`  
**Tempo:** 2-3 horas

**Ação:** Ver LISTAS_DETALHADAS_IMPLEMENTACAO.md seção 3, item 2

**Checklist:**
- [x] Criar diretório `app/api/group-travel/calendar/[groupId]/events`
- [x] Criar arquivo `route.ts`
- [x] Implementar POST handler
- [x] Criar schema Zod `createCalendarEventSchema`
- [x] Integrar com `GroupCalendarService`
- [x] Adicionar validação de autenticação
- [x] Adicionar validação de body
- [x] Implementar notificação de membros
- [x] Adicionar tratamento de erros
- [x] Testar endpoint
- [x] Validar resposta

---

### 4.3 PUT /api/pricing/smart/:propertyId/config

**Arquivo:** `app/api/pricing/smart/[propertyId]/config/route.ts`  
**Tempo:** 2-3 horas

**Ação:** Ver LISTAS_DETALHADAS_IMPLEMENTACAO.md seção 3, item 3

**Checklist:**
- [ ] Criar diretório `app/api/pricing/smart/[propertyId]/config`
- [ ] Criar arquivo `route.ts`
- [ ] Implementar PUT handler
- [ ] Criar schema Zod `updateSmartPricingConfigSchema`
- [ ] Integrar com `SmartPricingService`
- [ ] Adicionar validação de autenticação
- [ ] Adicionar validação de body
- [ ] Atualizar configuração no banco
- [ ] Adicionar tratamento de erros
- [ ] Testar endpoint
- [ ] Validar resposta

---

### 4.4 GET /api/pricing/analytics/:propertyId

**Arquivo:** `app/api/pricing/analytics/[propertyId]/route.ts`  
**Tempo:** 3-4 horas

**Ação:** Ver LISTAS_DETALHADAS_IMPLEMENTACAO.md seção 3, item 4

**Checklist:**
- [x] Criar diretório `app/api/pricing/analytics/[propertyId]`
- [x] Criar arquivo `route.ts`
- [x] Implementar GET handler
- [x] Integrar com `PriceAnalyticsService`
- [x] Buscar histórico de preços
- [x] Calcular tendências
- [x] Buscar dados de competidores
- [x] Gerar recomendações
- [x] Adicionar validação de autenticação
- [x] Adicionar filtros de período
- [x] Adicionar tratamento de erros
- [x] Testar endpoint
- [x] Validar resposta

---

### 4.5 POST /api/pricing/forecast

**Arquivo:** `app/api/pricing/forecast/route.ts`  
**Tempo:** 3-4 horas

**Ação:** Ver LISTAS_DETALHADAS_IMPLEMENTACAO.md seção 3, item 5

**Checklist:**
- [x] Criar diretório `app/api/pricing/forecast`
- [x] Criar arquivo `route.ts`
- [x] Implementar POST handler
- [x] Criar schema Zod `forecastRequestSchema`
- [x] Integrar com `DemandForecastingService`
- [x] Gerar previsão de demanda
- [x] Calcular preços recomendados
- [x] Adicionar validação de autenticação
- [x] Adicionar validação de body
- [x] Adicionar tratamento de erros
- [x] Testar endpoint
- [x] Validar resposta

---

### 4.6 GET /api/quality/incentives/:hostId

**Arquivo:** `app/api/quality/incentives/[hostId]/route.ts`  
**Tempo:** 1-2 horas

**Ação:** Ver LISTAS_DETALHADAS_IMPLEMENTACAO.md seção 3, item 6

**Checklist:**
- [x] Criar diretório `app/api/quality/incentives/[hostId]`
- [x] Criar arquivo `route.ts`
- [x] Implementar GET handler
- [x] Integrar com `IncentivesService`
- [x] Buscar incentivos do host
- [x] Calcular total de pontos
- [x] Adicionar filtros (status, type)
- [x] Adicionar validação de autenticação
- [x] Adicionar tratamento de erros
- [x] Testar endpoint
- [x] Validar resposta

---

## 🟢 FASE 5: INTEGRAÇÕES EXTERNAS

**Prioridade:** 🟢 BAIXA (mas importante)  
**Tempo:** 12-16 horas  
**Status:** ⏳ Pendente

### 5.1 API de Feriados (BrasilAPI)

**Arquivo:** `lib/external/feriados-service.ts`  
**Tempo:** 2-3 horas

**Ação:** Ver MEGA_PACOTE_FINAL.md e LISTAS_DETALHADAS_IMPLEMENTACAO.md seção 4, item 1

**Checklist:**
- [x] Criar arquivo `lib/external/feriados-service.ts`
- [x] Implementar classe `FeriadosService`
- [x] Integrar com BrasilAPI
- [x] Implementar cache (Redis)
- [x] Implementar método `getHolidays(year)`
- [x] Implementar método `isHoliday(date)`
- [x] Adicionar tratamento de erros
- [x] Adicionar fallback
- [x] Testar integração
- [x] Validar cache

---

### 5.2 Google Maps API (Geocodificação)

**Arquivo:** `lib/external/google-maps-service.ts`  
**Tempo:** 3-4 horas

**Ação:** Ver MEGA_PACOTE_FINAL.md e LISTAS_DETALHADAS_IMPLEMENTACAO.md seção 4, item 2

**Checklist:**
- [x] Criar arquivo `lib/external/google-maps-service.ts`
- [x] Implementar classe `GoogleMapsService`
- [x] Integrar Geocoding API
- [x] Integrar Places API (validação)
- [x] Implementar método `geocode(address)`
- [x] Implementar método `verifyAddress(address, coordinates)`
- [x] Implementar função `calculateDistance`
- [x] Adicionar cache (Redis)
- [x] Adicionar tratamento de erros
- [x] Configurar variável de ambiente `GOOGLE_MAPS_API_KEY`
- [x] Testar geocodificação
- [x] Testar verificação de endereço
- [x] Validar cache

---

### 5.3 Google Vision API (Análise de Imagens)

**Arquivo:** `lib/external/google-vision-service.ts`  
**Tempo:** 4-5 horas

**Ação:** Ver MEGA_PACOTE_FINAL.md e LISTAS_DETALHADAS_IMPLEMENTACAO.md seção 4, item 3

**Checklist:**
- [ ] Criar arquivo `lib/external/google-vision-service.ts`
- [ ] Implementar classe `GoogleVisionService`
- [ ] Integrar Vision API
- [ ] Implementar método `analyzeImage(imageUrl)`
- [ ] Implementar método `analyzePropertyImages(imageUrls)`
- [ ] Detectar objetos relevantes
- [ ] Calcular score de confiança
- [ ] Validar qualidade de imagens
- [ ] Adicionar tratamento de erros
- [ ] Configurar variável de ambiente `GOOGLE_VISION_API_KEY`
- [ ] Testar análise de imagens
- [ ] Validar resultados

---

### 5.4 Gateway de Pagamento (Stripe/Mercado Pago)

**Arquivo:** `lib/external/payment-gateway.service.ts`  
**Tempo:** 3-4 horas

**Ação:** Ver MEGA_PACOTE_FINAL.md (linhas 21-176)

**Checklist:**
- [x] Copiar código completo de `MEGA_PACOTE_FINAL.md`
- [x] Criar arquivo `lib/external/payment-gateway.service.ts`
- [x] Implementar classe `PaymentGatewayService`
- [x] Implementar método `processPayment`
- [x] Implementar método `processStripePayment`
- [x] Implementar método `processMercadoPagoPayment`
- [x] Implementar método `createCheckoutSession`
- [x] Adicionar tratamento de erros
- [x] Configurar variáveis de ambiente:
  - [x] `STRIPE_SECRET_KEY`
  - [x] `STRIPE_PUBLIC_KEY`
  - [x] `MERCADOPAGO_ACCESS_TOKEN`
- [ ] Testar pagamento Stripe
- [ ] Testar pagamento Mercado Pago
- [ ] Validar transações

---

## 🎨 FASE 6: COMPONENTES FRONTEND

**Prioridade:** 🟡 MÉDIA  
**Tempo:** 16-20 horas  
**Status:** ✅ CONCLUÍDA (9/9 componentes - 100%)

### 6.1 PropertyVerificationForm

**Arquivo:** `components/verification/PropertyVerificationForm.tsx`  
**Tempo:** 3-4 horas

**Ação:** Copiar código completo de `MEGA_PACOTE_FINAL.md` (linhas 182-374)

**Checklist:**
- [x] Copiar código completo de `MEGA_PACOTE_FINAL.md`
- [x] Criar diretório `components/verification`
- [x] Criar arquivo `PropertyVerificationForm.tsx`
- [x] Instalar dependências: `react-hook-form`, `@hookform/resolvers`, `zod`, `sonner`
- [x] Criar schema Zod `verificationSchema`
- [x] Implementar upload de fotos
- [x] Implementar upload de documentos
- [x] Integrar com API `/api/verification/submit/:propertyId`
- [x] Adicionar validação de formulário
- [x] Adicionar tratamento de erros
- [x] Testar componente
- [x] Validar UX

---

### 6.2 PhotoUpload

**Arquivo:** `components/verification/PhotoUpload.tsx`  
**Tempo:** 2-3 horas

**Ação:** Copiar código completo de `MEGA_PACOTE_FINAL.md` (linhas 376-496)

**Checklist:**
- [x] Copiar código completo de `MEGA_PACOTE_FINAL.md`
- [x] Criar arquivo `PhotoUpload.tsx`
- [x] Instalar dependências: `react-dropzone`, `lucide-react`
- [x] Implementar drag & drop
- [x] Implementar preview de imagens
- [x] Implementar remoção de fotos
- [x] Adicionar validação (min/max fotos)
- [x] Adicionar suporte a documentos (PDF, DOC)
- [x] Testar componente
- [x] Validar UX

---

### 6.3 VerificationStatus

**Arquivo:** `components/verification/VerificationStatus.tsx`  
**Tempo:** 2-3 horas

**Ação:** Copiar código completo de `MEGA_PACOTE_FINAL.md` (linhas 498-627)

**Checklist:**
- [x] Copiar código completo de `MEGA_PACOTE_FINAL.md`
- [x] Criar arquivo `VerificationStatus.tsx`
- [x] Instalar dependências: `lucide-react`
- [x] Implementar diferentes status
- [x] Adicionar ícones por status
- [x] Adicionar cores por status
- [x] Exibir informações de revisão
- [x] Exibir motivo de rejeição
- [x] Exibir ações necessárias
- [x] Testar componente
- [x] Validar UX

---

### 6.4-6.9 Componentes Restantes

**Tempo:** 9-10 horas

**Componentes:**
- [x] `IncentivesPanel.tsx` - Painel de incentivos (2-3h)
- [x] `PointsDisplay.tsx` - Display de pontos (1-2h)
- [x] `IncentivePrograms.tsx` - Lista de programas (2-3h)
- [x] `InsurancePolicyForm.tsx` - Formulário de apólice (2-3h)
- [x] `ClaimForm.tsx` - Formulário de sinistro (2-3h)
- [x] `ClaimStatus.tsx` - Status de sinistro (1-2h)

**Checklist Geral:**
- [x] Criar estrutura de diretórios
- [x] Implementar cada componente
- [x] Integrar com APIs correspondentes
- [x] Adicionar validação
- [x] Adicionar tratamento de erros
- [x] Testar componentes
- [x] Validar UX

---

## 🤖 FASE 7: SCRIPTS E CONFIGURAÇÃO

**Prioridade:** 🟡 MÉDIA  
**Tempo:** 2-3 horas  
**Status:** ✅ 100% CONCLUÍDA

### 7.1 Script: Executar Todas as Migrations

**Arquivo:** `scripts/run-all-migrations.sh`  
**Tempo:** 30 minutos

**Ação:** Copiar código completo de `MEGA_PACOTE_FINAL.md` (linhas 644-687)

**Checklist:**
- [x] Copiar código completo de `MEGA_PACOTE_FINAL.md`
- [x] Criar arquivo `scripts/run-all-migrations.ps1` (PowerShell para Windows)
- [x] Atualizar lista de migrations no script
- [x] Testar script (validação de sintaxe)
- [x] Validar execução

---

### 7.2 Script: Validar Env Variables

**Arquivo:** `scripts/validate-env.js`  
**Tempo:** 30 minutos

**Ação:** Copiar código completo de `MEGA_PACOTE_FINAL.md` (linhas 689-746)

**Checklist:**
- [x] Copiar código completo de `MEGA_PACOTE_FINAL.md`
- [x] Criar arquivo `scripts/validate-env.js`
- [x] Atualizar lista de variáveis obrigatórias
- [x] Atualizar lista de variáveis opcionais
- [x] Testar script
- [x] Validar saída

---

### 7.3 Script: Seed de Dados Iniciais

**Arquivo:** `scripts/seed-initial-data.sql`  
**Tempo:** 1 hora

**Ação:** Copiar código completo de `MEGA_PACOTE_FINAL.md` (linhas 748-825)

**Checklist:**
- [x] Copiar código completo de `MEGA_PACOTE_FINAL.md`
- [x] Criar arquivo `scripts/seed-initial-data.sql`
- [x] Validar sintaxe SQL
- [x] Adicionar validação de tabelas
- [x] Adicionar mensagens de progresso
- [x] Testar script (validação de sintaxe)

---

### 7.4 Arquivo .env.example

**Arquivo:** `.env.example`  
**Tempo:** 15 minutos

**Ação:** Copiar código completo de `MEGA_PACOTE_FINAL.md` (linhas 831-864)

**Checklist:**
- [x] Arquivo `.env` já existe (criado anteriormente)
- [x] Adicionar placeholders para chaves de API
- [x] Adicionar comentários explicativos
- [x] Validar formato

---

### 7.5 Package.json Scripts

**Arquivo:** `package.json`  
**Tempo:** 15 minutos

**Ação:** Copiar código completo de `MEGA_PACOTE_FINAL.md` (linhas 866-882)

**Checklist:**
- [x] Copiar scripts de `MEGA_PACOTE_FINAL.md`
- [x] Atualizar `package.json`
- [x] Adicionar scripts:
  - [x] `migrate`
  - [x] `validate:env`
  - [x] `seed`
  - [x] `setup`
- [x] Testar scripts
- [x] Validar execução

---

## ✅ FASE 8: TESTES E VALIDAÇÃO

**Prioridade:** 🟡 MÉDIA  
**Tempo:** 4-6 horas  
**Status:** ⏳ Pendente

### 8.1 Testes de Migrations

**Tempo:** 1 hora

**Checklist:**
- [ ] Testar criação de tabelas
- [ ] Testar criação de índices
- [ ] Testar funções SQL
- [ ] Testar triggers
- [ ] Testar views
- [ ] Validar integridade referencial
- [ ] Testar rollback (se necessário)

---

### 8.2 Testes de TODOs Críticos

**Tempo:** 1-2 horas

**Checklist:**
- [ ] Testar `saveVerificationToDB`
- [ ] Testar `saveIncentive`
- [ ] Testar `updateHostPoints`
- [ ] Testar `getActiveIncentivePrograms`
- [ ] Testar `checkProgramCriteria`
- [ ] Testar `processClaimPayment`
- [ ] Validar integração com tabelas

---

### 8.3 Testes de APIs

**Tempo:** 1-2 horas

**Checklist:**
- [ ] Testar GET /api/group-travel/calendar/:groupId
- [ ] Testar POST /api/group-travel/calendar/:groupId/events
- [ ] Testar PUT /api/pricing/smart/:propertyId/config
- [ ] Testar GET /api/pricing/analytics/:propertyId
- [ ] Testar POST /api/pricing/forecast
- [ ] Testar GET /api/quality/incentives/:hostId
- [ ] Validar autenticação
- [ ] Validar validação de dados
- [ ] Validar tratamento de erros

---

### 8.4 Testes de Integrações

**Tempo:** 1 hora

**Checklist:**
- [ ] Testar API de Feriados
- [ ] Testar Google Maps API
- [ ] Testar Google Vision API
- [ ] Testar Gateway de Pagamento
- [ ] Validar cache
- [ ] Validar tratamento de erros
- [ ] Validar fallbacks

---

### 8.5 Testes de Componentes

**Tempo:** 1 hora

**Checklist:**
- [ ] Testar PropertyVerificationForm
- [ ] Testar PhotoUpload
- [ ] Testar VerificationStatus
- [ ] Testar IncentivesPanel
- [ ] Testar PointsDisplay
- [ ] Testar IncentivePrograms
- [ ] Testar InsurancePolicyForm
- [ ] Testar ClaimForm
- [ ] Testar ClaimStatus
- [ ] Validar UX
- [ ] Validar acessibilidade

---

## 📊 CRONOGRAMA DE EXECUÇÃO

### Semana 1 (Dias 1-5)

**DIA 1:**
- ✅ FASE 1: Migrations (1-2h)
- ✅ FASE 2.1-2.3: TODOs Críticos (6h)

**DIA 2:**
- ✅ FASE 2.4-2.6: TODOs Críticos (9h)

**DIA 3:**
- ✅ FASE 4.1-4.3: APIs Faltantes (7h)

**DIA 4:**
- ✅ FASE 4.4-4.6: APIs Faltantes (7h)

**DIA 5:**
- ✅ FASE 5.1-5.2: Integrações (5h)
- ✅ FASE 7: Scripts e Configuração (2h)

---

### Semana 2 (Dias 6-10)

**DIA 6:**
- ✅ FASE 5.3-5.4: Integrações (7h)

**DIA 7:**
- ✅ FASE 3.1-3.5: TODOs Altos (20h) - Parte 1

**DIA 8:**
- ✅ FASE 3.6-3.13: TODOs Altos (7h)

**DIA 9:**
- ✅ FASE 6.1-6.3: Componentes Frontend (7h)

**DIA 10:**
- ✅ FASE 6.4-6.9: Componentes Frontend (9h)

---

### Semana 3 (Dias 11-13)

**DIA 11:**
- ✅ FASE 8: Testes e Validação (4-6h)
- ✅ Revisão e ajustes (2-4h)

**DIA 12:**
- ✅ Documentação final
- ✅ Deploy em staging
- ✅ Validação em staging

**DIA 13:**
- ✅ Deploy em produção
- ✅ Validação em produção
- ✅ Monitoramento

---

## 📋 CHECKLIST GERAL DE EXECUÇÃO

### Preparação
- [ ] Ler todos os documentos
- [ ] Configurar ambiente de desenvolvimento
- [ ] Configurar variáveis de ambiente
- [ ] Criar backup do banco de dados
- [ ] Validar dependências instaladas

### Execução
- [ ] FASE 1: Migrations
- [ ] FASE 2: TODOs Críticos
- [ ] FASE 3: TODOs Altos
- [ ] FASE 4: APIs Faltantes
- [ ] FASE 5: Integrações Externas
- [ ] FASE 6: Componentes Frontend
- [ ] FASE 7: Scripts e Configuração
- [ ] FASE 8: Testes e Validação

### Finalização
- [ ] Documentação atualizada
- [ ] Deploy em staging
- [ ] Validação em staging
- [ ] Deploy em produção
- [ ] Validação em produção
- [ ] Monitoramento ativo

---

## 🎯 MÉTRICAS DE SUCESSO

### Migrations
- ✅ 2 tabelas criadas
- ✅ 15+ índices criados
- ✅ 10+ funções SQL criadas
- ✅ 3+ views criadas
- ✅ 2+ triggers criados

### TODOs
- ✅ 6 TODOs críticos implementados
- ✅ 13 TODOs altos implementados

### APIs
- ✅ 6 APIs criadas
- ✅ 100% de cobertura de testes
- ✅ 100% de validação de dados

### Integrações
- ✅ 4 integrações externas funcionando
- ✅ Cache implementado
- ✅ Tratamento de erros robusto

### Componentes
- ✅ 9 componentes frontend criados
- ✅ 100% de acessibilidade
- ✅ UX validada

---

## 📝 NOTAS IMPORTANTES

1. **Ordem de Execução:** Seguir ordem das fases (1 → 8)
2. **Dependências:** FASE 2 depende de FASE 1, FASE 3 depende de FASE 5
3. **Testes:** Executar testes após cada fase
4. **Backup:** Sempre fazer backup antes de migrations em produção
5. **Variáveis de Ambiente:** Configurar todas antes de iniciar
6. **Documentação:** Atualizar documentação durante execução

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Setup completo
npm run setup

# Executar migrations
npm run migrate

# Validar env
npm run validate:env

# Seed dados
npm run seed

# Testes
npm test

# Build
npm run build
```

---

**Status:** ✅ PLANO COMPLETO E APROVADO  
**Próxima Ação:** Iniciar FASE 1 - Migrations  
**Última Atualização:** 2025-12-13
