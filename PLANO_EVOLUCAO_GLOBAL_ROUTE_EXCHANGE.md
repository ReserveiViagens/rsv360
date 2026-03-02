# 🚀 Plano de Evolução: The Global Route Exchange

## 📋 Visão Geral

Transformar o módulo de leilões em uma **"Bolsa de Valores de Destinos"** que combina:
- **Mecânica de Mercado Financeiro** (Book de Ofertas: Bid/Ask/Spread)
- **Estrutura de Logística/Sourcing** (RFQs - Request for Proposal)
- **Transparência e Verificação** (Proof of Transparency com hash)
- **Matching Engine em Tempo Real**

---

## 🎨 1. Design System & Temática

### Paleta de Cores
- **Azul Marinho Profundo** (#0A1F3D) - Confiança, Autoridade
- **Grafite** (#2C3E50) - Modernidade, Tecnologia
- **Verde Esmeralda** (#00C896) - Bids vencedores, Lucro, Oportunidades
- **Vermelho Coral** (#FF6B6B) - Alerta, Spread negativo
- **Branco** (#FFFFFF) - Limpeza, Minimalismo
- **Cinza Claro** (#F5F7FA) - Backgrounds

### Estilo Visual
- **Minimalista e Executivo**: Dashboards limpos, foco em dados
- **Gráficos de Velas (Candlesticks)**: Variação de preços de destinos
- **Tipografia**: Sans-serif moderna (Inter, Roboto)
- **Ícones**: Lucide React (já em uso)

### Tom de Voz
- Direto e focado em "Oportunidade de Mercado"
- Linguagem técnica mas acessível
- Ênfase em "Eficiência de Custo" e "Transparência"

---

## 🏗️ 2. Arquitetura do Sistema

### 2.1. Travel Order Book (Lado do Comprador/Finanças)

#### Componentes Principais:
1. **Market Bid** - Ordem de compra do viajante
2. **Ask Price** - Preço mínimo do fornecedor
3. **The Spread** - Margem de negociação/taxa de serviço
4. **Limit Order** - Ordem automática programada

#### Fluxo:
```
Viajante → Cria Bid → Sistema busca Asks compatíveis → Matching → Strike (Negócio fechado)
```

### 2.2. Logistics RFP (Lado do Fornecedor/B2B)

#### Componentes Principais:
1. **Abertura do BID** - Cliente posta necessidade
2. **RFP (Request for Proposal)** - Sistema notifica fornecedores
3. **Bidding Rounds** - Fornecedores enviam propostas
4. **Scoring** - Menor Preço vs. Melhor Rating

#### Fluxo:
```
Cliente → Posta RFP → Sistema notifica fornecedores → Propostas → Avaliação → Seleção
```

---

## 📊 3. Estrutura de Banco de Dados

### 3.1. Tabelas Principais

#### `route_exchange_markets` (Mercados de Destinos)
```sql
CREATE TABLE route_exchange_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_code VARCHAR(10) UNIQUE NOT NULL, -- Ex: PAR, TYO, DXB
  destination_name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  category VARCHAR(50), -- hotel, flight, package, activity
  base_currency VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, closed
  metadata JSONB, -- Informações adicionais (clima, segurança, etc)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `route_bids` (Ordens de Compra - Bids)
```sql
CREATE TABLE route_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES route_exchange_markets(id),
  user_id UUID NOT NULL,
  bid_type VARCHAR(20) NOT NULL, -- market, limit, stop
  bid_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL, -- Número de pessoas/quartos/passagens
  max_price DECIMAL(10,2), -- Para limit orders
  travel_dates JSONB NOT NULL, -- {check_in, check_out, flexible: boolean}
  requirements JSONB, -- Requisitos específicos (hotel 5*, transfer, etc)
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, matched, cancelled, expired
  verification_hash VARCHAR(64), -- Proof of Transparency
  expires_at TIMESTAMP,
  matched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `route_asks` (Ordens de Venda - Asks)
```sql
CREATE TABLE route_asks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES route_exchange_markets(id),
  supplier_id UUID NOT NULL, -- Fornecedor/Operadora
  ask_type VARCHAR(20) NOT NULL, -- market, limit
  ask_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  min_price DECIMAL(10,2), -- Para limit orders
  availability_dates JSONB NOT NULL, -- Datas disponíveis
  supplier_info JSONB, -- Informações do fornecedor (rating, certificações)
  status VARCHAR(20) DEFAULT 'active', -- active, matched, cancelled, expired
  verification_hash VARCHAR(64), -- Proof of Transparency
  expires_at TIMESTAMP,
  matched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `route_matches` (Negócios Fechados - Strikes)
```sql
CREATE TABLE route_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID REFERENCES route_bids(id),
  ask_id UUID REFERENCES route_asks(id),
  market_id UUID REFERENCES route_exchange_markets(id),
  strike_price DECIMAL(10,2) NOT NULL,
  spread DECIMAL(10,2) NOT NULL, -- Margem do sistema
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL, -- Taxa do sistema
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, paid, cancelled
  payment_status VARCHAR(20) DEFAULT 'pending',
  verification_hash VARCHAR(64) NOT NULL, -- Hash do match completo
  matched_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `route_rfps` (Request for Proposal - Licitações)
```sql
CREATE TABLE route_rfps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  destination_code VARCHAR(10),
  travel_dates JSONB NOT NULL,
  requirements JSONB NOT NULL, -- Requisitos técnicos dinâmicos
  budget_range JSONB, -- {min, max}
  participants_count INTEGER NOT NULL,
  category VARCHAR(50), -- group_travel, corporate, event
  status VARCHAR(20) DEFAULT 'open', -- open, bidding, closed, awarded
  bidding_deadline TIMESTAMP NOT NULL,
  auto_attach_requirements BOOLEAN DEFAULT true, -- Dynamic RFQ
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `route_rfp_proposals` (Propostas dos Fornecedores)
```sql
CREATE TABLE route_rfp_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID REFERENCES route_rfps(id),
  supplier_id UUID NOT NULL,
  proposal_data JSONB NOT NULL, -- Dados completos da proposta
  total_price DECIMAL(10,2) NOT NULL,
  quality_score DECIMAL(3,2), -- Score de qualidade (0-5)
  price_score DECIMAL(3,2), -- Score de preço (0-5)
  combined_score DECIMAL(3,2), -- Score combinado
  status VARCHAR(20) DEFAULT 'submitted', -- submitted, shortlisted, awarded, rejected
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `route_price_history` (Histórico de Preços - Para Candlesticks)
```sql
CREATE TABLE route_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES route_exchange_markets(id),
  period_start TIMESTAMP NOT NULL, -- Início do período (hora, dia, semana)
  period_type VARCHAR(10) NOT NULL, -- hour, day, week, month
  open_price DECIMAL(10,2) NOT NULL,
  high_price DECIMAL(10,2) NOT NULL,
  low_price DECIMAL(10,2) NOT NULL,
  close_price DECIMAL(10,2) NOT NULL,
  volume INTEGER NOT NULL, -- Número de matches
  total_value DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `route_verification_logs` (Proof of Transparency)
```sql
CREATE TABLE route_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL, -- bid, ask, match
  entity_id UUID NOT NULL,
  verification_hash VARCHAR(64) NOT NULL,
  previous_hash VARCHAR(64), -- Para cadeia de verificação
  data_snapshot JSONB NOT NULL, -- Snapshot dos dados no momento
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2. Índices para Performance
```sql
-- Índices para queries rápidas
CREATE INDEX idx_bids_market_status ON route_bids(market_id, status);
CREATE INDEX idx_bids_price ON route_bids(bid_price DESC);
CREATE INDEX idx_bids_user ON route_bids(user_id);
CREATE INDEX idx_asks_market_status ON route_asks(market_id, status);
CREATE INDEX idx_asks_price ON route_asks(ask_price ASC);
CREATE INDEX idx_matches_market ON route_matches(market_id);
CREATE INDEX idx_price_history_market_period ON route_price_history(market_id, period_start);
CREATE INDEX idx_rfps_status_deadline ON route_rfps(status, bidding_deadline);
```

---

## ⚙️ 4. Backend - APIs e Serviços

### 4.1. Order Book Service (`orderBookService.js`)

#### Funcionalidades:
- `getOrderBook(marketId)` - Retorna book completo (bids e asks ordenados)
- `placeBid(bidData)` - Cria nova ordem de compra
- `placeAsk(askData)` - Cria nova ordem de venda
- `cancelOrder(orderId, orderType)` - Cancela ordem
- `getSpread(marketId)` - Calcula spread atual
- `getPriceHistory(marketId, period)` - Histórico para gráficos

### 4.2. Matching Engine (`matchingEngine.js`)

#### Funcionalidades:
- `matchOrders()` - Motor de matching em tempo real
- `checkForMatches(bidId, askId)` - Verifica compatibilidade
- `executeMatch(bidId, askId)` - Executa o match (strike)
- `calculateSpread(bidPrice, askPrice)` - Calcula spread
- `notifyMatch(bidId, askId)` - Notifica partes envolvidas

### 4.3. RFQ Service (`rfqService.js`)

#### Funcionalidades:
- `createRFP(rfpData)` - Cria novo RFP
- `getDynamicRequirements(destination)` - Gera requisitos automáticos
- `notifySuppliers(rfpId)` - Notifica fornecedores qualificados
- `submitProposal(rfpId, proposalData)` - Submete proposta
- `evaluateProposals(rfpId)` - Avalia e ranqueia propostas
- `awardRFP(rfpId, proposalId)` - Seleciona vencedor

### 4.4. Verification Service (`verificationService.js`)

#### Funcionalidades:
- `generateHash(entityData)` - Gera hash SHA-256
- `verifyHash(entityId, hash)` - Verifica integridade
- `createVerificationLog(entityType, entityId, data)` - Cria log de verificação
- `getVerificationChain(entityId)` - Retorna cadeia de verificação

### 4.5. Price History Service (`priceHistoryService.js`)

#### Funcionalidades:
- `recordPriceSnapshot(marketId, price, volume)` - Registra snapshot
- `getCandlestickData(marketId, period, timeframe)` - Dados para gráfico
- `calculateIndicators(marketId)` - Calcula indicadores técnicos

---

## 🎨 5. Frontend - Componentes e Páginas

### 5.1. Componentes Reutilizáveis

#### `OrderBook.tsx` - Visualização do Book de Ofertas
- Tabela de Bids (ordem decrescente de preço)
- Tabela de Asks (ordem crescente de preço)
- Spread visual destacado
- Atualização em tempo real (WebSocket)

#### `CandlestickChart.tsx` - Gráfico de Velas
- Biblioteca: Recharts ou Chart.js
- Mostra variação de preços por período
- Indicadores: Médias móveis, volumes

#### `BidForm.tsx` - Formulário de Bid
- Tipo: Market, Limit, Stop
- Datas de viagem (com flexibilidade)
- Requisitos dinâmicos baseados no destino

#### `AskForm.tsx` - Formulário de Ask (Fornecedor)
- Preço e quantidade
- Datas de disponibilidade
- Informações do fornecedor

#### `RFPCard.tsx` - Card de RFP
- Informações do RFP
- Status e deadline
- Botão para submeter proposta

#### `ProposalForm.tsx` - Formulário de Proposta
- Campos dinâmicos baseados nos requisitos do RFP
- Upload de documentos
- Cálculo automático de scores

#### `MatchNotification.tsx` - Notificação de Match
- Alerta quando há match
- Detalhes do strike
- Ações: Confirmar, Rejeitar

#### `VerificationBadge.tsx` - Badge de Transparência
- Mostra hash de verificação
- Link para verificação completa
- Ícone de cadeado

### 5.2. Páginas Principais

#### `/dashboard/route-exchange` - Dashboard Principal
- Visão geral dos mercados
- Gráficos de principais destinos
- Últimos matches
- Estatísticas gerais

#### `/dashboard/route-exchange/markets` - Lista de Mercados
- Grid de cards de destinos
- Filtros por categoria, país
- Busca

#### `/dashboard/route-exchange/markets/[code]` - Detalhes do Mercado
- Order Book completo
- Gráfico de candlesticks
- Histórico de matches
- Formulários de Bid/Ask

#### `/dashboard/route-exchange/my-bids` - Meus Bids
- Lista de bids ativos
- Histórico
- Ações: Cancelar, Editar

#### `/dashboard/route-exchange/my-asks` - Minhas Asks (Fornecedor)
- Lista de asks ativos
- Histórico
- Ações: Cancelar, Editar

#### `/dashboard/route-exchange/matches` - Meus Matches
- Lista de matches
- Status de pagamento
- Ações: Confirmar, Pagar

#### `/dashboard/route-exchange/rfps` - RFPs Disponíveis
- Lista de RFPs abertos
- Filtros
- Botão para criar RFP

#### `/dashboard/route-exchange/rfps/[id]` - Detalhes do RFP
- Informações completas
- Lista de propostas (se fornecedor)
- Formulário de proposta

#### `/dashboard/route-exchange/rfps/new` - Criar RFP
- Formulário completo
- Dynamic requirements
- Preview

#### `/dashboard/route-exchange/analytics` - Analytics
- Gráficos de performance
- Análise de spreads
- Tendências de mercado

---

## 🔄 6. Fluxo de Processo Completo

### 6.1. Fluxo de Bid/Ask Matching

```
1. Viajante cria Bid
   ↓
2. Sistema gera hash de verificação
   ↓
3. Bid aparece no Order Book
   ↓
4. Matching Engine verifica Asks compatíveis
   ↓
5. Se preços se tocam → Match automático
   ↓
6. Sistema cria Strike (match)
   ↓
7. Notifica ambas as partes
   ↓
8. Confirmação e pagamento
```

### 6.2. Fluxo de RFP

```
1. Cliente cria RFP
   ↓
2. Sistema gera requisitos dinâmicos (Dynamic RFQ)
   ↓
3. Sistema notifica fornecedores qualificados
   ↓
4. Fornecedores submetem propostas
   ↓
5. Sistema calcula scores (preço + qualidade)
   ↓
6. Cliente avalia e seleciona vencedor
   ↓
7. Contrato gerado
```

---

## 🚀 7. Implementação - Ordem de Execução

### Fase 1: Fundação (Semana 1-2)
- [ ] Criar migrations do banco de dados
- [ ] Implementar Order Book Service básico
- [ ] Criar APIs básicas (GET/POST bids, asks)
- [ ] Implementar Verification Service

### Fase 2: Matching Engine (Semana 3-4)
- [ ] Implementar Matching Engine
- [ ] WebSocket para atualizações em tempo real
- [ ] Sistema de notificações
- [ ] Testes de matching

### Fase 3: Frontend - Order Book (Semana 5-6)
- [ ] Componente OrderBook
- [ ] Página de mercado individual
- [ ] Formulários de Bid/Ask
- [ ] Integração com WebSocket

### Fase 4: RFQ System (Semana 7-8)
- [ ] RFQ Service completo
- [ ] Dynamic Requirements Engine
- [ ] Sistema de scoring
- [ ] Páginas de RFP

### Fase 5: Analytics & Charts (Semana 9-10)
- [ ] Price History Service
- [ ] Componente CandlestickChart
- [ ] Página de Analytics
- [ ] Indicadores técnicos

### Fase 6: Polimento (Semana 11-12)
- [ ] Proof of Transparency UI
- [ ] Testes end-to-end
- [ ] Otimizações de performance
- [ ] Documentação

---

## 📝 8. Diferenciais Estratégicos

### 8.1. Proof of Transparency
- Cada bid/ask/match tem hash SHA-256
- Cadeia de verificação imutável
- Interface para verificar qualquer transação

### 8.2. Dynamic RFQ
- Sistema inteligente que anexa requisitos automáticos
- Ex: Suíça → Seguro viagem obrigatório, traslados de neve
- Reduz propostas incompletas

### 8.3. Real-time Matching Engine
- Matching instantâneo quando preços se tocam
- Notificações em tempo real
- WebSocket para atualizações live

### 8.4. Visualização Tipo Bolsa
- Gráficos de candlesticks
- Order book visual
- Indicadores técnicos
- Análise de tendências

---

## 🎯 9. Métricas de Sucesso

- **Volume de Matches**: Número de negócios fechados
- **Spread Médio**: Margem média do sistema
- **Tempo de Matching**: Velocidade de fechamento
- **Taxa de Conversão RFQ**: % de RFPs que resultam em contrato
- **Transparência**: % de transações verificadas

---

## 📚 10. Próximos Passos Imediatos

1. **Criar migrations do banco de dados**
2. **Implementar Order Book Service básico**
3. **Criar componente OrderBook no frontend**
4. **Configurar WebSocket para tempo real**

---

**Status**: 📋 Plano Completo - Pronto para Implementação
