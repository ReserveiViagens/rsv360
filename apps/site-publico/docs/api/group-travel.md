# 📚 API de Viagens em Grupo - RSV Gen 2

**Versão:** 1.0.0  
**Data:** 2024-12-10  
**Status:** ✅ Completo

---

## 📋 Visão Geral

A API de Viagens em Grupo permite que usuários criem wishlists compartilhadas, votem em propriedades, dividam pagamentos e se comuniquem via chat em grupo.

### Base URL
```
/api
```

### Autenticação
Todas as requisições requerem autenticação via JWT Bearer Token:

```
Authorization: Bearer <token>
```

O token deve ser obtido através do endpoint de autenticação e armazenado no `localStorage` como `token`, `authToken` ou `access_token`.

---

## 🎯 Wishlists

### GET /api/wishlists

Lista todas as wishlists do usuário autenticado.

**Query Parameters:**
- `userId` (string, opcional): Filtrar por ID do usuário
- `privacy` (string, opcional): Filtrar por privacidade (`private`, `shared`, `public`)
- `search` (string, opcional): Buscar por nome ou descrição
- `createdBy` (string, opcional): Filtrar por criador
- `memberId` (string, opcional): Filtrar wishlists onde usuário é membro

**Response 200:**
```json
{
  "success": true,
  "data": {
    "wishlists": [
      {
        "id": "uuid",
        "name": "Viagem para Paris",
        "description": "Lista de desejos para nossa viagem",
        "createdBy": "user-id",
        "createdAt": "2024-12-10T10:00:00Z",
        "updatedAt": "2024-12-10T10:00:00Z",
        "privacy": "shared",
        "members": [...],
        "items": [...]
      }
    ],
    "total": 10
  }
}
```

**Errors:**
- `401 Unauthorized`: Token inválido ou expirado
- `500 Server Error`: Erro interno do servidor

---

### GET /api/wishlists/:id

Busca uma wishlist específica por ID.

**Path Parameters:**
- `id` (string, required): UUID da wishlist

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Viagem para Paris",
    "description": "Lista de desejos para nossa viagem",
    "createdBy": "user-id",
    "createdAt": "2024-12-10T10:00:00Z",
    "updatedAt": "2024-12-10T10:00:00Z",
    "privacy": "shared",
    "members": [
      {
        "id": "member-id",
        "wishlistId": "uuid",
        "userId": "user-id",
        "email": "user@example.com",
        "role": "owner",
        "joinedAt": "2024-12-10T10:00:00Z",
        "user": {
          "name": "João Silva",
          "avatar": "https://..."
        }
      }
    ],
    "items": [...]
  }
}
```

**Errors:**
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão para acessar esta wishlist
- `404 Not Found`: Wishlist não encontrada

---

### POST /api/wishlists

Cria uma nova wishlist.

**Request Body:**
```json
{
  "name": "Viagem para Paris",
  "description": "Lista de desejos para nossa viagem em grupo",
  "privacy": "shared",
  "memberEmails": ["friend1@example.com", "friend2@example.com"]
}
```

**Campos:**
- `name` (string, required): Nome da wishlist
- `description` (string, opcional): Descrição da wishlist
- `privacy` (string, opcional): Nível de privacidade (`private`, `shared`, `public`). Default: `private`
- `memberEmails` (array, opcional): Lista de emails para convidar como membros

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Viagem para Paris",
    "description": "Lista de desejos para nossa viagem em grupo",
    "createdBy": "user-id",
    "createdAt": "2024-12-10T10:00:00Z",
    "updatedAt": "2024-12-10T10:00:00Z",
    "privacy": "shared"
  }
}
```

**Errors:**
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Não autenticado
- `422 Validation Error`: Erro de validação

---

### PUT /api/wishlists/:id

Atualiza uma wishlist existente.

**Path Parameters:**
- `id` (string, required): UUID da wishlist

**Request Body:**
```json
{
  "name": "Viagem para Paris - Atualizada",
  "description": "Nova descrição",
  "privacy": "public"
}
```

**Campos (todos opcionais):**
- `name` (string): Novo nome
- `description` (string): Nova descrição
- `privacy` (string): Novo nível de privacidade

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Viagem para Paris - Atualizada",
    ...
  }
}
```

**Errors:**
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão para editar
- `404 Not Found`: Wishlist não encontrada
- `422 Validation Error`: Erro de validação

---

### DELETE /api/wishlists/:id

Deleta uma wishlist.

**Path Parameters:**
- `id` (string, required): UUID da wishlist

**Response 200:**
```json
{
  "success": true,
  "message": "Wishlist deletada com sucesso"
}
```

**Errors:**
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Apenas o owner pode deletar
- `404 Not Found`: Wishlist não encontrada

---

### POST /api/wishlists/:id/items

Adiciona um item (propriedade) à wishlist.

**Path Parameters:**
- `id` (string, required): UUID da wishlist

**Request Body:**
```json
{
  "propertyId": "property-uuid",
  "notes": "Ótima localização perto do centro",
  "priority": "high"
}
```

**Campos:**
- `propertyId` (string, required): UUID da propriedade
- `notes` (string, opcional): Notas sobre o item
- `priority` (string, opcional): Prioridade (`low`, `medium`, `high`). Default: `medium`

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "item-uuid",
    "wishlistId": "uuid",
    "propertyId": "property-uuid",
    "addedBy": "user-id",
    "addedAt": "2024-12-10T10:00:00Z",
    "notes": "Ótima localização perto do centro",
    "priority": "high",
    "votesCount": 0
  }
}
```

**Errors:**
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão para adicionar items
- `404 Not Found`: Wishlist ou propriedade não encontrada
- `422 Validation Error`: Erro de validação

---

### DELETE /api/wishlists/:wishlistId/items/:itemId

Remove um item da wishlist.

**Path Parameters:**
- `wishlistId` (string, required): UUID da wishlist
- `itemId` (string, required): UUID do item

**Response 200:**
```json
{
  "success": true,
  "message": "Item removido com sucesso"
}
```

**Errors:**
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão para remover
- `404 Not Found`: Item não encontrado

---

### POST /api/wishlists/:id/invite

Convida um membro para a wishlist.

**Path Parameters:**
- `id` (string, required): UUID da wishlist

**Request Body:**
```json
{
  "email": "friend@example.com",
  "role": "editor"
}
```

**Campos:**
- `email` (string, required): Email do usuário a convidar
- `role` (string, opcional): Papel do membro (`editor`, `viewer`). Default: `viewer`

**Response 200:**
```json
{
  "success": true,
  "message": "Convite enviado com sucesso"
}
```

**Errors:**
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão para convidar
- `404 Not Found`: Wishlist não encontrada
- `422 Validation Error`: Email inválido ou usuário já é membro

---

### DELETE /api/wishlists/:wishlistId/members/:memberId

Remove um membro da wishlist.

**Path Parameters:**
- `wishlistId` (string, required): UUID da wishlist
- `memberId` (string, required): UUID do membro

**Response 200:**
```json
{
  "success": true,
  "message": "Membro removido com sucesso"
}
```

**Errors:**
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Apenas owner pode remover membros
- `404 Not Found`: Membro não encontrado

---

### GET /api/wishlists/:id/with-property

Busca wishlist com propriedades populadas.

**Path Parameters:**
- `id` (string, required): UUID da wishlist

**Response 200:**
```json
{
  "success": true,
  "data": {
    "wishlist": {...},
    "properties": [
      {
        "id": "property-uuid",
        "name": "Apartamento no Centro",
        "description": "...",
        "price": 150.00,
        "currency": "BRL",
        "images": ["https://..."],
        "location": {
          "address": "Rua Exemplo, 123",
          "city": "São Paulo",
          "state": "SP",
          "country": "Brasil",
          "coordinates": {
            "lat": -23.5505,
            "lng": -46.6333
          }
        },
        "amenities": ["WiFi", "Ar Condicionado"],
        "maxGuests": 4,
        "bedrooms": 2,
        "bathrooms": 1
      }
    ]
  }
}
```

---

## 🗳️ Votes (Votações)

### POST /api/wishlists/items/:itemId/vote

Vota em um item da wishlist.

**Path Parameters:**
- `itemId` (string, required): UUID do item

**Request Body:**
```json
{
  "voteType": "upvote"
}
```

**Campos:**
- `voteType` (string, required): Tipo de voto (`upvote`, `downvote`)

**Comportamento:**
- Se o usuário já votou com o mesmo tipo → remove o voto
- Se o usuário já votou com tipo diferente → atualiza o voto
- Se o usuário não votou → cria novo voto

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "vote-uuid",
    "itemId": "item-uuid",
    "userId": "user-id",
    "voteType": "upvote",
    "createdAt": "2024-12-10T10:00:00Z"
  }
}
```

**Errors:**
- `401 Unauthorized`: Não autenticado
- `404 Not Found`: Item não encontrado
- `422 Validation Error`: voteType inválido
- `429 Too Many Requests`: Limite de votos excedido (30/minuto)

---

### DELETE /api/wishlists/items/:itemId/vote

Remove o voto do usuário em um item.

**Path Parameters:**
- `itemId` (string, required): UUID do item

**Response 200:**
```json
{
  "success": true,
  "message": "Voto removido com sucesso"
}
```

**Errors:**
- `401 Unauthorized`: Não autenticado
- `404 Not Found`: Voto não encontrado

---

### GET /api/wishlists/items/:itemId/votes

Lista todos os votos de um item.

**Path Parameters:**
- `itemId` (string, required): UUID do item

**Query Parameters:**
- `limit` (number, opcional): Limite de resultados (default: 50)
- `offset` (number, opcional): Offset para paginação (default: 0)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "vote-uuid",
      "itemId": "item-uuid",
      "userId": "user-id",
      "voteType": "upvote",
      "createdAt": "2024-12-10T10:00:00Z",
      "user": {
        "name": "João Silva",
        "avatar": "https://..."
      }
    }
  ]
}
```

---

### GET /api/wishlists/items/:itemId/votes/user/:userId

Busca o voto específico de um usuário em um item.

**Path Parameters:**
- `itemId` (string, required): UUID do item
- `userId` (string, required): UUID do usuário

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "vote-uuid",
    "itemId": "item-uuid",
    "userId": "user-id",
    "voteType": "upvote",
    "createdAt": "2024-12-10T10:00:00Z"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": "Voto não encontrado"
}
```

---

### GET /api/wishlists/items/:itemId/votes/stats

Obtém estatísticas de votos de um item.

**Path Parameters:**
- `itemId` (string, required): UUID do item

**Response 200:**
```json
{
  "success": true,
  "data": {
    "upvotes": 15,
    "downvotes": 2,
    "total": 17
  }
}
```

---

## 💰 Split Payments (Divisão de Pagamentos)

### POST /api/bookings/:bookingId/split-payment

Cria uma divisão de pagamento para uma reserva.

**Path Parameters:**
- `bookingId` (string, required): UUID da reserva

**Request Body:**
```json
{
  "splits": [
    {
      "userId": "user-1-uuid",
      "amount": 500.00,
      "percentage": 50
    },
    {
      "userId": "user-2-uuid",
      "amount": 500.00,
      "percentage": 50
    }
  ]
}
```

**Campos:**
- `splits` (array, opcional): Lista de divisões customizadas
  - `userId` (string, required): UUID do usuário
  - `amount` (number, required): Valor a pagar
  - `percentage` (number, opcional): Porcentagem (se não fornecido, calcula automaticamente)

**Comportamento:**
- Se `splits` não for fornecido, divide igualmente entre todos os participantes da reserva
- Valida que a soma dos amounts = totalAmount da reserva (± 0.01 tolerância)

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "split-payment-uuid",
    "bookingId": "booking-uuid",
    "totalAmount": 1000.00,
    "currency": "BRL",
    "status": "pending",
    "splits": [
      {
        "id": "split-uuid-1",
        "splitPaymentId": "split-payment-uuid",
        "userId": "user-1-uuid",
        "amount": 500.00,
        "percentage": 50,
        "status": "pending",
        "paidAt": null,
        "paymentMethod": null,
        "user": {
          "name": "João Silva",
          "email": "joao@example.com"
        }
      }
    ],
    "createdAt": "2024-12-10T10:00:00Z",
    "updatedAt": "2024-12-10T10:00:00Z"
  }
}
```

**Errors:**
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Não autenticado
- `404 Not Found`: Reserva não encontrada
- `422 Validation Error`: Soma dos splits não confere com total

---

### GET /api/bookings/:bookingId/split-payment

Busca a divisão de pagamento de uma reserva.

**Path Parameters:**
- `bookingId` (string, required): UUID da reserva

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "split-payment-uuid",
    "bookingId": "booking-uuid",
    "totalAmount": 1000.00,
    "currency": "BRL",
    "status": "partial",
    "splits": [...],
    "createdAt": "2024-12-10T10:00:00Z",
    "updatedAt": "2024-12-10T10:00:00Z"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": "Divisão de pagamento não encontrada"
}
```

---

### POST /api/split-payments/:splitId/mark-paid

Marca um split individual como pago.

**Path Parameters:**
- `splitId` (string, required): UUID do split

**Request Body:**
```json
{
  "method": "credit_card",
  "transactionId": "txn-123456"
}
```

**Campos:**
- `method` (string, required): Método de pagamento
- `transactionId` (string, opcional): ID da transação no gateway

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "split-uuid",
    "status": "paid",
    "paidAt": "2024-12-10T10:00:00Z",
    "paymentMethod": "credit_card"
  }
}
```

**Comportamento:**
- Atualiza status do split para `paid`
- Se todos os splits estiverem pagos, atualiza status do SplitPayment para `completed`
- Se parcial, atualiza para `partial`

**Errors:**
- `400 Bad Request`: Split já está pago
- `401 Unauthorized`: Não autenticado
- `404 Not Found`: Split não encontrado

---

### GET /api/split-payments/user/:userId

Lista todos os splits de um usuário.

**Path Parameters:**
- `userId` (string, required): UUID do usuário

**Query Parameters:**
- `status` (string, opcional): Filtrar por status (`pending`, `paid`, `failed`)
- `limit` (number, opcional): Limite de resultados
- `offset` (number, opcional): Offset para paginação

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "split-uuid",
      "splitPaymentId": "split-payment-uuid",
      "userId": "user-id",
      "amount": 500.00,
      "percentage": 50,
      "status": "pending",
      "paidAt": null,
      "paymentMethod": null
    }
  ]
}
```

---

### GET /api/bookings/:bookingId/split-payment/status

Obtém o status de pagamento de uma divisão.

**Path Parameters:**
- `bookingId` (string, required): UUID da reserva

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total": 1000.00,
    "paid": 500.00,
    "pending": 500.00,
    "percentage": 50
  }
}
```

---

### POST /api/split-payments/:splitId/reminder

Envia um lembrete de pagamento para um split.

**Path Parameters:**
- `splitId` (string, required): UUID do split

**Response 200:**
```json
{
  "success": true,
  "message": "Lembrete enviado com sucesso"
}
```

**Rate Limit:**
- Máximo 1 lembrete por dia por split

**Errors:**
- `401 Unauthorized`: Não autenticado
- `404 Not Found`: Split não encontrado
- `429 Too Many Requests`: Rate limit excedido (1/dia)

---

## 💬 Group Chat (Chat em Grupo)

### GET /api/chats/:chatId

Busca dados de um chat.

**Path Parameters:**
- `chatId` (string, required): UUID do chat

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "chat-uuid",
    "wishlistId": "wishlist-uuid",
    "bookingId": null,
    "name": "Chat da Viagem",
    "type": "wishlist",
    "members": [...],
    "createdAt": "2024-12-10T10:00:00Z",
    "updatedAt": "2024-12-10T10:00:00Z"
  }
}
```

---

### GET /api/chats/:chatId/messages

Lista mensagens do chat (paginação cursor-based).

**Path Parameters:**
- `chatId` (string, required): UUID do chat

**Query Parameters:**
- `cursor` (string, opcional): Cursor para paginação (obtido na resposta anterior)
- `limit` (number, opcional): Mensagens por página (default: 50)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-uuid",
        "chatId": "chat-uuid",
        "userId": "user-id",
        "content": "Olá pessoal!",
        "messageType": "text",
        "attachments": [],
        "replyTo": null,
        "createdAt": "2024-12-10T10:00:00Z",
        "updatedAt": "2024-12-10T10:00:00Z",
        "user": {
          "name": "João Silva",
          "avatar": "https://..."
        }
      }
    ],
    "nextCursor": "cursor-string",
    "hasMore": true
  }
}
```

---

### POST /api/chats/:chatId/messages

Envia uma mensagem no chat.

**Path Parameters:**
- `chatId` (string, required): UUID do chat

**Request Body:**
```json
{
  "content": "Olá pessoal!",
  "messageType": "text",
  "attachments": [
    {
      "fileUrl": "https://...",
      "fileName": "image.jpg",
      "fileSize": 1024000,
      "mimeType": "image/jpeg"
    }
  ],
  "replyTo": "message-uuid"
}
```

**Campos:**
- `content` (string, required): Conteúdo da mensagem
- `messageType` (string, opcional): Tipo (`text`, `image`, `file`, `system`). Default: `text`
- `attachments` (array, opcional): Anexos
- `replyTo` (string, opcional): ID da mensagem respondida

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "message-uuid",
    "chatId": "chat-uuid",
    "userId": "user-id",
    "content": "Olá pessoal!",
    "messageType": "text",
    "createdAt": "2024-12-10T10:00:00Z",
    "updatedAt": "2024-12-10T10:00:00Z"
  }
}
```

**WebSocket Event:**
Após criar a mensagem, um evento `new_message` é emitido via WebSocket para todos os membros do chat.

---

### DELETE /api/chats/messages/:messageId

Deleta uma mensagem.

**Path Parameters:**
- `messageId` (string, required): UUID da mensagem

**Response 200:**
```json
{
  "success": true,
  "message": "Mensagem deletada com sucesso"
}
```

**Errors:**
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Apenas o autor pode deletar
- `404 Not Found`: Mensagem não encontrada

**WebSocket Event:**
Após deletar, um evento `message_deleted` é emitido via WebSocket.

---

### PUT /api/chats/messages/:messageId

Atualiza o conteúdo de uma mensagem.

**Path Parameters:**
- `messageId` (string, required): UUID da mensagem

**Request Body:**
```json
{
  "content": "Mensagem editada"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "message-uuid",
    "content": "Mensagem editada",
    "updatedAt": "2024-12-10T10:05:00Z"
  }
}
```

**Errors:**
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Apenas o autor pode editar
- `404 Not Found`: Mensagem não encontrada

**WebSocket Event:**
Após atualizar, um evento `message_updated` é emitido via WebSocket.

---

### GET /api/chats/:chatId/members

Lista membros do chat.

**Path Parameters:**
- `chatId` (string, required): UUID do chat

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "member-uuid",
      "chatId": "chat-uuid",
      "userId": "user-id",
      "role": "admin",
      "joinedAt": "2024-12-10T10:00:00Z",
      "lastReadAt": "2024-12-10T10:00:00Z",
      "user": {
        "name": "João Silva",
        "avatar": "https://..."
      }
    }
  ]
}
```

---

### POST /api/chats/:chatId/read

Marca todas as mensagens do chat como lidas.

**Path Parameters:**
- `chatId` (string, required): UUID do chat

**Response 200:**
```json
{
  "success": true,
  "message": "Mensagens marcadas como lidas"
}
```

---

## 🔌 WebSocket Events

O sistema utiliza WebSocket para comunicação em tempo real. Conecte-se em:

```
ws://localhost:3001 (desenvolvimento)
wss://api.example.com (produção)
```

### Eventos do Cliente → Servidor

#### `join_chat`
Entra na sala do chat.

```json
{
  "chatId": "chat-uuid"
}
```

#### `leave_chat`
Sai da sala do chat.

```json
{
  "chatId": "chat-uuid"
}
```

#### `typing`
Indica que o usuário está digitando.

```json
{
  "chatId": "chat-uuid",
  "userId": "user-id"
}
```

### Eventos do Servidor → Cliente

#### `new_message`
Nova mensagem foi criada.

```json
{
  "message": {
    "id": "message-uuid",
    "chatId": "chat-uuid",
    "userId": "user-id",
    "content": "Olá!",
    "createdAt": "2024-12-10T10:00:00Z"
  }
}
```

#### `message_deleted`
Mensagem foi deletada.

```json
{
  "messageId": "message-uuid",
  "chatId": "chat-uuid"
}
```

#### `message_updated`
Mensagem foi atualizada.

```json
{
  "message": {
    "id": "message-uuid",
    "content": "Mensagem editada",
    "updatedAt": "2024-12-10T10:05:00Z"
  }
}
```

#### `user_typing`
Usuário está digitando.

```json
{
  "userId": "user-id",
  "chatId": "chat-uuid"
}
```

#### `user_online`
Usuário ficou online.

```json
{
  "userId": "user-id"
}
```

#### `user_offline`
Usuário ficou offline.

```json
{
  "userId": "user-id"
}
```

---

## ⚡ Rate Limits

Os seguintes rate limits são aplicados:

- **Geral:** 100 requisições/minuto por usuário
- **Votos:** 30 votos/minuto por usuário
- **Lembretes:** 1 lembrete/dia por split payment

**Response 429:**
```json
{
  "success": false,
  "error": "Rate limit excedido",
  "retryAfter": 60
}
```

---

## ❌ Códigos de Erro

### 400 Bad Request
Requisição malformada ou dados inválidos.

### 401 Unauthorized
Token de autenticação ausente, inválido ou expirado.

### 403 Forbidden
Usuário autenticado mas sem permissão para a ação.

### 404 Not Found
Recurso não encontrado.

### 422 Validation Error
Erro de validação dos dados enviados.

```json
{
  "success": false,
  "error": "Erro de validação",
  "errors": {
    "name": "Nome é obrigatório",
    "privacy": "Privacidade inválida"
  }
}
```

### 429 Too Many Requests
Rate limit excedido.

### 500 Server Error
Erro interno do servidor.

---

## 📝 Exemplos de Uso

### Criar Wishlist e Adicionar Items

```typescript
import wishlistService from '@/lib/group-travel/api/wishlist.service';

// 1. Criar wishlist
const wishlist = await wishlistService.create({
  name: 'Viagem para Paris',
  description: 'Nossa viagem em grupo',
  privacy: 'shared'
});

// 2. Adicionar item
const item = await wishlistService.addItem(wishlist.id, {
  propertyId: 'property-uuid',
  notes: 'Ótima localização',
  priority: 'high'
});

// 3. Convidar membros
await wishlistService.inviteMember(wishlist.id, 'friend@example.com', 'editor');
```

### Votar em Items

```typescript
import voteService from '@/lib/group-travel/api/vote.service';

// Votar positivamente
await voteService.vote('item-uuid', 'upvote');

// Ver estatísticas
const stats = await voteService.getVotesStats('item-uuid');
console.log(`Upvotes: ${stats.upvotes}, Downvotes: ${stats.downvotes}`);

// Ver voto do usuário
const userVote = await voteService.getUserVote('item-uuid', 'user-id');
if (userVote) {
  console.log(`Usuário votou: ${userVote.voteType}`);
}
```

### Dividir Pagamento

```typescript
import splitPaymentService from '@/lib/group-travel/api/split-payment.service';

// 1. Criar divisão
const splitPayment = await splitPaymentService.createSplit('booking-uuid', {
  splits: [
    { userId: 'user-1', amount: 500, percentage: 50 },
    { userId: 'user-2', amount: 500, percentage: 50 }
  ]
});

// 2. Marcar como pago
await splitPaymentService.markAsPaid('split-uuid', {
  method: 'credit_card',
  transactionId: 'txn-123456'
});

// 3. Ver status
const status = await splitPaymentService.getSplitStatus('booking-uuid');
console.log(`Progresso: ${status.percentage}%`);
```

### Chat em Grupo

```typescript
import chatService from '@/lib/group-travel/api/chat.service';

// 1. Buscar mensagens
const { messages, nextCursor, hasMore } = await chatService.getMessages(
  'chat-uuid',
  undefined,
  50
);

// 2. Enviar mensagem
const message = await chatService.sendMessage('chat-uuid', {
  content: 'Olá pessoal!',
  messageType: 'text'
});

// 3. Marcar como lido
await chatService.markAsRead('chat-uuid');
```

### Usando Hooks React

```typescript
import { useSharedWishlist } from '@/hooks/useSharedWishlist';
import { useVote } from '@/hooks/useVote';
import { useSplitPayment } from '@/hooks/useSplitPayment';
import { useGroupChat } from '@/hooks/useGroupChat';

function MyComponent() {
  // Wishlist
  const { wishlist, createWishlist, addItem } = useSharedWishlist({ 
    wishlistId: 'uuid' 
  });

  // Votos
  const { vote, votesStats } = useVote({ 
    itemId: 'uuid', 
    userId: 'user-id' 
  });

  // Split Payment
  const { splitPayment, markAsPaid, getPaymentProgress } = useSplitPayment({
    bookingId: 'uuid',
    userId: 'user-id'
  });

  // Chat
  const { messages, sendMessage, isConnected } = useGroupChat({
    chatId: 'uuid',
    userId: 'user-id'
  });

  // Usar...
}
```

---

## 📅 Changelog

### v1.0.0 (2024-12-10)
- ✅ Versão inicial
- ✅ API de Wishlists completa
- ✅ API de Votos completa
- ✅ API de Split Payments completa
- ✅ API de Group Chat completa
- ✅ WebSocket integrado
- ✅ Rate limiting implementado
- ✅ Error handling robusto
- ✅ Documentação completa

---

## 🔗 Links Relacionados

- [Documentação de Autenticação](../API_DOCUMENTATION.md#authentication)
- [Guia de Integração](../INTEGRATION_GUIDE_DEVELOPERS.md)
- [Arquitetura do Sistema](../ARCHITECTURE.md)

---

**Última atualização:** 2024-12-10  
**Mantido por:** Equipe RSV Gen 2

