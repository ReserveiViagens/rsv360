# 📋 LISTA DE TAREFAS DETALHADA - RSV GEN 2

**Data de Criação:** 22/11/2025  
**Status:** Planejamento Completo  
**Total de Tarefas:** 150+ sub-tarefas

---

## 📊 Índice

1. [🔴 CRÍTICO - 3 Semanas](#crítico---3-semanas)
2. [🟡 ALTA PRIORIDADE - 4-6 Semanas](#alta-prioridade---4-6-semanas)
3. [🟢 MÉDIA PRIORIDADE - 2-3 Meses](#média-prioridade---2-3-meses)

---

## 🔴 CRÍTICO - 3 Semanas

### 📅 Semana 1: Check-in/Check-out Digital (5 dias)

#### Dia 1: Setup e Estrutura Base

**Backend:**
- [ ] **TAREFA 1.1.1:** Criar migration SQL para tabela `digital_checkins`
  - Campos: `id`, `booking_id`, `user_id`, `property_id`, `check_in_code`, `qr_code`, `status`, `check_in_at`, `check_out_at`, `documents_verified`, `created_at`, `updated_at`
  - Índices: `booking_id`, `user_id`, `check_in_code`
  - Estimativa: 1 hora

- [ ] **TAREFA 1.1.2:** Criar migration SQL para tabela `checkin_documents`
  - Campos: `id`, `checkin_id`, `document_type`, `document_url`, `verified`, `verified_at`, `verified_by`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 1.1.3:** Criar migration SQL para tabela `checkin_inspections`
  - Campos: `id`, `checkin_id`, `inspection_type` (before/after), `photos`, `notes`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 1.1.4:** Criar migration SQL para tabela `checkin_access_codes`
  - Campos: `id`, `checkin_id`, `code_type` (qr/smart_lock), `code`, `expires_at`, `used_at`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 1.1.5:** Executar migrations e verificar criação das tabelas
  - Script de verificação
  - Estimativa: 30 minutos

**Frontend:**
- [ ] **TAREFA 1.1.6:** Criar estrutura de pastas para componentes de check-in
  - `components/checkin/`
  - `app/checkin/`
  - Estimativa: 15 minutos

**Total Dia 1:** 4h 45min

---

#### Dia 2: Backend - Serviços e Schemas

**Backend:**
- [ ] **TAREFA 1.2.1:** Criar `lib/schemas/checkin-schemas.ts` com Zod schemas
  - `CheckinRequestSchema`
  - `CheckinDocumentSchema`
  - `CheckinInspectionSchema`
  - `CheckinAccessCodeSchema`
  - Estimativa: 2 horas

- [ ] **TAREFA 1.2.2:** Criar `lib/checkin-service.ts` - Serviço principal
  - Função `createCheckinRequest(bookingId, userId)`
  - Função `generateQRCode(checkinId)`
  - Função `verifyDocuments(checkinId, documents)`
  - Função `processCheckIn(checkinId)`
  - Função `processCheckOut(checkinId)`
  - Função `getCheckinStatus(checkinId)`
  - Estimativa: 4 horas

- [ ] **TAREFA 1.2.3:** Criar `lib/qr-code-generator.ts`
  - Função `generateQRCode(data, options)`
  - Integração com biblioteca QR code
  - Estimativa: 1 hora

- [ ] **TAREFA 1.2.4:** Criar `lib/document-verification-service.ts`
  - Função `verifyDocument(documentUrl, documentType)`
  - Integração com API de validação (mock inicial)
  - Estimativa: 2 horas

- [ ] **TAREFA 1.2.5:** Integrar com Smart Locks existente
  - Modificar `lib/smart-lock-service.ts` para gerar códigos de acesso
  - Função `generateCheckinAccessCode(propertyId, checkinId)`
  - Estimativa: 1 hora

**Total Dia 2:** 10 horas

---

#### Dia 3: Backend - API Routes

**Backend:**
- [ ] **TAREFA 1.3.1:** Criar `app/api/checkin/request/route.ts`
  - POST: Criar solicitação de check-in
  - Validação com Zod
  - Autenticação JWT
  - Rate limiting
  - Estimativa: 2 horas

- [ ] **TAREFA 1.3.2:** Criar `app/api/checkin/[id]/route.ts`
  - GET: Obter status do check-in
  - PUT: Atualizar check-in
  - DELETE: Cancelar check-in
  - Estimativa: 2 horas

- [ ] **TAREFA 1.3.3:** Criar `app/api/checkin/[id]/qr-code/route.ts`
  - GET: Obter QR code do check-in
  - POST: Regenerar QR code
  - Estimativa: 1 hora

- [ ] **TAREFA 1.3.4:** Criar `app/api/checkin/[id]/documents/route.ts`
  - POST: Upload de documentos
  - GET: Listar documentos
  - PUT: Atualizar status de verificação
  - Estimativa: 2 horas

- [ ] **TAREFA 1.3.5:** Criar `app/api/checkin/[id]/verify/route.ts`
  - POST: Verificar documentos e processar check-in
  - Validação de documentos
  - Geração de códigos de acesso
  - Estimativa: 2 horas

- [ ] **TAREFA 1.3.6:** Criar `app/api/checkin/[id]/checkout/route.ts`
  - POST: Processar check-out
  - Validação de vistoria
  - Upload de fotos pós-checkout
  - Estimativa: 2 horas

- [ ] **TAREFA 1.3.7:** Criar `app/api/checkin/scan/route.ts`
  - POST: Escanear QR code (para staff/proprietário)
  - Validação de código
  - Retorno de informações do check-in
  - Estimativa: 1 hora

**Total Dia 3:** 12 horas

---

#### Dia 4: Frontend - Componentes e Páginas

**Frontend:**
- [ ] **TAREFA 1.4.1:** Criar `components/checkin/CheckinRequestForm.tsx`
  - Formulário para solicitar check-in
  - Upload de documentos
  - Validação de campos
  - Estimativa: 3 horas

- [ ] **TAREFA 1.4.2:** Criar `components/checkin/QRCodeDisplay.tsx`
  - Exibição de QR code
  - Botão para baixar QR code
  - Compartilhamento
  - Estimativa: 2 horas

- [ ] **TAREFA 1.4.3:** Criar `components/checkin/CheckinStatus.tsx`
  - Status visual do check-in
  - Timeline de progresso
  - Indicadores de status
  - Estimativa: 2 horas

- [ ] **TAREFA 1.4.4:** Criar `components/checkin/DocumentUpload.tsx`
  - Upload múltiplo de documentos
  - Preview de documentos
  - Validação de tipos
  - Estimativa: 2 horas

- [ ] **TAREFA 1.4.5:** Criar `components/checkin/InspectionForm.tsx`
  - Formulário de vistoria
  - Upload de fotos antes/depois
  - Notas e observações
  - Estimativa: 2 horas

- [ ] **TAREFA 1.4.6:** Criar `app/checkin/[id]/page.tsx`
  - Página principal de check-in
  - Integração de todos os componentes
  - Fluxo completo
  - Estimativa: 3 horas

- [ ] **TAREFA 1.4.7:** Criar `app/checkin/scan/page.tsx`
  - Página para escanear QR code
  - Câmera/input para código
  - Validação e exibição de informações
  - Estimativa: 2 horas

**Total Dia 4:** 16 horas

---

#### Dia 5: Integração, Testes e Finalização

**Backend:**
- [ ] **TAREFA 1.5.1:** Integrar check-in com sistema de reservas
  - Modificar `app/api/bookings/[id]/route.ts`
  - Adicionar endpoint para iniciar check-in
  - Estimativa: 1 hora

- [ ] **TAREFA 1.5.2:** Criar notificações para check-in
  - Email de confirmação
  - WhatsApp com QR code
  - Lembretes automáticos
  - Estimativa: 2 horas

- [ ] **TAREFA 1.5.3:** Criar testes unitários para `checkin-service.ts`
  - Testes de criação
  - Testes de verificação
  - Testes de QR code
  - Estimativa: 2 horas

- [ ] **TAREFA 1.5.4:** Criar testes de API para endpoints de check-in
  - Testes de criação
  - Testes de verificação
  - Testes de check-out
  - Estimativa: 2 horas

**Frontend:**
- [ ] **TAREFA 1.5.5:** Criar testes E2E para fluxo de check-in
  - Teste completo de check-in
  - Teste de upload de documentos
  - Teste de check-out
  - Estimativa: 2 horas

- [ ] **TAREFA 1.5.6:** Ajustes de UI/UX
  - Responsividade
  - Acessibilidade
  - Feedback visual
  - Estimativa: 2 horas

- [ ] **TAREFA 1.5.7:** Documentação
  - Atualizar Swagger
  - Documentar endpoints
  - Criar guia de uso
  - Estimativa: 1 hora

**Total Dia 5:** 12 horas

**TOTAL SEMANA 1:** ~55 horas (5 dias)

---

### 📅 Semana 2: Sistema de Tickets (5 dias)

#### Dia 1: Setup e Estrutura Base

**Backend:**
- [ ] **TAREFA 2.1.1:** Criar migration SQL para tabela `support_tickets`
  - Campos: `id`, `ticket_number`, `user_id`, `subject`, `description`, `category`, `priority`, `status`, `assigned_to`, `created_at`, `updated_at`, `resolved_at`, `sla_due_at`
  - Índices: `user_id`, `status`, `priority`, `ticket_number`
  - Estimativa: 1 hora

- [ ] **TAREFA 2.1.2:** Criar migration SQL para tabela `ticket_comments`
  - Campos: `id`, `ticket_id`, `user_id`, `comment`, `is_internal`, `attachments`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 2.1.3:** Criar migration SQL para tabela `ticket_attachments`
  - Campos: `id`, `ticket_id`, `comment_id`, `file_url`, `file_name`, `file_type`, `file_size`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 2.1.4:** Criar migration SQL para tabela `ticket_history`
  - Campos: `id`, `ticket_id`, `action`, `old_value`, `new_value`, `changed_by`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 2.1.5:** Criar migration SQL para tabela `ticket_sla`
  - Campos: `id`, `ticket_id`, `sla_type`, `target_time`, `actual_time`, `status`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 2.1.6:** Executar migrations e verificar
  - Script de verificação
  - Estimativa: 30 minutos

**Frontend:**
- [ ] **TAREFA 2.1.7:** Criar estrutura de pastas
  - `components/tickets/`
  - `app/tickets/`
  - `app/admin/tickets/`
  - Estimativa: 15 minutos

**Total Dia 1:** 5h 45min

---

#### Dia 2: Backend - Serviços e Schemas

**Backend:**
- [ ] **TAREFA 2.2.1:** Criar `lib/schemas/ticket-schemas.ts` com Zod schemas
  - `TicketCreateSchema`
  - `TicketUpdateSchema`
  - `TicketCommentSchema`
  - `TicketFilterSchema`
  - Estimativa: 2 horas

- [ ] **TAREFA 2.2.2:** Criar `lib/ticket-service.ts` - Serviço principal
  - Função `createTicket(data)`
  - Função `updateTicket(ticketId, data)`
  - Função `assignTicket(ticketId, userId)`
  - Função `addComment(ticketId, comment)`
  - Função `changeStatus(ticketId, status)`
  - Função `getTicketById(ticketId)`
  - Função `listTickets(filters)`
  - Função `calculateSLA(ticketId)`
  - Estimativa: 5 horas

- [ ] **TAREFA 2.2.3:** Criar `lib/sla-service.ts`
  - Função `calculateSLA(priority, category)`
  - Função `checkSLAViolations()`
  - Função `getSLAStatus(ticketId)`
  - Estimativa: 2 horas

- [ ] **TAREFA 2.2.4:** Integrar com WebSocket para notificações
  - Modificar `lib/websocket-server.ts`
  - Eventos de ticket criado/atualizado
  - Notificações em tempo real
  - Estimativa: 1 hora

**Total Dia 2:** 10 horas

---

#### Dia 3: Backend - API Routes

**Backend:**
- [ ] **TAREFA 2.3.1:** Criar `app/api/tickets/route.ts`
  - POST: Criar ticket
  - GET: Listar tickets (com filtros)
  - Validação e autenticação
  - Estimativa: 3 horas

- [ ] **TAREFA 2.3.2:** Criar `app/api/tickets/[id]/route.ts`
  - GET: Obter ticket específico
  - PUT: Atualizar ticket
  - DELETE: Fechar/cancelar ticket
  - Estimativa: 2 horas

- [ ] **TAREFA 2.3.3:** Criar `app/api/tickets/[id]/comments/route.ts`
  - POST: Adicionar comentário
  - GET: Listar comentários
  - Estimativa: 2 horas

- [ ] **TAREFA 2.3.4:** Criar `app/api/tickets/[id]/assign/route.ts`
  - POST: Atribuir ticket
  - PUT: Reatribuir ticket
  - Estimativa: 1 hora

- [ ] **TAREFA 2.3.5:** Criar `app/api/tickets/[id]/status/route.ts`
  - POST: Alterar status
  - Histórico de mudanças
  - Estimativa: 1 hora

- [ ] **TAREFA 2.3.6:** Criar `app/api/tickets/[id]/attachments/route.ts`
  - POST: Upload de anexos
  - GET: Listar anexos
  - DELETE: Remover anexo
  - Estimativa: 2 horas

- [ ] **TAREFA 2.3.7:** Criar `app/api/tickets/stats/route.ts`
  - GET: Estatísticas de tickets
  - Métricas de SLA
  - Dashboard data
  - Estimativa: 2 horas

**Total Dia 3:** 13 horas

---

#### Dia 4: Frontend - Componentes e Páginas

**Frontend:**
- [ ] **TAREFA 2.4.1:** Criar `components/tickets/TicketForm.tsx`
  - Formulário de criação
  - Seleção de categoria/prioridade
  - Upload de anexos
  - Estimativa: 3 horas

- [ ] **TAREFA 2.4.2:** Criar `components/tickets/TicketList.tsx`
  - Lista de tickets
  - Filtros e busca
  - Paginação
  - Estimativa: 3 horas

- [ ] **TAREFA 2.4.3:** Criar `components/tickets/TicketCard.tsx`
  - Card de ticket
  - Status visual
  - Informações resumidas
  - Estimativa: 2 horas

- [ ] **TAREFA 2.4.4:** Criar `components/tickets/TicketDetail.tsx`
  - Detalhes completos
  - Timeline de comentários
  - Histórico de mudanças
  - Estimativa: 4 horas

- [ ] **TAREFA 2.4.5:** Criar `components/tickets/TicketComment.tsx`
  - Componente de comentário
  - Formulário de resposta
  - Anexos
  - Estimativa: 2 horas

- [ ] **TAREFA 2.4.6:** Criar `components/tickets/TicketFilters.tsx`
  - Filtros avançados
  - Busca
  - Ordenação
  - Estimativa: 2 horas

- [ ] **TAREFA 2.4.7:** Criar `app/tickets/page.tsx`
  - Página de tickets do usuário
  - Integração de componentes
  - Estimativa: 2 horas

- [ ] **TAREFA 2.4.8:** Criar `app/tickets/[id]/page.tsx`
  - Página de detalhes
  - Estimativa: 2 horas

- [ ] **TAREFA 2.4.9:** Criar `app/admin/tickets/page.tsx`
  - Dashboard admin
  - Estatísticas
  - Gestão de tickets
  - Estimativa: 3 horas

**Total Dia 4:** 24 horas

---

#### Dia 5: Integração, Testes e Finalização

**Backend:**
- [ ] **TAREFA 2.5.1:** Integrar com sistema de notificações
  - Email de criação
  - Notificações de atualização
  - Alertas de SLA
  - Estimativa: 2 horas

- [ ] **TAREFA 2.5.2:** Criar testes unitários
  - Testes de serviço
  - Testes de SLA
  - Estimativa: 2 horas

- [ ] **TAREFA 2.5.3:** Criar testes de API
  - Testes de criação
  - Testes de atualização
  - Testes de comentários
  - Estimativa: 2 horas

**Frontend:**
- [ ] **TAREFA 2.5.4:** Criar testes E2E
  - Fluxo completo de criação
  - Fluxo de resposta
  - Estimativa: 2 horas

- [ ] **TAREFA 2.5.5:** Integração com WebSocket
  - Notificações em tempo real
  - Atualização automática
  - Estimativa: 2 horas

- [ ] **TAREFA 2.5.6:** Ajustes de UI/UX
  - Responsividade
  - Acessibilidade
  - Feedback visual
  - Estimativa: 2 horas

- [ ] **TAREFA 2.5.7:** Documentação
  - Atualizar Swagger
  - Documentar endpoints
  - Criar guia de uso
  - Estimativa: 1 hora

**Total Dia 5:** 13 horas

**TOTAL SEMANA 2:** ~66 horas (5 dias)

---

### 📅 Semana 3: Monitoring Completo (5 dias) ✅ 95% COMPLETO

#### Dia 1: Prometheus Setup ✅

**Infraestrutura:**
- [x] **TAREFA 3.1.1:** Criar `k8s/prometheus/configmap.yaml` ✅
  - Configuração do Prometheus
  - Scrape configs
  - Alert rules
  - Estimativa: 2 horas

- [x] **TAREFA 3.1.2:** Criar `k8s/prometheus/deployment.yaml` ✅
  - Deployment do Prometheus
  - Persistent volume
  - Service
  - Estimativa: 2 horas

- [x] **TAREFA 3.1.3:** Criar `k8s/prometheus/service.yaml` ✅
  - Service para expor Prometheus
  - Estimativa: 30 minutos

- [x] **TAREFA 3.1.4:** Criar `k8s/prometheus/pvc.yaml` ✅
  - Persistent Volume Claim
  - Estimativa: 30 minutos

- [ ] **TAREFA 3.1.5:** Testar deploy do Prometheus ⏳
  - Verificar acesso
  - Validar configuração
  - Estimativa: 1 hora
  - **Status:** Pendente - Requer cluster K8s

**Backend:**
- [x] **TAREFA 3.1.6:** Instalar `prom-client` no projeto ✅
  - Adicionar dependência
  - Configurar métricas básicas
  - Estimativa: 1 hora

- [x] **TAREFA 3.1.7:** Criar `lib/metrics.ts` ✅
  - Métricas customizadas
  - Contadores
  - Histogramas
  - Gauges
  - Estimativa: 2 horas

**Total Dia 1:** 9 horas

---

#### Dia 2: Métricas de Aplicação ✅

**Backend:**
- [x] **TAREFA 3.2.1:** Criar middleware de métricas HTTP ✅
  - Tempo de resposta
  - Contadores de requisições
  - Status codes
  - Estimativa: 2 horas

- [x] **TAREFA 3.2.2:** Adicionar métricas de negócio ✅
  - Reservas criadas
  - Pagamentos processados
  - Check-ins realizados
  - Tickets criados/resolvidos
  - Estimativa: 3 horas

- [x] **TAREFA 3.2.3:** Adicionar métricas de banco de dados ✅
  - Query duration
  - Connection pool
  - Query errors
  - Estimativa: 2 horas

- [x] **TAREFA 3.2.4:** Adicionar métricas de cache (Redis) ✅
  - Hit/miss ratio
  - Latência
  - Tamanho do cache
  - Estimativa: 2 horas

- [x] **TAREFA 3.2.5:** Criar endpoint `/api/metrics` ✅
  - Expor métricas no formato Prometheus
  - Autenticação
  - Estimativa: 1 hora

- [x] **TAREFA 3.2.6:** Testar coleta de métricas ✅
  - Verificar no Prometheus
  - Validar métricas
  - Estimativa: 1 hora
  - **Status:** Testado localmente

**Total Dia 2:** 11 horas

---

#### Dia 3: Grafana Dashboards ✅

**Infraestrutura:**
- [x] **TAREFA 3.3.1:** Criar `k8s/grafana/deployment.yaml` ✅
  - Deployment do Grafana
  - Persistent volume
  - Service
  - Estimativa: 2 horas

- [x] **TAREFA 3.3.2:** Criar `k8s/grafana/configmap.yaml` ✅
  - Configuração do Grafana
  - Datasource (Prometheus)
  - Estimativa: 1 hora

- [x] **TAREFA 3.3.3:** Criar `k8s/grafana/pvc.yaml` ✅
  - Persistent Volume Claim
  - Estimativa: 30 minutos

- [ ] **TAREFA 3.3.4:** Testar deploy do Grafana ⏳
  - Verificar acesso
  - Configurar datasource
  - Estimativa: 1 hora
  - **Status:** Pendente - Requer cluster K8s

**Dashboards:**
- [x] **TAREFA 3.3.5:** Criar dashboard "Application Overview" ✅
  - Métricas HTTP
  - Taxa de erro
  - Latência
  - Throughput
  - Estimativa: 2 horas

- [x] **TAREFA 3.3.6:** Criar dashboard "Business Metrics" ✅
  - Reservas
  - Pagamentos
  - Check-ins
  - Tickets
  - Estimativa: 2 horas

- [x] **TAREFA 3.3.7:** Criar dashboard "Infrastructure" ✅
  - CPU/Memory
  - Database connections
  - Cache performance
  - Estimativa: 2 horas

- [x] **TAREFA 3.3.8:** Exportar dashboards como JSON ✅
  - Salvar em `k8s/grafana/dashboards/`
  - Versionamento
  - Estimativa: 1 hora

**Total Dia 3:** 11h 30min

---

#### Dia 4: Alertas e Notificações ✅

**Alertas:**
- [x] **TAREFA 3.4.1:** Criar `k8s/prometheus/alert-rules-configmap.yaml` ✅
  - Regras de alerta (18 alertas)
  - High error rate
  - High latency
  - Database connection issues
  - Cache issues
  - Business metrics
  - Estimativa: 2 horas

- [x] **TAREFA 3.4.2:** Configurar Alertmanager ✅
  - Criar `k8s/alertmanager/deployment.yaml`
  - Configuração de notificações
  - Roteamento por severidade
  - Estimativa: 2 horas

- [x] **TAREFA 3.4.3:** Configurar notificações ✅
  - Email (templates prontos)
  - Slack (templates prontos)
  - PagerDuty (opcional - futuro)
  - Estimativa: 2 horas
  - **Status:** Templates criados, requer configuração real

- [ ] **TAREFA 3.4.4:** Testar alertas ⏳
  - Simular condições
  - Verificar notificações
  - Estimativa: 1 hora
  - **Status:** Pendente - Requer cluster K8s e notificações configuradas

**Logs:**
- [ ] **TAREFA 3.4.5:** Configurar Loki (opcional) ⏳
  - Deployment
  - Configuração
  - Integração com Grafana
  - Estimativa: 2 horas
  - **Status:** Opcional - Futuro

- [ ] **TAREFA 3.4.6:** Configurar coleta de logs ⏳
  - Logs da aplicação
  - Logs do Kubernetes
  - Estimativa: 1 hora
  - **Status:** Opcional - Futuro

**Total Dia 4:** 10 horas

---

#### Dia 5: APM e Finalização ⏳

**APM:**
- [ ] **TAREFA 3.5.1:** Configurar APM (opcional - New Relic/DataDog) ⏳
  - Instalação do agente
  - Configuração
  - Estimativa: 2 horas
  - **Status:** Opcional - Futuro

- [ ] **TAREFA 3.5.2:** Adicionar tracing distribuído ⏳
  - OpenTelemetry
  - Jaeger (opcional)
  - Estimativa: 2 horas
  - **Status:** Opcional - Futuro

**Documentação:**
- [x] **TAREFA 3.5.3:** Documentar setup de monitoring ✅
  - Guia de instalação
  - Configuração de dashboards
  - Configuração de alertas
  - Estimativa: 2 horas

- [ ] **TAREFA 3.5.4:** Criar runbook de troubleshooting
  - Problemas comuns
  - Como investigar
  - Ações corretivas
  - Estimativa: 2 horas

**Testes:**
- [ ] **TAREFA 3.5.5:** Testar stack completo
  - Verificar todas as métricas
  - Testar alertas
  - Validar dashboards
  - Estimativa: 2 horas

**Total Dia 5:** 10 horas

**TOTAL SEMANA 3:** ~52 horas (5 dias)

---

## 🟡 ALTA PRIORIDADE - 4-6 Semanas

### 📅 Semana 4: CRM Completo (5 dias)

#### Dia 1: Setup e Estrutura Base

**Backend:**
- [ ] **TAREFA 4.1.1:** Criar migration SQL para tabela `customer_profiles`
  - Campos: `id`, `user_id`, `preferences`, `loyalty_tier`, `total_spent`, `total_bookings`, `last_booking_at`, `created_at`, `updated_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 4.1.2:** Criar migration SQL para tabela `customer_segments`
  - Campos: `id`, `customer_id`, `segment_name`, `segment_type`, `score`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 4.1.3:** Criar migration SQL para tabela `customer_interactions`
  - Campos: `id`, `customer_id`, `interaction_type`, `channel`, `content`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 4.1.4:** Criar migration SQL para tabela `customer_preferences`
  - Campos: `id`, `customer_id`, `preference_key`, `preference_value`, `created_at`, `updated_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 4.1.5:** Executar migrations
  - Script de verificação
  - Estimativa: 30 minutos

**Frontend:**
- [ ] **TAREFA 4.1.6:** Criar estrutura de pastas
  - `components/crm/`
  - `app/crm/`
  - Estimativa: 15 minutos

**Total Dia 1:** 4h 45min

---

#### Dia 2: Backend - Serviços

**Backend:**
- [ ] **TAREFA 4.2.1:** Criar `lib/schemas/crm-schemas.ts`
  - Schemas Zod para CRM
  - Estimativa: 2 horas

- [ ] **TAREFA 4.2.2:** Criar `lib/crm-service.ts`
  - Função `getCustomerProfile(userId)`
  - Função `updateCustomerProfile(userId, data)`
  - Função `getCustomerHistory(userId)`
  - Função `segmentCustomers()`
  - Função `getCustomerSegment(userId)`
  - Função `recordInteraction(userId, interaction)`
  - Função `getCustomerPreferences(userId)`
  - Função `updatePreferences(userId, preferences)`
  - Estimativa: 5 horas

- [ ] **TAREFA 4.2.3:** Criar `lib/customer-segmentation-service.ts`
  - Algoritmo de segmentação
  - RFM analysis
  - Estimativa: 3 horas

**Total Dia 2:** 10 horas

---

#### Dia 3: Backend - API Routes

**Backend:**
- [ ] **TAREFA 4.3.1:** Criar `app/api/crm/customers/route.ts`
  - GET: Listar clientes
  - POST: Criar perfil
  - Estimativa: 2 horas

- [ ] **TAREFA 4.3.2:** Criar `app/api/crm/customers/[id]/route.ts`
  - GET: Obter perfil completo
  - PUT: Atualizar perfil
  - Estimativa: 2 horas

- [ ] **TAREFA 4.3.3:** Criar `app/api/crm/customers/[id]/history/route.ts`
  - GET: Histórico completo
  - Estimativa: 1 hora

- [ ] **TAREFA 4.3.4:** Criar `app/api/crm/customers/[id]/preferences/route.ts`
  - GET: Obter preferências
  - PUT: Atualizar preferências
  - Estimativa: 1 hora

- [ ] **TAREFA 4.3.5:** Criar `app/api/crm/segments/route.ts`
  - GET: Listar segmentos
  - POST: Criar segmento customizado
  - Estimativa: 2 horas

- [ ] **TAREFA 4.3.6:** Criar `app/api/crm/stats/route.ts`
  - GET: Estatísticas do CRM
  - Métricas de clientes
  - Estimativa: 2 horas

**Total Dia 3:** 10 horas

---

#### Dia 4: Frontend - Componentes

**Frontend:**
- [ ] **TAREFA 4.4.1:** Criar `components/crm/CustomerList.tsx`
  - Lista de clientes
  - Filtros e busca
  - Estimativa: 3 horas

- [ ] **TAREFA 4.4.2:** Criar `components/crm/CustomerProfile.tsx`
  - Perfil completo
  - Histórico
  - Preferências
  - Estimativa: 4 horas

- [ ] **TAREFA 4.4.3:** Criar `components/crm/CustomerSegments.tsx`
  - Visualização de segmentos
  - Distribuição
  - Estimativa: 2 horas

- [ ] **TAREFA 4.4.4:** Criar `components/crm/CRMDashboard.tsx`
  - Dashboard principal
  - Métricas
  - Gráficos
  - Estimativa: 4 horas

- [ ] **TAREFA 4.4.5:** Criar `app/crm/page.tsx`
  - Página principal
  - Estimativa: 2 horas

**Total Dia 4:** 15 horas

---

#### Dia 5: Integração e Testes

**Backend:**
- [ ] **TAREFA 4.5.1:** Integrar com sistema de reservas
  - Atualizar perfil ao criar reserva
  - Histórico automático
  - Estimativa: 2 horas

- [ ] **TAREFA 4.5.2:** Criar testes
  - Testes de serviço
  - Testes de API
  - Estimativa: 2 horas

**Frontend:**
- [ ] **TAREFA 4.5.3:** Criar testes E2E
  - Fluxo completo
  - Estimativa: 2 horas

- [ ] **TAREFA 4.5.4:** Documentação
  - Atualizar Swagger
  - Guia de uso
  - Estimativa: 1 hora

**Total Dia 5:** 7 horas

**TOTAL SEMANA 4:** ~47 horas (5 dias)

---

### 📅 Semana 5: Programa de Fidelidade (5 dias)

#### Dia 1: Setup e Estrutura Base

**Backend:**
- [ ] **TAREFA 5.1.1:** Criar migration SQL para tabela `loyalty_programs`
  - Campos: `id`, `name`, `description`, `rules`, `active`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 5.1.2:** Criar migration SQL para tabela `loyalty_points`
  - Campos: `id`, `user_id`, `points`, `expires_at`, `created_at`, `updated_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 5.1.3:** Criar migration SQL para tabela `loyalty_tiers`
  - Campos: `id`, `program_id`, `tier_name`, `min_points`, `benefits`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 5.1.4:** Criar migration SQL para tabela `loyalty_transactions`
  - Campos: `id`, `user_id`, `transaction_type`, `points`, `description`, `booking_id`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 5.1.5:** Criar migration SQL para tabela `loyalty_rewards`
  - Campos: `id`, `program_id`, `reward_name`, `points_cost`, `description`, `active`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 5.1.6:** Criar migration SQL para tabela `loyalty_redemptions`
  - Campos: `id`, `user_id`, `reward_id`, `points_used`, `status`, `created_at`
  - Estimativa: 1 hora

- [ ] **TAREFA 5.1.7:** Executar migrations
  - Script de verificação
  - Estimativa: 30 minutos

**Total Dia 1:** 6h 30min

---

#### Dia 2: Backend - Serviços

**Backend:**
- [ ] **TAREFA 5.2.1:** Criar `lib/schemas/loyalty-schemas.ts`
  - Schemas Zod
  - Estimativa: 2 horas

- [ ] **TAREFA 5.2.2:** Criar `lib/loyalty-service.ts`
  - Função `earnPoints(userId, amount, reason)`
  - Função `redeemPoints(userId, rewardId)`
  - Função `getUserPoints(userId)`
  - Função `getUserTier(userId)`
  - Função `calculateTier(userId)`
  - Função `getAvailableRewards(userId)`
  - Função `getTransactionHistory(userId)`
  - Estimativa: 5 horas

- [ ] **TAREFA 5.2.3:** Integrar com sistema de reservas
  - Pontos ao completar reserva
  - Cálculo automático
  - Estimativa: 2 horas

**Total Dia 2:** 9 horas

---

#### Dia 3: Backend - API Routes

**Backend:**
- [ ] **TAREFA 5.3.1:** Criar `app/api/loyalty/points/route.ts`
  - GET: Obter pontos do usuário
  - POST: Adicionar pontos (admin)
  - Estimativa: 2 horas

- [ ] **TAREFA 5.3.2:** Criar `app/api/loyalty/tier/route.ts`
  - GET: Obter tier atual
  - Estimativa: 1 hora

- [ ] **TAREFA 5.3.3:** Criar `app/api/loyalty/rewards/route.ts`
  - GET: Listar recompensas disponíveis
  - POST: Criar recompensa (admin)
  - Estimativa: 2 horas

- [ ] **TAREFA 5.3.4:** Criar `app/api/loyalty/redeem/route.ts`
  - POST: Resgatar recompensa
  - Estimativa: 2 horas

- [ ] **TAREFA 5.3.5:** Criar `app/api/loyalty/history/route.ts`
  - GET: Histórico de transações
  - Estimativa: 1 hora

**Total Dia 3:** 8 horas

---

#### Dia 4: Frontend - Componentes

**Frontend:**
- [ ] **TAREFA 5.4.1:** Criar `components/loyalty/PointsDisplay.tsx`
  - Exibição de pontos
  - Progresso para próximo tier
  - Estimativa: 2 horas

- [ ] **TAREFA 5.4.2:** Criar `components/loyalty/TierBadge.tsx`
  - Badge do tier
  - Benefícios
  - Estimativa: 2 horas

- [ ] **TAREFA 5.4.3:** Criar `components/loyalty/RewardsList.tsx`
  - Lista de recompensas
  - Filtros
  - Estimativa: 3 horas

- [ ] **TAREFA 5.4.4:** Criar `components/loyalty/TransactionHistory.tsx`
  - Histórico de transações
  - Filtros
  - Estimativa: 2 horas

- [ ] **TAREFA 5.4.5:** Criar `app/loyalty/page.tsx`
  - Página principal
  - Integração de componentes
  - Estimativa: 2 horas

**Total Dia 4:** 11 horas

---

#### Dia 5: Integração e Testes

**Backend:**
- [ ] **TAREFA 5.5.1:** Criar testes
  - Testes de serviço
  - Testes de API
  - Estimativa: 2 horas

**Frontend:**
- [ ] **TAREFA 5.5.2:** Criar testes E2E
  - Fluxo completo
  - Estimativa: 2 horas

- [ ] **TAREFA 5.5.3:** Documentação
  - Atualizar Swagger
  - Guia de uso
  - Estimativa: 1 hora

**Total Dia 5:** 5 horas

**TOTAL SEMANA 5:** ~40 horas (5 dias)

---

### 📅 Semana 6-7: Smart Pricing - Melhorias (10 dias)

#### Semana 6: ML e Scraping

**Backend:**
- [ ] **TAREFA 6.1.1:** Melhorar modelo ML
  - Implementar regressão mais avançada
  - Adicionar features
  - Estimativa: 4 horas

- [ ] **TAREFA 6.1.2:** Criar sistema de treinamento
  - Pipeline de treinamento
  - Validação
  - Estimativa: 4 horas

- [ ] **TAREFA 6.1.3:** Implementar scraping de competidores
  - Scraper Airbnb (mock)
  - Scraper Booking (mock)
  - Estimativa: 6 horas

- [ ] **TAREFA 6.1.4:** Integrar dados de competidores
  - Processamento
  - Armazenamento
  - Estimativa: 3 horas

**Total Semana 6:** 17 horas

---

#### Semana 7: Dashboard e Análise

**Backend:**
- [ ] **TAREFA 7.1.1:** Adicionar análise de sentimento
  - Processar reviews
  - Extrair sentimento
  - Estimativa: 4 horas

- [ ] **TAREFA 7.1.2:** Criar API de recomendações
  - Endpoint de recomendações
  - Alertas de oportunidades
  - Estimativa: 3 horas

**Frontend:**
- [ ] **TAREFA 7.1.3:** Melhorar dashboard
  - Gráficos avançados
  - Tendências
  - Comparação com competidores
  - Estimativa: 6 horas

- [ ] **TAREFA 7.1.4:** Adicionar alertas
  - Notificações de oportunidades
  - Recomendações automáticas
  - Estimativa: 2 horas

**Total Semana 7:** 15 horas

**TOTAL SEMANAS 6-7:** ~32 horas (10 dias)

---

### 📅 Semana 8: Verificação - Melhorias (5 dias)

**Backend:**
- [ ] **TAREFA 8.1.1:** Implementar verificação automática com AI
  - Detecção de qualidade de fotos
  - Validação automática
  - Estimativa: 4 horas

- [ ] **TAREFA 8.1.2:** Integrar Google Maps API
  - Validação de endereço
  - Comparação
  - Estimativa: 3 horas

- [ ] **TAREFA 8.1.3:** Criar sistema de níveis
  - Níveis de verificação
  - Badges
  - Estimativa: 2 horas

**Frontend:**
- [ ] **TAREFA 8.1.4:** Atualizar interface
  - Exibir níveis
  - Badges visuais
  - Estimativa: 3 horas

**Total Semana 8:** 12 horas (5 dias)

---

## 🟢 MÉDIA PRIORIDADE - 2-3 Meses

### Melhorias Incrementais em Features Existentes

#### Viagens em Grupo - Melhorias
- [ ] **TAREFA M.1.1:** Implementar votação em tempo real
- [ ] **TAREFA M.1.2:** Adicionar compartilhamento de localização
- [ ] **TAREFA M.1.3:** Integrar calendário do grupo
- **Estimativa:** 3-5 dias

#### Sistema de Seguros - Melhorias
- [ ] **TAREFA M.2.1:** Integrar múltiplas seguradoras
- [ ] **TAREFA M.2.2:** Criar comparação de preços
- [ ] **TAREFA M.2.3:** Implementar seleção automática
- **Estimativa:** 3-5 dias

### Compliance Avançado
- [ ] **TAREFA M.3.1:** Implementar LGPD/GDPR completo
- [ ] **TAREFA M.3.2:** Criar sistema de backup automatizado
- [ ] **TAREFA M.3.3:** Implementar disaster recovery
- [ ] **TAREFA M.3.4:** Criar logs de auditoria completos
- [ ] **TAREFA M.3.5:** Implementar criptografia avançada
- **Estimativa:** 5 dias

### Testes de Performance
- [ ] **TAREFA M.4.1:** Configurar k6 ou Artillery
- [ ] **TAREFA M.4.2:** Criar testes de carga
- [ ] **TAREFA M.4.3:** Criar testes de stress
- [ ] **TAREFA M.4.4:** Criar testes de endurance
- [ ] **TAREFA M.4.5:** Otimizar baseado em resultados
- **Estimativa:** 3-5 dias

---

## 📊 Resumo Total

### Estimativas por Prioridade

| Prioridade | Semanas | Horas | Dias |
|------------|---------|-------|------|
| **Crítico** | 3 | ~173 | 15 |
| **Alta** | 4-6 | ~131 | 25 |
| **Média** | 2-3 meses | ~50 | 19-25 |
| **TOTAL** | **9-12 semanas** | **~354 horas** | **59-65 dias** |

### Com 1 Desenvolvedor
- **Tempo:** 9-12 semanas (2.5-3 meses)
- **Horas/dia:** 8 horas
- **Dias úteis:** 59-65 dias

### Com 2 Desenvolvedores
- **Tempo:** 5-6 semanas (1.5 meses)
- **Horas/dia:** 8 horas cada
- **Dias úteis:** 30-35 dias

---

## ✅ Checklist de Validação

### Para cada Feature:
- [ ] Migrations criadas e testadas
- [ ] Schemas Zod implementados
- [ ] Serviços backend completos
- [ ] API routes com autenticação
- [ ] Componentes frontend criados
- [ ] Páginas integradas
- [ ] Testes unitários
- [ ] Testes de API
- [ ] Testes E2E
- [ ] Documentação atualizada
- [ ] Swagger atualizado

---

**Última atualização:** 22/11/2025  
**Próxima revisão:** Após conclusão de cada semana

