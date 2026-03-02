# Análise Completa: Sistema de Leilões e Módulos de Turismo

## 📋 Status Atual

### ✅ Funcionalidades Implementadas

1. **Dashboard Principal de Módulos de Turismo**
   - ✅ Página: `/dashboard/modulos-turismo`
   - ✅ Componente: `ModulosTurismoDashboard`
   - ✅ Funcionalidade: Navegação entre módulos (Leilões, Excursões, Viagens em Grupo)

2. **Dashboard de Leilões**
   - ✅ Componente: `LeiloesDashboard`
   - ✅ Funcionalidades:
     - Estatísticas (Leilões Ativos, Total de Lances, Receita Total, Usuários Ativos)
     - Ações rápidas
     - Próximos leilões

3. **Dashboard de Excursões**
   - ✅ Componente: `ExcursoesDashboard`
   - ✅ Funcionalidades:
     - Estatísticas (Total, Em Planejamento, Em Andamento, Concluídas)
     - Ações rápidas
     - Próximas excursões

4. **Dashboard de Viagens em Grupo**
   - ✅ Componente: `ViagensGrupoDashboard`
   - ✅ Funcionalidades:
     - Estatísticas (Grupos Ativos, Participantes, Wishlists, Receita Total)
     - Ações rápidas
     - Grupos recentes

5. **Banco de Dados**
   - ✅ Tabela `auctions` criada
   - ✅ Tabela `bids` criada
   - ✅ Migration: `001-create-leiloes-tables.sql`

### ❌ Páginas Faltando (404)

#### Módulo de Leilões
1. ❌ `/dashboard/leiloes` - Lista de todos os leilões
2. ❌ `/dashboard/leiloes/novo` - Criar novo leilão
3. ❌ `/dashboard/leiloes/flash-deals` - Flash Deals ativos
4. ❌ `/dashboard/leiloes/relatorios` - Relatórios de leilões
5. ❌ `/dashboard/leiloes/[id]` - Detalhes/Edição de leilão específico

#### Módulo de Excursões
1. ❌ `/dashboard/excursoes` - Lista de todas as excursões
2. ❌ `/dashboard/excursoes/nova` - Criar nova excursão
3. ❌ `/dashboard/excursoes/roteiros` - Gerenciar roteiros
4. ❌ `/dashboard/excursoes/participantes` - Gerenciar participantes
5. ❌ `/dashboard/excursoes/[id]` - Detalhes/Edição de excursão específica

#### Módulo de Viagens em Grupo
1. ❌ `/dashboard/viagens-grupo` - Lista de todos os grupos
2. ❌ `/dashboard/viagens-grupo/nova` - Criar novo grupo
3. ❌ `/dashboard/viagens-grupo/wishlists` - Wishlists compartilhadas
4. ❌ `/dashboard/viagens-grupo/pagamentos` - Pagamentos divididos
5. ❌ `/dashboard/viagens-grupo/[id]` - Detalhes/Edição de grupo específico

## 🗂️ Estrutura de Arquivos Necessária

```
pages/dashboard/
├── modulos-turismo.tsx ✅ (existe)
├── leiloes/
│   ├── index.tsx ❌ (lista de leilões)
│   ├── novo.tsx ❌ (criar leilão)
│   ├── flash-deals.tsx ❌ (flash deals)
│   ├── relatorios.tsx ❌ (relatórios)
│   └── [id].tsx ❌ (detalhes/edição)
├── excursoes/
│   ├── index.tsx ❌ (lista de excursões)
│   ├── nova.tsx ❌ (criar excursão)
│   ├── roteiros.tsx ❌ (roteiros)
│   ├── participantes.tsx ❌ (participantes)
│   └── [id].tsx ❌ (detalhes/edição)
└── viagens-grupo/
    ├── index.tsx ❌ (lista de grupos)
    ├── nova.tsx ❌ (criar grupo)
    ├── wishlists.tsx ❌ (wishlists)
    ├── pagamentos.tsx ❌ (pagamentos)
    └── [id].tsx ❌ (detalhes/edição)
```

## 📊 Funcionalidades Detalhadas por Módulo

### 🎯 Módulo de Leilões

#### 1. Lista de Leilões (`/dashboard/leiloes`)
**Funcionalidades:**
- Listar todos os leilões (ativos, agendados, finalizados)
- Filtros: status, tipo (leilão/flash deal), data
- Busca por título/descrição
- Ordenação: data, preço, lances
- Paginação
- Ações: Ver detalhes, Editar, Cancelar, Finalizar

#### 2. Criar Novo Leilão (`/dashboard/leiloes/novo`)
**Funcionalidades:**
- Formulário de criação:
  - Título
  - Descrição
  - Tipo: Leilão ou Flash Deal
  - Preço inicial
  - Preço de reserva (opcional)
  - Data/hora de início
  - Data/hora de término
  - Desconto percentual (para Flash Deals)
  - Máximo de participantes (para Flash Deals)
  - Propriedade relacionada (opcional)
- Validações
- Preview antes de salvar

#### 3. Detalhes/Edição de Leilão (`/dashboard/leiloes/[id]`)
**Funcionalidades:**
- Visualizar detalhes completos
- Editar informações (se permitido)
- Ver histórico de lances
- Gerenciar participantes
- Cancelar/Finalizar leilão
- Ver estatísticas em tempo real

#### 4. Flash Deals (`/dashboard/leiloes/flash-deals`)
**Funcionalidades:**
- Listar apenas Flash Deals
- Filtros por status e data
- Contador regressivo
- Gerenciar ofertas relâmpago

#### 5. Relatórios (`/dashboard/leiloes/relatorios`)
**Funcionalidades:**
- Relatório de receita
- Relatório de participação
- Relatório de leilões por período
- Gráficos e estatísticas
- Exportar relatórios (PDF, Excel)

### 🗺️ Módulo de Excursões

#### 1. Lista de Excursões (`/dashboard/excursoes`)
**Funcionalidades:**
- Listar todas as excursões
- Filtros: status, destino, data
- Busca
- Ordenação
- Paginação

#### 2. Criar Nova Excursão (`/dashboard/excursoes/nova`)
**Funcionalidades:**
- Formulário de criação:
  - Nome da excursão
  - Destino
  - Data de início
  - Data de término
  - Descrição
  - Roteiro
  - Preço
  - Vagas disponíveis
  - Inclui (transporte, hospedagem, refeições)
- Validações

#### 3. Gerenciar Roteiros (`/dashboard/excursoes/roteiros`)
**Funcionalidades:**
- Criar/editar roteiros
- Adicionar atividades
- Definir horários
- Gerenciar pontos de interesse

#### 4. Gerenciar Participantes (`/dashboard/excursoes/participantes`)
**Funcionalidades:**
- Listar participantes
- Adicionar/remover participantes
- Gerenciar pagamentos
- Enviar notificações

### 👥 Módulo de Viagens em Grupo

#### 1. Lista de Grupos (`/dashboard/viagens-grupo`)
**Funcionalidades:**
- Listar todos os grupos
- Filtros: status, destino, data
- Busca
- Ordenação

#### 2. Criar Novo Grupo (`/dashboard/viagens-grupo/nova`)
**Funcionalidades:**
- Formulário de criação:
  - Nome do grupo
  - Destino
  - Data prevista
  - Descrição
  - Limite de participantes
  - Configurações de privacidade
- Validações

#### 3. Wishlists Compartilhadas (`/dashboard/viagens-grupo/wishlists`)
**Funcionalidades:**
- Visualizar wishlists do grupo
- Adicionar itens à wishlist
- Votar em itens
- Compartilhar wishlist

#### 4. Pagamentos Divididos (`/dashboard/viagens-grupo/pagamentos`)
**Funcionalidades:**
- Visualizar pagamentos do grupo
- Dividir custos
- Gerenciar pagamentos individuais
- Histórico de transações

## 🔌 APIs Necessárias (Backend)

### Status do Backend
- ⚠️ Diretórios criados mas vazios:
  - `backend/src/api/v1/leiloes/` (vazio)
  - `backend/src/api/v1/excursoes/` (vazio)
  - `backend/src/api/v1/viagens-grupo/` (vazio)
  - `backend/src/services/leiloes/` (vazio)
  - `backend/src/services/excursoes/` (vazio)
  - `backend/src/services/viagens-grupo/` (vazio)

### Leilões - APIs Necessárias
- `GET /api/v1/leiloes` - Listar leilões
- `GET /api/v1/leiloes/:id` - Detalhes do leilão
- `POST /api/v1/leiloes` - Criar leilão
- `PUT /api/v1/leiloes/:id` - Atualizar leilão
- `DELETE /api/v1/leiloes/:id` - Cancelar leilão
- `POST /api/v1/leiloes/:id/lances` - Fazer lance
- `GET /api/v1/leiloes/:id/lances` - Listar lances
- `GET /api/v1/leiloes/flash-deals` - Listar flash deals
- `GET /api/v1/leiloes/relatorios` - Relatórios

### Excursões - APIs Necessárias
- `GET /api/v1/excursoes` - Listar excursões
- `GET /api/v1/excursoes/:id` - Detalhes da excursão
- `POST /api/v1/excursoes` - Criar excursão
- `PUT /api/v1/excursoes/:id` - Atualizar excursão
- `DELETE /api/v1/excursoes/:id` - Cancelar excursão
- `GET /api/v1/excursoes/:id/participantes` - Listar participantes
- `POST /api/v1/excursoes/:id/participantes` - Adicionar participante
- `DELETE /api/v1/excursoes/:id/participantes/:userId` - Remover participante
- `GET /api/v1/excursoes/:id/roteiros` - Listar roteiros
- `POST /api/v1/excursoes/:id/roteiros` - Criar roteiro

### Viagens em Grupo - APIs Necessárias
- `GET /api/v1/viagens-grupo` - Listar grupos
- `GET /api/v1/viagens-grupo/:id` - Detalhes do grupo
- `POST /api/v1/viagens-grupo` - Criar grupo
- `PUT /api/v1/viagens-grupo/:id` - Atualizar grupo
- `DELETE /api/v1/viagens-grupo/:id` - Excluir grupo
- `GET /api/v1/viagens-grupo/:id/wishlists` - Listar wishlists
- `POST /api/v1/viagens-grupo/:id/wishlists` - Adicionar à wishlist
- `GET /api/v1/viagens-grupo/:id/pagamentos` - Listar pagamentos
- `POST /api/v1/viagens-grupo/:id/pagamentos` - Criar pagamento dividido

## 📝 Próximos Passos

### Fase 1: Frontend (Páginas)
1. **Criar páginas faltantes** (15 páginas)
   - Estrutura de diretórios
   - Componentes básicos
   - Navegação entre páginas

### Fase 2: Backend (APIs)
2. **Criar rotas no backend**
   - `backend/src/api/v1/leiloes/routes.js`
   - `backend/src/api/v1/excursoes/routes.js`
   - `backend/src/api/v1/viagens-grupo/routes.js`

3. **Criar controllers**
   - Controllers para cada módulo
   - Validações de entrada
   - Tratamento de erros

4. **Criar services**
   - Lógica de negócio
   - Integração com banco de dados
   - Regras de negócio específicas

### Fase 3: Integração
5. **Integração frontend-backend**
   - Criar serviços de API no frontend
   - Conectar formulários às APIs
   - Tratamento de erros

### Fase 4: Melhorias
6. **Adicionar validações**
7. **Implementar testes**
8. **Otimizações de performance**

## 🎯 Prioridades

### 🔴 Alta Prioridade (MVP - Mínimo Produto Viável)
1. `/dashboard/leiloes` - Lista de leilões
2. `/dashboard/leiloes/novo` - Criar leilão
3. `/dashboard/leiloes/[id]` - Detalhes/edição
4. APIs básicas de leilões (CRUD completo)

### 🟡 Média Prioridade
5. `/dashboard/excursoes/nova` - Criar excursão
6. `/dashboard/viagens-grupo/nova` - Criar grupo
7. `/dashboard/leiloes/flash-deals` - Flash deals
8. APIs de excursões e viagens-grupo (CRUD básico)

### 🟢 Baixa Prioridade
9. Relatórios (`/dashboard/leiloes/relatorios`)
10. Wishlists (`/dashboard/viagens-grupo/wishlists`)
11. Pagamentos divididos (`/dashboard/viagens-grupo/pagamentos`)
12. Funcionalidades avançadas (roteiros, participantes, etc.)

## 📊 Resumo Executivo

### Total de Páginas: 16
- ✅ Implementadas: 1 (`/dashboard/modulos-turismo`)
- ❌ Faltando: 15 páginas

### Total de APIs: ~25 endpoints
- ✅ Estrutura criada: 0
- ❌ Faltando: ~25 endpoints

### Módulos: 3
- 🎯 **Leilões**: 5 páginas + ~9 APIs
- 🗺️ **Excursões**: 5 páginas + ~10 APIs
- 👥 **Viagens em Grupo**: 5 páginas + ~9 APIs

### Banco de Dados
- ✅ Tabelas de leilões criadas (`auctions`, `bids`)
- ❌ Tabelas de excursões (a criar)
- ❌ Tabelas de viagens-grupo (a criar)

### Tempo Estimado
- **Fase 1 (Frontend)**: ~2-3 semanas
- **Fase 2 (Backend)**: ~2-3 semanas
- **Fase 3 (Integração)**: ~1 semana
- **Fase 4 (Melhorias)**: ~1 semana
- **Total**: ~6-8 semanas para MVP completo

