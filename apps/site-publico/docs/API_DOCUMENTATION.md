# 📚 DOCUMENTAÇÃO DE APIs - RSV 360

**Data:** 2025-12-13  
**Versão:** 2.0.0

---

## 📋 ÍNDICE

1. [Autenticação](#autenticação)
2. [Propriedades](#propriedades)
3. [Reservas](#reservas)
4. [Verificação de Propriedades](#verificação-de-propriedades)
5. [Incentivos e Qualidade](#incentivos-e-qualidade)
6. [Seguros](#seguros)
7. [Viagens em Grupo](#viagens-em-grupo)
8. [Precificação Inteligente](#precificação-inteligente)
9. [Analytics](#analytics)

---

## 🔐 AUTENTICAÇÃO

### POST /api/auth/login

**Descrição:** Autenticar usuário

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "usuario@example.com",
    "role": "host"
  }
}
```

**Erros:**
- `400`: Credenciais inválidas
- `401`: Não autorizado

---

### POST /api/auth/register

**Descrição:** Registrar novo usuário

**Request:**
```json
{
  "name": "João Silva",
  "email": "usuario@example.com",
  "password": "senha123",
  "role": "host"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "usuario@example.com"
  }
}
```

---

## 🏠 PROPRIEDADES

### GET /api/properties

**Descrição:** Listar propriedades

**Query Parameters:**
- `city` (string): Filtrar por cidade
- `state` (string): Filtrar por estado
- `limit` (number): Limite de resultados (padrão: 20)
- `offset` (number): Offset para paginação

**Response (200):**
```json
{
  "success": true,
  "properties": [
    {
      "id": 1,
      "name": "Apartamento Centro",
      "address": "Rua Exemplo, 123",
      "city": "São Paulo",
      "state": "SP",
      "price": 150.00
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

---

### GET /api/properties/:id

**Descrição:** Obter detalhes de uma propriedade

**Response (200):**
```json
{
  "success": true,
  "property": {
    "id": 1,
    "name": "Apartamento Centro",
    "address": "Rua Exemplo, 123",
    "city": "São Paulo",
    "state": "SP",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "amenities": ["wifi", "parking", "pool"],
    "price": 150.00,
    "verification_status": "approved"
  }
}
```

---

## 📅 RESERVAS

### POST /api/bookings

**Descrição:** Criar nova reserva

**Request:**
```json
{
  "propertyId": 1,
  "checkIn": "2025-12-20",
  "checkOut": "2025-12-25",
  "guests": 2,
  "paymentMethod": "credit_card"
}
```

**Response (201):**
```json
{
  "success": true,
  "booking": {
    "id": 123,
    "code": "RSV-2025-123456",
    "propertyId": 1,
    "checkIn": "2025-12-20",
    "checkOut": "2025-12-25",
    "total": 750.00,
    "status": "confirmed"
  }
}
```

---

## ✅ VERIFICAÇÃO DE PROPRIEDADES

### POST /api/verification/submit/:propertyId

**Descrição:** Submeter propriedade para verificação

**Request (multipart/form-data):**
- `photos`: Array de imagens
- `documents`: Array de documentos (PDF, DOC)
- `description`: Descrição da propriedade

**Response (200):**
```json
{
  "success": true,
  "verification": {
    "id": 1,
    "propertyId": 1,
    "status": "pending",
    "submittedAt": "2025-12-13T10:00:00Z"
  }
}
```

---

### GET /api/verification/status/:propertyId

**Descrição:** Verificar status de verificação

**Response (200):**
```json
{
  "success": true,
  "verification": {
    "id": 1,
    "status": "approved",
    "verifiedAt": "2025-12-13T10:00:00Z",
    "verifiedBy": 1
  }
}
```

---

## 🎁 INCENTIVOS E QUALIDADE

### GET /api/quality/incentives/:hostId

**Descrição:** Obter incentivos de um host

**Response (200):**
```json
{
  "success": true,
  "incentives": [
    {
      "id": 1,
      "type": "points",
      "value": 100,
      "title": "Primeira Reserva",
      "description": "Pontos por primeira reserva",
      "earnedAt": "2025-12-13T10:00:00Z",
      "expiresAt": "2026-12-13T10:00:00Z"
    }
  ],
  "totalPoints": 500
}
```

---

### GET /api/quality/leaderboard/public

**Descrição:** Obter leaderboard público de hosts

**Query Parameters:**
- `limit` (number): Limite de resultados (padrão: 10)

**Response (200):**
```json
{
  "success": true,
  "leaderboard": [
    {
      "hostId": 1,
      "hostName": "João Silva",
      "score": 98.5,
      "rank": 1,
      "totalPoints": 5000
    }
  ]
}
```

---

## 🛡️ SEGUROS

### POST /api/insurance/file-claim

**Descrição:** Criar sinistro

**Request:**
```json
{
  "policyId": 1,
  "claimType": "cancellation",
  "claimedAmount": 500.00,
  "incidentDate": "2025-12-10",
  "description": "Cancelamento de reserva"
}
```

**Response (201):**
```json
{
  "success": true,
  "claim": {
    "id": 1,
    "claimNumber": "CLM-2025-1234567890-ABC",
    "status": "pending",
    "claimedAmount": 500.00
  }
}
```

---

### GET /api/insurance/claims

**Descrição:** Listar sinistros do usuário

**Query Parameters:**
- `userId` (number): ID do usuário
- `status` (string): Filtrar por status

**Response (200):**
```json
{
  "success": true,
  "claims": [
    {
      "id": 1,
      "claimNumber": "CLM-2025-1234567890-ABC",
      "status": "approved",
      "claimedAmount": 500.00,
      "approvedAmount": 500.00
    }
  ]
}
```

---

## 👥 VIAGENS EM GRUPO

### GET /api/group-travel/calendar/:groupId

**Descrição:** Obter calendário de viagem em grupo

**Response (200):**
```json
{
  "success": true,
  "calendar": {
    "groupId": 1,
    "events": [
      {
        "id": 1,
        "title": "Check-in",
        "date": "2025-12-20",
        "time": "14:00",
        "location": "Hotel Exemplo"
      }
    ]
  }
}
```

---

### POST /api/group-travel/calendar/:groupId/events

**Descrição:** Criar evento no calendário

**Request:**
```json
{
  "title": "Jantar de Grupo",
  "date": "2025-12-21",
  "time": "19:00",
  "location": "Restaurante Exemplo"
}
```

**Response (201):**
```json
{
  "success": true,
  "event": {
    "id": 1,
    "title": "Jantar de Grupo",
    "date": "2025-12-21",
    "time": "19:00"
  }
}
```

---

## 💰 PRECIFICAÇÃO INTELIGENTE

### GET /api/pricing/smart/:propertyId

**Descrição:** Obter preço inteligente para propriedade

**Query Parameters:**
- `date` (string): Data (formato: YYYY-MM-DD)
- `guests` (number): Número de hóspedes

**Response (200):**
```json
{
  "success": true,
  "pricing": {
    "basePrice": 150.00,
    "smartPrice": 180.00,
    "multiplier": 1.2,
    "factors": {
      "demand": 1.1,
      "events": 1.05,
      "competition": 1.05
    }
  }
}
```

---

### GET /api/pricing/analytics/:propertyId

**Descrição:** Obter analytics de precificação

**Response (200):**
```json
{
  "success": true,
  "analytics": {
    "revenue": 50000.00,
    "occupancy": 85.5,
    "averagePrice": 175.00,
    "trend": "up"
  }
}
```

---

## 📊 ANALYTICS

### GET /api/analytics/dashboard

**Descrição:** Obter dashboard de analytics

**Response (200):**
```json
{
  "success": true,
  "dashboard": {
    "revenue": {
      "total": 100000.00,
      "growth": 15.5
    },
    "bookings": {
      "total": 500,
      "growth": 10.2
    },
    "occupancy": {
      "rate": 85.5,
      "trend": "up"
    }
  }
}
```

---

## 🔒 AUTENTICAÇÃO E AUTORIZAÇÃO

Todas as APIs (exceto as públicas) requerem autenticação via JWT:

**Header:**
```
Authorization: Bearer {token}
```

**Erros de Autenticação:**
- `401`: Token inválido ou expirado
- `403`: Sem permissão para acessar o recurso

---

## 📝 NOTAS

1. **Paginação:** Use `limit` e `offset` para paginar resultados
2. **Filtros:** Muitas APIs suportam filtros via query parameters
3. **Rate Limiting:** Limite de 100 requisições por 15 minutos
4. **Versão:** API atual é v2.0.0

---

**Última Atualização:** 2025-12-13
