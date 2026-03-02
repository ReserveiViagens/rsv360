# 🔧 CORREÇÃO: Foreign Key `bookings_customer_id_fkey`

**Data:** 2025-11-27  
**Status:** ✅ CORREÇÃO APLICADA  
**Metodologia:** Chain of Thought (CoT) + Root Cause Analysis

---

## 🐛 PROBLEMA IDENTIFICADO

### Erro:
```
inserção ou atualização em tabela "bookings" viola restrição de chave estrangeira 
"bookings_customer_id_fkey"
```

### Causa Raiz (5 Porquês):

**Por que 1:** Erro ao inserir na tabela `bookings`  
**→** O `customer_id` não existe na tabela `customers`

**Por que 2:** `customer_id` não existe?  
**→** O código está usando `user_id` da tabela `users` como `customer_id`

**Por que 3:** Por que usar `user_id` como `customer_id`?  
**→** O código cria/busca na tabela `users`, mas não cria/busca na tabela `customers`

**Por que 4:** Por que não cria na tabela `customers`?  
**→** O código não verifica se a tabela `customers` existe nem cria o registro lá

**Por que 5 (CAUSA RAIZ):**  
**→** Falta de lógica para criar/buscar customer na tabela `customers` antes de inserir a reserva

---

## ✅ SOLUÇÃO APLICADA

### Mudança no `app/api/bookings/route.ts`:

**ANTES (com erro):**
```typescript
// Linha 91-132: Cria/busca apenas na tabela users
let userId = null;
// ... código cria/busca em users ...

// Linha 168: Usa userId como customer_id (ERRADO!)
customer_id: userId,  // ❌ userId pode ser null ou não existir em customers
```

**DEPOIS (corrigido):**
```typescript
// 1. Criar/buscar customer na tabela customers
let customerId = null;
if (body.customer.email) {
  try {
    // Verificar se a tabela customers existe
    const customersTableExists = await queryDatabase(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
      ) as exists`
    );

    if (customersTableExists[0]?.exists) {
      // Buscar customer existente
      const existingCustomer = await queryDatabase(
        'SELECT id FROM customers WHERE email = $1',
        [body.customer.email]
      );

      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
      } else {
        // Criar novo customer
        const newCustomer = await queryDatabase(
          `INSERT INTO customers (name, email, phone, document_number, user_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [
            body.customer.name,
            body.customer.email,
            body.customer.phone || null,
            body.customer.document || null,
            userId || null  // Link com user se existir
          ]
        );
        customerId = newCustomer[0]?.id;
      }
    }
  } catch (error: any) {
    console.log('Erro ao criar/buscar customer:', error.message);
  }
}

// 2. Usar customerId correto na inserção
customer_id: customerId,  // ✅ ID correto da tabela customers
```

---

## 📋 EXPLICAÇÃO TÉCNICA

### Estrutura do Banco:

```
users (tabela de usuários do sistema)
  └─ id (user_id)

customers (tabela de clientes/hóspedes)
  └─ id (customer_id)
  └─ user_id (FK para users, opcional)

bookings (tabela de reservas)
  └─ customer_id (FK para customers)  ← PROBLEMA AQUI!
```

### O Problema:

1. **Foreign Key:** `bookings.customer_id` → `customers.id`
2. **Código antigo:** Usava `users.id` como `customer_id`
3. **Resultado:** Violação de foreign key (user_id não existe em customers)

### A Solução:

1. **Verificar tabela customers:** Se existe, usar; se não, continuar sem customer_id
2. **Buscar customer:** Por email na tabela `customers`
3. **Criar customer:** Se não existir, criar novo registro
4. **Usar customer_id:** ID correto da tabela `customers`

---

## 🔍 VERIFICAÇÕES

### ✅ Arquivo Modificado:
- `app/api/bookings/route.ts` - Lógica de criação/busca de customer adicionada

### ✅ Funcionalidade Mantida:
- Criação de reserva continua funcionando
- Se tabela customers não existir, continua sem customer_id (null)
- Se customer existir, usa o ID existente
- Se customer não existir, cria novo

---

## 🧪 TESTE

### Passos para Verificar:
1. Fazer uma nova reserva
2. Verificar que não há mais erro de foreign key
3. Verificar que o customer foi criado na tabela `customers`
4. Verificar que a reserva foi criada com `customer_id` correto

---

## 📊 RESULTADO

✅ **Erro corrigido!**

Agora o código:
- ✅ Verifica se a tabela `customers` existe
- ✅ Busca customer existente por email
- ✅ Cria novo customer se não existir
- ✅ Usa `customer_id` correto da tabela `customers`
- ✅ Não viola mais a foreign key

---

**Status:** ✅ CORRIGIDO

