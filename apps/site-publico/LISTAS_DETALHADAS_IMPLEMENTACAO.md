# 📋 LISTAS DETALHADAS PARA IMPLEMENTAÇÃO

**Data:** 2025-12-12  
**Status:** Listas Completas  
**Última Atualização:** 2025-12-12

---

## 1️⃣ AGORA: MIGRATIONS DE BANCO DE DADOS FALTANTES

### 📊 Resumo
- **Total de Migrations Faltantes:** 2
- **Tempo Estimado:** 1-2 horas
- **Prioridade:** 🔴 CRÍTICA

---

### 🔴 Migration 1: `host_points` (Sistema de Pontos)

**Arquivo:** `scripts/migration-018-create-host-points-table.sql`

**Tabela a Criar:**
```sql
CREATE TABLE IF NOT EXISTS host_points (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  points_type VARCHAR(50) NOT NULL, -- 'earned', 'spent', 'expired', 'bonus'
  source VARCHAR(100), -- 'booking', 'rating', 'referral', 'promotion'
  source_id INTEGER, -- ID da origem (booking_id, rating_id, etc)
  description TEXT,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_host_points_host FOREIGN KEY (host_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_host_points_host ON host_points(host_id);
CREATE INDEX IF NOT EXISTS idx_host_points_type ON host_points(points_type);
CREATE INDEX IF NOT EXISTS idx_host_points_active ON host_points(is_active);
CREATE INDEX IF NOT EXISTS idx_host_points_expires ON host_points(expires_at);
```

**Campos:**
- `id` - Primary key
- `host_id` - FK para users
- `points` - Quantidade de pontos (pode ser negativo para gastos)
- `points_type` - Tipo: 'earned', 'spent', 'expired', 'bonus'
- `source` - Origem dos pontos: 'booking', 'rating', 'referral', 'promotion'
- `source_id` - ID da origem (opcional)
- `description` - Descrição da transação
- `expires_at` - Data de expiração (opcional)
- `is_active` - Se os pontos estão ativos
- `created_at`, `updated_at` - Timestamps

**Índices:**
- `idx_host_points_host` - Busca por host
- `idx_host_points_type` - Busca por tipo
- `idx_host_points_active` - Busca por status ativo
- `idx_host_points_expires` - Busca por expiração

**Funções SQL:**
```sql
-- Função para calcular total de pontos de um host
CREATE OR REPLACE FUNCTION calculate_host_total_points(p_host_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(points) 
     FROM host_points 
     WHERE host_id = p_host_id 
       AND is_active = true 
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)),
    0
  );
END;
$$ LANGUAGE plpgsql;
```

**Dependências:**
- Tabela `users` deve existir
- Usado por: `lib/quality/incentives.service.ts:387`

---

### 🔴 Migration 2: `incentive_programs` (Programas de Incentivo)

**Arquivo:** `scripts/migration-019-create-incentive-programs-table.sql`

**Tabela a Criar:**
```sql
CREATE TABLE IF NOT EXISTS incentive_programs (
  id SERIAL PRIMARY KEY,
  program_key VARCHAR(100) UNIQUE NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  program_description TEXT,
  program_type VARCHAR(50) NOT NULL, -- 'points', 'discount', 'badge', 'feature', 'commission'
  criteria JSONB NOT NULL, -- Critérios para elegibilidade
  reward JSONB NOT NULL, -- Recompensa (pontos, desconto, etc)
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0, -- Prioridade (maior = mais importante)
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incentive_programs_key ON incentive_programs(program_key);
CREATE INDEX IF NOT EXISTS idx_incentive_programs_type ON incentive_programs(program_type);
CREATE INDEX IF NOT EXISTS idx_incentive_programs_active ON incentive_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_incentive_programs_dates ON incentive_programs(starts_at, ends_at);
```

**Campos:**
- `id` - Primary key
- `program_key` - Chave única do programa (ex: 'superhost_bonus')
- `program_name` - Nome do programa
- `program_description` - Descrição
- `program_type` - Tipo: 'points', 'discount', 'badge', 'feature', 'commission'
- `criteria` - JSONB com critérios (ex: `{"min_rating": 4.8, "min_bookings": 10}`)
- `reward` - JSONB com recompensa (ex: `{"points": 1000, "discount_percent": 5}`)
- `is_active` - Se o programa está ativo
- `starts_at`, `ends_at` - Período de vigência
- `max_participants` - Limite de participantes (opcional)
- `current_participants` - Contador atual
- `priority` - Prioridade (maior = mais importante)
- `metadata` - Metadados adicionais
- `created_at`, `updated_at` - Timestamps

**Índices:**
- `idx_incentive_programs_key` - Busca por chave
- `idx_incentive_programs_type` - Busca por tipo
- `idx_incentive_programs_active` - Busca por status ativo
- `idx_incentive_programs_dates` - Busca por período

**Funções SQL:**
```sql
-- Função para verificar elegibilidade de host em programa
CREATE OR REPLACE FUNCTION check_program_eligibility(
  p_host_id INTEGER,
  p_program_key VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_criteria JSONB;
  v_host_score DECIMAL(5, 2);
  v_host_rating DECIMAL(3, 2);
BEGIN
  -- Buscar critérios do programa
  SELECT criteria INTO v_criteria
  FROM incentive_programs
  WHERE program_key = p_program_key 
    AND is_active = true
    AND (starts_at IS NULL OR starts_at <= CURRENT_TIMESTAMP)
    AND (ends_at IS NULL OR ends_at >= CURRENT_TIMESTAMP);
  
  IF v_criteria IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar critérios (exemplo)
  IF v_criteria->>'min_score' IS NOT NULL THEN
    v_host_score := calculate_host_score(p_host_id);
    IF v_host_score < (v_criteria->>'min_score')::DECIMAL THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Adicionar mais verificações conforme necessário
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;
```

**Dependências:**
- Função `calculate_host_score` (já existe em migration-017)
- Usado por: `lib/quality/incentives.service.ts:396`

---

### 📝 Checklist de Implementação

- [ ] Criar arquivo `migration-018-create-host-points-table.sql`
- [ ] Criar tabela `host_points` com todos os campos
- [ ] Criar índices necessários
- [ ] Criar função `calculate_host_total_points`
- [ ] Criar arquivo `migration-019-create-incentive-programs-table.sql`
- [ ] Criar tabela `incentive_programs` com todos os campos
- [ ] Criar índices necessários
- [ ] Criar função `check_program_eligibility`
- [ ] Testar migrations em ambiente de desenvolvimento
- [ ] Validar integridade referencial

---

## 2️⃣ HOJE: FUNCIONALIDADES COM TODOs - IMPLEMENTAÇÃO

### 📊 Resumo
- **Total de TODOs:** 19
- **Críticos:** 6
- **Altos:** 13
- **Tempo Estimado:** 28-42 horas

---

### 🔴 CRÍTICOS (6 funcionalidades) - Dependem de Tabelas

#### 1. `property-verification.service.ts:474` - Implementar quando tabela for criada
**Arquivo:** `lib/verification/property-verification.service.ts`  
**Linha:** 474  
**Status:** ⏳ Pendente (depende de `property_verifications`)  
**Prioridade:** 🔴 Crítica  
**Tempo:** 2 horas

**O que fazer:**
- Implementar função que salva verificação no banco
- Usar tabela `property_verifications` (já existe em migration-016)
- Implementar validação de dados antes de salvar
- Adicionar tratamento de erros

**Código atual:**
```typescript
// TODO: Implementar quando tabela property_verifications for criada
```

**Código a implementar:**
```typescript
async function saveVerificationToDB(verification: VerificationRequest): Promise<VerificationRequest> {
  const result = await queryDatabase(
    `INSERT INTO property_verifications 
     (property_id, requested_by, status, verification_type, ...)
     VALUES ($1, $2, $3, $4, ...)
     RETURNING *`,
    [verification.property_id, verification.requested_by, ...]
  );
  return mapVerificationFromDB(result[0]);
}
```

---

#### 2. `incentives.service.ts:378` - Implementar quando tabela host_incentives for criada
**Arquivo:** `lib/quality/incentives.service.ts`  
**Linha:** 378  
**Status:** ⏳ Pendente (depende de `host_incentives`)  
**Prioridade:** 🔴 Crítica  
**Tempo:** 2 horas

**O que fazer:**
- Implementar função `saveIncentive` que salva no banco
- Usar tabela `host_incentives` (já existe em migration-017)
- Validar dados antes de salvar
- Adicionar tratamento de erros

**Código atual:**
```typescript
async function saveIncentive(incentive: Incentive): Promise<void> {
  try {
    // TODO: Implementar quando tabela host_incentives for criada
    console.log(`Salvando incentivo para host ${incentive.hostId}: ${incentive.title}`);
  } catch (error: any) {
    console.error('Erro ao salvar incentivo:', error);
  }
}
```

**Código a implementar:**
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
        JSON.stringify(incentive.criteriaMet),
        incentive.awardedAt,
        incentive.expiresAt,
        incentive.isActive
      ]
    );
  } catch (error: any) {
    console.error('Erro ao salvar incentivo:', error);
    throw error;
  }
}
```

---

#### 3. `incentives.service.ts:387` - Implementar quando tabela host_points for criada
**Arquivo:** `lib/quality/incentives.service.ts`  
**Linha:** 387  
**Status:** ⏳ Pendente (depende de `host_points`)  
**Prioridade:** 🔴 Crítica  
**Tempo:** 2 horas

**O que fazer:**
- Implementar função `updateHostPoints` que salva no banco
- Usar tabela `host_points` (precisa criar migration)
- Calcular total de pontos
- Adicionar registro de transação

**Código atual:**
```typescript
async function updateHostPoints(hostId: number, totalPoints: number): Promise<void> {
  try {
    // TODO: Implementar quando tabela host_points for criada
    await redisCache.set(`${CACHE_PREFIX}points:${hostId}`, totalPoints.toString(), CACHE_TTL);
  } catch (error: any) {
    console.error('Erro ao atualizar pontos:', error);
  }
}
```

**Código a implementar:**
```typescript
async function updateHostPoints(hostId: number, points: number, source: string, sourceId?: number): Promise<void> {
  try {
    // Registrar transação de pontos
    await queryDatabase(
      `INSERT INTO host_points 
       (host_id, points, points_type, source, source_id, description, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [
        hostId,
        points,
        points > 0 ? 'earned' : 'spent',
        source,
        sourceId || null,
        `Pontos ${points > 0 ? 'ganhos' : 'gastos'} via ${source}`
      ]
    );
    
    // Atualizar cache
    const totalPoints = await queryDatabase(
      `SELECT calculate_host_total_points($1) as total`,
      [hostId]
    );
    await redisCache.set(`${CACHE_PREFIX}points:${hostId}`, totalPoints[0].total.toString(), CACHE_TTL);
  } catch (error: any) {
    console.error('Erro ao atualizar pontos:', error);
    throw error;
  }
}
```

---

#### 4. `incentives.service.ts:396` - Buscar do banco quando tabela incentive_programs for criada
**Arquivo:** `lib/quality/incentives.service.ts`  
**Linha:** 396  
**Status:** ⏳ Pendente (depende de `incentive_programs`)  
**Prioridade:** 🔴 Crítica  
**Tempo:** 2 horas

**O que fazer:**
- Implementar função `getActiveIncentivePrograms` que busca do banco
- Usar tabela `incentive_programs` (precisa criar migration)
- Filtrar por programas ativos e vigentes
- Mapear resultados para objetos TypeScript

**Código atual:**
```typescript
async function getActiveIncentivePrograms(): Promise<IncentiveProgram[]> {
  try {
    // TODO: Buscar do banco quando tabela incentive_programs for criada
    return [];
  } catch (error: any) {
    console.error('Erro ao buscar programas:', error);
    return [];
  }
}
```

**Código a implementar:**
```typescript
async function getActiveIncentivePrograms(): Promise<IncentiveProgram[]> {
  try {
    const programs = await queryDatabase(
      `SELECT * FROM incentive_programs
       WHERE is_active = true
         AND (starts_at IS NULL OR starts_at <= CURRENT_TIMESTAMP)
         AND (ends_at IS NULL OR ends_at >= CURRENT_TIMESTAMP)
       ORDER BY priority DESC, created_at DESC`
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
    metadata: row.metadata
  };
}
```

---

#### 5. `incentives.service.ts:411` - Implementar verificação de critérios
**Arquivo:** `lib/quality/incentives.service.ts`  
**Linha:** 411  
**Status:** ⏳ Pendente  
**Prioridade:** 🔴 Crítica  
**Tempo:** 3-4 horas

**O que fazer:**
- Implementar função `checkProgramCriteria` que verifica se host atende critérios
- Buscar métricas do host (score, rating, bookings, etc)
- Comparar com critérios do programa
- Retornar true/false

**Código atual:**
```typescript
async function checkProgramCriteria(
  hostId: number,
  program: IncentiveProgram
): Promise<boolean> {
  try {
    // Verificar critérios do programa
    // Por enquanto, retornar false
    // TODO: Implementar verificação de critérios
    return false;
  } catch (error: any) {
    console.error('Erro ao verificar critérios:', error);
    return false;
  }
}
```

**Código a implementar:**
```typescript
async function checkProgramCriteria(
  hostId: number,
  program: IncentiveProgram
): Promise<boolean> {
  try {
    const criteria = program.criteria;
    
    // Verificar score mínimo
    if (criteria.min_score) {
      const hostScore = await queryDatabase(
        `SELECT calculate_host_score($1) as score`,
        [hostId]
      );
      if (hostScore[0].score < criteria.min_score) {
        return false;
      }
    }
    
    // Verificar rating mínimo
    if (criteria.min_rating) {
      const rating = await queryDatabase(
        `SELECT AVG(rating_value) as avg_rating
         FROM host_ratings
         WHERE host_id = $1 AND rating_type = 'overall'`,
        [hostId]
      );
      if (rating[0].avg_rating < criteria.min_rating) {
        return false;
      }
    }
    
    // Verificar número mínimo de bookings
    if (criteria.min_bookings) {
      const bookings = await queryDatabase(
        `SELECT COUNT(*) as count
         FROM bookings
         WHERE owner_id = $1 AND status IN ('confirmed', 'completed')`,
        [hostId]
      );
      if (bookings[0].count < criteria.min_bookings) {
        return false;
      }
    }
    
    // Verificar taxa de resposta mínima
    if (criteria.min_response_rate) {
      const responseRate = await queryDatabase(
        `SELECT metric_value
         FROM quality_metrics
         WHERE host_id = $1 AND metric_type = 'response_rate'
         ORDER BY calculated_at DESC
         LIMIT 1`,
        [hostId]
      );
      if (!responseRate[0] || responseRate[0].metric_value < criteria.min_response_rate) {
        return false;
      }
    }
    
    return true;
  } catch (error: any) {
    console.error('Erro ao verificar critérios:', error);
    return false;
  }
}
```

---

#### 6. `insurance-claims.service.ts:383-384` - Integrar com gateway de pagamento
**Arquivo:** `lib/insurance/insurance-claims.service.ts`  
**Linhas:** 383-384  
**Status:** ⏳ Pendente  
**Prioridade:** 🔴 Crítica  
**Tempo:** 4-6 horas

**O que fazer:**
- Implementar função que processa pagamento de sinistro aprovado
- Integrar com gateway de pagamento (Stripe, Mercado Pago, etc)
- Enviar confirmação de pagamento
- Atualizar status do sinistro

**Código atual:**
```typescript
// TODO: Enviar confirmação de pagamento
// TODO: Integrar com gateway de pagamento
```

**Código a implementar:**
```typescript
async function processClaimPayment(claimId: number, approvedAmount: number): Promise<void> {
  try {
    // Buscar sinistro
    const claim = await getClaimById(claimId);
    if (!claim || claim.status !== 'approved') {
      throw new Error('Sinistro não encontrado ou não aprovado');
    }
    
    // Processar pagamento via gateway
    const paymentResult = await processPayment({
      amount: approvedAmount,
      currency: 'BRL',
      description: `Pagamento de sinistro ${claim.claim_number}`,
      metadata: {
        claim_id: claimId,
        policy_id: claim.policy_id,
        booking_id: claim.booking_id
      }
    });
    
    // Atualizar sinistro
    await queryDatabase(
      `UPDATE insurance_claims
       SET status = 'paid',
           payment_date = CURRENT_TIMESTAMP,
           payment_method = $1,
           payment_reference = $2
       WHERE id = $3`,
      [paymentResult.method, paymentResult.reference, claimId]
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

---

### 🟠 ALTOS (13 funcionalidades) - Melhorias Importantes

#### 7. `smart-pricing-service.ts:436` - Integrar API de feriados
**Arquivo:** `lib/smart-pricing-service.ts`  
**Linha:** 436  
**Status:** ⏳ Pendente  
**Prioridade:** 🟠 Alta  
**Tempo:** 2-3 horas  
**Dificuldade:** Moderada

**O que fazer:**
- Integrar com API de feriados (BrasilAPI ou similar)
- Verificar se data é feriado
- Aplicar multiplicador de preço para feriados
- Cachear resultados

**Código atual:**
```typescript
isHoliday: false, // TODO: Integrar API de feriados
```

**Código a implementar:**
```typescript
async function checkIfHoliday(date: Date, location: string): Promise<boolean> {
  const cacheKey = `holiday:${date.toISOString().split('T')[0]}:${location}`;
  
  // Verificar cache
  const cached = await redisCache.get(cacheKey);
  if (cached !== null) {
    return cached === 'true';
  }
  
  try {
    // Buscar da API (exemplo com BrasilAPI)
    const response = await fetch(
      `https://brasilapi.com.br/api/feriados/v1/${date.getFullYear()}`
    );
    const holidays = await response.json();
    
    const isHoliday = holidays.some((h: any) => {
      const holidayDate = new Date(h.date);
      return holidayDate.toDateString() === date.toDateString();
    });
    
    // Cachear resultado
    await redisCache.set(cacheKey, isHoliday ? 'true' : 'false', 86400); // 24h
    
    return isHoliday;
  } catch (error) {
    console.error('Erro ao verificar feriado:', error);
    return false; // Fallback: não é feriado
  }
}
```

---

#### 8. `smart-pricing-service.ts:474` - Calcular baseado em dados de mercado
**Arquivo:** `lib/smart-pricing-service.ts`  
**Linha:** 474  
**Status:** ⏳ Pendente  
**Prioridade:** 🟠 Alta  
**Tempo:** 4-6 horas  
**Dificuldade:** Difícil

**O que fazer:**
- Buscar dados históricos de mercado
- Calcular média de preços de competidores
- Aplicar análise de tendências
- Considerar sazonalidade

**Código atual:**
```typescript
marketDemand: 0.6, // TODO: Calcular baseado em dados de mercado
```

**Código a implementar:**
```typescript
async function calculateMarketDemand(
  location: string,
  date: Date
): Promise<number> {
  try {
    // Buscar preços de competidores dos últimos 30 dias
    const competitorPrices = await queryDatabase(
      `SELECT AVG(price) as avg_price, COUNT(*) as count
       FROM competitor_prices
       WHERE location = $1
         AND scraped_at >= $2
         AND scraped_at < $3`,
      [
        location,
        new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000),
        date
      ]
    );
    
    // Buscar bookings históricos
    const historicalBookings = await queryDatabase(
      `SELECT COUNT(*) as count
       FROM bookings
       WHERE item_id IN (
         SELECT id FROM properties WHERE location = $1
       )
         AND check_in >= $2
         AND check_in < $3
         AND status IN ('confirmed', 'completed')`,
      [
        location,
        new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000),
        date
      ]
    );
    
    // Calcular demanda (0.0 a 1.0)
    const avgPrice = competitorPrices[0]?.avg_price || 0;
    const bookingCount = historicalBookings[0]?.count || 0;
    
    // Normalizar demanda (exemplo simplificado)
    const demand = Math.min(1.0, Math.max(0.0, 
      (bookingCount / 100) * 0.5 + // 50% baseado em bookings
      (avgPrice > 0 ? 0.5 : 0)      // 50% baseado em preços
    ));
    
    return demand;
  } catch (error) {
    console.error('Erro ao calcular demanda de mercado:', error);
    return 0.6; // Fallback
  }
}
```

---

#### 9. `smart-pricing-service.ts:856` - Implementar verificação de feriados
**Arquivo:** `lib/smart-pricing-service.ts`  
**Linha:** 856  
**Status:** ⏳ Pendente  
**Prioridade:** 🟠 Alta  
**Tempo:** 2-3 horas  
**Dificuldade:** Fácil

**O que fazer:**
- Reutilizar função de verificação de feriados (item 7)
- Aplicar multiplicador de preço
- Documentar comportamento

**Código atual:**
```typescript
// TODO: Implementar verificação de feriados
```

**Código a implementar:**
```typescript
const isHoliday = await checkIfHoliday(checkIn, location);
if (isHoliday) {
  multipliers.holiday = 1.2; // 20% de aumento em feriados
}
```

---

#### 10. `property-verification.service.ts:160` - ID do verificador
**Arquivo:** `lib/verification/property-verification.service.ts`  
**Linha:** 160  
**Status:** ⏳ Pendente  
**Prioridade:** 🟠 Alta  
**Tempo:** 1 hora  
**Dificuldade:** Fácil

**O que fazer:**
- Obter ID do usuário autenticado
- Salvar em `reviewed_by`
- Adicionar validação

**Código atual:**
```typescript
verifiedBy: status === 'approved' ? 0 : null, // TODO: ID do verificador
```

**Código a implementar:**
```typescript
verifiedBy: status === 'approved' ? (userId || null) : null,
```

---

#### 11. `property-verification.service.ts:357` - Implementar geocodificação
**Arquivo:** `lib/verification/property-verification.service.ts`  
**Linha:** 357  
**Status:** ⏳ Pendente  
**Prioridade:** 🟠 Alta  
**Tempo:** 3-4 horas  
**Dificuldade:** Moderada

**O que fazer:**
- Integrar com serviço de geocodificação (Google Maps, OpenStreetMap)
- Converter endereço em coordenadas
- Validar coordenadas
- Cachear resultados

**Código atual:**
```typescript
// TODO: Implementar geocodificação
```

**Código a implementar:**
```typescript
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const cacheKey = `geocode:${address}`;
  
  // Verificar cache
  const cached = await redisCache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  try {
    // Usar Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const result = { lat: location.lat, lng: location.lng };
      
      // Cachear por 30 dias
      await redisCache.set(cacheKey, JSON.stringify(result), 2592000);
      
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    return null;
  }
}
```

---

#### 12. `property-verification.service.ts:361` - Verificação com Google Maps API
**Arquivo:** `lib/verification/property-verification.service.ts`  
**Linha:** 361  
**Status:** ⏳ Pendente  
**Prioridade:** 🟠 Alta  
**Tempo:** 3-4 horas  
**Dificuldade:** Moderada

**O que fazer:**
- Usar Google Maps API para validar endereço
- Verificar se endereço existe
- Comparar com coordenadas fornecidas
- Validar precisão

**Código atual:**
```typescript
// TODO: Implementar verificação com Google Maps API
```

**Código a implementar:**
```typescript
async function verifyAddressWithGoogleMaps(
  address: string,
  coordinates: { lat: number; lng: number }
): Promise<boolean> {
  try {
    // Geocodificar endereço
    const geocoded = await geocodeAddress(address);
    if (!geocoded) {
      return false;
    }
    
    // Calcular distância entre coordenadas fornecidas e geocodificadas
    const distance = calculateDistance(
      coordinates.lat,
      coordinates.lng,
      geocoded.lat,
      geocoded.lng
    );
    
    // Aceitar se distância for menor que 100m
    return distance < 0.1; // 100 metros
  } catch (error) {
    console.error('Erro na verificação de endereço:', error);
    return false;
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

---

#### 13. `property-verification.service.ts:420` - Análise AI de imagens
**Arquivo:** `lib/verification/property-verification.service.ts`  
**Linha:** 420  
**Status:** ⏳ Pendente  
**Prioridade:** 🟠 Alta  
**Tempo:** 8-10 horas  
**Dificuldade:** Difícil

**O que fazer:**
- Integrar com Google Vision API ou similar
- Analisar imagens para verificar se são de propriedades reais
- Detectar objetos relevantes (cama, banheiro, cozinha, etc)
- Validar qualidade das imagens
- Retornar score de confiança

**Código atual:**
```typescript
// TODO: Análise AI de imagens (verificar se são de propriedades reais)
```

**Código a implementar:**
```typescript
async function analyzeImagesWithAI(imageUrls: string[]): Promise<{
  isValid: boolean;
  confidence: number;
  detectedObjects: string[];
  qualityScore: number;
}> {
  try {
    const results = await Promise.all(
      imageUrls.map(async (url) => {
        // Usar Google Vision API
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [{
                image: { source: { imageUri: url } },
                features: [
                  { type: 'OBJECT_LOCALIZATION' },
                  { type: 'LABEL_DETECTION' },
                  { type: 'IMAGE_PROPERTIES' }
                ]
              }]
            })
          }
        );
        
        const data = await response.json();
        return data.responses[0];
      })
    );
    
    // Analisar resultados
    const allLabels = results.flatMap(r => r.labelAnnotations || []);
    const propertyRelatedLabels = [
      'bedroom', 'bathroom', 'kitchen', 'living room', 'hotel', 'apartment',
      'furniture', 'bed', 'sofa', 'table', 'chair'
    ];
    
    const relevantLabels = allLabels.filter(label =>
      propertyRelatedLabels.some(prop => 
        label.description.toLowerCase().includes(prop)
      )
    );
    
    const confidence = Math.min(1.0, relevantLabels.length / 5); // Normalizar
    const isValid = confidence > 0.5;
    
    return {
      isValid,
      confidence,
      detectedObjects: relevantLabels.map(l => l.description),
      qualityScore: results.reduce((sum, r) => sum + (r.imagePropertiesAnnotation?.dominantColors?.colors?.length || 0), 0) / results.length
    };
  } catch (error) {
    console.error('Erro na análise AI:', error);
    return {
      isValid: false,
      confidence: 0,
      detectedObjects: [],
      qualityScore: 0
    };
  }
}
```

---

#### 14. `incentives.service.ts:365` - Definir expiração baseada no tipo
**Arquivo:** `lib/quality/incentives.service.ts`  
**Linha:** 365  
**Status:** ⏳ Pendente  
**Prioridade:** 🟠 Alta  
**Tempo:** 1-2 horas  
**Dificuldade:** Fácil

**O que fazer:**
- Definir regras de expiração por tipo de incentivo
- Aplicar regras ao criar incentivo
- Validar expiração

**Código atual:**
```typescript
expiresAt: null, // TODO: Definir expiração baseada no tipo
```

**Código a implementar:**
```typescript
function calculateExpirationDate(type: string, awardedAt: Date): Date | null {
  const expirationRules: Record<string, number> = {
    'discount': 90, // 90 dias
    'priority_support': 30, // 30 dias
    'feature_access': 365, // 1 ano
    'badge': null, // Não expira
    'commission_reduction': 180, // 180 dias
    'points': 365 // 1 ano
  };
  
  const days = expirationRules[type];
  if (days === null || days === undefined) {
    return null; // Não expira
  }
  
  const expiration = new Date(awardedAt);
  expiration.setDate(expiration.getDate() + days);
  return expiration;
}
```

---

#### 15-19. `insurance-claims.service.ts` - Notificações e Comunicação
**Arquivo:** `lib/insurance/insurance-claims.service.ts`  
**Linhas:** 131-132, 324-325  
**Status:** ⏳ Pendente  
**Prioridade:** 🟠 Alta  
**Tempo:** 5-7 horas  
**Dificuldade:** Moderada

**O que fazer:**
- Enviar notificação para seguradora ao criar sinistro
- Enviar email de confirmação para usuário
- Enviar notificação quando sinistro é aprovado/rejeitado
- Iniciar processo de pagamento quando aprovado

**Código atual:**
```typescript
// TODO: Enviar notificação para seguradora
// TODO: Enviar email de confirmação para usuário
// TODO: Enviar notificação para usuário
// TODO: Se aprovado, iniciar processo de pagamento
```

**Código a implementar:**
```typescript
async function notifyInsuranceProvider(claim: InsuranceClaim): Promise<void> {
  // Integrar com webhook ou API da seguradora
  await webhookService.send('insurance_claim_created', {
    claimNumber: claim.claim_number,
    policyId: claim.policy_id,
    claimType: claim.claim_type,
    amount: claim.claimed_amount,
    description: claim.description
  });
}

async function sendClaimConfirmationEmail(userId: number, claim: InsuranceClaim): Promise<void> {
  await emailService.send({
    to: userEmail,
    subject: 'Sinistro Registrado',
    template: 'insurance-claim-confirmation',
    data: {
      claimNumber: claim.claim_number,
      claimType: claim.claim_type,
      amount: claim.claimed_amount
    }
  });
}

async function notifyUserOfClaimStatus(userId: number, claim: InsuranceClaim): Promise<void> {
  await notificationService.send({
    userId,
    type: 'insurance_claim_status',
    title: `Sinistro ${claim.status === 'approved' ? 'Aprovado' : 'Rejeitado'}`,
    message: `Seu sinistro ${claim.claim_number} foi ${claim.status === 'approved' ? 'aprovado' : 'rejeitado'}`,
    data: { claimId: claim.id }
  });
}
```

---

### 📝 Checklist de Implementação - TODOs

#### 🔴 Críticos (6)
- [ ] Implementar `saveVerificationToDB` (property-verification.service.ts:474)
- [ ] Implementar `saveIncentive` (incentives.service.ts:378)
- [ ] Implementar `updateHostPoints` (incentives.service.ts:387)
- [ ] Implementar `getActiveIncentivePrograms` (incentives.service.ts:396)
- [ ] Implementar `checkProgramCriteria` (incentives.service.ts:411)
- [ ] Implementar pagamento de sinistros (insurance-claims.service.ts:383-384)

#### 🟠 Altos (13)
- [ ] Integrar API de feriados (smart-pricing-service.ts:436)
- [ ] Calcular demanda de mercado (smart-pricing-service.ts:474)
- [ ] Verificação de feriados (smart-pricing-service.ts:856)
- [ ] ID do verificador (property-verification.service.ts:160)
- [ ] Geocodificação (property-verification.service.ts:357)
- [ ] Verificação Google Maps (property-verification.service.ts:361)
- [ ] Análise AI de imagens (property-verification.service.ts:420)
- [ ] Expiração baseada em tipo (incentives.service.ts:365)
- [ ] Notificação para seguradora (insurance-claims.service.ts:131)
- [ ] Email de confirmação (insurance-claims.service.ts:132)
- [ ] Notificação para usuário (insurance-claims.service.ts:324)
- [ ] Processo de pagamento (insurance-claims.service.ts:325)
- [ ] Confirmação de pagamento (insurance-claims.service.ts:383)

---

## 3️⃣ AMANHÃ: APIs FALTANTES - IMPLEMENTAÇÃO

### 📊 Resumo
- **Total de APIs Faltantes:** 6
- **Críticas:** 2
- **Altas:** 4
- **Tempo Estimado:** 12-16 horas

---

### 🔴 CRÍTICAS (2 APIs) - Funcionalidades Principais

#### 1. `GET /api/group-travel/calendar/:groupId` - Calendário de Grupo
**Rota:** `app/api/group-travel/calendar/[groupId]/route.ts`  
**Método:** GET  
**Prioridade:** 🔴 Crítica  
**Tempo:** 2-3 horas  
**Dificuldade:** Moderada

**Descrição:**
- Retorna calendário completo de um grupo
- Inclui eventos, disponibilidade dos membros
- Filtros por data, tipo de evento

**Parâmetros:**
- `groupId` (path) - ID do grupo
- `startDate` (query) - Data inicial (opcional)
- `endDate` (query) - Data final (opcional)
- `includeAvailability` (query) - Incluir disponibilidade (opcional, default: false)

**Resposta:**
```typescript
{
  success: true,
  data: {
    groupId: string,
    events: CalendarEvent[],
    availability: CalendarAvailability[],
    metadata: {
      totalEvents: number,
      dateRange: { start: string, end: string }
    }
  }
}
```

**Implementação:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { GroupCalendarService } from '@/lib/group-calendar-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const includeAvailability = searchParams.get('includeAvailability') === 'true';
  
  const calendarService = new GroupCalendarService();
  const events = await calendarService.getGroupEvents(
    params.groupId,
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined
  );
  
  let availability = null;
  if (includeAvailability) {
    availability = await calendarService.getGroupAvailability(
      params.groupId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }
  
  return NextResponse.json({
    success: true,
    data: {
      groupId: params.groupId,
      events,
      availability,
      metadata: {
        totalEvents: events.length,
        dateRange: {
          start: startDate || new Date().toISOString(),
          end: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    }
  });
}
```

---

#### 2. `POST /api/group-travel/calendar/:groupId/events` - Criar Evento
**Rota:** `app/api/group-travel/calendar/[groupId]/events/route.ts`  
**Método:** POST  
**Prioridade:** 🔴 Crítica  
**Tempo:** 2-3 horas  
**Dificuldade:** Moderada

**Descrição:**
- Cria novo evento no calendário do grupo
- Valida permissões do usuário
- Notifica membros do grupo

**Body:**
```typescript
{
  title: string;
  description?: string;
  startDate: string; // ISO date
  endDate?: string; // ISO date
  allDay?: boolean;
  location?: string;
  type?: 'booking' | 'activity' | 'meeting' | 'reminder' | 'custom';
  attendees?: number[];
  color?: string;
  metadata?: Record<string, unknown>;
}
```

**Resposta:**
```typescript
{
  success: true,
  data: CalendarEvent
}
```

**Implementação:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { GroupCalendarService } from '@/lib/group-calendar-service';
import { createCalendarEventSchema } from '@/lib/schemas/group-travel-schemas';

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { user } = authResult;
  const body = await request.json();
  
  // Validar com Zod
  const validation = createCalendarEventSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: 'Dados inválidos', details: validation.error.errors },
      { status: 400 }
    );
  }
  
  const calendarService = new GroupCalendarService();
  const event = await calendarService.createEvent({
    ...validation.data,
    groupId: params.groupId,
    createdBy: user.id
  });
  
  return NextResponse.json({
    success: true,
    data: event
  });
}
```

---

### 🟠 ALTAS (4 APIs) - Funcionalidades Importantes

#### 3. `PUT /api/pricing/smart/:propertyId/config` - Configurar Smart Pricing
**Rota:** `app/api/pricing/smart/[propertyId]/config/route.ts`  
**Método:** PUT  
**Prioridade:** 🟠 Alta  
**Tempo:** 2-3 horas  
**Dificuldade:** Moderada

**Descrição:**
- Atualiza configuração de smart pricing para uma propriedade
- Permite ajustar multiplicadores, limites, etc
- Valida dados antes de salvar

**Body:**
```typescript
{
  minPriceMultiplier?: number;
  maxPriceMultiplier?: number;
  enableWeatherFactor?: boolean;
  enableEventsFactor?: boolean;
  enableCompetitorFactor?: boolean;
  enableDemandFactor?: boolean;
  customRules?: Record<string, unknown>;
}
```

**Resposta:**
```typescript
{
  success: true,
  data: {
    propertyId: number,
    config: SmartPricingConfig
  }
}
```

---

#### 4. `GET /api/pricing/analytics/:propertyId` - Analytics de Pricing
**Rota:** `app/api/pricing/analytics/[propertyId]/route.ts`  
**Método:** GET  
**Prioridade:** 🟠 Alta  
**Tempo:** 3-4 horas  
**Dificuldade:** Difícil

**Descrição:**
- Retorna analytics detalhados de pricing para uma propriedade
- Inclui histórico, tendências, comparação com competidores
- Permite filtros por período

**Query Params:**
- `startDate` (opcional) - Data inicial
- `endDate` (opcional) - Data final
- `includeCompetitors` (opcional) - Incluir dados de competidores

**Resposta:**
```typescript
{
  success: true,
  data: {
    propertyId: number,
    period: { start: string, end: string },
    pricingHistory: PricingHistory[],
    trends: {
      averagePrice: number,
      priceChange: number,
      priceChangePercent: number
    },
    competitors: CompetitorAnalysis[],
    recommendations: PricingRecommendation[]
  }
}
```

---

#### 5. `POST /api/pricing/forecast` - Previsão de Demanda
**Rota:** `app/api/pricing/forecast/route.ts`  
**Método:** POST  
**Prioridade:** 🟠 Alta  
**Tempo:** 3-4 horas  
**Dificuldade:** Difícil

**Descrição:**
- Gera previsão de demanda e preços futuros
- Usa modelo de ML quando disponível
- Retorna recomendações de pricing

**Body:**
```typescript
{
  propertyId: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  includeFactors?: boolean;
}
```

**Resposta:**
```typescript
{
  success: true,
  data: {
    propertyId: number,
    forecast: {
      date: string;
      predictedDemand: number;
      recommendedPrice: number;
      confidence: number;
      factors?: PricingFactors;
    }[]
  }
}
```

---

#### 6. `GET /api/quality/incentives/:hostId` - Listar Incentivos do Host
**Rota:** `app/api/quality/incentives/[hostId]/route.ts`  
**Método:** GET  
**Prioridade:** 🟠 Alta  
**Tempo:** 1-2 horas  
**Dificuldade:** Fácil

**Descrição:**
- Lista todos os incentivos de um host
- Filtros por status, tipo, etc
- Inclui pontos totais

**Query Params:**
- `status` (opcional) - 'active', 'expired', 'used'
- `type` (opcional) - Tipo de incentivo
- `includePoints` (opcional) - Incluir total de pontos

**Resposta:**
```typescript
{
  success: true,
  data: {
    hostId: number,
    incentives: Incentive[],
    totalPoints?: number,
    metadata: {
      activeCount: number,
      expiredCount: number,
      usedCount: number
    }
  }
}
```

---

### 📝 Checklist de Implementação - APIs

#### 🔴 Críticas (2)
- [ ] `GET /api/group-travel/calendar/:groupId`
- [ ] `POST /api/group-travel/calendar/:groupId/events`

#### 🟠 Altas (4)
- [ ] `PUT /api/pricing/smart/:propertyId/config`
- [ ] `GET /api/pricing/analytics/:propertyId`
- [ ] `POST /api/pricing/forecast`
- [ ] `GET /api/quality/incentives/:hostId`

---

## 4️⃣ ESTA SEMANA: INTEGRAÇÕES EXTERNAS - IMPLEMENTAÇÃO

### 📊 Resumo
- **Total de Integrações:** 4
- **Tempo Estimado:** 12-16 horas
- **Prioridade:** 🟢 Baixa (mas importante)

---

### 🟢 INTEGRAÇÕES EXTERNAS (4 APIs)

#### 1. API de Feriados (BrasilAPI)
**Serviço:** BrasilAPI - Feriados Nacionais  
**URL:** `https://brasilapi.com.br/api/feriados/v1/{ano}`  
**Prioridade:** 🟢 Baixa  
**Tempo:** 2-3 horas  
**Dificuldade:** Fácil

**O que fazer:**
- Criar serviço `lib/external/feriados-service.ts`
- Integrar com BrasilAPI
- Cachear resultados
- Tratar erros

**Implementação:**
```typescript
// lib/external/feriados-service.ts
export class FeriadosService {
  private cache: Map<string, any> = new Map();
  
  async getHolidays(year: number): Promise<Holiday[]> {
    const cacheKey = `feriados:${year}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/feriados/v1/${year}`
      );
      const holidays = await response.json();
      
      this.cache.set(cacheKey, holidays);
      return holidays;
    } catch (error) {
      console.error('Erro ao buscar feriados:', error);
      return [];
    }
  }
  
  async isHoliday(date: Date): Promise<boolean> {
    const holidays = await this.getHolidays(date.getFullYear());
    return holidays.some(h => {
      const holidayDate = new Date(h.date);
      return holidayDate.toDateString() === date.toDateString();
    });
  }
}
```

**Uso:**
- `smart-pricing-service.ts:436` - Verificar se data é feriado
- `smart-pricing-service.ts:856` - Aplicar multiplicador de preço

---

#### 2. Google Maps API (Geocodificação)
**Serviço:** Google Maps Geocoding API  
**URL:** `https://maps.googleapis.com/maps/api/geocode/json`  
**Prioridade:** 🟢 Baixa  
**Tempo:** 3-4 horas  
**Dificuldade:** Moderada

**O que fazer:**
- Criar serviço `lib/external/google-maps-service.ts`
- Integrar com Geocoding API
- Integrar com Places API (validação)
- Cachear resultados
- Tratar rate limits

**Implementação:**
```typescript
// lib/external/google-maps-service.ts
export class GoogleMapsService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }
  
  async geocode(address: string): Promise<GeocodeResult | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          address: result.formatted_address,
          location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng
          },
          placeId: result.place_id,
          types: result.types
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      return null;
    }
  }
  
  async verifyAddress(address: string, coordinates: { lat: number; lng: number }): Promise<boolean> {
    const geocoded = await this.geocode(address);
    if (!geocoded) return false;
    
    const distance = this.calculateDistance(
      coordinates.lat,
      coordinates.lng,
      geocoded.location.lat,
      geocoded.location.lng
    );
    
    return distance < 0.1; // 100 metros
  }
  
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
```

**Uso:**
- `property-verification.service.ts:357` - Geocodificar endereço
- `property-verification.service.ts:361` - Verificar endereço

**Configuração Necessária:**
- Variável de ambiente: `GOOGLE_MAPS_API_KEY`
- Habilitar APIs no Google Cloud Console:
  - Geocoding API
  - Places API

---

#### 3. Google Vision API (Análise de Imagens)
**Serviço:** Google Cloud Vision API  
**URL:** `https://vision.googleapis.com/v1/images:annotate`  
**Prioridade:** 🟢 Baixa  
**Tempo:** 4-5 horas  
**Dificuldade:** Difícil

**O que fazer:**
- Criar serviço `lib/external/google-vision-service.ts`
- Integrar com Vision API
- Analisar imagens para verificar se são de propriedades
- Detectar objetos relevantes
- Validar qualidade

**Implementação:**
```typescript
// lib/external/google-vision-service.ts
export class GoogleVisionService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.GOOGLE_VISION_API_KEY || '';
  }
  
  async analyzeImage(imageUrl: string): Promise<VisionAnalysis> {
    try {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { source: { imageUri: imageUrl } },
              features: [
                { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                { type: 'LABEL_DETECTION', maxResults: 20 },
                { type: 'IMAGE_PROPERTIES' },
                { type: 'SAFE_SEARCH_DETECTION' }
              ]
            }]
          })
        }
      );
      
      const data = await response.json();
      return this.parseAnalysis(data.responses[0]);
    } catch (error) {
      console.error('Erro na análise de imagem:', error);
      throw error;
    }
  }
  
  async analyzePropertyImages(imageUrls: string[]): Promise<PropertyImageAnalysis> {
    const analyses = await Promise.all(
      imageUrls.map(url => this.analyzeImage(url))
    );
    
    const propertyLabels = [
      'bedroom', 'bathroom', 'kitchen', 'living room', 'hotel',
      'apartment', 'furniture', 'bed', 'sofa', 'table'
    ];
    
    const relevantLabels = analyses.flatMap(a => 
      a.labels.filter(l => 
        propertyLabels.some(pl => l.description.toLowerCase().includes(pl))
      )
    );
    
    const confidence = Math.min(1.0, relevantLabels.length / 5);
    
    return {
      isValid: confidence > 0.5,
      confidence,
      detectedObjects: relevantLabels.map(l => l.description),
      qualityScore: analyses.reduce((sum, a) => sum + a.qualityScore, 0) / analyses.length,
      safeSearch: analyses.every(a => a.safeSearch === 'LIKELY' || a.safeSearch === 'VERY_LIKELY')
    };
  }
  
  private parseAnalysis(response: any): VisionAnalysis {
    return {
      objects: response.localizedObjectAnnotations || [],
      labels: response.labelAnnotations || [],
      properties: response.imagePropertiesAnnotation || {},
      safeSearch: response.safeSearchAnnotation?.adult || 'UNKNOWN',
      qualityScore: response.imagePropertiesAnnotation?.dominantColors?.colors?.length || 0
    };
  }
}
```

**Uso:**
- `property-verification.service.ts:420` - Analisar imagens de propriedades

**Configuração Necessária:**
- Variável de ambiente: `GOOGLE_VISION_API_KEY`
- Habilitar Vision API no Google Cloud Console
- Configurar billing (API é paga)

---

#### 4. Gateway de Pagamento (Sinistros)
**Serviço:** Stripe, Mercado Pago, ou similar  
**Prioridade:** 🟢 Baixa  
**Tempo:** 3-4 horas  
**Dificuldade:** Moderada

**O que fazer:**
- Criar serviço `lib/external/payment-gateway-service.ts`
- Integrar com gateway escolhido
- Processar pagamentos de sinistros
- Tratar webhooks de confirmação
- Implementar retry logic

**Implementação:**
```typescript
// lib/external/payment-gateway-service.ts
export class PaymentGatewayService {
  private provider: 'stripe' | 'mercadopago';
  
  constructor() {
    this.provider = (process.env.PAYMENT_PROVIDER as any) || 'stripe';
  }
  
  async processPayment(payment: PaymentRequest): Promise<PaymentResult> {
    try {
      if (this.provider === 'stripe') {
        return await this.processStripePayment(payment);
      } else {
        return await this.processMercadoPagoPayment(payment);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      throw error;
    }
  }
  
  private async processStripePayment(payment: PaymentRequest): Promise<PaymentResult> {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const transfer = await stripe.transfers.create({
      amount: Math.round(payment.amount * 100), // Converter para centavos
      currency: payment.currency.toLowerCase(),
      destination: payment.destinationAccountId,
      description: payment.description,
      metadata: payment.metadata
    });
    
    return {
      success: true,
      transactionId: transfer.id,
      reference: transfer.balance_transaction,
      method: 'stripe',
      status: transfer.status,
      processedAt: new Date(transfer.created * 1000)
    };
  }
  
  private async processMercadoPagoPayment(payment: PaymentRequest): Promise<PaymentResult> {
    // Implementar integração com Mercado Pago
    // Similar ao Stripe
  }
}
```

**Uso:**
- `insurance-claims.service.ts:383-384` - Pagar sinistros aprovados

**Configuração Necessária:**
- Variável de ambiente: `STRIPE_SECRET_KEY` ou `MERCADOPAGO_ACCESS_TOKEN`
- Conta no gateway escolhido
- Configurar webhooks para confirmação

---

### 📝 Checklist de Implementação - Integrações

- [ ] Criar `lib/external/feriados-service.ts`
- [ ] Integrar com BrasilAPI
- [ ] Implementar cache
- [ ] Criar `lib/external/google-maps-service.ts`
- [ ] Integrar Geocoding API
- [ ] Integrar Places API
- [ ] Configurar variáveis de ambiente
- [ ] Criar `lib/external/google-vision-service.ts`
- [ ] Integrar Vision API
- [ ] Implementar análise de imagens
- [ ] Criar `lib/external/payment-gateway-service.ts`
- [ ] Integrar com gateway escolhido
- [ ] Implementar webhooks
- [ ] Testar todas as integrações

---

## 📊 RESUMO GERAL DAS LISTAS

### 1️⃣ AGORA - Migrations (2)
- `host_points` - Sistema de pontos
- `incentive_programs` - Programas de incentivo

### 2️⃣ HOJE - TODOs (19)
- **Críticos (6):** Dependem de tabelas
- **Altos (13):** Melhorias importantes

### 3️⃣ AMANHÃ - APIs (6)
- **Críticas (2):** Group Travel Calendar
- **Altas (4):** Pricing e Quality

### 4️⃣ ESTA SEMANA - Integrações (4)
- API de Feriados
- Google Maps API
- Google Vision API
- Gateway de Pagamento

---

**Tempo Total Estimado:** 53-75 horas (~7-10 dias úteis)

---

**Última Atualização:** 2025-12-12  
**Status:** Listas Completas ✅

