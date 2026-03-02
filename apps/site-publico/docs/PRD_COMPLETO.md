# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD) COMPLETO - RSV 360

**Versão:** 2.0.0  
**Data:** 2025-12-13  
**Status:** ✅ Consolidado do PRD Estrutural

---

## 📑 ÍNDICE

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Requisitos Funcionais](#2-requisitos-funcionais)
3. [Requisitos Não-Funcionais](#3-requisitos-não-funcionais)
4. [Módulos Principais](#4-módulos-principais)
5. [User Stories](#5-user-stories)
6. [Casos de Uso](#6-casos-de-uso)
7. [Arquitetura](#7-arquitetura)
8. [APIs e Integrações](#8-apis-e-integrações)
9. [Banco de Dados](#9-banco-de-dados)
10. [Testes e Qualidade](#10-testes-e-qualidade)

---

## 1. VISÃO GERAL DO SISTEMA

### 1.1 Descrição

O **RSV 360°** é um sistema completo e moderno para gestão de reservas hoteleiras, desenvolvido com tecnologias de ponta e arquitetura escalável. O sistema oferece uma solução completa para agências de viagem, hotéis e operadoras de turismo.

### 1.2 Objetivos Principais

- ✅ Gestão completa de reservas e hospedagem
- ✅ Sistema de precificação inteligente (Smart Pricing)
- ✅ Programa de qualidade e reconhecimento de hosts (Top Host)
- ✅ Viagens em grupo com wishlists compartilhadas
- ✅ Divisão de pagamentos (Split Payment)
- ✅ Chat em grupo para viagens
- ✅ Sistema de convites para viagens
- ✅ Integração com múltiplos gateways de pagamento
- ✅ CRM completo para gestão de clientes
- ✅ Analytics e relatórios avançados
- ✅ PWA (Progressive Web App) com suporte offline

### 1.3 Status Atual

- **Versão:** 2.0.0 (RSV Gen 2)
- **Ambiente:** Desenvolvimento/Produção
- **Cobertura de Testes:** ~71.7% (Backend), ~16.7% (E2E)
- **Status Geral:** ⚠️ Funcional com melhorias necessárias

---

## 2. REQUISITOS FUNCIONAIS

### 2.1 Gestão de Propriedades

**RF-001:** Sistema deve permitir criar, editar e excluir propriedades  
**RF-002:** Sistema deve permitir upload de fotos e documentos  
**RF-003:** Sistema deve permitir verificação de propriedades  
**RF-004:** Sistema deve exibir propriedades com filtros avançados

**Status:** ✅ Implementado

---

### 2.2 Sistema de Reservas

**RF-005:** Sistema deve permitir criar reservas  
**RF-006:** Sistema deve verificar disponibilidade em tempo real  
**RF-007:** Sistema deve calcular valores e taxas automaticamente  
**RF-008:** Sistema deve processar pagamentos  
**RF-009:** Sistema deve enviar confirmações por email

**Status:** ✅ Implementado

---

### 2.3 Smart Pricing

**RF-010:** Sistema deve calcular preços baseado em demanda  
**RF-011:** Sistema deve considerar eventos locais (Google Calendar)  
**RF-012:** Sistema deve considerar clima (OpenWeather)  
**RF-013:** Sistema deve monitorar preços de competidores  
**RF-014:** Sistema deve aplicar regras de precificação customizadas

**Status:** ✅ Implementado

---

### 2.4 Top Host Program

**RF-015:** Sistema deve calcular score de hosts  
**RF-016:** Sistema deve atribuir níveis (Regular, Top, SuperHost)  
**RF-017:** Sistema deve conceder badges  
**RF-018:** Sistema deve exibir leaderboard público  
**RF-019:** Sistema deve aplicar comissões diferenciadas

**Status:** ✅ Implementado

---

### 2.5 Viagens em Grupo

**RF-020:** Sistema deve permitir criar wishlists compartilhadas  
**RF-021:** Sistema deve permitir votação em itens  
**RF-022:** Sistema deve permitir divisão de pagamentos (Split Payment)  
**RF-023:** Sistema deve permitir chat em grupo  
**RF-024:** Sistema deve permitir convites digitais  
**RF-025:** Sistema deve permitir calendário compartilhado

**Status:** ✅ Implementado

---

### 2.6 Seguros

**RF-026:** Sistema deve permitir criar apólices  
**RF-027:** Sistema deve permitir criar sinistros  
**RF-028:** Sistema deve processar pagamentos de sinistros  
**RF-029:** Sistema deve enviar notificações para seguradora  
**RF-030:** Sistema deve enviar confirmações por email

**Status:** ✅ Implementado (FASE 3)

---

### 2.7 Verificação de Propriedades

**RF-031:** Sistema deve permitir solicitar verificação  
**RF-032:** Sistema deve permitir upload de documentos  
**RF-033:** Sistema deve permitir revisão administrativa  
**RF-034:** Sistema deve enviar notificações de status

**Status:** ✅ Implementado

---

### 2.8 Incentivos e Qualidade

**RF-035:** Sistema deve conceder pontos por ações  
**RF-036:** Sistema deve conceder badges  
**RF-037:** Sistema deve calcular expiração de incentivos  
**RF-038:** Sistema deve permitir usar incentivos

**Status:** ✅ Implementado (FASE 3)

---

## 3. REQUISITOS NÃO-FUNCIONAIS

### 3.1 Performance

**RNF-001:** APIs devem responder em < 200ms (p95)  
**RNF-002:** Queries de banco devem executar em < 100ms  
**RNF-003:** Cache hit rate deve ser > 80%  
**RNF-004:** Bundle size deve ser < 500KB (gzipped)

**Status:** ⚠️ Em otimização

---

### 3.2 Segurança

**RNF-005:** Sistema deve usar JWT para autenticação  
**RNF-006:** Sistema deve implementar rate limiting  
**RNF-007:** Sistema deve validar todos os inputs  
**RNF-008:** Sistema deve criptografar dados sensíveis  
**RNF-009:** Sistema deve ser compatível com GDPR/LGPD

**Status:** ✅ Implementado

---

### 3.3 Escalabilidade

**RNF-010:** Sistema deve suportar 1000+ usuários simultâneos  
**RNF-011:** Sistema deve usar cache para queries frequentes  
**RNF-012:** Sistema deve usar connection pooling  
**RNF-013:** Sistema deve ser stateless (exceto sessões)

**Status:** ✅ Implementado

---

### 3.4 Confiabilidade

**RNF-014:** Sistema deve ter 99.9% de uptime  
**RNF-015:** Sistema deve ter backup automático  
**RNF-016:** Sistema deve ter disaster recovery  
**RNF-017:** Sistema deve ter health checks

**Status:** ⚠️ Parcialmente implementado

---

### 3.5 Usabilidade

**RNF-018:** Interface deve ser responsiva  
**RNF-019:** Interface deve ser acessível (WCAG 2.1)  
**RNF-020:** Sistema deve ter suporte offline (PWA)  
**RNF-021:** Sistema deve ter feedback visual claro

**Status:** ✅ Implementado

---

## 4. MÓDULOS PRINCIPAIS

### 4.1 Smart Pricing

**Descrição:** Sistema de precificação inteligente com IA

**Funcionalidades:**
- Cálculo de preços baseado em demanda
- Integração com Google Calendar (eventos)
- Integração com OpenWeather (clima)
- Integração com Eventbrite (eventos públicos)
- Scraping de competidores
- Regras de precificação customizadas
- A/B Testing de preços
- Analytics de ROI

**Status:** ✅ Implementado

---

### 4.2 Top Host Program

**Descrição:** Programa de qualidade e reconhecimento de hosts

**Funcionalidades:**
- Sistema de pontuação (score)
- Níveis: Regular, Top, SuperHost
- Sistema de badges (6 tipos)
- Leaderboard público
- Sistema de comissões diferenciadas
- Incentivos e recompensas

**Status:** ✅ Implementado

---

### 4.3 Group Travel

**Descrição:** Viagens em grupo com funcionalidades colaborativas

**Funcionalidades:**
- Wishlists compartilhadas
- Sistema de votação
- Divisão de pagamentos (Split Payment)
- Chat em grupo
- Convites digitais
- Calendário compartilhado
- Notificações push

**Status:** ✅ Implementado

---

### 4.4 CRM

**Descrição:** Gestão de relacionamento com clientes

**Funcionalidades:**
- Gestão de clientes
- Segmentação
- Campanhas
- Interações
- Analytics de clientes

**Status:** ✅ Implementado

---

### 4.5 Analytics

**Descrição:** Análises e relatórios avançados

**Funcionalidades:**
- Dashboard de analytics
- Previsão de receita
- Heatmap de demanda
- Benchmark de competidores
- Insights automáticos
- Relatórios customizados

**Status:** ✅ Implementado

---

### 4.6 Insurance

**Descrição:** Sistema de seguros

**Funcionalidades:**
- Criação de apólices
- Criação de sinistros
- Processamento de pagamentos
- Notificações para seguradora
- Confirmações por email

**Status:** ✅ Implementado (FASE 3)

---

### 4.7 Verification

**Descrição:** Verificação de propriedades e identidade

**Funcionalidades:**
- Solicitação de verificação
- Upload de documentos
- Revisão administrativa
- Verificação com IA
- Verificação Google Maps

**Status:** ✅ Implementado

---

## 5. USER STORIES

### 5.1 Como Host

**US-001:** Como host, quero criar uma propriedade para poder receber reservas  
**US-002:** Como host, quero verificar minha propriedade para aumentar confiança  
**US-003:** Como host, quero ver meu score para saber como estou me saindo  
**US-004:** Como host, quero ver meus incentivos para usar recompensas  
**US-005:** Como host, quero configurar preços inteligentes para maximizar receita

**Status:** ✅ Implementado

---

### 5.2 Como Hóspede

**US-006:** Como hóspede, quero buscar propriedades para encontrar hospedagem  
**US-007:** Como hóspede, quero fazer uma reserva para garantir minha estadia  
**US-008:** Como hóspede, quero criar uma wishlist compartilhada para planejar viagem em grupo  
**US-009:** Como hóspede, quero dividir pagamento para facilitar viagem em grupo  
**US-010:** Como hóspede, quero criar um sinistro para ser reembolsado

**Status:** ✅ Implementado

---

### 5.3 Como Administrador

**US-011:** Como admin, quero revisar verificações para garantir qualidade  
**US-012:** Como admin, quero processar sinistros para manter sistema funcionando  
**US-013:** Como admin, quero ver analytics para tomar decisões  
**US-014:** Como admin, quero gerenciar usuários para manter segurança

**Status:** ✅ Implementado

---

## 6. CASOS DE USO

### 6.1 Caso de Uso: Criar Reserva

**Ator:** Hóspede  
**Pré-condições:** Hóspede autenticado, propriedade disponível

**Fluxo Principal:**
1. Hóspede busca propriedades
2. Hóspede seleciona propriedade
3. Hóspede escolhe datas
4. Sistema verifica disponibilidade
5. Sistema calcula preço (Smart Pricing)
6. Hóspede confirma reserva
7. Sistema processa pagamento
8. Sistema envia confirmação por email

**Fluxos Alternativos:**
- Propriedade indisponível → Sistema sugere alternativas
- Pagamento falha → Sistema permite tentar novamente

**Status:** ✅ Implementado

---

### 6.2 Caso de Uso: Verificar Propriedade

**Ator:** Host  
**Pré-condições:** Host autenticado, propriedade criada

**Fluxo Principal:**
1. Host solicita verificação
2. Host faz upload de documentos
3. Host faz upload de fotos
4. Sistema envia para revisão
5. Admin revisa
6. Sistema aprova/rejeita
7. Sistema notifica host

**Status:** ✅ Implementado

---

### 6.3 Caso de Uso: Viagem em Grupo

**Ator:** Organizador  
**Pré-condições:** Organizador autenticado

**Fluxo Principal:**
1. Organizador cria wishlist compartilhada
2. Organizador convida membros
3. Membros votam em itens
4. Organizador seleciona itens
5. Sistema cria divisão de pagamento
6. Membros pagam suas partes
7. Sistema confirma reserva

**Status:** ✅ Implementado

---

## 7. ARQUITETURA

### 7.1 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Pages   │  │Components│  │  Hooks   │  │Contexts │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ API Routes
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Next.js API)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Services │  │   Utils  │  │  Schemas │  │  Types  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis    │  │  External   │
│   (Primary)  │  │   (Cache)   │  │    APIs     │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 7.2 Tecnologias

**Frontend:**
- Next.js 14+
- React 18+
- TypeScript 5+
- Tailwind CSS
- shadcn/ui

**Backend:**
- Next.js API Routes
- Node.js 20+
- PostgreSQL 15
- Redis 7

**Infraestrutura:**
- Docker
- Kubernetes
- PM2
- Prometheus
- Grafana

---

## 8. APIS E INTEGRAÇÕES

### 8.1 APIs Internas

**Autenticação:**
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh

**Propriedades:**
- GET /api/properties
- POST /api/properties
- GET /api/properties/:id

**Reservas:**
- GET /api/bookings
- POST /api/bookings
- GET /api/bookings/:code

**Pricing:**
- GET /api/pricing/smart/:propertyId
- GET /api/pricing/analytics/:propertyId

**Quality:**
- GET /api/quality/incentives/:hostId
- GET /api/quality/leaderboard/public

**Insurance:**
- POST /api/insurance/file-claim
- GET /api/insurance/claims

**Group Travel:**
- GET /api/group-travel/calendar/:groupId
- POST /api/group-travel/calendar/:groupId/events

**Status:** ✅ Documentado em `docs/API_DOCUMENTATION.md`

---

### 8.2 Integrações Externas

**Pagamentos:**
- Stripe
- Mercado Pago
- PayPal
- Klarna

**Mapas:**
- Google Maps API
- Google Vision API

**Calendário:**
- Google Calendar

**Eventos:**
- Eventbrite API

**Clima:**
- OpenWeather API

**Feriados:**
- BrasilAPI

**Status:** ✅ Implementado

---

## 9. BANCO DE DADOS

### 9.1 Tabelas Principais

**Core:**
- `users` - Usuários
- `properties` - Propriedades
- `bookings` - Reservas
- `payments` - Pagamentos

**Smart Pricing:**
- `pricing_configs` - Configurações
- `pricing_history` - Histórico
- `competitor_prices` - Competidores

**Top Host:**
- `host_scores` - Pontuações
- `host_badges` - Badges
- `host_points` - Pontos
- `incentive_programs` - Programas

**Group Travel:**
- `shared_wishlists` - Wishlists
- `wishlist_votes` - Votos
- `split_payments` - Divisões
- `group_chats` - Chats

**Insurance:**
- `insurance_policies` - Apólices
- `insurance_claims` - Sinistros

**Verification:**
- `property_verifications` - Verificações

**Status:** ✅ Documentado em `docs/DATABASE_SCHEMA.md`

---

## 10. TESTES E QUALIDADE

### 10.1 Estratégia de Testes

**Testes Unitários:**
- Serviços principais
- Funções utilitárias
- Validações

**Testes de Integração:**
- APIs
- Integrações externas
- Banco de dados

**Testes E2E:**
- Fluxos completos
- User journeys
- Cenários críticos

**Status:** ⚠️ Cobertura: 64.5% (meta: 80%+)

---

### 10.2 Métricas de Qualidade

**Cobertura de Testes:**
- Backend: 71.7% (meta: 90%+)
- E2E: 16.7% (meta: 70%+)
- Total: 64.5% (meta: 80%+)

**Performance:**
- Tempo de resposta API: < 200ms (p95)
- Queries: < 100ms
- Cache hit rate: > 80%

**Status:** ⚠️ Em otimização

---

**Última Atualização:** 2025-12-13  
**Status:** ✅ PRD Consolidado

