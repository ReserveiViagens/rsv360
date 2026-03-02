# Sistema de Tickets de Suporte - Documentação Completa

## 📋 Visão Geral

O Sistema de Tickets de Suporte do RSV Gen 2 permite que usuários criem, gerenciem e acompanhem tickets de suporte técnico, garantindo comunicação eficiente entre clientes e equipe de suporte.

## 🏗️ Arquitetura

### Estrutura de Dados

#### Tabela: `support_tickets`
Armazena informações principais dos tickets.

**Campos principais:**
- `id`: ID único do ticket
- `ticket_number`: Número único gerado automaticamente (ex: TKT-20250101-ABC123)
- `user_id`: ID do usuário que criou o ticket
- `assigned_to`: ID do usuário responsável pelo ticket (pode ser NULL)
- `category`: Categoria do ticket (general, technical, billing, booking, account, payment, refund, cancellation, other)
- `priority`: Prioridade (low, medium, high, urgent, critical)
- `status`: Status atual (open, in_progress, waiting_customer, waiting_third_party, resolved, closed, cancelled)
- `subject`: Assunto do ticket
- `description`: Descrição detalhada
- `source`: Origem do ticket (web, email, phone, chat, api, other)
- `tags`: Array de tags
- `metadata`: JSONB para dados adicionais
- `sla_due_at`: Data limite do SLA
- `sla_breached`: Boolean indicando se SLA foi violado
- `first_response_at`: Data da primeira resposta
- `resolved_at`: Data de resolução
- `closed_at`: Data de fechamento
- `created_at`, `updated_at`: Timestamps

#### Tabela: `ticket_comments`
Armazena comentários dos tickets.

**Campos principais:**
- `id`: ID único do comentário
- `ticket_id`: ID do ticket relacionado
- `user_id`: ID do usuário que fez o comentário
- `comment`: Texto do comentário
- `is_internal`: Boolean - se o comentário é interno (visível apenas para staff)
- `attachments`: Array de URLs de anexos
- `created_at`, `updated_at`: Timestamps

#### Tabela: `ticket_attachments`
Armazena anexos dos tickets.

**Campos principais:**
- `id`: ID único do anexo
- `ticket_id`: ID do ticket
- `comment_id`: ID do comentário (opcional)
- `user_id`: ID do usuário que fez upload
- `file_name`: Nome do arquivo
- `file_path`: Caminho do arquivo
- `file_size`: Tamanho em bytes
- `mime_type`: Tipo MIME do arquivo
- `uploaded_at`: Timestamp

#### Tabela: `ticket_history`
Armazena histórico de mudanças do ticket (criado automaticamente por trigger).

#### Tabela: `ticket_sla`
Armazena informações de SLA (Service Level Agreement).

**Campos principais:**
- `ticket_id`: ID do ticket
- `priority`: Prioridade do ticket
- `first_response_target_minutes`: Meta de primeira resposta (minutos)
- `resolution_target_minutes`: Meta de resolução (minutos)
- `first_response_at`: Data da primeira resposta
- `first_response_met`: Boolean - se meta foi atingida
- `resolution_at`: Data de resolução
- `resolution_met`: Boolean - se meta foi atingida
- `breached_at`: Data de violação do SLA

## 🔌 API Endpoints

### GET /api/tickets
Lista tickets com filtros e paginação.

**Query Parameters:**
- `user_id`: Filtrar por usuário
- `assigned_to`: Filtrar por responsável
- `status`: Filtrar por status
- `priority`: Filtrar por prioridade
- `category`: Filtrar por categoria
- `source`: Filtrar por origem
- `search`: Busca em assunto e descrição
- `created_from`: Data inicial
- `created_to`: Data final
- `tags`: Array de tags
- `limit`: Limite de resultados (padrão: 20)
- `offset`: Offset para paginação (padrão: 0)
- `sort_by`: Campo para ordenação (padrão: created_at)
- `sort_order`: Ordem (asc/desc, padrão: desc)

**Resposta:**
```json
{
  "success": true,
  "data": [...tickets],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

### POST /api/tickets
Cria um novo ticket.

**Body:**
```json
{
  "subject": "Assunto do ticket",
  "description": "Descrição detalhada",
  "category": "technical",
  "priority": "high",
  "source": "web",
  "tags": ["urgente", "pagamento"]
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {...ticket},
  "message": "Ticket criado com sucesso"
}
```

### GET /api/tickets/[id]
Obtém detalhes de um ticket específico, incluindo comentários.

**Resposta:**
```json
{
  "success": true,
  "data": {
    ...ticket,
    "comments": [...comentários]
  }
}
```

### PUT /api/tickets/[id]
Atualiza um ticket.

**Body:**
```json
{
  "category": "billing",
  "priority": "urgent",
  "status": "in_progress",
  "subject": "Novo assunto",
  "description": "Nova descrição",
  "assigned_to": 2,
  "tags": ["novo", "tag"]
}
```

### DELETE /api/tickets/[id]
Cancela um ticket (soft delete - muda status para cancelled).

### GET /api/tickets/[id]/comments
Lista comentários de um ticket.

**Query Parameters:**
- `include_internal`: Incluir comentários internos (apenas admin/staff)

### POST /api/tickets/[id]/comments
Adiciona um comentário ao ticket.

**Body:**
```json
{
  "comment": "Texto do comentário",
  "is_internal": false,
  "attachments": ["url1", "url2"]
}
```

### POST /api/tickets/[id]/assign
Atribui ticket a um usuário (apenas admin/staff).

**Body:**
```json
{
  "assigned_to": 3,
  "notes": "Notas opcionais"
}
```

### POST /api/tickets/[id]/status
Muda o status do ticket.

**Body:**
```json
{
  "status": "resolved",
  "notes": "Notas opcionais",
  "resolution_notes": "Problema resolvido"
}
```

### GET /api/tickets/[id]/attachments
Lista anexos do ticket.

### POST /api/tickets/[id]/attachments
Adiciona anexo ao ticket (FormData).

**FormData:**
- `file`: Arquivo (max 10MB)
- `comment_id`: ID do comentário (opcional)

### GET /api/tickets/stats
Obtém estatísticas de tickets (apenas admin/staff).

**Query Parameters:**
- `priority`: Filtrar por prioridade
- `category`: Filtrar por categoria
- `status`: Filtrar por status
- `assigned_to`: Filtrar por responsável
- `date_from`: Data inicial
- `date_to`: Data final

**Resposta:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 100,
      "open": 20,
      "resolved": 60,
      "closed": 20,
      "unassigned": 5,
      "sla_breached": 2
    },
    "by_priority": [...],
    "by_category": [...],
    "by_status": [...],
    "metrics": {
      "avg_resolution_hours": 24.5,
      "sla": {...}
    },
    "top_users": [...],
    "top_staff": [...]
  }
}
```

## 🔔 Sistema de Notificações

### Notificações por Email

O sistema envia emails automáticos para:

1. **Ticket Criado**: Confirmação para o criador
2. **Ticket Atualizado**: Notificação de mudança de status/prioridade
3. **Novo Comentário**: Notificação quando há novo comentário
4. **Ticket Resolvido**: Confirmação de resolução
5. **Ticket Atribuído**: Notificação para staff quando recebe um ticket

### Notificações WebSocket

Notificações em tempo real via WebSocket:

- `ticket:created` - Novo ticket criado
- `ticket:status_changed` - Status alterado
- `ticket:comment_added` - Novo comentário
- `ticket:assigned` - Ticket atribuído
- `ticket:assigned_to_you` - Ticket atribuído a você (staff)

## ⏱️ Sistema de SLA

### Configurações de SLA por Prioridade

| Prioridade | Primeira Resposta | Resolução |
|------------|-------------------|-----------|
| Baixa      | 8 horas           | 48 horas  |
| Média      | 4 horas           | 24 horas  |
| Alta       | 2 horas           | 12 horas  |
| Urgente    | 1 hora            | 6 horas   |
| Crítica    | 30 minutos        | 3 horas   |

### Verificação Automática

O sistema verifica automaticamente:
- Se a primeira resposta foi dada dentro do prazo
- Se a resolução foi feita dentro do prazo
- Se o SLA foi violado (tickets abertos após o prazo)

## 🔐 Permissões

### Usuários Normais
- Criar tickets
- Ver próprios tickets
- Comentar em próprios tickets
- Fechar próprios tickets
- Reabrir próprios tickets fechados

### Staff/Admin
- Ver todos os tickets
- Atribuir tickets
- Mudar status de qualquer ticket
- Adicionar comentários internos
- Ver comentários internos
- Acessar estatísticas
- Gerenciar anexos

## 📱 Frontend

### Componentes Principais

1. **TicketForm**: Formulário de criação de tickets
2. **TicketList**: Lista de tickets com filtros e paginação
3. **TicketCard**: Card individual de ticket
4. **TicketDetail**: Visualização completa do ticket
5. **TicketComment**: Componente de comentário
6. **TicketFilters**: Filtros avançados

### Páginas

- `/tickets`: Lista de tickets do usuário
- `/tickets/[id]`: Detalhes de um ticket específico
- `/admin/tickets`: Dashboard administrativo

## 🧪 Testes

### Testes Unitários
- `__tests__/lib/ticket-service.test.ts`: Testa funções do serviço

### Testes de API
- `__tests__/api/tickets.test.ts`: Testa endpoints da API

### Testes E2E
- `tests/e2e/tickets.spec.ts`: Testa fluxo completo do usuário

## 🚀 Uso

### Criar um Ticket

```typescript
const response = await fetch('/api/tickets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    subject: 'Problema técnico',
    description: 'Descrição detalhada',
    category: 'technical',
    priority: 'high',
    source: 'web'
  })
});
```

### Listar Tickets

```typescript
const response = await fetch('/api/tickets?status=open&priority=high', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Adicionar Comentário

```typescript
const response = await fetch(`/api/tickets/${ticketId}/comments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    comment: 'Novo comentário',
    is_internal: false
  })
});
```

## 📝 Notas de Implementação

- O sistema usa WebSocket para notificações em tempo real
- Emails são enviados via Nodemailer (configurar SMTP no .env)
- SLA é calculado automaticamente ao criar ticket
- Histórico de mudanças é registrado automaticamente via trigger SQL
- Anexos são armazenados localmente (em produção, usar S3/Cloudinary)

## 🔧 Configuração

### Variáveis de Ambiente

```env
# SMTP para emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha
SMTP_FROM_EMAIL=noreply@rsvgen2.com

# URL da aplicação (para links em emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📚 Referências

- [Documentação da API](./API_DOCUMENTATION.md)
- [Guia de Desenvolvimento](./DEVELOPMENT_GUIDE.md)
- [Arquitetura do Sistema](./ARCHITECTURE.md)

