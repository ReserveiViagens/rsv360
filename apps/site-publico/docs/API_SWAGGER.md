# 📚 DOCUMENTAÇÃO SWAGGER - APIs RSV360

**Versão:** 1.0.0  
**Data:** 2025-12-16

---

## 📋 ÍNDICE

1. [APIs de Group Travel](#apis-de-group-travel)
2. [APIs de Pricing](#apis-de-pricing)
3. [APIs de Quality](#apis-de-quality)
4. [APIs de Wishlists](#apis-de-wishlists)
5. [APIs de Trip Invitations](#apis-de-trip-invitations)

---

## 🎯 APIs DE GROUP TRAVEL

### GET /api/wishlists/{id}/items

Lista itens de uma wishlist compartilhada.

**Parâmetros:**
- `id` (path, required): ID da wishlist
- `user_id` (query, optional): ID do usuário
- `email` (query, optional): Email do usuário

**Resposta 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "wishlist_id": 1,
      "item_id": 123,
      "item_type": "property",
      "votes_up": 5,
      "votes_down": 1,
      "votes_maybe": 2
    }
  ],
  "cached": false
}
```

**Erros:**
- `400`: Parâmetros inválidos
- `500`: Erro interno

---

### POST /api/wishlists/{id}/items

Adiciona um item à wishlist.

**Parâmetros:**
- `id` (path, required): ID da wishlist

**Body:**
```json
{
  "item_id": 123,
  "item_type": "property",
  "notes": "Ótima localização",
  "check_in": "2025-12-20",
  "check_out": "2025-12-25",
  "guests": 4,
  "estimated_price": 500.00,
  "user_id": 1,
  "email": "user@example.com"
}
```

**Validações:**
- `item_id`: obrigatório, número positivo
- `item_type`: enum ['property', 'hotel', 'attraction']
- `notes`: máximo 500 caracteres
- `check_in`, `check_out`: formato YYYY-MM-DD, check_out > check_in
- `guests`: número positivo, máximo 20
- `estimated_price`: número não negativo

**Resposta 200:**
```json
{
  "success": true,
  "message": "Item adicionado com sucesso",
  "data": {
    "id": 1,
    "wishlist_id": 1,
    "item_id": 123
  }
}
```

---

### POST /api/wishlists/{id}/items/{itemId}/vote

Vota em um item da wishlist.

**Parâmetros:**
- `id` (path, required): ID da wishlist
- `itemId` (path, required): ID do item

**Body:**
```json
{
  "vote": "up",
  "comment": "Adorei esta propriedade!"
}
```

**Validações:**
- `vote`: enum ['up', 'down', 'maybe']
- `comment`: máximo 500 caracteres

**Resposta 200:**
```json
{
  "success": true,
  "message": "Voto registrado com sucesso",
  "data": {
    "id": 1,
    "item_id": 123,
    "vote": "up",
    "voted_at": "2025-12-16T10:00:00Z"
  }
}
```

---

### GET /api/wishlists/{id}/items/{itemId}/vote

Obtém votos de um item.

**Parâmetros:**
- `id` (path, required): ID da wishlist
- `itemId` (path, required): ID do item
- `user_id` (query, optional): ID do usuário
- `email` (query, optional): Email do usuário

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "item_id": 123,
    "votes_up": 5,
    "votes_down": 1,
    "votes_maybe": 2,
    "total_votes": 8,
    "user_vote": "up",
    "votes": [...]
  },
  "cached": false
}
```

---

## 💰 APIs DE PRICING

### GET /api/pricing/forecast

Gera previsão de preços futuros para uma propriedade.

**Parâmetros:**
- `property_id` (query, required): ID da propriedade
- `start_date` (query, required): Data inicial (YYYY-MM-DD)
- `end_date` (query, required): Data final (YYYY-MM-DD)
- `days_ahead` (query, optional): Dias à frente (padrão: 30)

**Validações:**
- `property_id`: número positivo
- `start_date`, `end_date`: formato YYYY-MM-DD
- `end_date` > `start_date`

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "property_id": 1,
    "start_date": "2025-12-20",
    "end_date": "2025-12-30",
    "current_price": 250.00,
    "forecast": [
      {
        "date": "2025-12-20",
        "predicted_price": 275.00,
        "confidence": 0.85,
        "factors": {
          "demand": 1.15,
          "seasonality": 1.2,
          "events": 1.0,
          "competitor_price": 280.00
        },
        "recommendation": "increase"
      }
    ],
    "summary": {
      "avg_predicted_price": 270.00,
      "min_predicted_price": 240.00,
      "max_predicted_price": 300.00,
      "recommended_action": "increase"
    }
  },
  "cached": false
}
```

**Cache:** 15 minutos

---

## ⭐ APIs DE QUALITY

### GET /api/quality/leaderboard

Ranking de hosts por qualidade.

**Parâmetros:**
- `limit` (query, optional): Limite de resultados (padrão: 50)
- `min_bookings` (query, optional): Mínimo de reservas (padrão: 5)
- `min_score` (query, optional): Score mínimo
- `category` (query, optional): Categoria

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "host_id": 1,
        "host_name": "João Silva",
        "score": 95.5,
        "level": "superhost",
        "stats": {
          "total_bookings": 150,
          "avg_rating": 4.8,
          "total_reviews": 120,
          "total_revenue": 45000.00
        }
      }
    ],
    "total_hosts": 50,
    "min_bookings_required": 5,
    "min_score_required": 0,
    "generated_at": "2025-12-16T10:00:00Z"
  },
  "cached": false
}
```

**Cache:** 10 minutos

---

## 📝 APIs DE WISHLISTS

### GET /api/wishlists

Lista wishlists do usuário.

**Parâmetros:**
- `id` (query, optional): ID da wishlist
- `token` (query, optional): Token de compartilhamento
- `user_id` (query, optional): ID do usuário
- `email` (query, optional): Email do usuário

**Resposta 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Viagem para Caldas Novas",
      "description": "Planejando viagem em família",
      "is_public": false,
      "share_token": "abc123",
      "member_count": 3,
      "item_count": 5
    }
  ]
}
```

---

### POST /api/wishlists

Cria uma nova wishlist.

**Body:**
```json
{
  "name": "Viagem para Caldas Novas",
  "description": "Planejando viagem em família",
  "is_public": false
}
```

**Validações:**
- `name`: obrigatório, 1-255 caracteres
- `description`: máximo 1000 caracteres
- `is_public`: boolean

**Resposta 200:**
```json
{
  "success": true,
  "message": "Wishlist criada com sucesso",
  "data": {
    "id": 1,
    "name": "Viagem para Caldas Novas",
    "share_token": "abc123"
  }
}
```

---

## ✉️ APIs DE TRIP INVITATIONS

### GET /api/trip-invitations

Lista convites de viagem.

**Parâmetros:**
- `user_id` (query, optional): ID do usuário
- `email` (query, optional): Email do usuário
- `type` (query, optional): Tipo ['sent', 'received']
- `status` (query, optional): Status ['pending', 'accepted', 'declined']

**Resposta 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "invited_email": "friend@example.com",
      "invitation_type": "trip",
      "status": "pending",
      "trip_name": "Viagem para Caldas Novas",
      "expires_at": "2025-12-23T10:00:00Z"
    }
  ]
}
```

---

### POST /api/trip-invitations

Cria um novo convite de viagem.

**Body:**
```json
{
  "invited_email": "friend@example.com",
  "invited_name": "Amigo",
  "invitation_type": "trip",
  "trip_name": "Viagem para Caldas Novas",
  "message": "Venha conosco!",
  "expires_in_days": 7,
  "booking_id": 123,
  "wishlist_id": 456
}
```

**Validações:**
- `invited_email`: obrigatório, email válido
- `invitation_type`: enum ['booking', 'wishlist', 'trip', 'split_payment']
- `trip_name`: obrigatório se `invitation_type` = 'trip'
- `expires_in_days`: número positivo

**Resposta 200:**
```json
{
  "success": true,
  "message": "Convite criado com sucesso",
  "data": {
    "id": 1,
    "token": "xyz789",
    "invited_email": "friend@example.com"
  }
}
```

---

## 🔐 AUTENTICAÇÃO

A maioria das APIs requer autenticação via Bearer Token:

```
Authorization: Bearer <token>
```

Algumas APIs são públicas (como leaderboard público).

---

## ⚡ CACHE

Várias APIs implementam cache para melhor performance:

- **Wishlist Items:** 5 minutos
- **Votes:** 5 minutos
- **Pricing Forecast:** 15 minutos
- **Leaderboard:** 10 minutos

Cache pode ser invalidado automaticamente quando dados são modificados.

---

## 📊 CÓDIGOS DE STATUS

- `200`: Sucesso
- `400`: Dados inválidos
- `401`: Não autenticado
- `403`: Sem permissão
- `404`: Não encontrado
- `500`: Erro interno

---

## 🐛 TRATAMENTO DE ERROS

Todas as APIs retornam erros no formato:

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": [
    {
      "path": ["campo"],
      "message": "Mensagem específica"
    }
  ]
}
```

---

**Última atualização:** 2025-12-16

