# 🚀 PLANO COMPLETO DE EVOLUÇÃO - RSV GEN 2

**Data de Criação:** 02/12/2025  
**Versão:** 1.0.0  
**Status:** 📋 Planejamento Completo  
**Objetivo:** Evoluir sistema RSV360 de 62% → 100% em 90 dias

---

## 📊 SITUAÇÃO ATUAL DO SISTEMA

### Status Geral: 62% Completo

| Componente | Status Atual | Meta | Gap |
|------------|--------------|------|-----|
| **Documentação** | ✅ 95% | 100% | 5% |
| **Backend Core** | ⚠️ 70% | 100% | 30% |
| **Frontend** | ⚠️ 60% | 100% | 40% |
| **Testes** | ❌ 30% | 80% | 50% |
| **Deploy** | ⚠️ 40% | 100% | 60% |
| **Integrações** | ⚠️ 50% | 100% | 50% |

### Features Críticas em 0% (PRIORIDADE MÁXIMA)

1. ❌ **Viagens em Grupo** - 0% (80% do mercado Airbnb)
2. ❌ **Smart Pricing AI** - 0% (+20% receita)
3. ❌ **Programa Top Host** - 0% (confiança e conversão)
4. ❌ **Reserve Now, Pay Later** - 0%
5. ❌ **Google Calendar Sync** - 0%
6. ❌ **Smart Locks Integration** - 0%
7. ❌ **Verificação de Anúncios** - 0%
8. ❌ **Seguro/Aircover** - 0%

---

## 🎯 ESTRATÉGIA DE 90 DIAS

### MÊS 1: VIABILIDADE COMERCIAL (Semanas 1-4)
**Foco:** Features que geram receita imediata

### MÊS 2: CONFIANÇA + QUALIDADE (Semanas 5-8)
**Foco:** Features que aumentam confiança e conversão

### MÊS 3: ESCALA + POLISH (Semanas 9-12)
**Foco:** Integrações, testes e deploy

---

## 📋 FASE 1: VIAGENS EM GRUPO (Semanas 1-3)

**Prioridade:** 🔴 CRÍTICA (80% do mercado Airbnb)  
**Impacto:** Aumenta bookings em 300%+  
**Estimativa:** 3 semanas

### Sprint 1.1: Database Schema (Dia 1)

#### TAREFA 1.1.1: Criar Migration SQL
**Arquivo:** `backend/migrations/006_add_group_travel.sql`

**Ações:**
1. Criar tabela `shared_wishlists`
2. Criar tabela `wishlist_members`
3. Criar tabela `wishlist_items`
4. Criar tabela `votes`
5. Criar tabela `payment_splits`
6. Criar tabela `trip_invitations`
7. Criar tabela `group_chat`
8. Criar tabela `group_messages`
9. Criar índices para performance
10. Criar triggers para atualização automática de votos

**Comando:**
```bash
cd backend
psql -U postgres -d rsv360 -f migrations/006_add_group_travel.sql
```

**Validação:**
- [ ] Todas as tabelas criadas
- [ ] Índices criados
- [ ] Triggers funcionando
- [ ] Foreign keys configuradas

---

#### TAREFA 1.1.2: Types TypeScript
**Arquivo:** `backend/src/group-travel/types/index.ts`

**Interfaces a criar:**
1. `SharedWishlist`
2. `WishlistMember`
3. `WishlistItem`
4. `Vote`
5. `SplitPayment`
6. `TripInvitation`
7. `GroupChat`
8. `GroupMessage`
9. `Comment`
10. DTOs para criação/atualização

**Validação:**
- [ ] Todas as interfaces exportadas
- [ ] Tipos corretos (number, string, Date, etc)
- [ ] DTOs com validação

---

### Sprint 1.2: Backend Services (Dias 2-5)

#### TAREFA 1.2.1: Wishlist Service
**Arquivo:** `backend/src/group-travel/services/wishlist.service.ts`

**Métodos a implementar:**
1. `createWishlist(userId, data)` - Criar wishlist compartilhada
2. `getUserWishlists(userId)` - Listar wishlists do usuário
3. `getWishlistById(wishlistId, userId)` - Buscar wishlist com membros e items
4. `addItem(userId, data)` - Adicionar propriedade à wishlist
5. `removeItem(userId, wishlistId, itemId)` - Remover item
6. `inviteMember(userId, wishlistId, email)` - Convidar membro
7. `removeMember(userId, wishlistId, memberId)` - Remover membro
8. `invalidateWishlistCache(wishlistId)` - Invalidar cache

**Requisitos:**
- ✅ Cache Redis (TTL: 1 hora)
- ✅ Validação de acesso (apenas membros)
- ✅ Transações SQL para consistência
- ✅ Error handling completo

**Validação:**
- [ ] Todos os métodos implementados
- [ ] Cache funcionando
- [ ] Validação de acesso
- [ ] Testes unitários passando

---

#### TAREFA 1.2.2: Vote Service
**Arquivo:** `backend/src/group-travel/services/vote.service.ts`

**Métodos a implementar:**
1. `vote(userId, data)` - Votar em item (up/down/maybe)
2. `removeVote(userId, itemId)` - Remover voto
3. `getItemVotes(itemId)` - Buscar votos de um item

**Validação:**
- [ ] Votos atualizados automaticamente via trigger
- [ ] Cache invalidado após votação
- [ ] Testes unitários passando

---

#### TAREFA 1.2.3: Split Payment Service
**Arquivo:** `backend/src/group-travel/services/split-payment.service.ts`

**Métodos a implementar:**
1. `createSplitPayment(bookingId, splits)` - Criar divisão de pagamento
2. `getBookingSplits(bookingId)` - Buscar divisões de uma reserva
3. `markAsPaid(splitId, paymentMethod)` - Marcar como pago
4. `calculateSplits(bookingId, participants)` - Calcular divisão automática

**Lógica de Divisão:**
- Divisão igual entre participantes
- Divisão proporcional (opcional)
- Suporte a taxas adicionais

**Validação:**
- [ ] Cálculo correto
- [ ] Validação de valores
- [ ] Testes unitários passando

---

#### TAREFA 1.2.4: Trip Invitation Service
**Arquivo:** `backend/src/group-travel/services/trip-invitation.service.ts`

**Métodos a implementar:**
1. `createInvitation(bookingId, invitedBy, email)` - Criar convite
2. `acceptInvitation(token)` - Aceitar convite
3. `declineInvitation(token)` - Recusar convite
4. `getInvitationByToken(token)` - Buscar convite por token
5. `sendInvitationEmail(invitation)` - Enviar email (job assíncrono)

**Requisitos:**
- ✅ Token único e seguro (UUID)
- ✅ Expiração de 7 dias
- ✅ Email com link de aceitação
- ✅ Integração com sistema de email

**Validação:**
- [ ] Tokens únicos
- [ ] Expiração funcionando
- [ ] Emails enviados
- [ ] Testes unitários passando

---

#### TAREFA 1.2.5: Group Chat Service
**Arquivo:** `backend/src/group-travel/services/group-chat.service.ts`

**Métodos a implementar:**
1. `createChat(bookingId, participants)` - Criar chat de grupo
2. `sendMessage(chatId, senderId, message)` - Enviar mensagem
3. `getChatMessages(chatId, page, limit)` - Buscar mensagens (paginação)
4. `getChatByBooking(bookingId)` - Buscar chat de uma reserva

**Requisitos:**
- ✅ Paginação (20 mensagens por página)
- ✅ Ordenação por data (mais recente primeiro)
- ✅ WebSocket para tempo real (opcional)

**Validação:**
- [ ] Mensagens salvas corretamente
- [ ] Paginação funcionando
- [ ] Testes unitários passando

---

### Sprint 1.3: Backend Controllers (Dias 6-8)

#### TAREFA 1.3.1: Wishlist Controller
**Arquivo:** `backend/src/group-travel/controllers/wishlist.controller.ts`

**Endpoints a criar:**
1. `POST /api/group-travel/wishlists` - Criar wishlist
2. `GET /api/group-travel/wishlists` - Listar wishlists do usuário
3. `GET /api/group-travel/wishlists/:id` - Buscar wishlist por ID
4. `POST /api/group-travel/wishlists/:id/items` - Adicionar item
5. `DELETE /api/group-travel/wishlists/:id/items/:itemId` - Remover item
6. `POST /api/group-travel/wishlists/:id/invite` - Convidar membro
7. `DELETE /api/group-travel/wishlists/:id/members/:memberId` - Remover membro

**Validação:**
- [ ] Todos os endpoints funcionando
- [ ] Validação de entrada (Joi)
- [ ] Error handling
- [ ] Testes de integração passando

---

#### TAREFA 1.3.2: Vote Controller
**Arquivo:** `backend/src/group-travel/controllers/vote.controller.ts`

**Endpoints a criar:**
1. `POST /api/group-travel/votes` - Votar em item
2. `DELETE /api/group-travel/votes/:itemId` - Remover voto
3. `GET /api/group-travel/items/:itemId/votes` - Buscar votos de item

**Validação:**
- [ ] Endpoints funcionando
- [ ] Validação de voto (up/down/maybe)
- [ ] Testes de integração passando

---

#### TAREFA 1.3.3: Split Payment Controller
**Arquivo:** `backend/src/group-travel/controllers/split-payment.controller.ts`

**Endpoints a criar:**
1. `POST /api/group-travel/split-payments` - Criar divisão
2. `GET /api/group-travel/bookings/:bookingId/splits` - Buscar divisões
3. `PATCH /api/group-travel/split-payments/:id/pay` - Marcar como pago

**Validação:**
- [ ] Endpoints funcionando
- [ ] Cálculo correto
- [ ] Testes de integração passando

---

#### TAREFA 1.3.4: Trip Invitation Controller
**Arquivo:** `backend/src/group-travel/controllers/trip-invitation.controller.ts`

**Endpoints a criar:**
1. `POST /api/group-travel/invitations` - Criar convite
2. `GET /api/group-travel/invitations/:token` - Buscar convite por token
3. `POST /api/group-travel/invitations/:token/accept` - Aceitar convite
4. `POST /api/group-travel/invitations/:token/decline` - Recusar convite

**Validação:**
- [ ] Endpoints funcionando
- [ ] Tokens seguros
- [ ] Expiração funcionando
- [ ] Testes de integração passando

---

#### TAREFA 1.3.5: Group Chat Controller
**Arquivo:** `backend/src/group-travel/controllers/group-chat.controller.ts`

**Endpoints a criar:**
1. `POST /api/group-travel/chats` - Criar chat
2. `POST /api/group-travel/chats/:id/messages` - Enviar mensagem
3. `GET /api/group-travel/chats/:id/messages` - Buscar mensagens
4. `GET /api/group-travel/bookings/:bookingId/chat` - Buscar chat de reserva

**Validação:**
- [ ] Endpoints funcionando
- [ ] Paginação funcionando
- [ ] Testes de integração passando

---

### Sprint 1.4: Validators (Dia 9)

#### TAREFA 1.4.1: Criar Validators Joi
**Arquivos:**
- `backend/src/group-travel/validators/wishlist.validator.ts`
- `backend/src/group-travel/validators/vote.validator.ts`
- `backend/src/group-travel/validators/split-payment.validator.ts`
- `backend/src/group-travel/validators/invitation.validator.ts`
- `backend/src/group-travel/validators/chat.validator.ts`

**Validações necessárias:**
- Nome da wishlist (min 3, max 255 caracteres)
- Email válido
- Vote (enum: 'up', 'down', 'maybe')
- Amount (decimal positivo)
- Token (UUID válido)
- Message (min 1, max 1000 caracteres)

**Validação:**
- [ ] Todos os validators criados
- [ ] Mensagens de erro claras
- [ ] Testes de validação passando

---

### Sprint 1.5: Routes (Dia 10)

#### TAREFA 1.5.1: Configurar Rotas
**Arquivo:** `backend/src/group-travel/routes/index.ts`

**Ações:**
1. Importar todos os controllers
2. Configurar rotas RESTful
3. Aplicar middleware de autenticação
4. Aplicar validators
5. Registrar rotas no app principal

**Validação:**
- [ ] Todas as rotas registradas
- [ ] Autenticação funcionando
- [ ] Validação aplicada
- [ ] Testes de rota passando

---

### Sprint 1.6: Frontend Components (Dias 11-15)

#### TAREFA 1.6.1: Shared Wishlist Components
**Arquivos:**
- `frontend/src/features/group-travel/components/SharedWishlistList.tsx`
- `frontend/src/features/group-travel/components/SharedWishlistForm.tsx`
- `frontend/src/features/group-travel/components/SharedWishlistCard.tsx`
- `frontend/src/features/group-travel/components/WishlistItemCard.tsx`
- `frontend/src/features/group-travel/components/VoteButtons.tsx`

**Funcionalidades:**
- Listar wishlists do usuário
- Criar nova wishlist
- Adicionar propriedades
- Sistema de votação visual
- Remover items
- Gerenciar membros

**Validação:**
- [ ] Componentes renderizando
- [ ] Interações funcionando
- [ ] Validação de formulários
- [ ] Testes de componente passando

---

#### TAREFA 1.6.2: Split Payment Components
**Arquivos:**
- `frontend/src/features/group-travel/components/SplitPaymentCalculator.tsx`
- `frontend/src/features/group-travel/components/SplitPaymentList.tsx`
- `frontend/src/features/group-travel/components/PaymentStatusBadge.tsx`

**Funcionalidades:**
- Calcular divisão automática
- Visualizar divisões
- Marcar como pago
- Status de pagamento

**Validação:**
- [ ] Cálculo correto
- [ ] UI responsiva
- [ ] Testes de componente passando

---

#### TAREFA 1.6.3: Trip Invitation Components
**Arquivos:**
- `frontend/src/features/group-travel/components/InviteMemberForm.tsx`
- `frontend/src/features/group-travel/components/InvitationCard.tsx`
- `frontend/src/features/group-travel/components/AcceptInvitationPage.tsx`

**Funcionalidades:**
- Formulário de convite
- Listar convites pendentes
- Aceitar/recusar convite
- Link de convite compartilhável

**Validação:**
- [ ] Formulário funcionando
- [ ] Links funcionando
- [ ] Testes de componente passando

---

#### TAREFA 1.6.4: Group Chat Components
**Arquivos:**
- `frontend/src/features/group-travel/components/GroupChat.tsx`
- `frontend/src/features/group-travel/components/ChatMessage.tsx`
- `frontend/src/features/group-travel/components/ChatInput.tsx`

**Funcionalidades:**
- Chat em tempo real (WebSocket opcional)
- Lista de mensagens
- Enviar mensagem
- Paginação de mensagens antigas

**Validação:**
- [ ] Mensagens exibindo
- [ ] Envio funcionando
- [ ] Paginação funcionando
- [ ] Testes de componente passando

---

### Sprint 1.7: Frontend Pages (Dias 16-18)

#### TAREFA 1.7.1: Shared Wishlist Page
**Arquivo:** `frontend/src/features/group-travel/pages/SharedWishlistPage.tsx`

**Funcionalidades:**
- Visualizar wishlist completa
- Adicionar propriedades
- Sistema de votação
- Gerenciar membros
- Comentários

**Validação:**
- [ ] Página renderizando
- [ ] Todas as funcionalidades
- [ ] Testes E2E passando

---

#### TAREFA 1.7.2: Split Payment Page
**Arquivo:** `frontend/src/features/group-travel/pages/SplitPaymentPage.tsx`

**Funcionalidades:**
- Visualizar divisões
- Calcular divisão
- Marcar pagamentos
- Histórico de pagamentos

**Validação:**
- [ ] Página renderizando
- [ ] Cálculos corretos
- [ ] Testes E2E passando

---

### Sprint 1.8: Frontend Hooks & Services (Dias 19-20)

#### TAREFA 1.8.1: React Hooks
**Arquivos:**
- `frontend/src/features/group-travel/hooks/useSharedWishlist.ts`
- `frontend/src/features/group-travel/hooks/useVote.ts`
- `frontend/src/features/group-travel/hooks/useSplitPayment.ts`
- `frontend/src/features/group-travel/hooks/useGroupChat.ts`

**Funcionalidades:**
- Gerenciar estado
- Cache com React Query
- Otimistic updates
- Error handling

**Validação:**
- [ ] Hooks funcionando
- [ ] Cache funcionando
- [ ] Testes de hook passando

---

#### TAREFA 1.8.2: API Services
**Arquivos:**
- `frontend/src/features/group-travel/services/wishlist.service.ts`
- `frontend/src/features/group-travel/services/vote.service.ts`
- `frontend/src/features/group-travel/services/split-payment.service.ts`
- `frontend/src/features/group-travel/services/chat.service.ts`

**Validação:**
- [ ] Todas as chamadas API funcionando
- [ ] Error handling
- [ ] Testes de service passando

---

### Sprint 1.9: Testes (Dias 21-22)

#### TAREFA 1.9.1: Testes Backend
**Arquivos:**
- `backend/src/group-travel/tests/unit/wishlist.service.test.ts`
- `backend/src/group-travel/tests/unit/vote.service.test.ts`
- `backend/src/group-travel/tests/integration/wishlist.integration.test.ts`
- `backend/src/group-travel/tests/integration/vote.integration.test.ts`

**Cobertura mínima:** 80%

**Validação:**
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Cobertura >= 80%

---

#### TAREFA 1.9.2: Testes Frontend
**Arquivos:**
- `frontend/src/features/group-travel/tests/SharedWishlistList.test.tsx`
- `frontend/src/features/group-travel/tests/VoteButtons.test.tsx`
- `frontend/src/features/group-travel/tests/SplitPaymentCalculator.test.tsx`

**Validação:**
- [ ] Testes de componente passando
- [ ] Testes de hook passando
- [ ] Cobertura >= 70%

---

### Sprint 1.10: Documentação (Dia 23)

#### TAREFA 1.10.1: API Documentation
**Arquivo:** `docs/api/group-travel.md`

**Conteúdo:**
- Descrição da feature
- Endpoints documentados
- Exemplos de request/response
- Códigos de erro
- Autenticação

**Validação:**
- [ ] Documentação completa
- [ ] Exemplos funcionando
- [ ] Swagger/OpenAPI atualizado

---

## 📋 FASE 2: SMART PRICING AI (Semanas 4-7)

**Prioridade:** 🔴 CRÍTICA (+20% receita)  
**Impacto:** Aumenta receita em 15-25%  
**Estimativa:** 4 semanas

### Sprint 2.1: Database Schema (Dia 1)

#### TAREFA 2.1.1: Migration SQL
**Arquivo:** `backend/migrations/007_add_smart_pricing.sql`

**Tabelas a criar:**
1. `smart_pricing_config` - Configuração por propriedade
2. `pricing_factors` - Fatores de precificação
3. `price_history` - Histórico de preços
4. `competitor_properties` - Propriedades concorrentes
5. `demand_forecast` - Previsão de demanda

**Validação:**
- [ ] Todas as tabelas criadas
- [ ] Índices criados
- [ ] Foreign keys configuradas

---

### Sprint 2.2: Machine Learning Models (Dias 2-5)

#### TAREFA 2.2.1: Modelo de Precificação
**Arquivo:** `backend/src/pricing/ml-models/pricing-model.ts`

**Algoritmo:**
- Regressão linear para preço base
- Fatores ponderados:
  - Sazonalidade (30%)
  - Demanda/Ocupação (25%)
  - Eventos locais (15%)
  - Concorrência (15%)
  - Clima (10%)
  - Dia da semana (5%)

**Validação:**
- [ ] Modelo treinado
- [ ] Precisão >= 85%
- [ ] Testes de modelo passando

---

#### TAREFA 2.2.2: Integração com APIs Externas
**Arquivos:**
- `backend/src/pricing/services/weather.service.ts`
- `backend/src/pricing/services/calendar.service.ts`
- `backend/src/pricing/services/eventbrite.service.ts`
- `backend/src/pricing/services/competitor-scraper.service.ts`

**APIs a integrar:**
1. OpenWeather API - Clima
2. Google Calendar API - Eventos
3. Eventbrite API - Eventos locais
4. Scraping Airbnb/Booking - Concorrência

**Validação:**
- [ ] Todas as APIs funcionando
- [ ] Cache de dados externos
- [ ] Error handling robusto
- [ ] Testes de integração passando

---

### Sprint 2.3: Pricing Service (Dias 6-10)

#### TAREFA 2.3.1: Smart Pricing Service
**Arquivo:** `backend/src/pricing/services/smart-pricing.service.ts`

**Métodos a implementar:**
1. `calculatePrice(propertyId, date)` - Calcular preço inteligente
2. `updatePrice(propertyId, date, newPrice)` - Atualizar preço
3. `getPriceHistory(propertyId, startDate, endDate)` - Histórico
4. `getCompetitorPrices(propertyId, date)` - Preços concorrentes
5. `getDemandForecast(propertyId, startDate, endDate)` - Previsão
6. `applyPricingRules(propertyId, date)` - Aplicar regras

**Validação:**
- [ ] Cálculo correto
- [ ] Performance (< 500ms)
- [ ] Cache funcionando
- [ ] Testes unitários passando

---

### Sprint 2.4: Frontend Dashboard (Dias 11-15)

#### TAREFA 2.4.1: Smart Pricing Dashboard
**Arquivo:** `frontend/src/features/pricing/pages/SmartPricingDashboard.tsx`

**Funcionalidades:**
- Visualizar preços calculados
- Comparar com preços manuais
- Gráficos de histórico
- Ajustar configurações
- Simular cenários

**Validação:**
- [ ] Dashboard renderizando
- [ ] Gráficos funcionando
- [ ] Interações funcionando
- [ ] Testes E2E passando

---

## 📋 FASE 3: PROGRAMA TOP HOST (Semanas 8-9)

**Prioridade:** 🟡 ALTA (Confiança e Conversão)  
**Impacto:** Aumenta conversão em 15-20%  
**Estimativa:** 2 semanas

### Sprint 3.1: Database Schema (Dia 1)

#### TAREFA 3.1.1: Migration SQL
**Arquivo:** `backend/migrations/008_add_quality_program.sql`

**Tabelas a criar:**
1. `host_ratings` - Ratings de hosts
2. `badges` - Badges disponíveis
3. `host_badges` - Badges conquistados
4. `host_incentives` - Incentivos para SuperHosts

**Validação:**
- [ ] Todas as tabelas criadas
- [ ] Índices criados

---

### Sprint 3.2: Rating Service (Dias 2-5)

#### TAREFA 3.2.1: Host Rating Service
**Arquivo:** `backend/src/quality/services/host-rating.service.ts`

**Métodos a implementar:**
1. `calculateRating(hostId)` - Calcular rating geral
2. `updateRating(hostId)` - Atualizar rating
3. `getHostBadges(hostId)` - Buscar badges
4. `awardBadge(hostId, badgeType)` - Conceder badge
5. `checkSuperHostStatus(hostId)` - Verificar SuperHost

**Critérios:**
- Tempo de resposta (< 1h = 10 pontos)
- Taxa de aceitação (> 90% = 10 pontos)
- Taxa de cancelamento (< 1% = 10 pontos)
- Reviews (4.8+ = 10 pontos)
- Experiência (50+ reservas = 10 pontos)

**Validação:**
- [ ] Cálculo correto
- [ ] Badges concedidos automaticamente
- [ ] Testes unitários passando

---

### Sprint 3.3: Frontend Components (Dias 6-10)

#### TAREFA 3.3.1: Host Badges Components
**Arquivos:**
- `frontend/src/features/quality/components/HostBadges.tsx`
- `frontend/src/features/quality/components/BadgeCard.tsx`
- `frontend/src/features/quality/components/QualityDashboard.tsx`

**Validação:**
- [ ] Componentes renderizando
- [ ] Badges exibindo corretamente
- [ ] Testes de componente passando

---

## 📋 FASE 4: INTEGRAÇÕES CRÍTICAS (Semanas 10-11)

### Sprint 4.1: Google Calendar Sync (Dias 1-3)

#### TAREFA 4.1.1: Google Calendar Integration
**Arquivos:**
- `backend/src/integrations/google-calendar/google-calendar.service.ts`
- `backend/src/integrations/google-calendar/google-calendar.controller.ts`

**Funcionalidades:**
- Sincronizar reservas com Google Calendar
- Criar eventos automaticamente
- Atualizar eventos
- Deletar eventos cancelados

**Validação:**
- [ ] OAuth2 funcionando
- [ ] Sincronização automática
- [ ] Testes de integração passando

---

### Sprint 4.2: Smart Locks (Dias 4-6)

#### TAREFA 4.2.1: Smart Locks Integration
**Arquivos:**
- `backend/src/integrations/smart-locks/smart-locks.service.ts`
- `backend/src/integrations/smart-locks/smart-locks.controller.ts`

**Funcionalidades:**
- Gerar códigos de acesso
- Enviar códigos para hóspedes
- Revogar códigos após checkout
- Integração com principais marcas (August, Schlage, etc)

**Validação:**
- [ ] Códigos gerados
- [ ] Envio automático
- [ ] Revogação funcionando
- [ ] Testes de integração passando

---

### Sprint 4.3: Reserve Now Pay Later (Dias 7-9)

#### TAREFA 4.3.1: Klarna Integration
**Arquivos:**
- `backend/src/integrations/klarna/klarna.service.ts`
- `backend/src/integrations/klarna/klarna.controller.ts`

**Funcionalidades:**
- Criar sessão Klarna
- Processar pagamento parcelado
- Webhook de confirmação
- Cancelamento de parcelas

**Validação:**
- [ ] Integração funcionando
- [ ] Pagamentos processados
- [ ] Webhooks funcionando
- [ ] Testes de integração passando

---

## 📋 FASE 5: TESTES E DEPLOY (Semana 12)

### Sprint 5.1: Testes Completos (Dias 1-3)

#### TAREFA 5.1.1: Aumentar Cobertura de Testes
**Meta:** 80% de cobertura

**Ações:**
1. Testes unitários faltantes
2. Testes de integração faltantes
3. Testes E2E críticos
4. Testes de carga
5. Testes de segurança

**Validação:**
- [ ] Cobertura >= 80%
- [ ] Todos os testes passando
- [ ] CI/CD configurado

---

### Sprint 5.2: Deploy e Monitoramento (Dias 4-5)

#### TAREFA 5.2.1: Configurar Deploy
**Arquivos:**
- `docker-compose.prod.yml`
- `k8s/deployment.yaml`
- `.github/workflows/deploy.yml`

**Validação:**
- [ ] Deploy automatizado
- [ ] Rollback funcionando
- [ ] Monitoramento configurado

---

## 📊 CHECKLIST GERAL DE PROGRESSO

### Backend
- [ ] Viagens em Grupo (100%)
- [ ] Smart Pricing AI (100%)
- [ ] Programa Top Host (100%)
- [ ] Seguros (100%)
- [ ] Verificação (100%)
- [ ] Integrações (100%)
- [ ] Testes (80% cobertura)

### Frontend
- [ ] Componentes de Grupo (100%)
- [ ] Dashboard de Pricing (100%)
- [ ] Badges e Quality (100%)
- [ ] Páginas principais (100%)
- [ ] Testes (70% cobertura)

### DevOps
- [ ] Docker configurado
- [ ] Kubernetes configurado
- [ ] CI/CD funcionando
- [ ] Monitoramento ativo
- [ ] Backup automático

---

## 🎯 MÉTRICAS DE SUCESSO

### Mês 1
- ✅ Viagens em Grupo funcionando
- ✅ 10-20 clientes beta testando
- ✅ Smart Pricing básico funcionando

### Mês 2
- ✅ Programa Top Host implementado
- ✅ 50-100 propriedades ativas
- ✅ Seguros integrados

### Mês 3
- ✅ Sistema 100% operacional
- ✅ Cobertura de testes >= 80%
- ✅ Deploy automatizado
- ✅ Pronto para escalar 1000+ propriedades

---

## 💰 INVESTIMENTO ESTIMADO

### Opção 1: Time Completo (Recomendado)
- 2 Devs Full-Stack: R$ 15k/mês cada × 3 meses = **R$ 90k**
- Infraestrutura (AWS): R$ 3,5k/mês × 3 = **R$ 10,5k**
- Integrações (APIs): **R$ 5k** one-time
- **TOTAL: R$ 105.500 em 90 dias**

### Opção 2: Desenvolvimento Focado
- 1 Dev Full-Stack: R$ 15k/mês × 3 = **R$ 45k**
- Infra reduzida: R$ 2k/mês × 3 = **R$ 6k**
- **TOTAL: R$ 51.000 em 90 dias**

---

## 📝 NOTAS IMPORTANTES

1. **Priorizar Features Críticas:** Focar em Viagens em Grupo e Smart Pricing primeiro
2. **Validação Contínua:** Testar com beta testers desde o início
3. **Métricas:** Monitorar conversão, receita e NPS
4. **Documentação:** Manter documentação atualizada
5. **Testes:** Não lançar sem testes automatizados

---

**Versão:** 1.0.0  
**Data:** 02/12/2025  
**Status:** 📋 Planejamento Completo - Pronto para Execução

