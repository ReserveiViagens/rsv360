# 🏗️ ARQUITETURA DO SISTEMA - RSV GEN 2

**Versão:** 2.0.0  
**Data:** 22/11/2025  
**Status:** Documentação Completa

---

## 📋 VISÃO GERAL

O RSV Gen 2 é uma plataforma Next.js 15 full-stack para gestão de reservas de hospedagem, construída com TypeScript, PostgreSQL e Redis.

---

## 🏛️ ARQUITETURA GERAL

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                     │
│  React 19 + Next.js 15 + TailwindCSS + Radix UI        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────┐
│              NEXT.JS APPLICATION LAYER                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  App Router (app/)                               │   │
│  │  - Pages (Server Components)                    │   │
│  │  - API Routes (Route Handlers)                   │   │
│  │  - Middleware                                    │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Components (components/)                       │   │
│  │  - UI Components (shadcn/ui)                    │   │
│  │  - Feature Components                           │   │
│  │  - Business Logic Components                    │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              BUSINESS LOGIC LAYER (lib/)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Services                                        │   │
│  │  - booking-service.ts                           │   │
│  │  - smart-pricing-service.ts                     │   │
│  │  - top-host-service.ts                          │   │
│  │  - insurance-service.ts                          │   │
│  │  - verification-service.ts                       │   │
│  │  - wishlist-service.ts                           │   │
│  │  - split-payment-service.ts                      │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Integrations                                    │   │
│  │  - google-calendar-service.ts                    │   │
│  │  - smart-lock-service.ts                         │   │
│  │  - klarna-service.ts                             │   │
│  │  - kakau-insurance-client.ts                     │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Utilities                                       │   │
│  │  - api-auth.ts (JWT Authentication)             │   │
│  │  - db.ts (PostgreSQL Client)                    │   │
│  │  - cache-integration.ts (Redis)                 │   │
│  │  - upload-service.ts (S3/Cloudinary)            │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│  PostgreSQL    │      │     Redis        │
│  (Primary DB)  │      │  (Cache/Queue)  │
└────────────────┘      └──────────────────┘
```

---

## 📦 ESTRUTURA DE MÓDULOS

### 1. Módulo de Reservas (Bookings)
**Localização:** `lib/booking-service.ts`, `app/api/bookings/`

**Responsabilidades:**
- Criar, atualizar, cancelar reservas
- Gerenciar status de reservas
- Calcular valores e taxas
- Integração com pagamentos

**Dependências:**
- `db.ts` - Acesso ao banco
- `api-auth.ts` - Autenticação
- `properties-service.ts` - Validação de propriedades
- `availability-service.ts` - Verificação de disponibilidade

---

### 2. Módulo de Viagens em Grupo
**Localização:** `lib/wishlist-service.ts`, `lib/split-payment-service.ts`, `lib/trip-invitation-service.ts`, `lib/group-chat-service.ts`

**Responsabilidades:**
- Wishlists compartilhadas
- Divisão de pagamento
- Convites de viagem
- Chat em grupo

**Dependências:**
- `db.ts`
- `api-auth.ts`
- `booking-service.ts`

---

### 3. Módulo de Smart Pricing
**Localização:** `lib/smart-pricing-service.ts`, `lib/ml/demand-predictor.ts`

**Responsabilidades:**
- Cálculo de preços dinâmicos
- Previsão de demanda (ML)
- Análise de competidores
- Integração com APIs externas (Weather, Events)

**Dependências:**
- `db.ts`
- `cache-integration.ts`
- `eventbrite-service.ts`
- `google-calendar-sync.ts`

---

### 4. Módulo de Programa Top Host
**Localização:** `lib/top-host-service.ts`

**Responsabilidades:**
- Cálculo de ratings de hosts
- Sistema de badges
- Leaderboard
- Métricas de qualidade

**Dependências:**
- `db.ts`
- `cache-integration.ts`
- `booking-service.ts`

---

### 5. Módulo de Seguros
**Localização:** `lib/insurance-service.ts`, `lib/kakau-insurance-client.ts`

**Responsabilidades:**
- Criação de apólices
- Gerenciamento de sinistros
- Integração com Kakau Seguros
- Cálculo de prêmios

**Dependências:**
- `db.ts`
- `kakau-insurance-client.ts`
- `booking-service.ts`

---

### 6. Módulo de Verificação
**Localização:** `lib/verification-service.ts`, `lib/upload-service.ts`

**Responsabilidades:**
- Upload de fotos/vídeos
- Processo de verificação
- Moderação de propriedades
- Badges de verificação

**Dependências:**
- `db.ts`
- `upload-service.ts` (S3/Cloudinary)
- `api-auth.ts`

---

### 7. Módulo de Integrações
**Localização:** `lib/google-calendar-service.ts`, `lib/smart-lock-service.ts`, `lib/klarna-service.ts`

**Responsabilidades:**
- Sincronização Google Calendar
- Integração com Smart Locks
- Klarna Pay Later

**Dependências:**
- `db.ts`
- APIs externas (Google, Klarna, Smart Locks)

---

## 🔐 CAMADA DE AUTENTICAÇÃO

### Fluxo de Autenticação:

```
1. Login → POST /api/auth/login
   ↓
2. Validação de credenciais (bcrypt)
   ↓
3. Geração de JWT token
   ↓
4. Retorno: { token, user, refreshToken }
   ↓
5. Cliente armazena token
   ↓
6. Requisições subsequentes: Header Authorization: Bearer <token>
   ↓
7. Middleware requireAuth() valida token
   ↓
8. Acesso concedido/negado
```

**Arquivos:**
- `lib/api-auth.ts` - Middleware de autenticação
- `lib/advanced-auth.ts` - Autenticação avançada
- `app/api/auth/*` - Rotas de autenticação

---

## 💾 CAMADA DE DADOS

### PostgreSQL (Primary Database)

**Conexão:** `lib/db.ts`
- Pool de conexões
- Query parametrizada (prevenção SQL injection)
- Transações

**Principais Tabelas:**
- `users` - Usuários do sistema
- `properties` - Propriedades para reserva
- `bookings` - Reservas
- `payments` - Pagamentos
- `wishlists` - Wishlists compartilhadas
- `insurance_policies` - Apólices de seguro
- `property_verifications` - Verificações
- `host_ratings` - Ratings de hosts
- `pricing_history` - Histórico de preços

### Redis (Cache & Queue)

**Conexão:** `lib/cache-integration.ts`
- Cache de dados frequentes
- Cache de resultados de APIs externas
- Invalidação inteligente

**Uso:**
- Smart Pricing calculations
- Host quality scores
- External API responses (Weather, Events)

---

## 🔄 FLUXO DE REQUISIÇÃO TÍPICO

```
1. Cliente faz requisição HTTP
   ↓
2. Next.js Middleware (middleware.ts)
   - Verifica autenticação
   - Rate limiting
   - CORS
   ↓
3. API Route Handler (app/api/*/route.ts)
   - Validação Zod
   - Autenticação (requireAuth)
   - Autorização (role check)
   ↓
4. Service Layer (lib/*-service.ts)
   - Lógica de negócio
   - Validações
   - Cache check
   ↓
5. Database Layer (lib/db.ts)
   - Query parametrizada
   - Transações
   ↓
6. Response
   - JSON formatado
   - Error handling
   - Status codes
```

---

## 🎨 PADRÕES ARQUITETURAIS

### 1. Service Layer Pattern
- Toda lógica de negócio em services
- Services são stateless
- Services retornam dados, não componentes

### 2. Repository Pattern (Simplificado)
- `db.ts` atua como repository
- Queries centralizadas
- Facilita testes e manutenção

### 3. Dependency Injection
- Services recebem dependências via parâmetros
- Facilita testes unitários
- Baixo acoplamento

### 4. Schema Validation (Zod)
- Validação de entrada em todas as APIs
- Type safety
- Mensagens de erro claras

### 5. Error Handling
- Try-catch em todas as operações
- Erros padronizados
- Logging centralizado

---

## 🔗 DEPENDÊNCIAS ENTRE MÓDULOS

```
┌─────────────────┐
│  API Routes     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Services      │
│  ┌───────────┐  │
│  │ Booking   │──┼──► Properties
│  │ Service   │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │ Smart     │──┼──► Cache
│  │ Pricing   │  │    Weather API
│  └───────────┘  │    Events API
│  ┌───────────┐  │
│  │ Insurance │──┼──► Kakau API
│  │ Service   │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │ Top Host  │──┼──► Cache
│  │ Service   │  │    Bookings
│  └───────────┘  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Database/      │
│  Cache Layer    │
└─────────────────┘
```

---

## 🚀 DEPLOY E INFRAESTRUTURA

### Ambientes:
- **Development:** Local com Docker Compose
- **Staging:** (A configurar)
- **Production:** (A configurar)

### Stack:
- **Runtime:** Node.js 18+
- **Framework:** Next.js 15
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Container:** Docker
- **CI/CD:** GitHub Actions

---

## 📝 DECISÕES ARQUITETURAIS (ADRs)

### ADR-001: Next.js App Router
**Decisão:** Usar App Router do Next.js 15  
**Razão:** Melhor performance, Server Components, melhor DX  
**Alternativas consideradas:** Pages Router  
**Status:** ✅ Implementado

### ADR-002: PostgreSQL como Primary DB
**Decisão:** PostgreSQL para todos os dados relacionais  
**Razão:** ACID, robustez, JSONB support  
**Alternativas consideradas:** MongoDB, MySQL  
**Status:** ✅ Implementado

### ADR-003: Redis para Cache
**Decisão:** Redis para cache e queue  
**Razão:** Performance, TTL, pub/sub  
**Alternativas consideradas:** Memcached, In-memory  
**Status:** ✅ Implementado

### ADR-004: Zod para Validação
**Decisão:** Zod para validação de schemas  
**Razão:** Type-safe, TypeScript-first, excelente DX  
**Alternativas consideradas:** Joi, Yup  
**Status:** ✅ Implementado

### ADR-005: JWT para Autenticação
**Decisão:** JWT tokens para autenticação  
**Razão:** Stateless, escalável, padrão da indústria  
**Alternativas consideradas:** Sessions, OAuth2  
**Status:** ✅ Implementado

---

## 🔒 SEGURANÇA

### Implementado:
- ✅ JWT Authentication
- ✅ Password hashing (bcrypt)
- ✅ SQL Injection prevention (parametrized queries)
- ✅ CORS configurado
- ✅ Rate limiting básico
- ✅ Input validation (Zod)

### A Implementar:
- ⚠️ HTTPS enforcement
- ⚠️ CSRF protection
- ⚠️ XSS prevention avançado
- ⚠️ Security headers
- ⚠️ Audit logging completo

---

## 📊 MONITORAMENTO

### Implementado:
- ✅ Health check endpoint (`/api/health`)
- ✅ Error logging básico
- ✅ Performance monitoring básico

### A Implementar:
- ⚠️ Prometheus metrics
- ⚠️ Grafana dashboards
- ⚠️ Alertas configurados
- ⚠️ APM (Application Performance Monitoring)

---

**Última atualização:** 22/11/2025

