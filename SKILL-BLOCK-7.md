---
name: rsv360-block-7-skill
description: '**WORKFLOW SKILL** — Extensão do Block 6 para operações de escrita (POST/PUT/DELETE). Adiciona mutations TanStack Query, validação de dados, error handling avançado, e testes de integração. USE FOR: RSV360 Block 7, write operations, mutations, data validation, integration tests. DO NOT USE FOR: read-only operations, frontend-only changes.'
---

# RSV360 Block 7 Skill: Operações de Escrita

## Visão Geral
Este skill estende o Block 6 adicionando operações de escrita (CREATE, UPDATE, DELETE) para os 12 domínios integrados. Inclui mutations TanStack Query, validação de dados, tratamento de erros avançado, e testes de integração.

## Pré-requisitos
- Block 6 concluído (12 domínios read-only integrados)
- TanStack Query configurado
- Validação de formulários (Zod recomendado)

## Processo Passo a Passo

### Passo 1: Extender APIs Backend
Para cada domínio, adicionar rotas POST/PUT/DELETE:

```javascript
// POST /api/v1/{domain} - Criar
router.post('/', async (req, res) => {
  try {
    const [id] = await knex('{table}').insert(req.body).returning('id');
    res.status(201).json({ success: true, data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Create failed' });
  }
});

// PUT /api/v1/{domain}/:id - Atualizar
router.put('/:id', async (req, res) => {
  try {
    const updated = await knex('{table}').where({ id: req.params.id }).update(req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: { updated } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Update failed' });
  }
});

// DELETE /api/v1/{domain}/:id - Deletar
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await knex('{table}').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: { deleted } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
});
```

### Passo 2: Extender Adapters Frontend
Adicionar funções de escrita:

```typescript
// Create
export async function create{Domain}(data: Omit<{Domain}Item, 'id'>): Promise<{Domain}Item> {
  const res = await fetch(`${API_BASE}/api/v1/{domain}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<{Domain}Item> = await res.json();
  return json.data!;
}

// Update
export async function update{Domain}(id: string, data: Partial<{Domain}Item>): Promise<{Domain}Item> {
  const res = await fetch(`${API_BASE}/api/v1/{domain}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<{Domain}Item> = await res.json();
  return json.data!;
}

// Delete
export async function delete{Domain}(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/{domain}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
```

### Passo 3: Extender Hooks com Mutations
Adicionar mutations TanStack Query:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { create{Domain}, update{Domain}, delete{Domain} } from '@/services/{domain}.adapter';

export function useCreate{Domain}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: create{Domain},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{domain}', 'list'] });
    },
  });
}

export function useUpdate{Domain}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{Domain}Item> }) => 
      update{Domain}(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{domain}'] });
    },
  });
}

export function useDelete{Domain}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: delete{Domain},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{domain}', 'list'] });
    },
  });
}
```

### Passo 4: Validação de Dados
Implementar validação com Zod:

```typescript
import { z } from 'zod';

export const {Domain}Schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  // outros campos...
});

export type {Domain}Input = z.infer<typeof {Domain}Schema>;
```

### Passo 5: Tratamento de Erros Avançado
Adicionar error boundaries e toast notifications.

### Passo 6: Testes de Integração
Criar testes com Vitest/Playwright para operações CRUD.

## Critérios de Qualidade
- Todas as operações CRUD funcionam
- Validação de dados implementada
- Cache invalidado corretamente
- Tratamento de erros robusto
- Testes passando

## Pontos de Decisão
- Usar optimistic updates? (Recomendado para UX)
- Implementar soft delete? (Para dados sensíveis)
- Adicionar rate limiting? (Para APIs públicas)

## Verificações de Conclusão
- PR Block 7 criado
- Todos os testes passando
- Documentação atualizada