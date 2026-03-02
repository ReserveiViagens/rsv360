# 👨‍💻 Guia para Desenvolvedores - RSV Gen 2

**Versão:** 2.0.0  
**Data:** 22/11/2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Quick Start](#quick-start)
3. [Autenticação](#autenticação)
4. [Endpoints Principais](#endpoints-principais)
5. [SDKs e Bibliotecas](#sdks-e-bibliotecas)
6. [Webhooks](#webhooks)
7. [Rate Limiting](#rate-limiting)
8. [Exemplos de Código](#exemplos-de-código)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

A API RSV Gen 2 é uma API RESTful completa para integração com sistemas de reservas de hospedagem.

### Características

- **RESTful:** Segue princípios REST
- **JSON:** Todas as requisições e respostas em JSON
- **JWT:** Autenticação baseada em tokens
- **Rate Limiting:** Proteção contra abuso
- **Webhooks:** Notificações em tempo real
- **Documentação:** Swagger/OpenAPI completo

### Base URLs

- **Produção:** `https://api.rsv.com`
- **Staging:** `https://api-staging.rsv.com`
- **Desenvolvimento:** `http://localhost:3000`

---

## 🚀 Quick Start

### 1. Obter Credenciais

1. Acesse o dashboard de desenvolvedores
2. Crie uma conta de desenvolvedor
3. Gere uma API Key
4. Guarde suas credenciais com segurança

### 2. Autenticação

```bash
curl -X POST https://api.rsv.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@example.com",
    "password": "sua-senha"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

### 3. Fazer Primeira Requisição

```bash
curl -X GET https://api.rsv.com/api/properties \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🔑 Autenticação

### Fluxo de Autenticação

1. **Login:** Obter token JWT
2. **Usar Token:** Incluir no header `Authorization`
3. **Renovar:** Usar refresh token quando expirar

### Headers Obrigatórios

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Refresh Token

Quando o access token expirar:

```bash
curl -X POST https://api.rsv.com/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "seu-refresh-token"
  }'
```

### Códigos de Erro

| Código | Status | Descrição |
|--------|--------|-----------|
| `AUTH_TOKEN_MISSING` | 401 | Token não fornecido |
| `AUTH_TOKEN_INVALID` | 401 | Token inválido |
| `AUTH_TOKEN_EXPIRED` | 401 | Token expirado |
| `AUTH_USER_INACTIVE` | 403 | Usuário inativo |

---

## 📡 Endpoints Principais

### Propriedades

#### Listar Propriedades

```bash
GET /api/properties
```

**Query Parameters:**
- `location` (string): Filtrar por localização
- `check_in` (date): Data de check-in
- `check_out` (date): Data de check-out
- `guests` (integer): Número de hóspedes
- `min_price` (number): Preço mínimo
- `max_price` (number): Preço máximo
- `amenities` (array): Lista de comodidades
- `limit` (integer): Número de resultados (padrão: 50)
- `offset` (integer): Offset para paginação

**Exemplo:**
```bash
curl -X GET "https://api.rsv.com/api/properties?location=São%20Paulo&guests=2&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### Obter Propriedade

```bash
GET /api/properties/:id
```

**Exemplo:**
```bash
curl -X GET https://api.rsv.com/api/properties/123 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Reservas

#### Criar Reserva

```bash
POST /api/bookings
```

**Request:**
```json
{
  "property_id": 123,
  "check_in": "2025-12-01",
  "check_out": "2025-12-05",
  "guests": 2
}
```

**Exemplo:**
```bash
curl -X POST https://api.rsv.com/api/bookings \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 123,
    "check_in": "2025-12-01",
    "check_out": "2025-12-05",
    "guests": 2
  }'
```

#### Listar Reservas

```bash
GET /api/bookings
```

**Query Parameters:**
- `status` (string): Filtrar por status
- `limit` (integer): Número de resultados
- `offset` (integer): Offset

### Smart Pricing

#### Calcular Preço Inteligente

```bash
POST /api/pricing/smart
```

**Request:**
```json
{
  "property_id": 123,
  "base_price": 100.00,
  "check_in": "2025-12-01T00:00:00Z",
  "check_out": "2025-12-05T00:00:00Z",
  "location": "São Paulo, SP"
}
```

---

## 📚 SDKs e Bibliotecas

### JavaScript/TypeScript

```bash
npm install @rsv/api-client
```

**Uso:**
```typescript
import { RSVClient } from '@rsv/api-client';

const client = new RSVClient({
  apiKey: 'sua-api-key',
  baseURL: 'https://api.rsv.com'
});

// Listar propriedades
const properties = await client.properties.list({
  location: 'São Paulo',
  guests: 2
});

// Criar reserva
const booking = await client.bookings.create({
  property_id: 123,
  check_in: '2025-12-01',
  check_out: '2025-12-05',
  guests: 2
});
```

### Python

```bash
pip install rsv-api-client
```

**Uso:**
```python
from rsv import RSVClient

client = RSVClient(api_key='sua-api-key')

# Listar propriedades
properties = client.properties.list(
    location='São Paulo',
    guests=2
)

# Criar reserva
booking = client.bookings.create(
    property_id=123,
    check_in='2025-12-01',
    check_out='2025-12-05',
    guests=2
)
```

### PHP

```bash
composer require rsv/api-client
```

**Uso:**
```php
use RSV\Client;

$client = new Client([
    'api_key' => 'sua-api-key'
]);

// Listar propriedades
$properties = $client->properties->list([
    'location' => 'São Paulo',
    'guests' => 2
]);

// Criar reserva
$booking = $client->bookings->create([
    'property_id' => 123,
    'check_in' => '2025-12-01',
    'check_out' => '2025-12-05',
    'guests' => 2
]);
```

---

## 🔔 Webhooks

### Configurar Webhook

```bash
POST /api/webhooks
```

**Request:**
```json
{
  "url": "https://seu-servidor.com/webhook",
  "events": ["booking.created", "booking.confirmed"],
  "secret": "seu-secret-key"
}
```

### Eventos Disponíveis

- `booking.created` - Nova reserva criada
- `booking.confirmed` - Reserva confirmada
- `booking.cancelled` - Reserva cancelada
- `payment.completed` - Pagamento concluído
- `payment.failed` - Pagamento falhou
- `verification.approved` - Verificação aprovada
- `verification.rejected` - Verificação rejeitada

### Payload

```json
{
  "event": "booking.created",
  "timestamp": "2025-11-22T10:00:00Z",
  "data": {
    "booking_id": 123,
    "property_id": 456,
    "user_id": 789
  }
}
```

### Verificação de Assinatura

Todos os webhooks incluem header `X-Webhook-Signature`:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}
```

---

## ⚡ Rate Limiting

### Limites

| Tipo | Limite | Janela |
|------|--------|--------|
| Autenticação | 5 req | 15 min |
| Leitura (GET) | 100 req | 15 min |
| Escrita (POST/PUT/DELETE) | 20 req | 15 min |
| Reservas | 20 req | 15 min |

### Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1637596800
```

### Resposta 429

```json
{
  "success": false,
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900
}
```

---

## 💻 Exemplos de Código

### JavaScript/Node.js

```javascript
const axios = require('axios');

class RSVClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.rsv.com';
    this.token = null;
  }
  
  async login(email, password) {
    const response = await axios.post(`${this.baseURL}/api/auth/login`, {
      email,
      password
    });
    
    this.token = response.data.data.token;
    return response.data;
  }
  
  async getProperties(filters = {}) {
    const response = await axios.get(`${this.baseURL}/api/properties`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      params: filters
    });
    
    return response.data;
  }
  
  async createBooking(bookingData) {
    const response = await axios.post(
      `${this.baseURL}/api/bookings`,
      bookingData,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  }
}

// Uso
const client = new RSVClient();
await client.login('email@example.com', 'senha');
const properties = await client.getProperties({ location: 'São Paulo' });
const booking = await client.createBooking({
  property_id: 123,
  check_in: '2025-12-01',
  check_out: '2025-12-05',
  guests: 2
});
```

### Python

```python
import requests

class RSVClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.rsv.com'
        self.token = None
    
    def login(self, email, password):
        response = requests.post(
            f'{self.base_url}/api/auth/login',
            json={'email': email, 'password': password}
        )
        self.token = response.json()['data']['token']
        return response.json()
    
    def get_properties(self, filters=None):
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(
            f'{self.base_url}/api/properties',
            headers=headers,
            params=filters or {}
        )
        return response.json()
    
    def create_booking(self, booking_data):
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        response = requests.post(
            f'{self.base_url}/api/bookings',
            headers=headers,
            json=booking_data
        )
        return response.json()

# Uso
client = RSVClient('api-key')
client.login('email@example.com', 'senha')
properties = client.get_properties({'location': 'São Paulo'})
booking = client.create_booking({
    'property_id': 123,
    'check_in': '2025-12-01',
    'check_out': '2025-12-05',
    'guests': 2
})
```

---

## 🔧 Troubleshooting

### Erro 401 (Não Autenticado)

- Verifique se o token está sendo enviado
- Verifique se o token não expirou
- Renove o token se necessário

### Erro 429 (Rate Limit)

- Aguarde o tempo indicado em `retryAfter`
- Implemente retry com backoff exponencial
- Considere aumentar limites (contate suporte)

### Erro 400 (Dados Inválidos)

- Verifique formato dos dados
- Consulte documentação do endpoint
- Valide dados antes de enviar

### Timeout

- Verifique conexão com internet
- Aumente timeout se necessário
- Implemente retry logic

---

## 📖 Recursos Adicionais

- [Documentação Completa da API](./API_DOCUMENTATION.md)
- [Swagger UI](https://api.rsv.com/api/docs)
- [Postman Collection](https://api.rsv.com/docs/postman-collection.json)
- [Guia de Desenvolvimento](./DEVELOPMENT_GUIDE.md)

---

## 📞 Suporte

- **Email:** developers@rsv.com
- **Slack:** #rsv-api-support
- **Documentação:** https://docs.rsv.com

---

**Última atualização:** 22/11/2025

