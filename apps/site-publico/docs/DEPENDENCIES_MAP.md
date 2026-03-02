# 🔗 MAPEAMENTO DE DEPENDÊNCIAS - RSV GEN 2

**Versão:** 2.0.0  
**Data:** 22/11/2025

---

## 📊 VISÃO GERAL

Este documento mapeia todas as dependências entre módulos, services e componentes do sistema.

---

## 🏗️ DEPENDÊNCIAS ENTRE SERVICES

### Core Services (Base)

#### `lib/db.ts`
**Dependências:** Nenhuma (base)  
**Usado por:**
- Todos os services
- Todas as API routes

#### `lib/api-auth.ts`
**Dependências:**
- `lib/db.ts`

**Usado por:**
- Todas as API routes protegidas
- Middleware de autenticação

#### `lib/cache-integration.ts`
**Dependências:**
- Redis (ioredis)

**Usado por:**
- `smart-pricing-service.ts`
- `top-host-service.ts`
- `wishlist-service.ts`

---

### Business Services

#### `lib/booking-service.ts`
**Dependências:**
- `lib/db.ts`
- `lib/api-auth.ts`
- `lib/properties-service.ts`
- `lib/availability-service.ts`

**Usado por:**
- `split-payment-service.ts`
- `insurance-service.ts`
- `trip-invitation-service.ts`
- `top-host-service.ts`

#### `lib/smart-pricing-service.ts`
**Dependências:**
- `lib/db.ts`
- `lib/cache-integration.ts`
- `lib/ml/demand-predictor.ts`
- `lib/eventbrite-service.ts`
- `lib/google-calendar-sync.ts`

**Usado por:**
- `app/api/pricing/smart/route.ts`

#### `lib/top-host-service.ts`
**Dependências:**
- `lib/db.ts`
- `lib/cache-integration.ts`
- `lib/booking-service.ts` (indireto)

**Usado por:**
- `app/api/quality/*/route.ts`

#### `lib/insurance-service.ts`
**Dependências:**
- `lib/db.ts`
- `lib/kakau-insurance-client.ts`
- `lib/booking-service.ts` (indireto)

**Usado por:**
- `app/api/insurance/*/route.ts`

#### `lib/verification-service.ts`
**Dependências:**
- `lib/db.ts`
- `lib/upload-service.ts`

**Usado por:**
- `app/api/verification/*/route.ts`

#### `lib/wishlist-service.ts`
**Dependências:**
- `lib/db.ts`
- `lib/cache-integration.ts`

**Usado por:**
- `app/api/wishlists/*/route.ts`

#### `lib/split-payment-service.ts`
**Dependências:**
- `lib/db.ts`
- `lib/booking-service.ts` (indireto)

**Usado por:**
- `app/api/split-payments/*/route.ts`

---

### Integration Services

#### `lib/google-calendar-service.ts`
**Dependências:**
- `googleapis`
- `lib/db.ts`

**Usado por:**
- `app/api/calendar/sync/route.ts`

#### `lib/smart-lock-service.ts`
**Dependências:**
- `lib/db.ts`

**Usado por:**
- `app/api/smartlocks/*/route.ts`

#### `lib/klarna-service.ts`
**Dependências:**
- Nenhuma (standalone)

**Usado por:**
- `app/api/payments/*/route.ts` (futuro)

#### `lib/kakau-insurance-client.ts`
**Dependências:**
- Nenhuma (standalone)

**Usado por:**
- `lib/insurance-service.ts`

---

### Utility Services

#### `lib/upload-service.ts`
**Dependências:**
- `@aws-sdk/client-s3` (opcional)
- `cloudinary` (opcional)
- `sharp`

**Usado por:**
- `lib/verification-service.ts`
- `app/api/upload/*/route.ts`

---

## 🎨 DEPENDÊNCIAS ENTRE COMPONENTES

### UI Components

#### `components/ui/*`
**Dependências:**
- `@radix-ui/*`
- `tailwindcss`
- `lucide-react` (via `lib/lucide-icons.ts`)

**Usado por:**
- Todos os componentes de feature

### Feature Components

#### `components/wishlist/*`
**Dependências:**
- `components/ui/*`
- `lib/wishlist-service.ts` (via API)
- `hooks/useAuth.ts`

#### `components/smart-pricing/*`
**Dependências:**
- `components/ui/*`
- `lib/smart-pricing-service.ts` (via API)
- `recharts` (gráficos)

#### `components/top-host/*`
**Dependências:**
- `components/ui/*`
- `lib/top-host-service.ts` (via API)

#### `components/insurance/*`
**Dependências:**
- `components/ui/*`
- `lib/insurance-service.ts` (via API)

#### `components/verification/*`
**Dependências:**
- `components/ui/*`
- `lib/verification-service.ts` (via API)
- `lib/upload-service.ts` (via API)

---

## 📦 DEPENDÊNCIAS EXTERNAS

### APIs Externas

#### OpenWeather API
**Usado por:**
- `lib/smart-pricing-service.ts`

**Uso:**
- Dados meteorológicos para precificação

#### Eventbrite API
**Usado por:**
- `lib/eventbrite-service.ts`
- `lib/smart-pricing-service.ts`

**Uso:**
- Eventos locais para precificação

#### Google Calendar API
**Usado por:**
- `lib/google-calendar-service.ts`

**Uso:**
- Sincronização de reservas

#### Kakau Seguros API
**Usado por:**
- `lib/kakau-insurance-client.ts`

**Uso:**
- Criação de apólices

#### Klarna API
**Usado por:**
- `lib/klarna-service.ts`

**Uso:**
- Pay Later

---

## 🔄 CICLO DE DEPENDÊNCIAS

### Sem Ciclos Críticos ✅

Todas as dependências seguem uma hierarquia clara:

```
API Routes
    ↓
Services
    ↓
Database/Cache/External APIs
```

### Exemplo de Fluxo:

```
User Request
    ↓
API Route (/api/bookings)
    ↓
requireAuth() → api-auth.ts → db.ts
    ↓
booking-service.ts → db.ts
    ↓
properties-service.ts → db.ts
    ↓
Response
```

---

## 📊 MATRIZ DE DEPENDÊNCIAS

| Service | db.ts | api-auth.ts | cache | booking | pricing | insurance | verification |
|---------|-------|-------------|-------|---------|---------|-----------|--------------|
| booking-service | ✅ | - | - | - | - | - | - |
| smart-pricing | ✅ | - | ✅ | - | - | - | - |
| top-host | ✅ | - | ✅ | (indireto) | - | - | - |
| insurance | ✅ | - | - | (indireto) | - | - | - |
| verification | ✅ | - | - | - | - | - | ✅ |
| wishlist | ✅ | - | ✅ | - | - | - | - |
| split-payment | ✅ | - | - | (indireto) | - | - | - |

---

## 🎯 PRINCÍPIOS DE DEPENDÊNCIA

### 1. Single Responsibility
Cada service tem uma responsabilidade única e clara.

### 2. Dependency Inversion
Services dependem de abstrações (interfaces), não de implementações concretas.

### 3. Low Coupling
Services são pouco acoplados, facilitando testes e manutenção.

### 4. High Cohesion
Funcionalidades relacionadas estão agrupadas no mesmo service.

---

**Última atualização:** 22/11/2025

