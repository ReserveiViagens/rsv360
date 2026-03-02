# 📚 DOCUMENTAÇÃO DETALHADA DE MÓDULOS - RSV 360

**Data:** 2025-12-13  
**Versão:** 2.0.0

---

## 📋 ÍNDICE

1. [Smart Pricing](#1-smart-pricing)
2. [Top Host Program](#2-top-host-program)
3. [Group Travel](#3-group-travel)
4. [CRM](#4-crm)
5. [Analytics](#5-analytics)
6. [Insurance](#6-insurance)
7. [Verification](#7-verification)
8. [Quality & Incentives](#8-quality--incentives)

---

## 1. SMART PRICING

### 1.1 Visão Geral

Sistema de precificação inteligente que calcula preços dinâmicos baseado em múltiplos fatores.

### 1.2 Algoritmo de Precificação

**Fatores Considerados:**
1. **Demanda** (ocupação atual e histórica)
2. **Eventos Locais** (Google Calendar, Eventbrite)
3. **Clima** (OpenWeather API)
4. **Competidores** (scraping de Airbnb, Booking.com)
5. **Regras Customizadas** (configuradas pelo host)

**Fórmula:**
```
Preço Final = Preço Base × Multiplicador Demanda × Multiplicador Eventos × Multiplicador Clima × Multiplicador Competição
```

### 1.3 Configuração

**Arquivo:** `lib/smart-pricing-service.ts`

**Configuração por Propriedade:**
```typescript
{
  propertyId: number;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  demandWeight: number;      // Peso do fator demanda (0-1)
  eventsWeight: number;      // Peso do fator eventos (0-1)
  weatherWeight: number;      // Peso do fator clima (0-1)
  competitionWeight: number;  // Peso do fator competição (0-1)
  rules: PricingRule[];      // Regras customizadas
}
```

### 1.4 APIs

**GET /api/pricing/smart/:propertyId**
- Calcula preço inteligente para uma propriedade
- Query params: `date`, `guests`

**GET /api/pricing/analytics/:propertyId**
- Retorna analytics de precificação
- Métricas: receita, ocupação, ROI

**PUT /api/pricing/smart/:propertyId/config**
- Atualiza configuração de precificação

### 1.5 Integrações

- **Google Calendar:** Eventos locais
- **OpenWeather:** Dados climáticos
- **Eventbrite:** Eventos públicos
- **Competitor Scraper:** Preços de competidores

---

## 2. TOP HOST PROGRAM

### 2.1 Visão Geral

Sistema de qualidade e reconhecimento de hosts com níveis, badges e incentivos.

### 2.2 Sistema de Pontuação

**Fatores de Score:**
1. **Avaliações** (peso: 30%)
2. **Taxa de Resposta** (peso: 20%)
3. **Taxa de Cancelamento** (peso: 15%)
4. **Tempo de Resposta** (peso: 15%)
5. **Taxa de Aceitação** (peso: 10%)
6. **Completude do Perfil** (peso: 10%)

**Cálculo:**
```typescript
score = (
  ratings * 0.30 +
  responseRate * 0.20 +
  (1 - cancellationRate) * 0.15 +
  responseTimeScore * 0.15 +
  acceptanceRate * 0.10 +
  profileCompleteness * 0.10
) * 100
```

### 2.3 Níveis

**Regular:** Score < 70  
**Top:** Score 70-89  
**SuperHost:** Score 90+

### 2.4 Badges

1. **SuperHost** - Score 90+
2. **Quick Response** - Responde em < 1 hora
3. **Perfect Rating** - 5 estrelas
4. **High Occupancy** - Ocupação > 80%
5. **Long Term** - Host há mais de 1 ano
6. **Verified** - Propriedade verificada

### 2.5 Sistema de Comissões

**Regular:** 15%  
**Top:** 12%  
**SuperHost:** 10%

### 2.6 APIs

**GET /api/quality/leaderboard/public**
- Leaderboard público de hosts

**GET /api/quality/incentives/:hostId**
- Incentivos de um host

**GET /api/commission/calculate**
- Calcula comissão baseado no nível

---

## 3. GROUP TRAVEL

### 3.1 Visão Geral

Sistema completo para viagens em grupo com wishlists, votação, split payment e chat.

### 3.2 Wishlists Compartilhadas

**Funcionalidades:**
- Criar wishlist compartilhada
- Adicionar itens (propriedades, atividades)
- Compartilhar com membros
- Votação em itens
- Seleção de itens mais votados

**Fluxo:**
1. Organizador cria wishlist
2. Adiciona itens
3. Convida membros
4. Membros votam
5. Organizador seleciona itens

### 3.3 Split Payment

**Algoritmo de Divisão:**
- Divisão igual (padrão)
- Divisão por número de noites
- Divisão customizada

**Fluxo:**
1. Criar divisão de pagamento
2. Definir participantes e valores
3. Enviar convites de pagamento
4. Participantes pagam
5. Sistema confirma quando todos pagaram

### 3.4 Group Chat

**Funcionalidades:**
- Chat em tempo real (WebSocket)
- Mensagens de texto
- Notificações push
- Histórico de mensagens

### 3.5 Calendário Compartilhado

**Funcionalidades:**
- Adicionar eventos
- Visualizar calendário do grupo
- Notificações de eventos
- Sincronização com Google Calendar

### 3.6 APIs

**Wishlists:**
- GET /api/wishlists
- POST /api/wishlists
- GET /api/wishlists/:id
- POST /api/wishlists/:id/items

**Split Payment:**
- POST /api/split-payments
- GET /api/split-payments/:id

**Group Chat:**
- GET /api/group-chats
- POST /api/group-chats
- GET /api/group-chats/:id/messages

**Calendar:**
- GET /api/group-travel/calendar/:groupId
- POST /api/group-travel/calendar/:groupId/events

---

## 4. CRM

### 4.1 Visão Geral

Sistema de gestão de relacionamento com clientes.

### 4.2 Segmentação

**Critérios:**
- Valor total gasto
- Frequência de reservas
- Última reserva
- Preferências
- Comportamento

**Segmentos:**
- VIP
- Frequente
- Ocasional
- Inativo

### 4.3 Campanhas

**Tipos:**
- Email marketing
- Promoções
- Cupons
- Notificações push

### 4.4 Interações

**Tipos:**
- Reservas
- Mensagens
- Avaliações
- Suporte

### 4.5 APIs

**GET /api/crm/customers**
- Listar clientes

**GET /api/crm/customers/:id**
- Detalhes do cliente

**POST /api/crm/campaigns**
- Criar campanha

**GET /api/crm/segments**
- Listar segmentos

---

## 5. ANALYTICS

### 5.1 Visão Geral

Sistema de análises e relatórios avançados.

### 5.2 Métricas Disponíveis

**Receita:**
- Receita total
- Receita por período
- Crescimento
- Previsão

**Ocupação:**
- Taxa de ocupação
- Noites ocupadas
- ADR (Average Daily Rate)
- RevPAR (Revenue per Available Room)

**Clientes:**
- Novos clientes
- Clientes recorrentes
- Lifetime Value
- Churn rate

**Performance:**
- Conversão
- Cancelamentos
- Tempo médio de estadia
- Origem das reservas

### 5.3 Relatórios

**Tipos:**
- Dashboard executivo
- Relatório de receita
- Relatório de ocupação
- Relatório de clientes
- Relatório customizado

### 5.4 APIs

**GET /api/analytics/dashboard**
- Dashboard completo

**GET /api/analytics/revenue**
- Métricas de receita

**GET /api/analytics/occupancy**
- Métricas de ocupação

**GET /api/analytics/forecast**
- Previsão de receita

---

## 6. INSURANCE

### 6.1 Visão Geral

Sistema de seguros para reservas.

### 6.2 Funcionalidades

**Apólices:**
- Criar apólice
- Gerenciar apólices
- Visualizar histórico

**Sinistros:**
- Criar sinistro
- Acompanhar status
- Processar pagamento
- Notificações

### 6.3 Fluxo de Sinistro

1. Usuário cria sinistro
2. Sistema valida dados
3. Sistema envia notificação para seguradora (webhook/email)
4. Sistema envia confirmação para usuário
5. Admin revisa
6. Sistema aprova/rejeita
7. Sistema processa pagamento (se aprovado)
8. Sistema envia confirmação de pagamento

### 6.4 APIs

**POST /api/insurance/file-claim**
- Criar sinistro

**GET /api/insurance/claims**
- Listar sinistros

**POST /api/insurance/create-policy**
- Criar apólice

---

## 7. VERIFICATION

### 7.1 Visão Geral

Sistema de verificação de propriedades e identidade.

### 7.2 Tipos de Verificação

**Propriedade:**
- Documentos de propriedade
- Licença de funcionamento
- Fotos da propriedade
- Verificação de endereço (Google Maps)

**Identidade:**
- Documento de identidade
- Verificação de antecedentes
- Verificação com IA

### 7.3 Fluxo de Verificação

1. Host solicita verificação
2. Host faz upload de documentos
3. Host faz upload de fotos
4. Sistema valida documentos
5. Sistema verifica endereço (Google Maps)
6. Sistema analisa fotos (Google Vision)
7. Admin revisa
8. Sistema aprova/rejeita
9. Sistema notifica host

### 7.4 APIs

**POST /api/verification/submit/:propertyId**
- Submeter para verificação

**GET /api/verification/status/:propertyId**
- Status da verificação

**POST /api/verification/approve/:id**
- Aprovar verificação (admin)

---

## 8. QUALITY & INCENTIVES

### 8.1 Visão Geral

Sistema de incentivos e qualidade para hosts.

### 8.2 Tipos de Incentivos

**Pontos:**
- Concedidos por ações
- Expiração: 1 ano
- Usáveis para descontos

**Badges:**
- Concedidos por conquistas
- Não expiram
- Visíveis no perfil

**Descontos:**
- Descontos em comissões
- Expiração: 90 dias

**Suporte Prioritário:**
- Suporte mais rápido
- Expiração: 30 dias

**Acesso a Features:**
- Features premium
- Expiração: 60 dias

**Redução de Comissão:**
- Redução permanente
- Expiração: 180 dias

### 8.3 Sistema de Pontos

**Ações que Geram Pontos:**
- Primeira reserva: 100 pontos
- Badge conquistado: 50 pontos
- Score perfeito do mês: 200 pontos
- Verificação aprovada: 150 pontos

### 8.4 Expiração

**Cálculo Automático:**
- Pontos: 1 ano
- Descontos: 90 dias
- Badges: Não expiram
- Suporte prioritário: 30 dias
- Acesso a features: 60 dias
- Redução de comissão: 180 dias

### 8.5 APIs

**GET /api/quality/incentives/:hostId**
- Listar incentivos

**POST /api/quality/incentives/use**
- Usar incentivo

**GET /api/quality/points/:hostId**
- Total de pontos

---

**Última Atualização:** 2025-12-13  
**Status:** ✅ Documentação Completa

