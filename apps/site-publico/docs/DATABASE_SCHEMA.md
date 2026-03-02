# 🗄️ MODELO DE DADOS - RSV GEN 2

**Versão:** 2.0.0  
**Data:** 22/11/2025  
**Status:** Documentação Completa

---

## 📋 VISÃO GERAL

O banco de dados RSV Gen 2 utiliza PostgreSQL 15+ com suporte a JSONB para dados flexíveis.

---

## 🏗️ DIAGRAMA ENTIDADE-RELACIONAMENTO (ER)

### Principais Entidades:

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │
       ├──►┌─────────────┐
       │   │ properties  │
       │   └──────┬──────┘
       │          │
       │          ├──►┌─────────────┐
       │          │   │  bookings  │
       │          │   └──────┬──────┘
       │          │          │
       │          │          ├──►┌─────────────┐
       │          │          │   │  payments  │
       │          │          │   └─────────────┘
       │          │          │
       │          │          ├──►┌─────────────┐
       │          │          │   │ insurance_  │
       │          │          │   │  policies  │
       │          │          │   └─────────────┘
       │          │          │
       │          │          └──►┌─────────────┐
       │          │              │ split_     │
       │          │              │ payments   │
       │          │              └─────────────┘
       │          │
       │          └──►┌─────────────┐
       │              │ property_  │
       │              │ verifications│
       │              └─────────────┘
       │
       ├──►┌─────────────┐
       │   │ wishlists   │
       │   └──────┬──────┘
       │          │
       │          ├──►┌─────────────┐
       │          │   │ wishlist_  │
       │          │   │ items      │
       │          │   └──────┬──────┘
       │          │          │
       │          │          └──►┌─────────────┐
       │          │              │ wishlist_  │
       │          │              │ votes      │
       │          │              └─────────────┘
       │          │
       │          └──►┌─────────────┐
       │              │ wishlist_  │
       │              │ members    │
       │              └─────────────┘
       │
       ├──►┌─────────────┐
       │   │ host_      │
       │   │ ratings    │
       │   └──────┬──────┘
       │          │
       │          └──►┌─────────────┐
       │              │ badges     │
       │              └─────────────┘
       │
       └──►┌─────────────┐
           │ trip_      │
           │ invitations│
           └─────────────┘
```

---

## 📊 TABELAS PRINCIPAIS

### 1. Core Tables

#### `users`
**Descrição:** Usuários do sistema (hosts, hóspedes, admins)

**Campos Principais:**
- `id` (PK) - ID único
- `email` (UNIQUE) - Email do usuário
- `name` - Nome completo
- `role` - Role: 'user', 'host', 'admin'
- `password_hash` - Hash da senha (bcrypt)
- `phone` - Telefone
- `status` - Status: 'active', 'inactive', 'suspended'

**Relacionamentos:**
- 1:N com `properties` (host_id)
- 1:N com `bookings` (user_id)
- 1:N com `wishlists` (owner_id)
- 1:N com `host_ratings` (host_id)

**Índices:**
- `idx_users_email` (UNIQUE)
- `idx_users_role`
- `idx_users_status`

---

#### `properties`
**Descrição:** Propriedades disponíveis para reserva

**Campos Principais:**
- `id` (PK)
- `host_id` (FK → users.id)
- `name` - Nome da propriedade
- `description` - Descrição
- `address` - Endereço completo
- `latitude`, `longitude` - Coordenadas
- `price_per_night` - Preço base
- `max_guests` - Capacidade máxima
- `is_verified` - Propriedade verificada
- `status` - Status: 'active', 'inactive', 'suspended'

**Relacionamentos:**
- N:1 com `users` (host_id)
- 1:N com `bookings` (property_id)
- 1:1 com `property_verifications` (property_id)
- 1:N com `pricing_history` (property_id)

**Índices:**
- `idx_properties_host`
- `idx_properties_location` (latitude, longitude)
- `idx_properties_status`
- `idx_properties_verified`

---

#### `bookings`
**Descrição:** Reservas de propriedades

**Campos Principais:**
- `id` (PK)
- `code` (UNIQUE) - Código da reserva
- `property_id` (FK → properties.id)
- `user_id` (FK → users.id)
- `check_in`, `check_out` - Datas
- `guests` - Número de hóspedes
- `total_amount` - Valor total
- `status` - Status: 'pending', 'confirmed', 'cancelled', 'completed'
- `payment_status` - Status pagamento: 'pending', 'paid', 'partial', 'refunded'
- `calendar_event_id` - ID do evento no Google Calendar

**Relacionamentos:**
- N:1 com `properties` (property_id)
- N:1 com `users` (user_id)
- 1:N com `payments` (booking_id)
- 1:N com `insurance_policies` (booking_id)
- 1:N com `split_payments` (booking_id)

**Índices:**
- `idx_bookings_code` (UNIQUE)
- `idx_bookings_property`
- `idx_bookings_user`
- `idx_bookings_dates` (check_in, check_out)
- `idx_bookings_status`

---

### 2. Viagens em Grupo

#### `wishlists`
**Descrição:** Wishlists compartilhadas

**Campos Principais:**
- `id` (PK)
- `owner_id` (FK → users.id)
- `name` - Nome da wishlist
- `description` - Descrição
- `share_token` (UNIQUE) - Token para compartilhamento
- `status` - Status: 'active', 'archived'

**Relacionamentos:**
- N:1 com `users` (owner_id)
- 1:N com `wishlist_members` (wishlist_id)
- 1:N com `wishlist_items` (wishlist_id)

**Índices:**
- `idx_wishlists_owner`
- `idx_wishlists_token` (UNIQUE)
- `idx_wishlists_status`

---

#### `wishlist_items`
**Descrição:** Itens (propriedades) em uma wishlist

**Campos Principais:**
- `id` (PK)
- `wishlist_id` (FK → wishlists.id)
- `property_id` - ID da propriedade
- `votes_up`, `votes_down`, `votes_maybe` - Contadores de votos
- `added_by` (FK → users.id)

**Relacionamentos:**
- N:1 com `wishlists` (wishlist_id)
- 1:N com `wishlist_votes` (item_id)

**Índices:**
- `idx_wishlist_items_wishlist`
- `idx_wishlist_items_property`

---

#### `wishlist_votes`
**Descrição:** Votos em itens da wishlist

**Campos Principais:**
- `id` (PK)
- `item_id` (FK → wishlist_items.id)
- `user_id` (FK → users.id)
- `vote` - Tipo: 'up', 'down', 'maybe'
- `created_at` - Data do voto

**Relacionamentos:**
- N:1 com `wishlist_items` (item_id)
- N:1 com `users` (user_id)

**Índices:**
- `idx_wishlist_votes_item`
- `idx_wishlist_votes_user`
- `idx_wishlist_votes_unique` (UNIQUE item_id, user_id)

---

#### `split_payments`
**Descrição:** Divisão de pagamento entre participantes

**Campos Principais:**
- `id` (PK)
- `booking_id` (FK → bookings.id)
- `total_amount` - Valor total
- `split_method` - Método: 'equal', 'custom', 'percentage'
- `status` - Status: 'pending', 'paid', 'partial', 'completed'

**Relacionamentos:**
- N:1 com `bookings` (booking_id)
- 1:N com `split_payment_participants` (split_id)

**Índices:**
- `idx_split_payments_booking`
- `idx_split_payments_status`

---

#### `trip_invitations`
**Descrição:** Convites para viagens em grupo

**Campos Principais:**
- `id` (PK)
- `booking_id` (FK → bookings.id)
- `inviter_id` (FK → users.id)
- `invitee_email` - Email do convidado
- `token` (UNIQUE) - Token do convite
- `status` - Status: 'pending', 'accepted', 'declined', 'expired'

**Relacionamentos:**
- N:1 com `bookings` (booking_id)
- N:1 com `users` (inviter_id)

**Índices:**
- `idx_trip_invitations_booking`
- `idx_trip_invitations_token` (UNIQUE)
- `idx_trip_invitations_status`

---

#### `group_chats`
**Descrição:** Chats de grupo para viagens

**Campos Principais:**
- `id` (PK)
- `booking_id` (FK → bookings.id)
- `name` - Nome do chat
- `created_by` (FK → users.id)

**Relacionamentos:**
- N:1 com `bookings` (booking_id)
- 1:N com `group_messages` (chat_id)

**Índices:**
- `idx_group_chats_booking`
- `idx_group_chats_created_by`

---

### 3. Smart Pricing

#### `smart_pricing_config`
**Descrição:** Configuração de precificação inteligente

**Campos Principais:**
- `id` (PK)
- `item_id` (FK → properties.id)
- `enabled` - Precificação ativa
- `base_price` - Preço base
- `weather_weight`, `event_weight`, `competitor_weight`, `demand_weight`, `season_weight` - Pesos dos fatores
- `min_price_multiplier`, `max_price_multiplier` - Limites

**Relacionamentos:**
- N:1 com `properties` (item_id)
- 1:N com `pricing_history` (config_id)

**Índices:**
- `idx_smart_pricing_config_item` (UNIQUE item_id)

---

#### `pricing_history`
**Descrição:** Histórico de preços calculados

**Campos Principais:**
- `id` (PK)
- `item_id` (FK → properties.id)
- `config_id` (FK → smart_pricing_config.id)
- `base_price` - Preço base
- `final_price` - Preço final calculado
- `date` - Data do preço
- `factors` (JSONB) - Fatores utilizados

**Relacionamentos:**
- N:1 com `properties` (item_id)
- N:1 com `smart_pricing_config` (config_id)

**Índices:**
- `idx_pricing_history_item`
- `idx_pricing_history_date`
- `idx_pricing_history_item_date` (item_id, date)

---

#### `pricing_factors`
**Descrição:** Fatores de precificação (weather, events, etc)

**Campos Principais:**
- `id` (PK)
- `item_id` (FK → properties.id)
- `factor_type` - Tipo: 'weather', 'event', 'competitor', 'demand', 'season'
- `factor_name` - Nome do fator
- `factor_value` - Valor
- `multiplier` - Multiplicador
- `date` - Data

**Relacionamentos:**
- N:1 com `properties` (item_id)

**Índices:**
- `idx_pricing_factors_item`
- `idx_pricing_factors_type`
- `idx_pricing_factors_date`

---

### 4. Programa Top Host

#### `host_ratings`
**Descrição:** Ratings de hosts

**Campos Principais:**
- `id` (PK)
- `host_id` (FK → users.id)
- `property_id` (FK → properties.id)
- `rating_type` - Tipo: 'response_time', 'cleanliness', 'communication', 'accuracy', 'check_in', 'value', 'overall'
- `rating_value` - Valor (1-5)
- `reviewer_id` (FK → users.id)

**Relacionamentos:**
- N:1 com `users` (host_id)
- N:1 com `properties` (property_id)
- N:1 com `users` (reviewer_id)

**Índices:**
- `idx_host_ratings_host`
- `idx_host_ratings_property`
- `idx_host_ratings_type`

---

#### `badges`
**Descrição:** Badges de hosts

**Campos Principais:**
- `id` (PK)
- `badge_key` (UNIQUE) - Chave única
- `badge_name` - Nome do badge
- `badge_description` - Descrição
- `badge_icon` - Ícone
- `badge_category` - Categoria: 'quality', 'performance', 'achievement', 'special'
- `criteria` (JSONB) - Critérios para obtenção

**Relacionamentos:**
- 1:N com `host_badges` (badge_id)

**Índices:**
- `idx_badges_key` (UNIQUE)
- `idx_badges_category`

---

#### `host_badges`
**Descrição:** Badges atribuídos a hosts

**Campos Principais:**
- `id` (PK)
- `host_id` (FK → users.id)
- `badge_id` (FK → badges.id)
- `property_id` (FK → properties.id) - Opcional
- `assigned_at` - Data de atribuição
- `expires_at` - Data de expiração (opcional)

**Relacionamentos:**
- N:1 com `users` (host_id)
- N:1 com `badges` (badge_id)
- N:1 com `properties` (property_id)

**Índices:**
- `idx_host_badges_host`
- `idx_host_badges_badge`
- `idx_host_badges_unique` (UNIQUE host_id, badge_id, property_id)

---

### 5. Sistema de Seguros

#### `insurance_policies`
**Descrição:** Apólices de seguro

**Campos Principais:**
- `id` (PK)
- `booking_id` (FK → bookings.id)
- `user_id` (FK → users.id)
- `policy_number` (UNIQUE) - Número da apólice
- `insurance_provider` - Provedor: 'rsv360', 'external'
- `coverage_type` - Tipo: 'basic', 'standard', 'premium', 'comprehensive'
- `coverage_amount` - Valor de cobertura
- `premium_amount` - Valor do prêmio
- `status` - Status: 'active', 'expired', 'cancelled', 'claimed'

**Relacionamentos:**
- N:1 com `bookings` (booking_id)
- N:1 com `users` (user_id)
- 1:N com `insurance_claims` (policy_id)

**Índices:**
- `idx_insurance_policies_booking`
- `idx_insurance_policies_user`
- `idx_insurance_policies_status`
- `idx_insurance_policies_number` (UNIQUE)

---

#### `insurance_claims`
**Descrição:** Sinistros de seguro

**Campos Principais:**
- `id` (PK)
- `policy_id` (FK → insurance_policies.id)
- `booking_id` (FK → bookings.id)
- `user_id` (FK → users.id)
- `claim_number` (UNIQUE) - Número do sinistro
- `claim_type` - Tipo: 'cancellation', 'medical', 'baggage', 'trip_delay', 'accident', 'other'
- `claimed_amount` - Valor reclamado
- `approved_amount` - Valor aprovado
- `status` - Status: 'pending', 'under_review', 'approved', 'rejected', 'paid', 'closed'

**Relacionamentos:**
- N:1 com `insurance_policies` (policy_id)
- N:1 com `bookings` (booking_id)
- N:1 com `users` (user_id)

**Índices:**
- `idx_insurance_claims_policy`
- `idx_insurance_claims_user`
- `idx_insurance_claims_status`

---

### 6. Verificação

#### `property_verifications`
**Descrição:** Verificações de propriedades

**Campos Principais:**
- `id` (PK)
- `property_id` (FK → properties.id)
- `requested_by` (FK → users.id)
- `status` - Status: 'pending', 'under_review', 'approved', 'rejected'
- `property_photos` (JSONB) - Array de URLs de fotos
- `metadata` (JSONB) - Metadados (video_url, etc)
- `reviewed_by` (FK → users.id)
- `reviewed_at` - Data de revisão
- `rejection_reason` - Motivo da rejeição

**Relacionamentos:**
- N:1 com `properties` (property_id)
- N:1 com `users` (requested_by)
- N:1 com `users` (reviewed_by)
- 1:N com `verification_history` (verification_id)

**Índices:**
- `idx_property_verifications_property`
- `idx_property_verifications_status`
- `idx_property_verifications_requester`

---

## 🔗 RELACIONAMENTOS PRINCIPAIS

### Hierarquia de Dependências:

```
users (base)
  ├── properties (host_id)
  │     ├── bookings (property_id)
  │     │     ├── payments (booking_id)
  │     │     ├── insurance_policies (booking_id)
  │     │     └── split_payments (booking_id)
  │     ├── property_verifications (property_id)
  │     └── pricing_history (item_id)
  ├── wishlists (owner_id)
  │     ├── wishlist_members (wishlist_id)
  │     └── wishlist_items (wishlist_id)
  │           └── wishlist_votes (item_id)
  ├── host_ratings (host_id)
  └── trip_invitations (inviter_id)
```

---

## 📈 ÍNDICES OTIMIZADOS

### Índices de Performance:

```sql
-- Busca por email (login)
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Busca de propriedades por localização
CREATE INDEX idx_properties_location ON properties(latitude, longitude);

-- Busca de reservas por datas
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);

-- Busca de preços por propriedade e data
CREATE INDEX idx_pricing_history_item_date ON pricing_history(item_id, date);

-- Busca de ratings por host
CREATE INDEX idx_host_ratings_host ON host_ratings(host_id);

-- Busca de verificações pendentes
CREATE INDEX idx_property_verifications_status ON property_verifications(status) WHERE status = 'pending';
```

---

## 🔒 CONSTRAINTS E VALIDAÇÕES

### Constraints Implementadas:

```sql
-- Check constraints
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
CHECK (rating_value >= 1 AND rating_value <= 5)
CHECK (check_out > check_in)
CHECK (guests > 0)

-- Foreign keys
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- Unique constraints
UNIQUE (email)
UNIQUE (policy_number)
UNIQUE (booking_code)
```

---

## 📊 ESTATÍSTICAS DO SCHEMA

### Total de Tabelas: ~30+
- Core: 5 tabelas
- Viagens em Grupo: 7 tabelas
- Smart Pricing: 3 tabelas
- Top Host: 3 tabelas
- Seguros: 2 tabelas
- Verificação: 2 tabelas
- Outras: 8+ tabelas

### Total de Índices: ~50+
- Performance: 30+
- Unique: 10+
- Composite: 10+

---

**Última atualização:** 22/11/2025

