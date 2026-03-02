# 🎫 Guia de Uso - Sistema de Tickets

**Versão:** 1.0  
**Data:** 03/12/2025

---

## 📋 Visão Geral

O Sistema de Tickets permite gerenciar solicitações de suporte, problemas técnicos e feedback dos usuários de forma organizada e eficiente.

---

## 🎯 Funcionalidades Principais

### 1. Criação de Tickets
- Criar novos tickets
- Categorização automática
- Priorização
- Anexos

### 2. Gerenciamento de Tickets
- Listagem com filtros
- Atribuição a agentes
- Atualização de status
- Histórico completo

### 3. Comunicação
- Comentários em tickets
- Notificações em tempo real (WebSocket)
- Anexos
- Histórico de mudanças

### 4. SLA (Service Level Agreement)
- Metas de primeira resposta
- Metas de resolução
- Alertas de violação
- Relatórios de compliance

### 5. Dashboard Administrativo
- Estatísticas gerais
- Métricas de SLA
- Distribuição por prioridade/categoria
- Tickets sem atribuição

---

## 🚀 Como Usar

### Para Usuários

#### 1. Criar Ticket

1. Acesse `/tickets`
2. Clique em "Novo Ticket"
3. Preencha:
   - **Assunto**: Título do problema
   - **Descrição**: Detalhes do problema
   - **Categoria**: Tipo de problema
   - **Prioridade**: Urgência (baixa, média, alta, urgente, crítica)
4. Anexe arquivos se necessário
5. Clique em "Criar Ticket"

#### 2. Acompanhar Ticket

1. Acesse `/tickets/[id]`
2. Visualize:
   - Status atual
   - Comentários
   - Histórico de mudanças
   - Anexos
   - Informações de SLA

#### 3. Adicionar Comentário

1. Na página do ticket
2. Digite seu comentário
3. Clique em "Adicionar Comentário"

---

### Para Staff/Agentes

#### 1. Visualizar Tickets

1. Acesse `/admin/tickets`
2. Use filtros:
   - Status (aberto, em progresso, resolvido, fechado)
   - Prioridade
   - Categoria
   - Busca por texto

#### 2. Atribuir Ticket

1. Abra o ticket
2. Clique em "Atribuir"
3. Selecione o agente
4. Confirme

#### 3. Atualizar Status

1. Abra o ticket
2. Selecione novo status:
   - **Open**: Aberto
   - **In Progress**: Em progresso
   - **Resolved**: Resolvido
   - **Closed**: Fechado
   - **Cancelled**: Cancelado

#### 4. Responder Ticket

1. Abra o ticket
2. Adicione comentário
3. Anexe arquivos se necessário
4. Clique em "Adicionar Comentário"

---

## 📡 APIs Disponíveis

### GET /api/tickets
Lista tickets com filtros e paginação.

**Query Parameters:**
- `status`: Filtro por status
- `priority`: Filtro por prioridade
- `category`: Filtro por categoria
- `search`: Busca por texto
- `limit`: Limite de resultados (padrão: 20)
- `offset`: Offset para paginação

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticket_number": "TKT-001",
      "subject": "Problema no sistema",
      "status": "open",
      "priority": "high",
      "category": "technical"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

### POST /api/tickets
Cria um novo ticket.

**Request:**
```json
{
  "subject": "Problema no sistema",
  "description": "Descrição detalhada",
  "category": "technical",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ticket_number": "TKT-001",
    "subject": "Problema no sistema",
    "status": "open"
  }
}
```

### GET /api/tickets/[id]
Obtém informações de um ticket específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ticket_number": "TKT-001",
    "subject": "Problema no sistema",
    "status": "open",
    "comments": [...],
    "attachments": [...],
    "history": [...],
    "sla": {...}
  }
}
```

### PUT /api/tickets/[id]
Atualiza um ticket.

**Request:**
```json
{
  "status": "in_progress",
  "priority": "high"
}
```

### POST /api/tickets/[id]/comments
Adiciona comentário a um ticket.

**Request:**
```json
{
  "comment": "Comentário do agente",
  "is_internal": false
}
```

### POST /api/tickets/[id]/assign
Atribui ticket a um agente.

**Request:**
```json
{
  "assign_to": 2
}
```

### POST /api/tickets/[id]/attachments
Faz upload de anexo.

**Request (multipart/form-data):**
- `file`: Arquivo
- `description`: Descrição (opcional)

### GET /api/tickets/stats
Obtém estatísticas de tickets (admin).

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 100,
      "open": 20,
      "resolved": 60,
      "closed": 15,
      "unassigned": 5,
      "sla_breached": 3
    },
    "by_priority": [...],
    "by_category": [...],
    "metrics": {
      "avg_resolution_hours": 24.5,
      "sla": {...}
    }
  }
}
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=onboarding_rsv_db
DB_USER=onboarding_rsv
DB_PASSWORD=senha_segura_123

# WebSocket
WS_URL=ws://localhost:3001

# Storage (para anexos)
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads/tickets
```

### Configuração de SLA

Os SLAs padrão por prioridade são:

- **Critical**: 30min primeira resposta / 3h resolução
- **Urgent**: 1h primeira resposta / 6h resolução
- **High**: 2h primeira resposta / 12h resolução
- **Medium**: 4h primeira resposta / 24h resolução
- **Low**: 8h primeira resposta / 48h resolução

---

## 🧪 Testes

### Testes Unitários
```bash
npm test components/tickets
```

### Testes de API
```bash
npm test app/api/tickets
```

### Testes E2E
```bash
npm run test:e2e tests/e2e/tickets.spec.ts
```

---

## 🐛 Troubleshooting

### Tickets não aparecem na lista
- Verificar autenticação
- Verificar filtros aplicados
- Verificar permissões do usuário

### WebSocket não conecta
- Verificar se servidor WebSocket está rodando
- Verificar variável `WS_URL`
- Verificar token de autenticação

### SLA não calcula
- Verificar se `ticket_sla` foi criado
- Verificar configuração de SLA
- Verificar logs do serviço

---

## 📚 Recursos Adicionais

- [Documentação da API](./TICKETS_SWAGGER.yaml)
- [Guia de Integração](./TICKETS_INTEGRACAO.md)
- [FAQ](./TICKETS_FAQ.md)

---

**Última atualização:** 03/12/2025

