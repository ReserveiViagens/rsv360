# 📋 LISTA DE TAREFAS DETALHADA E ROBUSTA - RSV GEN 2

**Data:** 02/12/2025  
**Versão:** 1.0.0  
**Projeto:** RSV Gen 2 - Evolução Completa do Sistema  
**Objetivo:** Evoluir de 62% → 100% em 90 dias

---

## 🎯 VISÃO GERAL DO PROJETO

### Status Atual
- **Documentação:** 95% ✅
- **Backend Core:** 70% ⚠️
- **Frontend:** 60% ⚠️
- **Testes:** 30% ❌
- **Deploy:** 40% ⚠️
- **Integrações:** 50% ⚠️
- **Score Geral:** 62% ⚠️

### Meta Final
- **Todas as Features:** 100% ✅
- **Cobertura de Testes:** 80% ✅
- **Deploy:** Production-ready ✅
- **Documentação:** 100% ✅

---

## 📅 CRONOGRAMA DE 90 DIAS

### MÊS 1: VIABILIDADE COMERCIAL (Semanas 1-4)
**Foco:** Features que geram receita imediata

### MÊS 2: CONFIANÇA + QUALIDADE (Semanas 5-8)
**Foco:** Features que aumentam confiança e conversão

### MÊS 3: ESCALA + POLISH (Semanas 9-12)
**Foco:** Integrações, testes e deploy

---

## 🚀 FASE 1: VIAGENS EM GRUPO (Semanas 1-3)

**Prioridade:** 🔴 CRÍTICA  
**Impacto:** 80% do mercado Airbnb  
**Estimativa:** 3 semanas (15 dias úteis)

---

### 📅 SEMANA 1: Database e Backend Core

#### DIA 1: Database Schema

##### TAREFA 1.1: Criar Migration SQL
**Arquivo:** `backend/migrations/006_add_group_travel.sql`

**Passos Detalhados:**

1. **Criar tabela `shared_wishlists`:**
   ```sql
   CREATE TABLE shared_wishlists (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     created_by INTEGER REFERENCES customers(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   CREATE INDEX idx_shared_wishlists_creator ON shared_wishlists(created_by);
   ```

2. **Criar tabela `wishlist_members`:**
   ```sql
   CREATE TABLE wishlist_members (
     id SERIAL PRIMARY KEY,
     wishlist_id INTEGER REFERENCES shared_wishlists(id) ON DELETE CASCADE,
     user_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
     role VARCHAR(20) DEFAULT 'member',
     joined_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(wishlist_id, user_id)
   );
   CREATE INDEX idx_wishlist_members_wishlist ON wishlist_members(wishlist_id);
   CREATE INDEX idx_wishlist_members_user ON wishlist_members(user_id);
   ```

3. **Criar tabela `wishlist_items`:**
   ```sql
   CREATE TABLE wishlist_items (
     id SERIAL PRIMARY KEY,
     wishlist_id INTEGER REFERENCES shared_wishlists(id) ON DELETE CASCADE,
     property_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
     added_by INTEGER REFERENCES customers(id) ON DELETE SET NULL,
     votes_up INTEGER DEFAULT 0,
     votes_down INTEGER DEFAULT 0,
     added_at TIMESTAMP DEFAULT NOW(),
     comments JSONB DEFAULT '[]'
   );
   CREATE INDEX idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
   CREATE INDEX idx_wishlist_items_property ON wishlist_items(property_id);
   ```

4. **Criar tabela `votes`:**
   ```sql
   CREATE TABLE votes (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
     item_id INTEGER REFERENCES wishlist_items(id) ON DELETE CASCADE,
     vote VARCHAR(10) CHECK (vote IN ('up', 'down', 'maybe')),
     timestamp TIMESTAMP DEFAULT NOW(),
     UNIQUE(user_id, item_id)
   );
   CREATE INDEX idx_votes_item ON votes(item_id);
   ```

5. **Criar tabela `payment_splits`:**
   ```sql
   CREATE TABLE payment_splits (
     id SERIAL PRIMARY KEY,
     booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
     user_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
     amount DECIMAL(10,2) NOT NULL,
     paid BOOLEAN DEFAULT false,
     paid_at TIMESTAMP,
     payment_method VARCHAR(50),
     created_at TIMESTAMP DEFAULT NOW()
   );
   CREATE INDEX idx_payment_splits_booking ON payment_splits(booking_id);
   CREATE INDEX idx_payment_splits_user ON payment_splits(user_id);
   ```

6. **Criar tabela `trip_invitations`:**
   ```sql
   CREATE TABLE trip_invitations (
     id SERIAL PRIMARY KEY,
     booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
     invited_by INTEGER REFERENCES customers(id) ON DELETE CASCADE,
     invited_email VARCHAR(255) NOT NULL,
     token VARCHAR(255) UNIQUE NOT NULL,
     status VARCHAR(20) DEFAULT 'pending',
     expires_at TIMESTAMP NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     accepted_at TIMESTAMP
   );
   CREATE INDEX idx_trip_invitations_token ON trip_invitations(token);
   CREATE INDEX idx_trip_invitations_booking ON trip_invitations(booking_id);
   ```

7. **Criar tabela `group_chat`:**
   ```sql
   CREATE TABLE group_chat (
     id SERIAL PRIMARY KEY,
     booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
     participants INTEGER[] NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   CREATE INDEX idx_group_chat_booking ON group_chat(booking_id);
   ```

8. **Criar tabela `group_messages`:**
   ```sql
   CREATE TABLE group_messages (
     id SERIAL PRIMARY KEY,
     chat_id INTEGER REFERENCES group_chat(id) ON DELETE CASCADE,
     sender_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
     message TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   CREATE INDEX idx_group_messages_chat ON group_messages(chat_id);
   CREATE INDEX idx_group_messages_created_at ON group_messages(created_at DESC);
   ```

9. **Criar trigger para atualizar votos:**
   ```sql
   CREATE OR REPLACE FUNCTION update_vote_counts()
   RETURNS TRIGGER AS $$
   BEGIN
     IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
       UPDATE wishlist_items
       SET 
         votes_up = (SELECT COUNT(*) FROM votes WHERE item_id = NEW.item_id AND vote = 'up'),
         votes_down = (SELECT COUNT(*) FROM votes WHERE item_id = NEW.item_id AND vote = 'down')
       WHERE id = NEW.item_id;
     ELSIF TG_OP = 'DELETE' THEN
       UPDATE wishlist_items
       SET 
         votes_up = (SELECT COUNT(*) FROM votes WHERE item_id = OLD.item_id AND vote = 'up'),
         votes_down = (SELECT COUNT(*) FROM votes WHERE item_id = OLD.item_id AND vote = 'down')
       WHERE id = OLD.item_id;
     END IF;
     RETURN NULL;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER vote_count_trigger
   AFTER INSERT OR UPDATE OR DELETE ON votes
   FOR EACH ROW EXECUTE FUNCTION update_vote_counts();
   ```

**Comando de Execução:**
```bash
cd backend
psql -U postgres -d rsv360 -f migrations/006_add_group_travel.sql
```

**Validação:**
- [ ] Todas as 8 tabelas criadas
- [ ] Todos os índices criados
- [ ] Trigger funcionando corretamente
- [ ] Foreign keys configuradas
- [ ] Constraints aplicadas

---

##### TAREFA 1.2: Criar Types TypeScript
**Arquivo:** `backend/src/group-travel/types/index.ts`

**Passos Detalhados:**

1. **Criar interface `SharedWishlist`:**
   ```typescript
   export interface SharedWishlist {
     id: number;
     name: string;
     created_by: number;
     created_at: Date;
     updated_at: Date;
     members?: WishlistMember[];
     items?: WishlistItem[];
   }
   ```

2. **Criar interface `WishlistMember`:**
   ```typescript
   export interface WishlistMember {
     id: number;
     wishlist_id: number;
     user_id: number;
     role: 'admin' | 'member';
     joined_at: Date;
     user?: {
       id: number;
       name: string;
       email: string;
       avatar?: string;
     };
   }
   ```

3. **Criar interface `WishlistItem`:**
   ```typescript
   export interface WishlistItem {
     id: number;
     wishlist_id: number;
     property_id: number;
     added_by: number;
     votes_up: number;
     votes_down: number;
     added_at: Date;
     comments: Comment[];
     property?: {
       id: number;
       name: string;
       price: number;
       images: string[];
       location: string;
     };
     user_vote?: 'up' | 'down' | 'maybe' | null;
   }
   ```

4. **Criar interface `Vote`:**
   ```typescript
   export interface Vote {
     id: number;
     user_id: number;
     item_id: number;
     vote: 'up' | 'down' | 'maybe';
     timestamp: Date;
   }
   ```

5. **Criar interface `SplitPayment`:**
   ```typescript
   export interface SplitPayment {
     id: number;
     booking_id: number;
     user_id: number;
     amount: number;
     paid: boolean;
     paid_at?: Date;
     payment_method?: string;
     created_at: Date;
     user?: {
       name: string;
       email: string;
     };
   }
   ```

6. **Criar interface `TripInvitation`:**
   ```typescript
   export interface TripInvitation {
     id: number;
     booking_id: number;
     invited_by: number;
     invited_email: string;
     token: string;
     status: 'pending' | 'accepted' | 'declined';
     expires_at: Date;
     created_at: Date;
     accepted_at?: Date;
   }
   ```

7. **Criar interface `GroupChat`:**
   ```typescript
   export interface GroupChat {
     id: number;
     booking_id: number;
     participants: number[];
     created_at: Date;
     messages?: GroupMessage[];
   }
   ```

8. **Criar interface `GroupMessage`:**
   ```typescript
   export interface GroupMessage {
     id: number;
     chat_id: number;
     sender_id: number;
     message: string;
     created_at: Date;
     sender?: {
       name: string;
       avatar?: string;
     };
   }
   ```

9. **Criar interface `Comment`:**
   ```typescript
   export interface Comment {
     user_id: number;
     user_name: string;
     message: string;
     timestamp: Date;
   }
   ```

10. **Criar DTOs:**
    ```typescript
    export interface CreateWishlistDTO {
      name: string;
      member_emails?: string[];
    }

    export interface AddItemDTO {
      wishlist_id: number;
      property_id: number;
    }

    export interface VoteDTO {
      item_id: number;
      vote: 'up' | 'down' | 'maybe';
    }

    export interface CreateSplitPaymentDTO {
      booking_id: number;
      splits: Array<{
        user_id: number;
        amount: number;
      }>;
    }

    export interface InviteMemberDTO {
      wishlist_id: number;
      email: string;
    }
    ```

**Validação:**
- [ ] Todas as interfaces exportadas
- [ ] Tipos corretos
- [ ] DTOs criados
- [ ] Sem erros de TypeScript

---

#### DIA 2-3: Backend Services - Wishlist Service

##### TAREFA 1.3: Implementar Wishlist Service
**Arquivo:** `backend/src/group-travel/services/wishlist.service.ts`

**Métodos a Implementar (Detalhado):**

1. **`createWishlist(userId, data)`**
   - Validar dados de entrada
   - Iniciar transação SQL
   - Criar wishlist
   - Adicionar criador como admin
   - Convidar membros se fornecidos
   - Commit transação
   - Invalidar cache
   - Retornar wishlist criada

2. **`getUserWishlists(userId)`**
   - Verificar cache Redis
   - Se não em cache, buscar do banco
   - Incluir contagem de items e membros
   - Cachear resultado (TTL: 1 hora)
   - Retornar lista

3. **`getWishlistById(wishlistId, userId)`**
   - Verificar cache
   - Verificar acesso do usuário
   - Buscar wishlist
   - Buscar membros
   - Buscar items com votos do usuário
   - Cachear resultado
   - Retornar wishlist completa

4. **`addItem(userId, data)`**
   - Verificar acesso
   - Verificar se item já existe
   - Inserir item
   - Atualizar timestamp da wishlist
   - Invalidar cache
   - Retornar item criado

5. **`removeItem(userId, wishlistId, itemId)`**
   - Verificar acesso (admin ou quem adicionou)
   - Deletar item
   - Invalidar cache
   - Retornar void

6. **`inviteMember(userId, wishlistId, email)`**
   - Verificar se é admin
   - Buscar usuário por email
   - Adicionar como membro
   - Invalidar cache
   - Enviar email de convite (job assíncrono)
   - Retornar void

7. **`removeMember(userId, wishlistId, memberId)`**
   - Verificar se é admin
   - Verificar se não é o criador
   - Remover membro
   - Invalidar cache
   - Retornar void

8. **`invalidateWishlistCache(wishlistId)` (privado)**
   - Buscar todos os membros
   - Invalidar cache da wishlist
   - Invalidar cache de cada membro
   - Retornar void

**Requisitos Técnicos:**
- ✅ Cache Redis (TTL: 3600 segundos)
- ✅ Transações SQL para consistência
- ✅ Error handling robusto
- ✅ Validação de acesso
- ✅ Logs de operações

**Validação:**
- [ ] Todos os métodos implementados
- [ ] Cache funcionando
- [ ] Transações funcionando
- [ ] Error handling completo
- [ ] Testes unitários criados
- [ ] Testes unitários passando

---

#### DIA 4: Backend Services - Vote Service

##### TAREFA 1.4: Implementar Vote Service
**Arquivo:** `backend/src/group-travel/services/vote.service.ts`

**Métodos a Implementar:**

1. **`vote(userId, data)`**
   - Verificar acesso à wishlist
   - Iniciar transação
   - Inserir ou atualizar voto
   - Commit transação
   - Invalidar cache (trigger atualiza contadores)
   - Retornar voto

2. **`removeVote(userId, itemId)`**
   - Deletar voto
   - Invalidar cache
   - Retornar void

3. **`getItemVotes(itemId)`**
   - Buscar todos os votos do item
   - Contar por tipo (up/down/maybe)
   - Retornar estatísticas e lista de votantes

**Validação:**
- [ ] Métodos implementados
- [ ] Trigger atualizando contadores
- [ ] Cache invalidado
- [ ] Testes unitários passando

---

#### DIA 5: Backend Services - Split Payment Service

##### TAREFA 1.5: Implementar Split Payment Service
**Arquivo:** `backend/src/group-travel/services/split-payment.service.ts`

**Métodos a Implementar:**

1. **`createSplitPayment(bookingId, splits)`**
   - Validar valores (soma = total da reserva)
   - Iniciar transação
   - Criar divisões
   - Commit transação
   - Retornar divisões criadas

2. **`getBookingSplits(bookingId)`**
   - Buscar todas as divisões
   - Incluir informações do usuário
   - Retornar lista

3. **`markAsPaid(splitId, paymentMethod)`**
   - Atualizar status
   - Registrar método de pagamento
   - Invalidar cache
   - Retornar divisão atualizada

4. **`calculateSplits(bookingId, participants)`**
   - Buscar total da reserva
   - Calcular divisão igual
   - Aplicar taxas se necessário
   - Retornar divisões calculadas

**Validação:**
- [ ] Cálculo correto
- [ ] Validação de valores
- [ ] Testes unitários passando

---

#### DIA 6: Backend Services - Trip Invitation Service

##### TAREFA 1.6: Implementar Trip Invitation Service
**Arquivo:** `backend/src/group-travel/services/trip-invitation.service.ts`

**Métodos a Implementar:**

1. **`createInvitation(bookingId, invitedBy, email)`**
   - Gerar token único (UUID)
   - Calcular expiração (7 dias)
   - Criar convite
   - Enviar email (job assíncrono)
   - Retornar convite

2. **`acceptInvitation(token)`**
   - Buscar convite por token
   - Verificar se não expirou
   - Atualizar status
   - Adicionar ao grupo de pagamento
   - Retornar convite aceito

3. **`declineInvitation(token)`**
   - Buscar convite
   - Atualizar status
   - Retornar void

4. **`getInvitationByToken(token)`**
   - Buscar convite
   - Verificar expiração
   - Retornar convite

5. **`sendInvitationEmail(invitation)` (privado)**
   - Gerar link de aceitação
   - Enviar email via SendGrid
   - Retornar void

**Validação:**
- [ ] Tokens únicos
- [ ] Expiração funcionando
- [ ] Emails enviados
- [ ] Testes unitários passando

---

#### DIA 7: Backend Services - Group Chat Service

##### TAREFA 1.7: Implementar Group Chat Service
**Arquivo:** `backend/src/group-travel/services/group-chat.service.ts`

**Métodos a Implementar:**

1. **`createChat(bookingId, participants)`**
   - Verificar se chat já existe
   - Criar chat
   - Retornar chat criado

2. **`sendMessage(chatId, senderId, message)`**
   - Verificar acesso ao chat
   - Validar mensagem (não vazia, max 1000 chars)
   - Inserir mensagem
   - Invalidar cache
   - Retornar mensagem

3. **`getChatMessages(chatId, page, limit)`**
   - Calcular offset
   - Buscar mensagens (paginação)
   - Incluir informações do sender
   - Retornar mensagens e metadados

4. **`getChatByBooking(bookingId)`**
   - Buscar chat
   - Retornar chat com mensagens recentes

**Validação:**
- [ ] Mensagens salvas
- [ ] Paginação funcionando
- [ ] Testes unitários passando

---

#### DIA 8-9: Backend Controllers

##### TAREFA 1.8: Implementar Controllers
**Arquivos:**
- `backend/src/group-travel/controllers/wishlist.controller.ts`
- `backend/src/group-travel/controllers/vote.controller.ts`
- `backend/src/group-travel/controllers/split-payment.controller.ts`
- `backend/src/group-travel/controllers/trip-invitation.controller.ts`
- `backend/src/group-travel/controllers/group-chat.controller.ts`

**Endpoints a Criar:**

**Wishlist Controller:**
1. `POST /api/group-travel/wishlists` - Criar wishlist
2. `GET /api/group-travel/wishlists` - Listar wishlists
3. `GET /api/group-travel/wishlists/:id` - Buscar wishlist
4. `POST /api/group-travel/wishlists/:id/items` - Adicionar item
5. `DELETE /api/group-travel/wishlists/:id/items/:itemId` - Remover item
6. `POST /api/group-travel/wishlists/:id/invite` - Convidar membro
7. `DELETE /api/group-travel/wishlists/:id/members/:memberId` - Remover membro

**Vote Controller:**
1. `POST /api/group-travel/votes` - Votar
2. `DELETE /api/group-travel/votes/:itemId` - Remover voto
3. `GET /api/group-travel/items/:itemId/votes` - Buscar votos

**Split Payment Controller:**
1. `POST /api/group-travel/split-payments` - Criar divisão
2. `GET /api/group-travel/bookings/:bookingId/splits` - Buscar divisões
3. `PATCH /api/group-travel/split-payments/:id/pay` - Marcar como pago

**Trip Invitation Controller:**
1. `POST /api/group-travel/invitations` - Criar convite
2. `GET /api/group-travel/invitations/:token` - Buscar convite
3. `POST /api/group-travel/invitations/:token/accept` - Aceitar
4. `POST /api/group-travel/invitations/:token/decline` - Recusar

**Group Chat Controller:**
1. `POST /api/group-travel/chats` - Criar chat
2. `POST /api/group-travel/chats/:id/messages` - Enviar mensagem
3. `GET /api/group-travel/chats/:id/messages` - Buscar mensagens
4. `GET /api/group-travel/bookings/:bookingId/chat` - Buscar chat

**Requisitos:**
- ✅ Middleware de autenticação
- ✅ Validação com Joi
- ✅ Error handling
- ✅ Response format consistente

**Validação:**
- [ ] Todos os endpoints criados
- [ ] Autenticação funcionando
- [ ] Validação aplicada
- [ ] Testes de integração passando

---

#### DIA 10: Validators e Routes

##### TAREFA 1.9: Criar Validators Joi
**Arquivos:**
- `backend/src/group-travel/validators/wishlist.validator.ts`
- `backend/src/group-travel/validators/vote.validator.ts`
- `backend/src/group-travel/validators/split-payment.validator.ts`
- `backend/src/group-travel/validators/invitation.validator.ts`
- `backend/src/group-travel/validators/chat.validator.ts`

**Validações:**

**Wishlist:**
- name: string, min 3, max 255
- member_emails: array de emails válidos (opcional)

**Vote:**
- item_id: number, positivo
- vote: enum ['up', 'down', 'maybe']

**Split Payment:**
- booking_id: number, positivo
- splits: array de objetos com user_id e amount
- amount: decimal, positivo

**Invitation:**
- booking_id: number
- email: string, email válido

**Chat:**
- message: string, min 1, max 1000

**Validação:**
- [ ] Todos os validators criados
- [ ] Mensagens de erro claras
- [ ] Testes de validação passando

---

##### TAREFA 1.10: Configurar Routes
**Arquivo:** `backend/src/group-travel/routes/index.ts`

**Passos:**
1. Importar todos os controllers
2. Importar validators
3. Importar middleware de autenticação
4. Configurar rotas RESTful
5. Aplicar middleware
6. Aplicar validators
7. Exportar router
8. Registrar no app principal

**Validação:**
- [ ] Rotas registradas
- [ ] Middleware aplicado
- [ ] Testes de rota passando

---

### 📅 SEMANA 2: Frontend Components

#### DIA 11-12: Shared Wishlist Components

##### TAREFA 1.11: Criar Componentes de Wishlist
**Arquivos:**
- `frontend/src/features/group-travel/components/SharedWishlistList.tsx`
- `frontend/src/features/group-travel/components/SharedWishlistForm.tsx`
- `frontend/src/features/group-travel/components/SharedWishlistCard.tsx`
- `frontend/src/features/group-travel/components/WishlistItemCard.tsx`
- `frontend/src/features/group-travel/components/VoteButtons.tsx`

**Funcionalidades Detalhadas:**

**SharedWishlistList:**
- Listar wishlists do usuário
- Card para cada wishlist
- Link para abrir wishlist
- Botão para criar nova
- Loading state
- Empty state

**SharedWishlistForm:**
- Formulário para criar wishlist
- Campo nome (obrigatório)
- Campo emails de membros (opcional)
- Validação com Zod
- Submit com loading
- Error handling

**SharedWishlistCard:**
- Exibir informações da wishlist
- Lista de membros
- Contador de items
- Botões de ação (editar, deletar)
- Badge de role (admin/member)

**WishlistItemCard:**
- Exibir propriedade
- Imagem da propriedade
- Informações (nome, preço, localização)
- Botões de votação
- Contador de votos
- Comentários
- Botão para remover

**VoteButtons:**
- Botão Up (👍)
- Botão Down (👎)
- Botão Maybe (🤔)
- Estado visual do voto atual
- Contador de votos
- Tooltip com informações

**Validação:**
- [ ] Componentes renderizando
- [ ] Interações funcionando
- [ ] Validação de formulários
- [ ] Loading states
- [ ] Error states
- [ ] Testes de componente passando

---

#### DIA 13: Split Payment Components

##### TAREFA 1.12: Criar Componentes de Split Payment
**Arquivos:**
- `frontend/src/features/group-travel/components/SplitPaymentCalculator.tsx`
- `frontend/src/features/group-travel/components/SplitPaymentList.tsx`
- `frontend/src/features/group-travel/components/PaymentStatusBadge.tsx`

**Funcionalidades:**

**SplitPaymentCalculator:**
- Input de participantes
- Seleção de método de divisão (igual/proporcional)
- Cálculo automático
- Visualização de divisões
- Botão para criar divisões

**SplitPaymentList:**
- Lista de divisões
- Informações do usuário
- Valor de cada divisão
- Status de pagamento
- Botão para marcar como pago

**PaymentStatusBadge:**
- Badge verde (pago)
- Badge amarelo (pendente)
- Badge vermelho (atrasado)
- Ícone de status

**Validação:**
- [ ] Cálculo correto
- [ ] UI responsiva
- [ ] Testes de componente passando

---

#### DIA 14: Trip Invitation Components

##### TAREFA 1.13: Criar Componentes de Invitation
**Arquivos:**
- `frontend/src/features/group-travel/components/InviteMemberForm.tsx`
- `frontend/src/features/group-travel/components/InvitationCard.tsx`
- `frontend/src/features/group-travel/components/AcceptInvitationPage.tsx`

**Funcionalidades:**

**InviteMemberForm:**
- Campo email
- Validação de email
- Botão enviar
- Loading state
- Success message

**InvitationCard:**
- Informações do convite
- Status (pending/accepted/declined)
- Data de expiração
- Botões aceitar/recusar

**AcceptInvitationPage:**
- Página pública (sem auth)
- Exibir informações da reserva
- Botão aceitar
- Botão recusar
- Link compartilhável

**Validação:**
- [ ] Formulário funcionando
- [ ] Links funcionando
- [ ] Testes de componente passando

---

#### DIA 15: Group Chat Components

##### TAREFA 1.14: Criar Componentes de Chat
**Arquivos:**
- `frontend/src/features/group-travel/components/GroupChat.tsx`
- `frontend/src/features/group-travel/components/ChatMessage.tsx`
- `frontend/src/features/group-travel/components/ChatInput.tsx`

**Funcionalidades:**

**GroupChat:**
- Container do chat
- Lista de mensagens (scroll automático)
- Input de mensagem
- Paginação de mensagens antigas
- Indicador de digitação (opcional)
- WebSocket para tempo real (opcional)

**ChatMessage:**
- Exibir mensagem
- Nome do sender
- Avatar do sender
- Timestamp formatado
- Estilo diferente para mensagens próprias

**ChatInput:**
- Input de texto
- Botão enviar
- Validação (não vazio)
- Enter para enviar
- Loading state

**Validação:**
- [ ] Mensagens exibindo
- [ ] Envio funcionando
- [ ] Paginação funcionando
- [ ] Testes de componente passando

---

### 📅 SEMANA 3: Frontend Pages e Hooks

#### DIA 16-17: Frontend Pages

##### TAREFA 1.15: Criar Páginas
**Arquivos:**
- `frontend/src/features/group-travel/pages/SharedWishlistPage.tsx`
- `frontend/src/features/group-travel/pages/SplitPaymentPage.tsx`
- `frontend/src/features/group-travel/pages/GroupChatPage.tsx`

**Funcionalidades:**

**SharedWishlistPage:**
- Header com nome da wishlist
- Lista de membros (com avatares)
- Lista de items (ordenada por votos)
- Botão adicionar propriedade
- Botão convidar membro
- Sistema de votação
- Comentários em items

**SplitPaymentPage:**
- Informações da reserva
- Calculadora de divisão
- Lista de divisões
- Status de pagamentos
- Histórico de pagamentos

**GroupChatPage:**
- Chat completo
- Lista de participantes
- Mensagens em tempo real
- Input de mensagem

**Validação:**
- [ ] Páginas renderizando
- [ ] Todas as funcionalidades
- [ ] Navegação funcionando
- [ ] Testes E2E passando

---

#### DIA 18-19: Frontend Hooks e Services

##### TAREFA 1.16: Criar React Hooks
**Arquivos:**
- `frontend/src/features/group-travel/hooks/useSharedWishlist.ts`
- `frontend/src/features/group-travel/hooks/useVote.ts`
- `frontend/src/features/group-travel/hooks/useSplitPayment.ts`
- `frontend/src/features/group-travel/hooks/useGroupChat.ts`

**Funcionalidades:**

**useSharedWishlist:**
- Buscar wishlists
- Criar wishlist
- Adicionar item
- Remover item
- Convidar membro
- Cache com React Query
- Optimistic updates

**useVote:**
- Votar em item
- Remover voto
- Buscar votos
- Cache local

**useSplitPayment:**
- Criar divisão
- Buscar divisões
- Marcar como pago
- Calcular divisão

**useGroupChat:**
- Buscar chat
- Enviar mensagem
- Buscar mensagens
- Paginação
- WebSocket (opcional)

**Validação:**
- [ ] Hooks funcionando
- [ ] Cache funcionando
- [ ] Optimistic updates
- [ ] Testes de hook passando

---

##### TAREFA 1.17: Criar API Services
**Arquivos:**
- `frontend/src/features/group-travel/services/wishlist.service.ts`
- `frontend/src/features/group-travel/services/vote.service.ts`
- `frontend/src/features/group-travel/services/split-payment.service.ts`
- `frontend/src/features/group-travel/services/chat.service.ts`

**Funcionalidades:**
- Chamadas HTTP com axios
- Error handling
- TypeScript types
- Retry logic
- Timeout handling

**Validação:**
- [ ] Todas as chamadas funcionando
- [ ] Error handling
- [ ] Testes de service passando

---

#### DIA 20-21: Testes

##### TAREFA 1.18: Testes Backend
**Arquivos:**
- `backend/src/group-travel/tests/unit/wishlist.service.test.ts`
- `backend/src/group-travel/tests/unit/vote.service.test.ts`
- `backend/src/group-travel/tests/integration/wishlist.integration.test.ts`
- `backend/src/group-travel/tests/integration/vote.integration.test.ts`

**Cobertura Mínima:** 80%

**Testes a Criar:**

**Unit Tests:**
- Criar wishlist
- Buscar wishlists
- Adicionar item
- Remover item
- Votar
- Criar divisão
- Calcular divisão

**Integration Tests:**
- Fluxo completo de wishlist
- Fluxo completo de votação
- Fluxo completo de divisão
- Fluxo completo de convite

**Validação:**
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Cobertura >= 80%

---

##### TAREFA 1.19: Testes Frontend
**Arquivos:**
- `frontend/src/features/group-travel/tests/SharedWishlistList.test.tsx`
- `frontend/src/features/group-travel/tests/VoteButtons.test.tsx`
- `frontend/src/features/group-travel/tests/SplitPaymentCalculator.test.tsx`

**Testes a Criar:**
- Renderização de componentes
- Interações do usuário
- Validação de formulários
- Estados de loading/error
- Hooks

**Validação:**
- [ ] Testes de componente passando
- [ ] Testes de hook passando
- [ ] Cobertura >= 70%

---

#### DIA 22: Documentação

##### TAREFA 1.20: API Documentation
**Arquivo:** `docs/api/group-travel.md`

**Conteúdo:**
- Descrição da feature
- Endpoints documentados
- Exemplos de request/response
- Códigos de erro
- Autenticação
- Rate limiting

**Validação:**
- [ ] Documentação completa
- [ ] Exemplos funcionando
- [ ] Swagger/OpenAPI atualizado

---

## 🚀 FASE 2: SMART PRICING AI (Semanas 4-7)

**Prioridade:** 🔴 CRÍTICA  
**Impacto:** +20% receita  
**Estimativa:** 4 semanas

---

### 📅 SEMANA 4: Database e ML Models

#### DIA 1: Database Schema

##### TAREFA 2.1: Criar Migration SQL
**Arquivo:** `backend/migrations/007_add_smart_pricing.sql`

**Tabelas a Criar:**

1. **`smart_pricing_config`:**
   ```sql
   CREATE TABLE smart_pricing_config (
     id SERIAL PRIMARY KEY,
     property_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
     enabled BOOLEAN DEFAULT true,
     min_price DECIMAL(10,2) NOT NULL,
     max_price DECIMAL(10,2) NOT NULL,
     aggressiveness VARCHAR(20) DEFAULT 'medium',
     factors JSONB DEFAULT '{}',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(property_id)
   );
   ```

2. **`pricing_factors`:**
   ```sql
   CREATE TABLE pricing_factors (
     id SERIAL PRIMARY KEY,
     property_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
     date DATE NOT NULL,
     seasonality_factor DECIMAL(5,2) DEFAULT 1.0,
     demand_factor DECIMAL(5,2) DEFAULT 1.0,
     occupancy_rate DECIMAL(5,2) DEFAULT 0.0,
     local_events_factor DECIMAL(5,2) DEFAULT 1.0,
     competition_factor DECIMAL(5,2) DEFAULT 1.0,
     weather_factor DECIMAL(5,2) DEFAULT 1.0,
     day_of_week_factor DECIMAL(5,2) DEFAULT 1.0,
     calculated_price DECIMAL(10,2),
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(property_id, date)
   );
   ```

3. **`price_history`:**
   ```sql
   CREATE TABLE price_history (
     id SERIAL PRIMARY KEY,
     property_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
     date DATE NOT NULL,
     base_price DECIMAL(10,2) NOT NULL,
     smart_price DECIMAL(10,2) NOT NULL,
     final_price DECIMAL(10,2) NOT NULL,
     factors JSONB NOT NULL,
     booking_count INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW()
   );
   CREATE INDEX idx_price_history_property_date ON price_history(property_id, date DESC);
   ```

4. **`competitor_properties`:**
   ```sql
   CREATE TABLE competitor_properties (
     id SERIAL PRIMARY KEY,
     property_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
     competitor_name VARCHAR(50) NOT NULL,
     competitor_property_id VARCHAR(255) NOT NULL,
     price DECIMAL(10,2),
     availability BOOLEAN,
     scraped_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(property_id, competitor_name, competitor_property_id)
   );
   ```

5. **`demand_forecast`:**
   ```sql
   CREATE TABLE demand_forecast (
     id SERIAL PRIMARY KEY,
     property_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
     date DATE NOT NULL,
     forecasted_demand DECIMAL(5,2) NOT NULL,
     confidence_level DECIMAL(5,2) NOT NULL,
     factors JSONB NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(property_id, date)
   );
   ```

**Validação:**
- [ ] Todas as tabelas criadas
- [ ] Índices criados
- [ ] Foreign keys configuradas

---

#### DIA 2-5: Machine Learning Models

##### TAREFA 2.2: Implementar Modelo de Precificação
**Arquivo:** `backend/src/pricing/ml-models/pricing-model.ts`

**Algoritmo:**

1. **Preço Base:**
   - Buscar preço base da propriedade
   - Aplicar ajuste sazonal

2. **Fatores Ponderados:**
   - Sazonalidade: 30%
   - Demanda/Ocupação: 25%
   - Eventos locais: 15%
   - Concorrência: 15%
   - Clima: 10%
   - Dia da semana: 5%

3. **Cálculo:**
   ```typescript
   finalPrice = basePrice * (
     seasonalityFactor * 0.30 +
     demandFactor * 0.25 +
     eventsFactor * 0.15 +
     competitionFactor * 0.15 +
     weatherFactor * 0.10 +
     dayOfWeekFactor * 0.05
   )
   ```

4. **Aplicar Limites:**
   - Min price (configurado)
   - Max price (configurado)

5. **Ajustar por Agressividade:**
   - Conservative: -5%
   - Medium: 0%
   - Aggressive: +5%

**Validação:**
- [ ] Modelo implementado
- [ ] Cálculo correto
- [ ] Limites aplicados
- [ ] Testes de modelo passando

---

##### TAREFA 2.3: Integração com APIs Externas

**Arquivos:**
- `backend/src/pricing/services/weather.service.ts`
- `backend/src/pricing/services/calendar.service.ts`
- `backend/src/pricing/services/eventbrite.service.ts`
- `backend/src/pricing/services/competitor-scraper.service.ts`

**APIs a Integrar:**

1. **OpenWeather API:**
   - Buscar clima por localização
   - Temperatura, chuva, eventos climáticos
   - Cache: 6 horas

2. **Google Calendar API:**
   - Buscar eventos próximos
   - Eventos grandes = aumento de preço
   - Cache: 1 hora

3. **Eventbrite API:**
   - Buscar eventos locais
   - Quantidade de eventos = fator
   - Cache: 1 hora

4. **Scraping Competidores:**
   - Airbnb (preços médios)
   - Booking.com (preços médios)
   - Comparar com propriedade
   - Cache: 12 horas

**Validação:**
- [ ] Todas as APIs funcionando
- [ ] Cache implementado
- [ ] Error handling robusto
- [ ] Testes de integração passando

---

### 📅 SEMANA 5-6: Pricing Service

#### DIA 6-10: Smart Pricing Service

##### TAREFA 2.4: Implementar Smart Pricing Service
**Arquivo:** `backend/src/pricing/services/smart-pricing.service.ts`

**Métodos a Implementar:**

1. **`calculatePrice(propertyId, date)`**
   - Buscar configuração
   - Buscar fatores do dia
   - Se não existir, calcular:
     - Buscar clima
     - Buscar eventos
     - Buscar concorrência
     - Calcular demanda
   - Aplicar modelo ML
   - Salvar em price_history
   - Retornar preço calculado

2. **`updatePrice(propertyId, date, newPrice)`**
   - Atualizar preço na propriedade
   - Registrar em price_history
   - Invalidar cache
   - Retornar preço atualizado

3. **`getPriceHistory(propertyId, startDate, endDate)`**
   - Buscar histórico
   - Retornar lista ordenada

4. **`getCompetitorPrices(propertyId, date)`**
   - Buscar preços concorrentes
   - Calcular média
   - Retornar comparação

5. **`getDemandForecast(propertyId, startDate, endDate)`**
   - Calcular previsão de demanda
   - Usar histórico de reservas
   - Aplicar modelo de previsão
   - Retornar previsão

6. **`applyPricingRules(propertyId, date)`**
   - Buscar regras configuradas
   - Aplicar regras
   - Retornar preço ajustado

**Requisitos:**
- ✅ Cache Redis (TTL: 1 hora)
- ✅ Performance (< 500ms)
- ✅ Error handling
- ✅ Logs de cálculo

**Validação:**
- [ ] Cálculo correto
- [ ] Performance adequada
- [ ] Cache funcionando
- [ ] Testes unitários passando

---

### 📅 SEMANA 7: Frontend Dashboard

#### DIA 11-15: Smart Pricing Dashboard

##### TAREFA 2.5: Criar Dashboard de Pricing
**Arquivo:** `frontend/src/features/pricing/pages/SmartPricingDashboard.tsx`

**Funcionalidades:**

1. **Visualização de Preços:**
   - Calendário com preços calculados
   - Comparação com preços manuais
   - Gráfico de histórico
   - Indicadores de fatores

2. **Configuração:**
   - Habilitar/desabilitar smart pricing
   - Configurar min/max price
   - Ajustar agressividade
   - Configurar fatores

3. **Análise:**
   - Comparação de receita
   - Gráfico de ocupação
   - Análise de concorrência
   - Previsão de demanda

4. **Ações:**
   - Aplicar preços calculados
   - Reverter para preços manuais
   - Exportar relatório
   - Simular cenários

**Componentes:**
- `PricingCalendar.tsx`
- `PricingChart.tsx`
- `PricingConfig.tsx`
- `CompetitorComparison.tsx`
- `DemandForecast.tsx`

**Validação:**
- [ ] Dashboard renderizando
- [ ] Gráficos funcionando
- [ ] Interações funcionando
- [ ] Testes E2E passando

---

## 🚀 FASE 3: PROGRAMA TOP HOST (Semanas 8-9)

**Prioridade:** 🟡 ALTA  
**Impacto:** Aumenta conversão em 15-20%  
**Estimativa:** 2 semanas

---

### 📅 SEMANA 8: Database e Rating Service

#### DIA 1: Database Schema

##### TAREFA 3.1: Criar Migration SQL
**Arquivo:** `backend/migrations/008_add_quality_program.sql`

**Tabelas a Criar:**

1. **`host_ratings`:**
   ```sql
   CREATE TABLE host_ratings (
     id SERIAL PRIMARY KEY,
     host_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
     overall_rating DECIMAL(3,2) NOT NULL,
     response_time_score DECIMAL(3,2) NOT NULL,
     acceptance_score DECIMAL(3,2) NOT NULL,
     cancellation_score DECIMAL(3,2) NOT NULL,
     cleanliness_score DECIMAL(3,2) NOT NULL,
     level VARCHAR(20) DEFAULT 'standard',
     total_bookings INTEGER DEFAULT 0,
     total_reviews INTEGER DEFAULT 0,
     calculated_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(host_id)
   );
   ```

2. **`badges`:**
   ```sql
   CREATE TABLE badges (
     id SERIAL PRIMARY KEY,
     type VARCHAR(50) NOT NULL,
     name VARCHAR(255) NOT NULL,
     icon VARCHAR(255) NOT NULL,
     criteria TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **`host_badges`:**
   ```sql
   CREATE TABLE host_badges (
     id SERIAL PRIMARY KEY,
     host_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
     badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
     awarded_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(host_id, badge_id)
   );
   ```

4. **`host_incentives`:**
   ```sql
   CREATE TABLE host_incentives (
     id SERIAL PRIMARY KEY,
     host_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
     type VARCHAR(50) NOT NULL,
     value DECIMAL(10,2),
     description TEXT,
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

**Validação:**
- [ ] Todas as tabelas criadas
- [ ] Índices criados

---

#### DIA 2-5: Rating Service

##### TAREFA 3.2: Implementar Host Rating Service
**Arquivo:** `backend/src/quality/services/host-rating.service.ts`

**Métodos a Implementar:**

1. **`calculateRating(hostId)`**
   - Buscar métricas do host:
     - Tempo médio de resposta
     - Taxa de aceitação
     - Taxa de cancelamento
     - Média de reviews
     - Total de reservas
   - Calcular scores:
     - Response time score (0-10)
     - Acceptance score (0-10)
     - Cancellation score (0-10)
     - Cleanliness score (0-10)
   - Calcular overall rating
   - Determinar level (standard/silver/gold/superhost)
   - Salvar em host_ratings
   - Retornar rating

2. **`updateRating(hostId)`**
   - Recalcular rating
   - Atualizar badges
   - Verificar SuperHost status
   - Retornar rating atualizado

3. **`getHostBadges(hostId)`**
   - Buscar badges do host
   - Retornar lista

4. **`awardBadge(hostId, badgeType)`**
   - Verificar critérios
   - Conceder badge
   - Notificar host
   - Retornar badge

5. **`checkSuperHostStatus(hostId)`**
   - Verificar critérios:
     - Overall rating >= 4.8
     - Response time < 1h
     - Acceptance rate >= 90%
     - Cancellation rate < 1%
     - Total bookings >= 50
   - Se atender, conceder badge SuperHost
   - Aplicar incentivos
   - Retornar status

**Critérios de Badges:**

- **SuperHost:**
  - Rating >= 4.8
  - Response time < 1h
  - Acceptance >= 90%
  - Cancellation < 1%
  - Bookings >= 50

- **Fast Responder:**
  - Response time < 1h (média 30 dias)

- **Guest Favorite:**
  - Top 10% em reviews

- **Experienced:**
  - 50+ reservas completas

- **Eco Friendly:**
  - Propriedade sustentável

**Incentivos para SuperHost:**
- Comissão reduzida (-10%)
- Prioridade no suporte
- Boost no ranking
- Early access features

**Validação:**
- [ ] Cálculo correto
- [ ] Badges concedidos automaticamente
- [ ] Incentivos aplicados
- [ ] Testes unitários passando

---

### 📅 SEMANA 9: Frontend Components

#### DIA 6-10: Frontend Components

##### TAREFA 3.3: Criar Componentes de Quality
**Arquivos:**
- `frontend/src/features/quality/components/HostBadges.tsx`
- `frontend/src/features/quality/components/BadgeCard.tsx`
- `frontend/src/features/quality/components/QualityDashboard.tsx`
- `frontend/src/features/quality/components/RatingDisplay.tsx`
- `frontend/src/features/quality/components/IncentivesPanel.tsx`

**Funcionalidades:**

**HostBadges:**
- Lista de badges do host
- Badge destacado (SuperHost)
- Tooltip com critérios
- Progresso para próximo badge

**BadgeCard:**
- Ícone do badge
- Nome do badge
- Data de conquista
- Descrição

**QualityDashboard:**
- Rating geral
- Breakdown de scores
- Lista de badges
- Incentivos ativos
- Métricas detalhadas
- Gráficos de evolução

**RatingDisplay:**
- Rating visual (estrelas)
- Número do rating
- Breakdown por categoria
- Comparação com média

**IncentivesPanel:**
- Lista de incentivos
- Valor dos incentivos
- Status (ativo/inativo)
- Descrição

**Validação:**
- [ ] Componentes renderizando
- [ ] Badges exibindo corretamente
- [ ] Interações funcionando
- [ ] Testes de componente passando

---

## 🚀 FASE 4: INTEGRAÇÕES CRÍTICAS (Semanas 10-11)

### 📅 SEMANA 10: Google Calendar e Smart Locks

#### DIA 1-3: Google Calendar Sync

##### TAREFA 4.1: Implementar Google Calendar Integration
**Arquivos:**
- `backend/src/integrations/google-calendar/google-calendar.service.ts`
- `backend/src/integrations/google-calendar/google-calendar.controller.ts`
- `backend/src/integrations/google-calendar/google-calendar.types.ts`

**Funcionalidades:**

1. **OAuth2 Setup:**
   - Configurar credenciais Google
   - Fluxo de autorização
   - Armazenar tokens
   - Refresh tokens

2. **Sincronização:**
   - Criar evento ao criar reserva
   - Atualizar evento ao atualizar reserva
   - Deletar evento ao cancelar reserva
   - Sincronização bidirecional (opcional)

3. **Event Details:**
   - Título: "Reserva - [Nome da Propriedade]"
   - Descrição: Detalhes da reserva
   - Data/hora: Check-in e check-out
   - Localização: Endereço da propriedade
   - Convidados: Email do hóspede

**Validação:**
- [ ] OAuth2 funcionando
- [ ] Sincronização automática
- [ ] Eventos criados corretamente
- [ ] Testes de integração passando

---

#### DIA 4-6: Smart Locks Integration

##### TAREFA 4.2: Implementar Smart Locks Integration
**Arquivos:**
- `backend/src/integrations/smart-locks/smart-locks.service.ts`
- `backend/src/integrations/smart-locks/smart-locks.controller.ts`
- `backend/src/integrations/smart-locks/providers/august.service.ts`
- `backend/src/integrations/smart-locks/providers/schlage.service.ts`

**Funcionalidades:**

1. **Gerar Códigos:**
   - Código único por reserva
   - Configurar data/hora de ativação
   - Configurar data/hora de expiração
   - Enviar código para hóspede

2. **Gerenciar Códigos:**
   - Listar códigos ativos
   - Revogar código
   - Estender código
   - Histórico de códigos

3. **Integrações:**
   - August Smart Lock
   - Schlage Encode
   - Yale Assure
   - Outras (extensível)

**Validação:**
- [ ] Códigos gerados
- [ ] Envio automático
- [ ] Revogação funcionando
- [ ] Testes de integração passando

---

### 📅 SEMANA 11: Reserve Now Pay Later

#### DIA 7-9: Klarna Integration

##### TAREFA 4.3: Implementar Klarna Integration
**Arquivos:**
- `backend/src/integrations/klarna/klarna.service.ts`
- `backend/src/integrations/klarna/klarna.controller.ts`
- `backend/src/integrations/klarna/klarna.types.ts`

**Funcionalidades:**

1. **Criar Sessão:**
   - Inicializar sessão Klarna
   - Configurar parcelas
   - Retornar session ID

2. **Processar Pagamento:**
   - Criar ordem
   - Processar pagamento
   - Confirmar reserva
   - Enviar confirmação

3. **Webhooks:**
   - Confirmação de pagamento
   - Cancelamento
   - Reembolso
   - Atualização de status

4. **Gerenciar Parcelas:**
   - Listar parcelas
   - Cancelar parcelas
   - Reembolsar parcelas

**Validação:**
- [ ] Integração funcionando
- [ ] Pagamentos processados
- [ ] Webhooks funcionando
- [ ] Testes de integração passando

---

## 🚀 FASE 5: TESTES E DEPLOY (Semana 12)

### 📅 SEMANA 12: Testes e Deploy

#### DIA 1-3: Testes Completos

##### TAREFA 5.1: Aumentar Cobertura de Testes
**Meta:** 80% de cobertura

**Ações:**

1. **Testes Unitários Faltantes:**
   - Services não testados
   - Utils não testados
   - Helpers não testados

2. **Testes de Integração Faltantes:**
   - Fluxos completos
   - Integrações externas
   - Webhooks

3. **Testes E2E Críticos:**
   - Fluxo de reserva em grupo
   - Fluxo de precificação
   - Fluxo de qualidade

4. **Testes de Carga:**
   - Endpoints principais
   - Queries complexas
   - Cache performance

5. **Testes de Segurança:**
   - Autenticação
   - Autorização
   - Input validation
   - SQL injection
   - XSS

**Validação:**
- [ ] Cobertura >= 80%
- [ ] Todos os testes passando
- [ ] CI/CD configurado

---

#### DIA 4-5: Deploy e Monitoramento

##### TAREFA 5.2: Configurar Deploy
**Arquivos:**
- `docker-compose.prod.yml`
- `k8s/deployment.yaml`
- `k8s/service.yaml`
- `.github/workflows/deploy.yml`

**Configurações:**

1. **Docker:**
   - Dockerfile otimizado
   - Multi-stage build
   - Health checks
   - Environment variables

2. **Kubernetes:**
   - Deployment config
   - Service config
   - Ingress config
   - ConfigMaps
   - Secrets

3. **CI/CD:**
   - GitHub Actions
   - Build automático
   - Testes automáticos
   - Deploy automático
   - Rollback automático

4. **Monitoramento:**
   - Prometheus metrics
   - Grafana dashboards
   - Alertas configurados
   - Logs centralizados

**Validação:**
- [ ] Deploy automatizado
- [ ] Rollback funcionando
- [ ] Monitoramento ativo
- [ ] Alertas funcionando

---

## 📊 CHECKLIST FINAL DE VALIDAÇÃO

### Backend
- [ ] Todas as features implementadas (100%)
- [ ] Todos os endpoints funcionando
- [ ] Cache Redis funcionando
- [ ] Validação completa
- [ ] Error handling robusto
- [ ] Testes >= 80% cobertura
- [ ] Documentação API completa

### Frontend
- [ ] Todos os componentes implementados (100%)
- [ ] Todas as páginas funcionando
- [ ] Hooks funcionando
- [ ] Validação de formulários
- [ ] Error handling
- [ ] Testes >= 70% cobertura
- [ ] UI responsiva

### Integrações
- [ ] Google Calendar funcionando
- [ ] Smart Locks funcionando
- [ ] Klarna funcionando
- [ ] APIs externas funcionando
- [ ] Webhooks funcionando

### DevOps
- [ ] Docker configurado
- [ ] Kubernetes configurado
- [ ] CI/CD funcionando
- [ ] Monitoramento ativo
- [ ] Backup automático
- [ ] Disaster recovery plan

---

## 🎯 MÉTRICAS DE SUCESSO

### Mês 1
- ✅ Viagens em Grupo funcionando
- ✅ 10-20 clientes beta testando
- ✅ Smart Pricing básico funcionando
- ✅ Receita aumentando

### Mês 2
- ✅ Programa Top Host implementado
- ✅ 50-100 propriedades ativas
- ✅ Seguros integrados
- ✅ Conversão aumentando

### Mês 3
- ✅ Sistema 100% operacional
- ✅ Cobertura de testes >= 80%
- ✅ Deploy automatizado
- ✅ Pronto para escalar 1000+ propriedades
- ✅ ROI positivo

---

## 💰 INVESTIMENTO E ROI

### Investimento Estimado
- **Opção 1 (Recomendado):** R$ 105.500 em 90 dias
- **Opção 2 (Focado):** R$ 51.000 em 90 dias

### ROI Projetado
- **100 propriedades:** R$ 20k MRR
- **Payback:** 3-5 meses
- **Ano 1:** R$ 240k ARR (lucro R$ 140k)
- **ROI:** 124% em 2 anos

---

## 📝 NOTAS IMPORTANTES

1. **Priorizar Features Críticas:** Viagens em Grupo e Smart Pricing primeiro
2. **Validação Contínua:** Testar com beta testers desde o início
3. **Métricas:** Monitorar conversão, receita e NPS
4. **Documentação:** Manter atualizada
5. **Testes:** Não lançar sem testes automatizados
6. **Performance:** Monitorar e otimizar continuamente
7. **Segurança:** Auditoria de segurança antes do deploy

---

**Versão:** 1.0.0  
**Data:** 02/12/2025  
**Status:** 📋 Lista Completa - Pronta para Execução  
**Total de Tarefas:** 150+ tarefas detalhadas

