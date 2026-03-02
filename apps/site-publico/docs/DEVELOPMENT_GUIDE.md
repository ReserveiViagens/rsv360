# 🛠️ Guia de Desenvolvimento - RSV Gen 2

**Versão:** 2.0.0  
**Data:** 22/11/2025

---

## 📋 Índice

1. [Setup do Ambiente](#setup-do-ambiente)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Padrões de Código](#padrões-de-código)
4. [Desenvolvimento de Features](#desenvolvimento-de-features)
5. [Testes](#testes)
6. [Deploy](#deploy)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup do Ambiente

### Pré-requisitos

- Node.js 18+ e npm/yarn
- PostgreSQL 14+
- Redis 6+
- Git

### Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/rsv/rsv-gen2.git
cd rsv-gen2

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Executar migrations
npm run migrate

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rsv_gen2

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-change-in-production

# API Keys
GOOGLE_CALENDAR_CLIENT_ID=...
GOOGLE_CALENDAR_CLIENT_SECRET=...
```

---

## 📁 Estrutura do Projeto

```
rsv-gen2/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticação
│   │   ├── bookings/      # Reservas
│   │   └── ...
│   ├── (pages)/           # Páginas públicas
│   └── dashboard/         # Dashboard autenticado
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   └── features/         # Componentes de features
├── lib/                   # Bibliotecas e utilitários
│   ├── db.ts             # Database client
│   ├── api-auth.ts       # Autenticação
│   └── services/         # Services de negócio
├── docs/                  # Documentação
│   ├── ADRs/            # Architecture Decision Records
│   └── ...
├── scripts/              # Scripts utilitários
│   └── migrations/      # SQL migrations
├── __tests__/           # Testes
└── public/              # Arquivos estáticos
```

### Convenções de Nomenclatura

- **Arquivos:** `kebab-case` (ex: `api-auth.ts`)
- **Componentes:** `PascalCase` (ex: `BookingCard.tsx`)
- **Funções:** `camelCase` (ex: `createBooking`)
- **Constantes:** `UPPER_SNAKE_CASE` (ex: `MAX_BOOKINGS`)

---

## 📝 Padrões de Código

### TypeScript

```typescript
// ✅ BOM: Tipos explícitos
interface Booking {
  id: number;
  propertyId: number;
  checkIn: Date;
  checkOut: Date;
}

function createBooking(booking: Booking): Promise<Booking> {
  // ...
}

// ❌ RUIM: any
function createBooking(booking: any): any {
  // ...
}
```

### API Routes

```typescript
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { createBookingSchema } from '@/lib/schemas/booking-schemas';
import { createBooking } from '@/lib/services/booking-service';

export const POST = withAuth(
  async (request: NextRequest, user) => {
    try {
      // 1. Validar input
      const body = await request.json();
      const validated = createBookingSchema.parse(body);
      
      // 2. Executar lógica de negócio
      const booking = await createBooking({
        ...validated,
        userId: user.id
      });
      
      // 3. Retornar resposta
      return NextResponse.json({
        success: true,
        data: booking
      }, { status: 201 });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar reserva'
      }, { status: 500 });
    }
  },
  { required: true }
);
```

### Services

```typescript
// lib/services/booking-service.ts
import { queryDatabase } from '@/lib/db';
import { Booking, CreateBookingInput } from '@/types/booking';

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  // 1. Validar disponibilidade
  const available = await checkAvailability(
    input.propertyId,
    input.checkIn,
    input.checkOut
  );
  
  if (!available) {
    throw new Error('Período não disponível');
  }
  
  // 2. Calcular preço
  const price = await calculatePrice(
    input.propertyId,
    input.checkIn,
    input.checkOut,
    input.guests
  );
  
  // 3. Criar reserva
  const result = await queryDatabase(
    `INSERT INTO bookings (property_id, user_id, check_in, check_out, guests, total_price, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING *`,
    [input.propertyId, input.userId, input.checkIn, input.checkOut, input.guests, price]
  );
  
  return result[0];
}
```

### Componentes React

```typescript
// components/booking/BookingCard.tsx
'use client';

import { useState } from 'react';
import { Booking } from '@/types/booking';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: number) => void;
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const [loading, setLoading] = useState(false);
  
  const handleCancel = async () => {
    if (!confirm('Deseja realmente cancelar esta reserva?')) return;
    
    setLoading(true);
    try {
      await fetch(`/api/bookings/${booking.id}`, {
        method: 'DELETE'
      });
      onCancel?.(booking.id);
    } catch (error) {
      console.error('Erro ao cancelar:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4">
      <h3>{booking.property.name}</h3>
      <p>Check-in: {booking.checkIn.toLocaleDateString()}</p>
      <p>Check-out: {booking.checkOut.toLocaleDateString()}</p>
      <button
        onClick={handleCancel}
        disabled={loading}
        className="btn-danger"
      >
        {loading ? 'Cancelando...' : 'Cancelar'}
      </button>
    </div>
  );
}
```

---

## 🎯 Desenvolvimento de Features

### Fluxo de Trabalho

1. **Criar branch:** `git checkout -b feature/nome-da-feature`
2. **Desenvolver:** Seguir padrões de código
3. **Testar:** Escrever testes unitários e de integração
4. **Documentar:** Atualizar documentação se necessário
5. **Commit:** `git commit -m "feat: descrição"`
6. **Push:** `git push origin feature/nome-da-feature`
7. **Pull Request:** Criar PR e aguardar review

### Checklist de Feature

- [ ] Código segue padrões do projeto
- [ ] Testes unitários escritos e passando
- [ ] Testes de integração escritos e passando
- [ ] Documentação atualizada
- [ ] Migrations criadas (se necessário)
- [ ] Validação de input (Zod schemas)
- [ ] Autenticação/autorização implementada
- [ ] Tratamento de erros adequado
- [ ] Logs apropriados
- [ ] Performance considerada

### Exemplo: Criar Nova Feature

```bash
# 1. Criar migration
npm run migrate:create add_reviews_table

# 2. Criar schema Zod
# lib/schemas/review-schemas.ts

# 3. Criar service
# lib/services/review-service.ts

# 4. Criar API route
# app/api/reviews/route.ts

# 5. Criar componente
# components/review/ReviewCard.tsx

# 6. Criar testes
# __tests__/api/reviews.test.ts
```

---

## 🧪 Testes

### Estrutura de Testes

```
__tests__/
├── unit/              # Testes unitários
├── integration/       # Testes de integração
├── api/              # Testes de API
└── e2e/              # Testes end-to-end
```

### Exemplo de Teste

```typescript
// __tests__/api/bookings.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { POST } from '@/app/api/bookings/route';
import { NextRequest } from 'next/server';

describe('POST /api/bookings', () => {
  it('deve criar uma reserva válida', async () => {
    const request = new NextRequest('http://localhost/api/bookings', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        propertyId: 1,
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        guests: 2
      })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
  });
});
```

### Executar Testes

```bash
# Todos os testes
npm test

# Testes com coverage
npm run test:coverage

# Testes em watch mode
npm run test:watch

# Testes específicos
npm test -- bookings.test.ts
```

---

## 🚀 Deploy

### Ambiente de Desenvolvimento

```bash
npm run dev
```

### Ambiente de Staging

```bash
npm run build
npm run start
```

### Ambiente de Produção

```bash
# Docker
docker-compose up -d

# Ou manualmente
npm run build
NODE_ENV=production npm run start
```

### CI/CD

O projeto usa GitHub Actions. Veja `.github/workflows/ci-cd.yml`.

---

## 🔧 Troubleshooting

### Problemas Comuns

#### Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
pg_isready

# Verificar variáveis de ambiente
echo $DATABASE_URL
```

#### Erro de Cache

```bash
# Limpar cache do Next.js
rm -rf .next

# Limpar cache do Node
npm run clean
```

#### Erro de Migrations

```bash
# Verificar status das migrations
npm run migrate:status

# Reverter última migration
npm run migrate:rollback
```

---

## 📚 Recursos Adicionais

- [Documentação da API](./API_DOCUMENTATION.md)
- [ADRs](./ADRs/README.md)
- [Padrões de Código](./PATTERNS.md)
- [Arquitetura](./ARCHITECTURE.md)

---

**Última atualização:** 22/11/2025

