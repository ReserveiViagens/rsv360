# 📚 Guia de Uso - Sistema CRM

## Visão Geral

O Sistema CRM (Customer Relationship Management) do RSV Gen 2 permite gerenciar relacionamentos com clientes, segmentação, campanhas de marketing e análise de métricas.

## Funcionalidades Principais

### 1. Gestão de Clientes

#### Lista de Clientes (`/crm`)
- Visualização de todos os clientes cadastrados
- Filtros por:
  - Tier de fidelidade (Bronze, Silver, Gold, Platinum, Diamond)
  - Valor total gasto (mínimo e máximo)
  - Número de reservas
- Ordenação por:
  - Valor total gasto
  - Número de reservas
  - Data da última reserva
  - Score de engajamento
- Paginação de resultados

#### Busca de Clientes
- Busca por nome, email ou telefone
- Autocomplete com resultados em tempo real
- Navegação por teclado

#### Perfil do Cliente (`/crm/[id]`)
- **Aba Perfil:**
  - Informações básicas do cliente
  - Métricas principais (total gasto, reservas, scores)
  - Tier atual de fidelidade
  - Estatísticas financeiras e de engajamento

- **Aba Histórico:**
  - Timeline visual de reservas e interações
  - Filtros por tipo e período
  - Detalhes de cada evento

- **Aba Preferências:**
  - Lista de preferências do cliente
  - Adicionar/editar/remover preferências
  - Categorias: accommodation, services, communication, marketing, payment

- **Aba Interações:**
  - Histórico de interações (calls, emails, meetings, etc.)
  - Criar nova interação
  - Filtros por tipo, canal e prioridade

### 2. Segmentação de Clientes

#### Segmentos (`/crm` → Aba Segmentos)
- Visualização de distribuição de clientes por segmento
- Criar novos segmentos com critérios:
  - Número mínimo de reservas
  - Valor mínimo gasto
  - Tier de fidelidade
  - Tags
  - Score de engajamento mínimo
  - Risco de churn máximo
- Atualização automática ou manual
- Recalcular clientes em segmentos

### 3. Campanhas de Marketing

#### Lista de Campanhas (`/crm` → Aba Campanhas)
- Visualização de todas as campanhas
- Métricas:
  - Taxa de abertura (open rate)
  - Taxa de clique (click rate)
  - Taxa de conversão (conversion rate)
- Filtros por status e tipo

#### Criar/Editar Campanha
- Informações básicas:
  - Nome e descrição
  - Tipo (promotional, newsletter, transactional)
  - Canal (email, sms, push, in-app)
- Segmentação:
  - Seleção de segmento alvo
  - Critérios customizados
- Conteúdo:
  - Assunto (para email)
  - Mensagem
  - Template (opcional)
- Agendamento e orçamento

### 4. Dashboard

#### Dashboard Principal (`/crm` → Aba Dashboard)
- Métricas principais:
  - Total de clientes
  - Clientes ativos
  - Novos clientes
  - Receita total
  - Ticket médio
  - Total de interações
- Visualizações:
  - Distribuição por segmento
  - Interações por tipo
- Top clientes (por valor gasto)

#### Dashboard Administrativo (`/admin/crm`)
- Métricas avançadas:
  - Taxa de crescimento de clientes
  - Taxa de crescimento de receita
  - Taxa de churn
  - Lifetime médio do cliente
- Performance por segmento
- Performance de campanhas
- Análises avançadas

## APIs Disponíveis

### Clientes

#### `GET /api/crm/customers`
Lista clientes com filtros e paginação.

**Query Parameters:**
- `user_id` (number): Filtrar por ID de usuário
- `customer_id` (number): Filtrar por ID de cliente
- `loyalty_tier` (string): Filtrar por tier (bronze, silver, gold, platinum, diamond)
- `min_total_spent` (number): Valor mínimo gasto
- `max_total_spent` (number): Valor máximo gasto
- `min_bookings` (number): Número mínimo de reservas
- `tags` (string[]): Filtrar por tags (separadas por vírgula)
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 20)
- `sort_by` (string): Campo para ordenação (padrão: total_spent)
- `sort_order` (string): Ordem (asc/desc, padrão: desc)

**Exemplo:**
```bash
GET /api/crm/customers?loyalty_tier=gold&min_total_spent=1000&page=1&limit=20
```

#### `POST /api/crm/customers`
Cria um novo perfil de cliente.

**Body:**
```json
{
  "user_id": 1,
  "loyalty_tier": "bronze",
  "tags": ["vip", "early-adopter"]
}
```

#### `GET /api/crm/customers/[id]`
Obtém detalhes de um cliente específico.

#### `PUT /api/crm/customers/[id]`
Atualiza um perfil de cliente.

#### `DELETE /api/crm/customers/[id]`
Remove um perfil de cliente.

### Preferências

#### `GET /api/crm/customers/[id]/preferences`
Lista preferências de um cliente.

#### `POST /api/crm/customers/[id]/preferences`
Adiciona uma preferência ao cliente.

**Body:**
```json
{
  "preference_key": "room_type",
  "preference_value": "suite",
  "preference_type": "string",
  "category": "accommodation",
  "source": "explicit"
}
```

#### `PUT /api/crm/customers/[id]/preferences/[pref_id]`
Atualiza uma preferência.

#### `DELETE /api/crm/customers/[id]/preferences/[pref_id]`
Remove uma preferência.

### Interações

#### `GET /api/crm/interactions`
Lista interações com filtros.

**Query Parameters:**
- `customer_id` (number): Filtrar por cliente
- `interaction_type` (string): Tipo de interação
- `channel` (string): Canal
- `priority` (string): Prioridade
- `date_from` (string): Data inicial (ISO)
- `date_to` (string): Data final (ISO)

#### `POST /api/crm/interactions`
Cria uma nova interação.

**Body:**
```json
{
  "customer_id": 1,
  "interaction_type": "call",
  "channel": "phone",
  "subject": "Follow-up",
  "description": "Ligação de acompanhamento",
  "outcome": "successful",
  "sentiment": "positive",
  "priority": "normal"
}
```

### Segmentos

#### `GET /api/crm/segments`
Lista segmentos.

#### `POST /api/crm/segments`
Cria um novo segmento.

**Body:**
```json
{
  "name": "VIP",
  "description": "Clientes VIP",
  "criteria": {
    "min_bookings": 5,
    "min_total_spent": 5000,
    "loyalty_tier": ["gold", "platinum", "diamond"]
  },
  "is_active": true,
  "is_auto_update": true
}
```

#### `POST /api/crm/segments/[id]/calculate`
Recalcula clientes em um segmento.

### Campanhas

#### `GET /api/crm/campaigns`
Lista campanhas.

#### `POST /api/crm/campaigns`
Cria uma nova campanha.

**Body:**
```json
{
  "name": "Oferta Especial",
  "description": "Campanha promocional",
  "campaign_type": "promotional",
  "channel": "email",
  "target_segment_id": 1,
  "subject": "Oferta Especial para Você",
  "message": "Conteúdo da campanha...",
  "status": "draft"
}
```

### Dashboard

#### `GET /api/crm/dashboard`
Obtém métricas do dashboard.

**Query Parameters:**
- `date_from` (string): Data inicial (ISO)
- `date_to` (string): Data final (ISO)
- `segment_id` (number): Filtrar por segmento

## Autenticação

Todas as APIs requerem autenticação via `advancedAuthMiddleware`. O token deve ser enviado no header:

```
Authorization: Bearer <token>
```

## Validação de Dados

Todas as APIs utilizam schemas Zod para validação. Erros de validação retornam status `400` com detalhes dos campos inválidos.

## Exemplos de Uso

### Criar Segmento e Campanha

```typescript
// 1. Criar segmento
const segment = await fetch('/api/crm/segments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Clientes Frequentes',
    criteria: { min_bookings: 3 },
    is_auto_update: true,
  }),
});

// 2. Criar campanha para o segmento
const campaign = await fetch('/api/crm/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Oferta para Clientes Frequentes',
    campaign_type: 'promotional',
    channel: 'email',
    target_segment_id: segment.id,
    subject: 'Oferta Especial',
    message: 'Conteúdo da campanha...',
  }),
});
```

### Adicionar Preferências e Interação

```typescript
// 1. Adicionar preferência
await fetch(`/api/crm/customers/${customerId}/preferences`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    preference_key: 'breakfast',
    preference_value: 'true',
    preference_type: 'boolean',
    category: 'services',
  }),
});

// 2. Registrar interação
await fetch('/api/crm/interactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_id: customerId,
    interaction_type: 'call',
    channel: 'phone',
    subject: 'Confirmação de preferências',
    outcome: 'successful',
    sentiment: 'positive',
  }),
});
```

## Troubleshooting

### Erro 401 (Não Autenticado)
- Verificar se o token de autenticação está sendo enviado
- Verificar se o token não expirou
- Verificar permissões do usuário

### Erro 400 (Validação)
- Verificar formato dos dados enviados
- Consultar schemas Zod em `lib/schemas/crm-schemas.ts`
- Verificar tipos de dados (strings, numbers, arrays)

### Erro 404 (Não Encontrado)
- Verificar se o ID existe no banco de dados
- Verificar se o perfil de cliente foi criado

### Erro 500 (Erro do Servidor)
- Verificar logs do servidor
- Verificar conexão com banco de dados
- Verificar se migrations foram executadas

## Próximos Passos

- Integração com sistema de fidelidade
- Automação de campanhas
- Análise preditiva de churn
- Recomendações personalizadas

