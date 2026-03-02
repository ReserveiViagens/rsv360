# 📐 PADRÕES DE CÓDIGO - RSV GEN 2

**Versão:** 2.0.0  
**Data:** 22/11/2025

---

## 🎯 VISÃO GERAL

Este documento define os padrões de código, convenções e best practices utilizados no projeto.

---

## 📝 CONVENÇÕES DE NOMENCLATURA

### Arquivos e Pastas
- **Services:** `*-service.ts` (ex: `booking-service.ts`)
- **Schemas:** `*-schemas.ts` (ex: `wishlist-schemas.ts`)
- **Components:** PascalCase (ex: `WishlistManager.tsx`)
- **API Routes:** `route.ts` dentro de `app/api/*/`
- **Types:** `types.ts` ou dentro do arquivo do service

### Variáveis e Funções
- **camelCase** para variáveis e funções
- **PascalCase** para classes e componentes
- **UPPER_SNAKE_CASE** para constantes
- **kebab-case** para arquivos

### Exemplos:
```typescript
// ✅ Correto
const bookingService = new BookingService();
function createBooking() { }
const MAX_RETRIES = 3;
class BookingManager { }

// ❌ Incorreto
const BookingService = ...;
function CreateBooking() { }
const maxRetries = 3; // Deveria ser constante
```

---

## 🏗️ PADRÃO DE SERVICE

### Estrutura Padrão:

```typescript
/**
 * ✅ SERVICE: [Nome do Service]
 * [Descrição breve]
 */

import { queryDatabase } from './db';
import { cacheQuality, invalidateQualityCache } from './cache-integration';

export interface [Service]Interface {
  // Interfaces
}

/**
 * ✅ Função principal
 */
export async function [functionName](
  param1: Type1,
  param2: Type2
): Promise<ReturnType> {
  try {
    // 1. Validações
    // 2. Cache check (se aplicável)
    // 3. Lógica de negócio
    // 4. Database operations
    // 5. Cache update (se aplicável)
    // 6. Return
  } catch (error) {
    console.error('Erro em [functionName]:', error);
    throw error;
  }
}
```

---

## 🛡️ PADRÃO DE API ROUTE

### Estrutura Padrão:

```typescript
/**
 * ✅ API: [Nome da API]
 * [Método] /api/[path] - [Descrição]
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, withAuth } from '@/lib/api-auth';
import { [serviceFunction] } from '@/lib/[service]-service';
import { [schema] } from '@/lib/schemas/[schema]-schemas';

export const [METHOD] = withAuth(async (request: NextRequest, { user }) => {
  try {
    // 1. Parse body/query
    const body = await request.json();
    
    // 2. Validação Zod
    const validationResult = [schema].safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }
    
    // 3. Autorização (se necessário)
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    // 4. Chamada ao service
    const result = await [serviceFunction](validationResult.data);
    
    // 5. Response
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erro em [API]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
});
```

---

## ✅ PADRÃO DE VALIDAÇÃO (Zod)

### Schema Padrão:

```typescript
import { z } from 'zod';

export const [entity]Schema = z.object({
  // Campos obrigatórios
  required_field: z.string().min(1, 'Campo obrigatório'),
  
  // Campos opcionais
  optional_field: z.string().optional(),
  
  // Campos numéricos
  number_field: z.number()
    .int()
    .positive('Deve ser positivo'),
  
  // Campos de data
  date_field: z.string()
    .datetime('Data inválida')
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val),
  
  // Enums
  status: z.enum(['active', 'inactive']),
  
  // Arrays
  items: z.array(z.string()).min(1, 'Pelo menos um item'),
  
  // Objetos aninhados
  metadata: z.record(z.any()).optional(),
}).refine(
  // Validações customizadas
  (data) => data.end_date > data.start_date,
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['end_date'],
  }
);
```

---

## 🎨 PADRÃO DE COMPONENTE REACT

### Estrutura Padrão:

```typescript
/**
 * ✅ COMPONENTE: [Nome do Componente]
 * [Descrição]
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { [Icon] } from '@/lib/lucide-icons';
import { toast } from 'sonner';

interface [Component]Props {
  // Props
}

export function [Component]({ props }: [Component]Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType | null>(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch data
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>[Título]</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Conteúdo */}
      </CardContent>
    </Card>
  );
}
```

---

## 🗄️ PADRÃO DE QUERY DATABASE

### Query Padrão:

```typescript
// ✅ Query parametrizada (segura)
const result = await queryDatabase(
  `SELECT * FROM table_name 
   WHERE id = $1 AND status = $2
   ORDER BY created_at DESC
   LIMIT $3 OFFSET $4`,
  [id, status, limit, offset]
);

// ❌ NUNCA fazer concatenação de strings
// const query = `SELECT * FROM users WHERE id = ${userId}`; // SQL Injection!
```

### Transações:

```typescript
// Usar transações para operações múltiplas
await queryDatabase('BEGIN');
try {
  await queryDatabase('INSERT INTO ...', [params1]);
  await queryDatabase('UPDATE ...', [params2]);
  await queryDatabase('COMMIT');
} catch (error) {
  await queryDatabase('ROLLBACK');
  throw error;
}
```

---

## 🔐 PADRÃO DE AUTENTICAÇÃO

### Middleware:

```typescript
// ✅ Usar withAuth para rotas protegidas
export const POST = withAuth(async (request, { user }) => {
  // user está disponível aqui
});

// ✅ Ou requireAuth para lógica customizada
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  // ...
}
```

---

## 💾 PADRÃO DE CACHE

### Cache Pattern:

```typescript
// 1. Verificar cache
const cacheKey = `[entity]:${id}`;
const cached = await getFromCache(cacheKey);
if (cached) return cached;

// 2. Buscar do banco
const data = await queryDatabase(...);

// 3. Armazenar no cache
await setCache(cacheKey, data, 3600); // 1 hora

// 4. Invalidar cache quando necessário
await invalidateCache(`[entity]:${id}`);
```

---

## 🚨 PADRÃO DE TRATAMENTO DE ERROS

### Error Handling:

```typescript
try {
  // Operação
} catch (error: any) {
  console.error('Contexto do erro:', error);
  
  // Log detalhado em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', error.stack);
  }
  
  // Retornar erro apropriado
  throw new Error('Mensagem amigável ao usuário');
}
```

---

## 📊 PADRÃO DE LOGGING

### Logging:

```typescript
// ✅ Logs estruturados
console.log('[SERVICE] Operação realizada', {
  userId: user.id,
  action: 'create_booking',
  bookingId: result.id,
});

// ✅ Logs de erro
console.error('[SERVICE] Erro ao realizar operação', {
  error: error.message,
  stack: error.stack,
  context: { userId, bookingId },
});
```

---

## 🧪 PADRÃO DE TESTES

### Test Structure:

```typescript
/**
 * ✅ TESTES: [Nome do Módulo]
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('[Module]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('deve [comportamento esperado]', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

---

## 📦 PADRÃO DE IMPORTS

### Ordem de Imports:

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. Bibliotecas externas
import { z } from 'zod';
import { toast } from 'sonner';

// 3. Componentes UI
import { Button } from '@/components/ui/button';

// 4. Services/Libs
import { queryDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// 5. Types/Schemas
import { BookingSchema } from '@/lib/schemas/booking-schemas';

// 6. Utils
import { formatDate } from '@/lib/utils';
```

---

## 🎯 PRINCÍPIOS SOLID

### 1. Single Responsibility
Cada função/classe tem uma única responsabilidade.

### 2. Open/Closed
Aberto para extensão, fechado para modificação.

### 3. Liskov Substitution
Subtipos devem ser substituíveis por seus tipos base.

### 4. Interface Segregation
Interfaces específicas são melhores que interfaces genéricas.

### 5. Dependency Inversion
Depender de abstrações, não de implementações concretas.

---

**Última atualização:** 22/11/2025

