# 🚀 PLANO DE INTEGRAÇÃO E EVOLUÇÃO - NTX + LEILÕES + FLASH DEALS

**Data de Criação:** 22/01/2025  
**Status:** 📋 PLANO DETALHADO DE INTEGRAÇÃO  
**Versão:** 1.0.0

---

## 📋 ÍNDICE

1. [Visão Geral da Integração](#visão-geral)
2. [Arquitetura de Integração](#arquitetura)
3. [Mapeamento dos Sistemas Existentes](#mapeamento)
4. [Integração por Módulo](#integração-módulos)
5. [Interface Unificada de Gestão](#interface-unificada)
6. [Fluxos de Dados](#fluxos-dados)
7. [Plano de Implementação Passo a Passo](#implementação)
8. [Estrutura de Banco de Dados](#banco-dados)
9. [APIs e Endpoints](#apis)
10. [Componentes React](#componentes)
11. [Testes e Validação](#testes)

---

## 🎯 VISÃO GERAL DA INTEGRAÇÃO

### Sistemas Existentes (✅ Prontos e Funcionando)

| Sistema | URL | Porta | Descrição | Status |
|---------|-----|-------|-----------|--------|
| **Site Público** | http://localhost:3000/ | 3000 | Site público com busca de hotéis | ✅ Ativo |
| **CMS Admin** | http://localhost:3000/admin/cms | 3000 | Gerenciamento de conteúdo | ✅ Ativo |
| **CRM Admin** | http://localhost:3000/admin/crm | 3000 | Gestão de clientes e campanhas | ✅ Ativo |
| **Dashboard Turismo** | http://localhost:3005/ | 3005 | Gestão de reservas, documentos, seguros | ✅ Ativo |

### Novos Módulos a Integrar (📦 NTX + Leilões + Flash Deals)

| Módulo | Descrição | Prioridade |
|--------|-----------|------------|
| **NTX (Nexus Travel Exchange)** | Sistema de leilões e exchange de acomodações | 🔴 Alta |
| **Leilões Dinâmicos** | Leilões reversos, lances em tempo real | 🔴 Alta |
| **Flash Deals** | Ofertas relâmpago com desconto progressivo | 🟡 Média |
| **Express Deals** | Ofertas expressas com preço fixo | 🟡 Média |
| **Pricebreakers** | Quebra de preço automática | 🟢 Baixa |
| **OTA Integration** | Integração com Booking.com, Expedia, etc. | 🔴 Alta |
| **Google Hotel Ads** | Integração com Google Hotel Ads | 🟡 Média |
| **Marketplace Multi-Hotéis** | Marketplace com comissão de 8% | 🟡 Média |
| **Sistema de Afiliados** | Programa de afiliados 20% recorrente | 🟢 Baixa |
| **Voice Commerce** | Vendas por voz com GPT-4o | 🟢 Baixa |

---

## 🏗️ ARQUITETURA DE INTEGRAÇÃO

### Diagrama de Integração

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  Site Público   │  │  CMS Admin       │  │  CRM Admin      │ │
│  │  (3000)         │  │  (3000/admin/cms)│  │  (3000/admin/crm)│ │
│  │                 │  │                  │  │                 │ │
│  │  • Busca Hotéis │  │  • Gerenciar     │  │  • Clientes     │ │
│  │  • Leilões      │  │    Conteúdo      │  │  • Campanhas    │ │
│  │  • Flash Deals  │  │  • Leilões       │  │  • Segmentação  │ │
│  │  • Reservas     │  │  • Flash Deals    │  │  • Analytics    │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         Dashboard Turismo (3005)                            │ │
│  │                                                              │ │
│  │  • Reservas (Calendário)                                    │ │
│  │  • Documentos                                               │ │
│  │  • Seguros                                                  │ │
│  │  • Vistos                                                   │ │
│  │  • Leilões (NOVO)                                           │ │
│  │  • Flash Deals (NOVO)                                       │ │
│  │  • OTA Sync (NOVO)                                          │ │
│  │  • Analytics Financeiro (NOVO)                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE APIS (Backend)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  API Principal  │  │  API Admin/CMS   │  │  32 Microserv. │ │
│  │  (5000)         │  │  (5002)           │  │  (6000-6031)   │ │
│  │                 │  │                  │  │                 │ │
│  │  • Enterprises  │  │  • Website       │  │  • Core API    │ │
│  │  • Properties   │  │    Content       │  │  • Booking      │ │
│  │  • Accommod.    │  │  • CMS Data      │  │  • Payments     │ │
│  │  • Documents    │  │  • Media          │  │  • OTA Sync     │ │
│  │  • Insurance    │  │                  │  │  • Analytics   │ │
│  │  • Visas        │  │                  │  │  • Notifications│ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         NOVAS APIs - NTX + Leilões                          │ │
│  │                                                              │ │
│  │  • /api/v1/auctions          - Leilões                      │ │
│  │  • /api/v1/bids              - Lances                       │ │
│  │  • /api/v1/flash-deals       - Flash Deals                  │ │
│  │  • /api/v1/express-deals     - Express Deals                 │ │
│  │  • /api/v1/pricebreakers     - Pricebreakers                 │ │
│  │  • /api/v1/ota                - OTA Integration              │ │
│  │  • /api/v1/google-hotel-ads  - Google Hotel Ads              │ │
│  │  • /api/v1/marketplace       - Marketplace                   │ │
│  │  • /api/v1/affiliates        - Sistema de Afiliados          │ │
│  │  • /api/v1/voice-commerce    - Voice Commerce                │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE DADOS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         PostgreSQL (5433)                                   │ │
│  │                                                              │ │
│  │  TABELAS EXISTENTES:                                        │ │
│  │  • enterprises, properties, accommodations                  │ │
│  │  • website_content                                          │ │
│  │  • bookings, customers                                      │ │
│  │  • documents, insurance_policies, visa_applications         │ │
│  │                                                              │ │
│  │  NOVAS TABELAS:                                             │ │
│  │  • auctions, bids, marketmatches                            │ │
│  │  • flash_deals, express_deals, pricebreakers                │ │
│  │  • ota_sync_log, ota_reservations                           │ │
│  │  • google_hotel_ads_feeds                                   │ │
│  │  • marketplace_listings, marketplace_orders                 │ │
│  │  • affiliates, affiliate_commissions                         │ │
│  │  • voice_commerce_sessions                                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         Redis (Cache + WebSocket)                           │ │
│  │                                                              │ │
│  │  • Cache de leilões ativos                                  │ │
│  │  • Sessões WebSocket em tempo real                           │ │
│  │  • Locks temporários (5 minutos)                              │ │
│  │  • Queue de jobs (BullMQ)                                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📍 MAPEAMENTO DOS SISTEMAS EXISTENTES

### 1. Site Público (http://localhost:3000/)

**Estrutura Atual:**
- ✅ Página inicial (`/`)
- ✅ Busca de hotéis (`/buscar`, `/hoteis`)
- ✅ Detalhes de hotel (`/hoteis/[id]`)
- ✅ Busca completa (`/hoteis/busca/completa`)
- ✅ Promoções, Atrações, Ingressos

**Novas Funcionalidades a Adicionar:**
- 🔄 **Leilões Ativos** (`/leiloes`)
  - Lista de leilões em andamento
  - Filtros por destino, data, tipo
  - Cards com countdown timer
  - Botão "Fazer Lance"
  
- 🔄 **Flash Deals** (`/flash-deals`)
  - Ofertas relâmpago com desconto progressivo
  - Timer de expiração
  - Badge "X% OFF"
  - Botão "Reservar Agora"
  
- 🔄 **Express Deals** (`/express-deals`)
  - Ofertas expressas com preço fixo
  - Disponibilidade limitada
  - Botão "Reservar Express"
  
- 🔄 **Página de Leilão** (`/leiloes/[id]`)
  - Detalhes do leilão
  - Histórico de lances
  - Formulário de lance
  - WebSocket para atualizações em tempo real
  - Mapa da propriedade
  - Galeria de fotos

**Integração com Componentes Existentes:**
- Reutilizar `hotel-details-modal.tsx` para detalhes
- Reutilizar `hotel-map.tsx` para localização
- Reutilizar `hotel-photo-gallery.tsx` para galeria
- Criar novos componentes: `AuctionCard.tsx`, `FlashDealCard.tsx`, `BidForm.tsx`

---

### 2. CMS Admin (http://localhost:3000/admin/cms)

**Estrutura Atual:**
- ✅ Dashboard com estatísticas
- ✅ Tab "Hotéis" (9 sub-tabs)
- ✅ Tab "Promoções"
- ✅ Tab "Atrações"
- ✅ Tab "Ingressos"
- ✅ Tab "Header"
- ✅ Tab "Site"

**Novas Tabs a Adicionar:**
- 🔄 **Tab "Leilões"**
  - Lista de leilões
  - Criar novo leilão
  - Editar leilão existente
  - Configurar regras (preço mínimo, incremento, duração)
  - Visualizar lances em tempo real
  - Finalizar leilão manualmente
  
- 🔄 **Tab "Flash Deals"**
  - Lista de flash deals
  - Criar novo flash deal
  - Configurar desconto progressivo
  - Definir timer de expiração
  - Ativar/desativar deals
  
- 🔄 **Tab "Express Deals"**
  - Lista de express deals
  - Criar novo express deal
  - Definir preço fixo
  - Limitar disponibilidade
  - Gerenciar estoque
  
- 🔄 **Tab "OTA Integration"**
  - Configurar credenciais (Booking.com, Expedia, etc.)
  - Sincronizar disponibilidade
  - Visualizar reservas sincronizadas
  - Logs de sincronização
  - Status de conexão
  
- 🔄 **Tab "Google Hotel Ads"**
  - Configurar feed XML
  - Visualizar status de indexação
  - Métricas de performance
  - Configurar campanhas
  
- 🔄 **Tab "Marketplace"**
  - Lista de propriedades no marketplace
  - Configurar comissão (8%)
  - Aprovar/rejeitar propriedades
  - Gerenciar pedidos
  
- 🔄 **Tab "Afiliados"**
  - Lista de afiliados
  - Criar novo afiliado
  - Visualizar comissões (20%)
  - Configurar payouts
  - Relatórios de performance

**Componentes a Criar:**
- `AuctionManagement.tsx` - Gerenciamento de leilões
- `FlashDealManagement.tsx` - Gerenciamento de flash deals
- `ExpressDealManagement.tsx` - Gerenciamento de express deals
- `OTAIntegrationManager.tsx` - Gerenciamento de OTA
- `GoogleHotelAdsManager.tsx` - Gerenciamento de Google Hotel Ads
- `MarketplaceManager.tsx` - Gerenciamento de marketplace
- `AffiliateManager.tsx` - Gerenciamento de afiliados

---

### 3. CRM Admin (http://localhost:3000/admin/crm)

**Estrutura Atual:**
- ✅ Dashboard com métricas
- ✅ Segmentação de clientes
- ✅ Campanhas
- ✅ Analytics

**Novas Funcionalidades a Adicionar:**
- 🔄 **Segmentação por Leilões**
  - Clientes que participaram de leilões
  - Clientes que ganharam leilões
  - Clientes que perderam leilões
  - Clientes com lances frequentes
  
- 🔄 **Campanhas de Flash Deals**
  - Criar campanha para flash deals
  - Segmentar por histórico de compras
  - Enviar notificações push/email
  - Acompanhar conversão
  
- 🔄 **Analytics de Leilões**
  - Taxa de conversão de leilões
  - Valor médio de lance
  - Tempo médio de participação
  - Clientes mais ativos
  
- 🔄 **Integração com Voice Commerce**
  - Histórico de chamadas
  - Conversões por voz
  - Gravações (com consentimento)
  - Métricas de atendimento

**Componentes a Criar:**
- `AuctionSegments.tsx` - Segmentação por leilões
- `FlashDealCampaigns.tsx` - Campanhas de flash deals
- `AuctionAnalytics.tsx` - Analytics de leilões
- `VoiceCommerceAnalytics.tsx` - Analytics de voice commerce

---

### 4. Dashboard Turismo (http://localhost:3005/)

**Estrutura Atual:**
- ✅ Reservas (Calendário + Lista)
- ✅ Documentos
- ✅ Seguros
- ✅ Vistos
- ✅ Catálogo de Viagens
- ✅ Notificações

**Novas Páginas/Abas a Adicionar:**
- 🔄 **Página "Leilões"** (`/leiloes`)
  - Dashboard de leilões
  - Estatísticas (ativos, finalizados, receita)
  - Lista de leilões
  - Criar novo leilão
  - Visualizar lances em tempo real
  
- 🔄 **Página "Flash Deals"** (`/flash-deals`)
  - Dashboard de flash deals
  - Estatísticas (ativos, vendidos, receita)
  - Lista de flash deals
  - Criar novo flash deal
  - Monitorar vendas em tempo real
  
- 🔄 **Página "OTA Sync"** (`/ota-sync`)
  - Status de sincronização
  - Reservas sincronizadas
  - Conflitos de disponibilidade
  - Logs de sincronização
  - Configurações de OTA
  
- 🔄 **Página "Analytics Financeiro"** (`/analytics-financeiro`)
  - RevPAR (Revenue per Available Room)
  - ADR (Average Daily Rate)
  - Occupancy Rate
  - GOPPAR (Gross Operating Profit per Available Room)
  - TRevPAR (Total Revenue per Available Room)
  - Taxa de cancelamento
  - Comparação com período anterior
  
- 🔄 **Página "Marketplace"** (`/marketplace`)
  - Propriedades listadas
  - Pedidos recebidos
  - Comissões geradas
  - Performance de propriedades
  - Ranking de propriedades

**Componentes a Criar:**
- `LeiloesDashboard.tsx` - Dashboard de leilões
- `FlashDealsDashboard.tsx` - Dashboard de flash deals
- `OTASyncDashboard.tsx` - Dashboard de sincronização OTA
- `FinancialAnalytics.tsx` - Analytics financeiro
- `MarketplaceDashboard.tsx` - Dashboard de marketplace

---

## 🔄 INTEGRAÇÃO POR MÓDULO

### Módulo 1: Sistema de Leilões (NTX)

#### Backend (APIs)

**Novas Rotas:**
```javascript
// backend/src/api/v1/auctions/routes.js
GET    /api/v1/auctions              // Listar leilões
GET    /api/v1/auctions/:id           // Detalhes do leilão
POST   /api/v1/auctions              // Criar leilão
PUT    /api/v1/auctions/:id          // Atualizar leilão
DELETE /api/v1/auctions/:id          // Deletar leilão
GET    /api/v1/auctions/:id/bids     // Listar lances
POST   /api/v1/auctions/:id/bids     // Fazer lance
GET    /api/v1/auctions/active       // Leilões ativos
GET    /api/v1/auctions/upcoming     // Próximos leilões
GET    /api/v1/auctions/finished     // Leilões finalizados
POST   /api/v1/auctions/:id/finish   // Finalizar leilão
```

**Integração com Sistemas Existentes:**
- Usar `enterprises`, `properties`, `accommodations` para criar leilões
- Usar `bookings` para criar reserva após leilão ganho
- Usar `customers` para associar lances a clientes
- Usar WebSocket para atualizações em tempo real

#### Frontend (Componentes)

**Site Público:**
- `AuctionCard.tsx` - Card de leilão na listagem
- `AuctionDetails.tsx` - Página de detalhes do leilão
- `BidForm.tsx` - Formulário de lance
- `BidHistory.tsx` - Histórico de lances
- `AuctionTimer.tsx` - Timer de countdown

**CMS Admin:**
- `AuctionManagement.tsx` - Gerenciamento completo
- `AuctionForm.tsx` - Formulário de criação/edição
- `AuctionRulesConfig.tsx` - Configuração de regras
- `AuctionLiveView.tsx` - Visualização em tempo real

**Dashboard Turismo:**
- `LeiloesDashboard.tsx` - Dashboard principal
- `AuctionList.tsx` - Lista de leilões
- `AuctionStats.tsx` - Estatísticas

#### Banco de Dados

**Novas Tabelas:**
```sql
-- Tabela de leilões
CREATE TABLE auctions (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER REFERENCES enterprises(id),
  property_id INTEGER REFERENCES properties(id),
  accommodation_id INTEGER REFERENCES accommodations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  min_increment DECIMAL(10,2) NOT NULL,
  reserve_price DECIMAL(10,2),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, finished, cancelled
  winner_id INTEGER REFERENCES customers(id),
  winner_bid_id INTEGER REFERENCES bids(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de lances
CREATE TABLE bids (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER REFERENCES auctions(id),
  customer_id INTEGER REFERENCES customers(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, outbid
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_auction_id (auction_id),
  INDEX idx_customer_id (customer_id)
);

-- Tabela de matches (NTX)
CREATE TABLE marketmatches (
  id SERIAL PRIMARY KEY,
  bid_id INTEGER REFERENCES bids(id),
  ask_id INTEGER REFERENCES asks(id),
  price DECIMAL(10,2) NOT NULL,
  matched_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending' -- pending, confirmed, cancelled
);
```

---

### Módulo 2: Flash Deals

#### Backend (APIs)

**Novas Rotas:**
```javascript
// backend/src/api/v1/flash-deals/routes.js
GET    /api/v1/flash-deals            // Listar flash deals
GET    /api/v1/flash-deals/:id        // Detalhes
POST   /api/v1/flash-deals            // Criar flash deal
PUT    /api/v1/flash-deals/:id        // Atualizar
DELETE /api/v1/flash-deals/:id        // Deletar
GET    /api/v1/flash-deals/active     // Flash deals ativos
POST   /api/v1/flash-deals/:id/reserve // Reservar flash deal
```

#### Frontend (Componentes)

**Site Público:**
- `FlashDealCard.tsx` - Card de flash deal
- `FlashDealDetails.tsx` - Detalhes do flash deal
- `FlashDealTimer.tsx` - Timer de expiração
- `DiscountProgressBar.tsx` - Barra de desconto progressivo

**CMS Admin:**
- `FlashDealManagement.tsx` - Gerenciamento
- `FlashDealForm.tsx` - Formulário

**Dashboard Turismo:**
- `FlashDealsDashboard.tsx` - Dashboard

#### Banco de Dados

**Nova Tabela:**
```sql
CREATE TABLE flash_deals (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER REFERENCES enterprises(id),
  property_id INTEGER REFERENCES properties(id),
  accommodation_id INTEGER REFERENCES accommodations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER NOT NULL, -- Desconto atual
  max_discount INTEGER NOT NULL, -- Desconto máximo
  discount_increment INTEGER DEFAULT 5, -- Incremento de desconto
  units_available INTEGER NOT NULL,
  units_sold INTEGER DEFAULT 0,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, sold_out, expired
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### Módulo 3: OTA Integration

#### Backend (APIs)

**Novas Rotas:**
```javascript
// backend/src/api/v1/ota/routes.js
GET    /api/v1/ota/connections         // Listar conexões OTA
POST   /api/v1/ota/connections        // Criar conexão
PUT    /api/v1/ota/connections/:id    // Atualizar conexão
DELETE /api/v1/ota/connections/:id    // Deletar conexão
POST   /api/v1/ota/sync                // Sincronizar disponibilidade
GET    /api/v1/ota/sync/status        // Status de sincronização
GET    /api/v1/ota/reservations        // Reservas sincronizadas
GET    /api/v1/ota/logs                // Logs de sincronização
```

#### Frontend (Componentes)

**CMS Admin:**
- `OTAIntegrationManager.tsx` - Gerenciamento de OTA
- `OTAConnectionForm.tsx` - Formulário de conexão
- `OTASyncStatus.tsx` - Status de sincronização
- `OTAReservationsList.tsx` - Lista de reservas

**Dashboard Turismo:**
- `OTASyncDashboard.tsx` - Dashboard de sincronização

#### Banco de Dados

**Novas Tabelas:**
```sql
CREATE TABLE ota_connections (
  id SERIAL PRIMARY KEY,
  ota_name VARCHAR(100) NOT NULL, -- booking, expedia, airbnb, etc.
  api_key VARCHAR(255) NOT NULL,
  api_secret VARCHAR(255) NOT NULL,
  property_id INTEGER REFERENCES properties(id),
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, error
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ota_reservations (
  id SERIAL PRIMARY KEY,
  ota_connection_id INTEGER REFERENCES ota_connections(id),
  ota_reservation_id VARCHAR(255) NOT NULL,
  booking_id INTEGER REFERENCES bookings(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ota_sync_logs (
  id SERIAL PRIMARY KEY,
  ota_connection_id INTEGER REFERENCES ota_connections(id),
  sync_type VARCHAR(50) NOT NULL, -- availability, reservations, pricing
  status VARCHAR(50) NOT NULL, -- success, error, partial
  records_synced INTEGER DEFAULT 0,
  errors TEXT,
  started_at TIMESTAMP NOT NULL,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 INTERFACE UNIFICADA DE GESTÃO

### Dashboard Principal Unificado

**Localização:** http://localhost:3000/admin/dashboard (NOVO)

**Estrutura:**
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: RSV360 - Sistema Completo de Gestão                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Site        │  │  CMS          │  │  CRM          │     │
│  │  Público     │  │  Admin        │  │  Admin        │     │
│  │  (3000)      │  │  (3000/cms)   │  │  (3000/crm)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │  Leilões     │  │  Flash Deals │     │
│  │  Turismo     │  │  (NOVO)      │  │  (NOVO)       │     │
│  │  (3005)       │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  OTA Sync    │  │  Analytics    │  │  Marketplace │     │
│  │  (NOVO)      │  │  Financeiro   │  │  (NOVO)      │     │
│  │              │  │  (NOVO)       │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Menu de Navegação Unificado

**Componente:** `UnifiedNavigation.tsx`

```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: ReactNode;
  url: string;
  badge?: number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'site-publico',
    label: 'Site Público',
    icon: <Globe />,
    url: 'http://localhost:3000',
    children: [
      { id: 'home', label: 'Home', url: 'http://localhost:3000/' },
      { id: 'hoteis', label: 'Hotéis', url: 'http://localhost:3000/hoteis' },
      { id: 'leiloes', label: 'Leilões', url: 'http://localhost:3000/leiloes' },
      { id: 'flash-deals', label: 'Flash Deals', url: 'http://localhost:3000/flash-deals' },
    ]
  },
  {
    id: 'cms',
    label: 'CMS Admin',
    icon: <FileText />,
    url: 'http://localhost:3000/admin/cms',
    children: [
      { id: 'hotels', label: 'Hotéis', url: 'http://localhost:3000/admin/cms?tab=hotels' },
      { id: 'auctions', label: 'Leilões', url: 'http://localhost:3000/admin/cms?tab=auctions' },
      { id: 'flash-deals', label: 'Flash Deals', url: 'http://localhost:3000/admin/cms?tab=flash-deals' },
      { id: 'ota', label: 'OTA Integration', url: 'http://localhost:3000/admin/cms?tab=ota' },
    ]
  },
  {
    id: 'crm',
    label: 'CRM Admin',
    icon: <Users />,
    url: 'http://localhost:3000/admin/crm',
  },
  {
    id: 'dashboard',
    label: 'Dashboard Turismo',
    icon: <BarChart3 />,
    url: 'http://localhost:3005',
    children: [
      { id: 'reservations', label: 'Reservas', url: 'http://localhost:3005/reservations-rsv' },
      { id: 'leiloes', label: 'Leilões', url: 'http://localhost:3005/leiloes' },
      { id: 'flash-deals', label: 'Flash Deals', url: 'http://localhost:3005/flash-deals' },
      { id: 'ota-sync', label: 'OTA Sync', url: 'http://localhost:3005/ota-sync' },
      { id: 'analytics', label: 'Analytics', url: 'http://localhost:3005/analytics-financeiro' },
    ]
  },
];
```

---

## 🔄 FLUXOS DE DADOS

### Fluxo 1: Criar Leilão

```
1. Admin acessa CMS Admin (http://localhost:3000/admin/cms)
2. Clica na tab "Leilões"
3. Clica em "Criar Novo Leilão"
4. Preenche formulário:
   - Seleciona empreendimento/propriedade/acomodação
   - Define preço inicial
   - Define preço mínimo (reserve price)
   - Define incremento mínimo
   - Define data/hora de início e fim
5. Salva leilão → POST /api/v1/auctions
6. Backend cria registro em `auctions`
7. Backend agenda job para iniciar leilão
8. Leilão aparece no Site Público (/leiloes)
9. WebSocket notifica clientes conectados
```

### Fluxo 2: Cliente Faz Lance

```
1. Cliente acessa Site Público (/leiloes)
2. Clica em um leilão ativo
3. Visualiza detalhes (preço atual, tempo restante, histórico)
4. Preenche formulário de lance
5. Submete lance → POST /api/v1/auctions/:id/bids
6. Backend valida:
   - Lance >= preço atual + incremento mínimo
   - Cliente autenticado
   - Leilão ainda ativo
7. Backend cria registro em `bids`
8. Backend atualiza `auctions.current_price`
9. Backend notifica lance anterior (se houver) via WebSocket
10. WebSocket atualiza todos os clientes conectados
11. Cliente vê confirmação de lance
```

### Fluxo 3: Leilão Finaliza - Criar Reserva

```
1. Timer do leilão chega ao fim
2. Cron job detecta leilão finalizado
3. Backend identifica vencedor (maior lance válido)
4. Backend atualiza `auctions.winner_id` e `auctions.winner_bid_id`
5. Backend cria bloqueio temporário (Redis, 5 minutos)
6. Backend envia notificação ao vencedor (email + push)
7. Vencedor recebe modal de pagamento imediato
8. Vencedor paga → POST /api/v1/payments
9. Backend cria reserva em `bookings`
10. Backend remove bloqueio temporário
11. Backend atualiza disponibilidade em `accommodation_availability`
12. Se não pagar em 5 minutos, próximo lance vira vencedor
```

### Fluxo 4: Sincronização OTA

```
1. Admin configura conexão OTA no CMS
2. Backend agenda job de sincronização (a cada 15 minutos)
3. Job executa:
   - Busca disponibilidade na OTA (Booking.com, Expedia, etc.)
   - Compara com disponibilidade local
   - Identifica conflitos
   - Atualiza `accommodation_availability`
   - Cria registros em `ota_sync_logs`
4. Job processa reservas da OTA:
   - Busca novas reservas
   - Cria registros em `ota_reservations`
   - Cria reservas em `bookings`
   - Atualiza disponibilidade
5. Dashboard Turismo exibe status de sincronização
6. Admin visualiza logs e conflitos
```

---

## 📋 PLANO DE IMPLEMENTAÇÃO PASSO A PASSO

### Fase 1: Preparação (Semana 1)

**Objetivo:** Preparar infraestrutura e banco de dados

**Tarefas:**
1. ✅ Criar migrations para novas tabelas
   - `auctions`, `bids`, `marketmatches`
   - `flash_deals`, `express_deals`, `pricebreakers`
   - `ota_connections`, `ota_reservations`, `ota_sync_logs`
   - `google_hotel_ads_feeds`
   - `marketplace_listings`, `marketplace_orders`
   - `affiliates`, `affiliate_commissions`
   - `voice_commerce_sessions`

2. ✅ Configurar Redis
   - Instalar Redis
   - Configurar conexão
   - Configurar BullMQ para jobs

3. ✅ Configurar WebSocket
   - Instalar Socket.io
   - Criar servidor WebSocket
   - Configurar eventos

4. ✅ Criar estrutura de pastas
   ```
   backend/src/api/v1/
   ├── auctions/
   ├── flash-deals/
   ├── express-deals/
   ├── ota/
   ├── google-hotel-ads/
   ├── marketplace/
   ├── affiliates/
   └── voice-commerce/
   ```

---

### Fase 2: Backend - APIs Básicas (Semana 2-3)

**Objetivo:** Implementar APIs CRUD básicas

**Tarefas:**
1. ✅ Implementar APIs de Leilões
   - GET, POST, PUT, DELETE /api/v1/auctions
   - GET, POST /api/v1/auctions/:id/bids
   - GET /api/v1/auctions/active
   - POST /api/v1/auctions/:id/finish

2. ✅ Implementar APIs de Flash Deals
   - GET, POST, PUT, DELETE /api/v1/flash-deals
   - GET /api/v1/flash-deals/active
   - POST /api/v1/flash-deals/:id/reserve

3. ✅ Implementar APIs de OTA
   - GET, POST, PUT, DELETE /api/v1/ota/connections
   - POST /api/v1/ota/sync
   - GET /api/v1/ota/sync/status
   - GET /api/v1/ota/reservations

4. ✅ Implementar WebSocket
   - Eventos: `auction:updated`, `bid:new`, `flash-deal:updated`
   - Autenticação de conexões
   - Rate limiting

---

### Fase 3: Frontend - Site Público (Semana 4-5)

**Objetivo:** Adicionar leilões e flash deals no site público

**Tarefas:**
1. ✅ Criar página `/leiloes`
   - Lista de leilões ativos
   - Filtros e busca
   - Cards de leilão

2. ✅ Criar página `/leiloes/[id]`
   - Detalhes do leilão
   - Formulário de lance
   - Histórico de lances
   - WebSocket para atualizações

3. ✅ Criar página `/flash-deals`
   - Lista de flash deals ativos
   - Cards com timer
   - Botão de reserva

4. ✅ Integrar com componentes existentes
   - Reutilizar `hotel-map.tsx`
   - Reutilizar `hotel-photo-gallery.tsx`
   - Reutilizar `hotel-details-modal.tsx`

---

### Fase 4: Frontend - CMS Admin (Semana 6-7)

**Objetivo:** Adicionar gestão de leilões e flash deals no CMS

**Tarefas:**
1. ✅ Adicionar tab "Leilões" no CMS
   - Lista de leilões
   - Formulário de criação/edição
   - Visualização em tempo real

2. ✅ Adicionar tab "Flash Deals" no CMS
   - Lista de flash deals
   - Formulário de criação/edição
   - Monitoramento de vendas

3. ✅ Adicionar tab "OTA Integration" no CMS
   - Configuração de conexões
   - Status de sincronização
   - Logs

4. ✅ Adicionar tab "Google Hotel Ads" no CMS
   - Configuração de feed
   - Métricas

---

### Fase 5: Frontend - Dashboard Turismo (Semana 8-9)

**Objetivo:** Adicionar dashboards de leilões e analytics

**Tarefas:**
1. ✅ Criar página `/leiloes` no Dashboard
   - Dashboard de leilões
   - Estatísticas
   - Lista de leilões

2. ✅ Criar página `/flash-deals` no Dashboard
   - Dashboard de flash deals
   - Estatísticas
   - Lista de flash deals

3. ✅ Criar página `/ota-sync` no Dashboard
   - Status de sincronização
   - Reservas sincronizadas
   - Logs

4. ✅ Criar página `/analytics-financeiro` no Dashboard
   - RevPAR, ADR, Occupancy
   - Gráficos e métricas
   - Comparação com períodos anteriores

---

### Fase 6: Integração OTA (Semana 10-11)

**Objetivo:** Implementar sincronização com OTAs

**Tarefas:**
1. ✅ Implementar adapters OTA
   - Booking.com adapter
   - Expedia adapter
   - Airbnb adapter (se aplicável)

2. ✅ Implementar job de sincronização
   - Sincronização de disponibilidade
   - Sincronização de reservas
   - Tratamento de conflitos

3. ✅ Implementar dashboard de sincronização
   - Status em tempo real
   - Logs detalhados
   - Alertas de erro

---

### Fase 7: Google Hotel Ads (Semana 12)

**Objetivo:** Integrar com Google Hotel Ads

**Tarefas:**
1. ✅ Implementar geração de feed XML
   - Estrutura XML conforme especificação
   - Atualização automática
   - Validação de dados

2. ✅ Implementar dashboard
   - Status de indexação
   - Métricas de performance
   - Configuração de campanhas

---

### Fase 8: Marketplace e Afiliados (Semana 13-14)

**Objetivo:** Implementar marketplace e sistema de afiliados

**Tarefas:**
1. ✅ Implementar marketplace
   - Listagem de propriedades
   - Sistema de comissão (8%)
   - Processamento de pedidos

2. ✅ Implementar sistema de afiliados
   - Cadastro de afiliados
   - Cálculo de comissão (20%)
   - Dashboard de afiliados
   - Sistema de payouts

---

### Fase 9: Voice Commerce (Semana 15)

**Objetivo:** Implementar vendas por voz

**Tarefas:**
1. ✅ Integrar Twilio Voice API
2. ✅ Integrar GPT-4o
3. ✅ Implementar fluxo conversacional
4. ✅ Dashboard de métricas

---

### Fase 10: Testes e Validação (Semana 16)

**Objetivo:** Testar todas as funcionalidades

**Tarefas:**
1. ✅ Testes unitários
2. ✅ Testes de integração
3. ✅ Testes end-to-end
4. ✅ Testes de performance
5. ✅ Testes de segurança
6. ✅ Correção de bugs

---

## 🗄️ ESTRUTURA DE BANCO DE DADOS

### Tabelas Existentes (Mantidas)

- `enterprises` - Empreendimentos
- `properties` - Propriedades
- `accommodations` - Acomodações
- `website_content` - Conteúdo do site
- `bookings` - Reservas
- `customers` - Clientes
- `documents` - Documentos
- `insurance_policies` - Apólices
- `insurance_claims` - Sinistros
- `visa_applications` - Aplicações de visto

### Novas Tabelas (A Criar)

**Leilões:**
- `auctions` - Leilões
- `bids` - Lances
- `asks` - Pedidos (NTX)
- `marketmatches` - Matches (NTX)

**Flash Deals:**
- `flash_deals` - Flash deals
- `express_deals` - Express deals
- `pricebreakers` - Pricebreakers

**OTA:**
- `ota_connections` - Conexões OTA
- `ota_reservations` - Reservas OTA
- `ota_sync_logs` - Logs de sincronização

**Google Hotel Ads:**
- `google_hotel_ads_feeds` - Feeds XML
- `google_hotel_ads_campaigns` - Campanhas

**Marketplace:**
- `marketplace_listings` - Listagens
- `marketplace_orders` - Pedidos
- `marketplace_commissions` - Comissões

**Afiliados:**
- `affiliates` - Afiliados
- `affiliate_commissions` - Comissões
- `affiliate_payouts` - Pagamentos

**Voice Commerce:**
- `voice_commerce_sessions` - Sessões
- `voice_commerce_calls` - Chamadas

---

## 🔌 APIS E ENDPOINTS

### APIs de Leilões

```
GET    /api/v1/auctions
GET    /api/v1/auctions/:id
POST   /api/v1/auctions
PUT    /api/v1/auctions/:id
DELETE /api/v1/auctions/:id
GET    /api/v1/auctions/:id/bids
POST   /api/v1/auctions/:id/bids
GET    /api/v1/auctions/active
GET    /api/v1/auctions/upcoming
GET    /api/v1/auctions/finished
POST   /api/v1/auctions/:id/finish
```

### APIs de Flash Deals

```
GET    /api/v1/flash-deals
GET    /api/v1/flash-deals/:id
POST   /api/v1/flash-deals
PUT    /api/v1/flash-deals/:id
DELETE /api/v1/flash-deals/:id
GET    /api/v1/flash-deals/active
POST   /api/v1/flash-deals/:id/reserve
```

### APIs de OTA

```
GET    /api/v1/ota/connections
POST   /api/v1/ota/connections
PUT    /api/v1/ota/connections/:id
DELETE /api/v1/ota/connections/:id
POST   /api/v1/ota/sync
GET    /api/v1/ota/sync/status
GET    /api/v1/ota/reservations
GET    /api/v1/ota/logs
```

### APIs de Google Hotel Ads

```
GET    /api/v1/google-hotel-ads/feeds
POST   /api/v1/google-hotel-ads/feeds
GET    /api/v1/google-hotel-ads/feeds/:id/xml
GET    /api/v1/google-hotel-ads/campaigns
POST   /api/v1/google-hotel-ads/campaigns
GET    /api/v1/google-hotel-ads/metrics
```

### APIs de Marketplace

```
GET    /api/v1/marketplace/listings
POST   /api/v1/marketplace/listings
PUT    /api/v1/marketplace/listings/:id
DELETE /api/v1/marketplace/listings/:id
GET    /api/v1/marketplace/orders
POST   /api/v1/marketplace/orders
GET    /api/v1/marketplace/commissions
```

### APIs de Afiliados

```
GET    /api/v1/affiliates
POST   /api/v1/affiliates
PUT    /api/v1/affiliates/:id
GET    /api/v1/affiliates/:id/commissions
GET    /api/v1/affiliates/:id/payouts
POST   /api/v1/affiliates/:id/payouts
```

---

## 🧩 COMPONENTES REACT

### Componentes do Site Público

**Leilões:**
- `AuctionCard.tsx` - Card de leilão
- `AuctionDetails.tsx` - Detalhes do leilão
- `BidForm.tsx` - Formulário de lance
- `BidHistory.tsx` - Histórico de lances
- `AuctionTimer.tsx` - Timer de countdown
- `AuctionLiveUpdates.tsx` - Atualizações em tempo real (WebSocket)

**Flash Deals:**
- `FlashDealCard.tsx` - Card de flash deal
- `FlashDealDetails.tsx` - Detalhes do flash deal
- `FlashDealTimer.tsx` - Timer de expiração
- `DiscountProgressBar.tsx` - Barra de desconto progressivo

### Componentes do CMS Admin

**Leilões:**
- `AuctionManagement.tsx` - Gerenciamento completo
- `AuctionForm.tsx` - Formulário de criação/edição
- `AuctionRulesConfig.tsx` - Configuração de regras
- `AuctionLiveView.tsx` - Visualização em tempo real

**Flash Deals:**
- `FlashDealManagement.tsx` - Gerenciamento
- `FlashDealForm.tsx` - Formulário

**OTA:**
- `OTAIntegrationManager.tsx` - Gerenciamento
- `OTAConnectionForm.tsx` - Formulário de conexão
- `OTASyncStatus.tsx` - Status de sincronização
- `OTAReservationsList.tsx` - Lista de reservas

### Componentes do Dashboard Turismo

**Leilões:**
- `LeiloesDashboard.tsx` - Dashboard principal
- `AuctionList.tsx` - Lista de leilões
- `AuctionStats.tsx` - Estatísticas

**Flash Deals:**
- `FlashDealsDashboard.tsx` - Dashboard
- `FlashDealStats.tsx` - Estatísticas

**OTA:**
- `OTASyncDashboard.tsx` - Dashboard de sincronização
- `OTASyncStatus.tsx` - Status
- `OTAReservationsTable.tsx` - Tabela de reservas

**Analytics:**
- `FinancialAnalytics.tsx` - Analytics financeiro
- `RevPARChart.tsx` - Gráfico RevPAR
- `OccupancyChart.tsx` - Gráfico de ocupação
- `RevenueChart.tsx` - Gráfico de receita

---

## 🧪 TESTES E VALIDAÇÃO

### Testes Unitários

- Testes de APIs (Jest + Supertest)
- Testes de componentes React (React Testing Library)
- Testes de lógica de negócio

### Testes de Integração

- Testes de fluxo completo de leilão
- Testes de sincronização OTA
- Testes de WebSocket

### Testes End-to-End

- Testes com Playwright/Cypress
- Fluxo completo: criar leilão → fazer lance → finalizar → criar reserva
- Fluxo completo: criar flash deal → reservar → processar pagamento

### Testes de Performance

- Testes de carga (Artillery)
- Testes de concorrência (múltiplos lances simultâneos)
- Testes de WebSocket (múltiplas conexões)

### Testes de Segurança

- Testes de autenticação/autorização
- Testes de validação de entrada
- Testes de SQL injection
- Testes de XSS

---

## 📊 MÉTRICAS DE SUCESSO

### Métricas de Negócio

- **Taxa de conversão de leilões:** % de leilões que resultam em reserva
- **Valor médio de lance:** Média dos lances em leilões
- **Tempo médio de participação:** Tempo que clientes ficam em leilões
- **Taxa de conversão de flash deals:** % de flash deals que resultam em reserva
- **Receita gerada por leilões:** Total de receita de leilões
- **Receita gerada por flash deals:** Total de receita de flash deals

### Métricas Técnicas

- **Tempo de resposta das APIs:** < 200ms (p95)
- **Disponibilidade do sistema:** > 99.9%
- **Taxa de erro:** < 0.1%
- **Tempo de sincronização OTA:** < 5 minutos
- **Latência do WebSocket:** < 100ms

---

## 🚀 PRÓXIMOS PASSOS

1. **Revisar e aprovar este plano**
2. **Criar repositório Git para novas features**
3. **Configurar ambiente de desenvolvimento**
4. **Iniciar Fase 1: Preparação**
5. **Executar migrations**
6. **Implementar APIs básicas**
7. **Criar componentes React**
8. **Integrar com sistemas existentes**
9. **Testar e validar**
10. **Deploy em produção**

---

## 📝 NOTAS IMPORTANTES

### Compatibilidade

- ✅ Todas as novas funcionalidades são **aditivas** (não quebram funcionalidades existentes)
- ✅ Sistemas existentes continuam funcionando normalmente
- ✅ Migração gradual é possível

### Segurança

- ✅ Autenticação obrigatória para todas as APIs
- ✅ Autorização baseada em roles (admin, host, guest)
- ✅ Validação de entrada em todos os endpoints
- ✅ Rate limiting para prevenir abuso
- ✅ Logs de auditoria para todas as ações críticas

### Performance

- ✅ Cache Redis para leilões ativos
- ✅ Indexação adequada no banco de dados
- ✅ Paginação em todas as listagens
- ✅ Lazy loading de componentes pesados
- ✅ WebSocket apenas para dados em tempo real

### Escalabilidade

- ✅ Arquitetura preparada para horizontal scaling
- ✅ Jobs assíncronos para operações pesadas
- ✅ Queue system (BullMQ) para processamento
- ✅ CDN para assets estáticos

---

**Documento criado em:** 22/01/2025  
**Última atualização:** 22/01/2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Implementação
