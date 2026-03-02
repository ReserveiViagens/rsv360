# 📡 ARQUITETURA DE APIs - RSV GEN 2

**Versão:** 2.0.0  
**Data:** 22/11/2025

---

## 🎯 VISÃO GERAL

O sistema possui uma arquitetura RESTful completa com mais de 80 endpoints organizados por domínio.

---

## 📁 ESTRUTURA DE APIs

### Autenticação (`/api/auth/*`)
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Recuperar senha
- `POST /api/auth/reset-password` - Redefinir senha
- `GET /api/auth/google` - OAuth Google
- `GET /api/auth/facebook` - OAuth Facebook

### Reservas (`/api/bookings/*`)
- `GET /api/bookings` - Listar reservas
- `POST /api/bookings` - Criar reserva
- `GET /api/bookings/[code]` - Buscar por código
- `POST /api/bookings/[code]/cancel` - Cancelar
- `POST /api/bookings/[code]/payment` - Processar pagamento

### Viagens em Grupo (`/api/wishlists/*`, `/api/split-payments/*`, `/api/trip-invitations/*`, `/api/group-chats/*`)
- **Wishlists:**
  - `GET /api/wishlists` - Listar
  - `POST /api/wishlists` - Criar
  - `GET /api/wishlists/[id]` - Buscar
  - `POST /api/wishlists/[id]/items` - Adicionar item
  - `POST /api/wishlists/[id]/vote` - Votar

- **Split Payments:**
  - `GET /api/split-payments` - Listar
  - `POST /api/split-payments` - Criar
  - `GET /api/split-payments/[id]` - Buscar

- **Trip Invitations:**
  - `GET /api/trip-invitations` - Listar
  - `POST /api/trip-invitations` - Criar
  - `GET /api/trip-invitations/[token]` - Buscar por token

- **Group Chats:**
  - `GET /api/group-chats` - Listar
  - `POST /api/group-chats` - Criar
  - `GET /api/group-chats/[id]/messages` - Mensagens

### Smart Pricing (`/api/pricing/smart/*`)
- `POST /api/pricing/smart` - Calcular preço inteligente
- `GET /api/pricing/smart?action=history` - Histórico
- `GET /api/pricing/smart?action=trends` - Tendências

### Programa Top Host (`/api/quality/*`)
- `GET /api/quality/leaderboard` - Ranking
- `GET /api/quality/metrics` - Métricas
- `GET /api/quality/incentives` - Incentivos

### Seguros (`/api/insurance/*`)
- `GET /api/insurance/policies` - Listar apólices
- `POST /api/insurance/policies` - Criar apólice
- `GET /api/insurance/claims` - Listar sinistros
- `POST /api/insurance/claims` - Criar sinistro
- `POST /api/insurance/calculate-premium` - Calcular prêmio

### Verificação (`/api/verification/*`)
- `POST /api/verification/request` - Solicitar verificação
- `POST /api/verification/review` - Revisar (Admin)
- `GET /api/verification/list` - Listar (Admin)

### Integrações (`/api/calendar/*`, `/api/smartlocks/*`)
- `POST /api/calendar/sync` - Sincronizar Google Calendar
- `POST /api/smartlocks/[id]/pins` - Gerar código de acesso

---

## 🔐 AUTENTICAÇÃO E AUTORIZAÇÃO

### Fluxo Padrão:

```typescript
// 1. Middleware de autenticação
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  
  // 2. Validação de permissões
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  
  // 3. Lógica da API
  // ...
}
```

### Roles:
- `user` - Usuário comum
- `host` - Proprietário
- `admin` - Administrador

---

## ✅ VALIDAÇÃO

### Padrão Zod:

```typescript
// 1. Definir schema
import { z } from 'zod';

export const createBookingSchema = z.object({
  property_id: z.number().int().positive(),
  check_in: z.string().datetime(),
  check_out: z.string().datetime(),
  // ...
});

// 2. Validar na API
const validationResult = createBookingSchema.safeParse(body);
if (!validationResult.success) {
  return NextResponse.json(
    { error: 'Dados inválidos', details: validationResult.error.errors },
    { status: 400 }
  );
}
```

---

## 📊 PADRÃO DE RESPOSTA

### Sucesso:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

### Erro:
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": [ ... ]
}
```

### Paginação:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## 🚦 RATE LIMITING

### Implementado:
- Rate limiting básico por IP
- Rate limiting por usuário autenticado

### Configuração:
- Default: 100 requests/minuto
- Auth endpoints: 10 requests/minuto
- Payment endpoints: 20 requests/minuto

---

## 📝 CÓDIGOS DE STATUS HTTP

### Sucesso:
- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado
- `204 No Content` - Sucesso sem conteúdo

### Erro do Cliente:
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Conflito (ex: duplicata)

### Erro do Servidor:
- `500 Internal Server Error` - Erro interno
- `503 Service Unavailable` - Serviço indisponível

---

**Última atualização:** 22/11/2025

