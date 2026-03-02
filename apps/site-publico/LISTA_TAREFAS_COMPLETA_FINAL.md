# 📋 LISTA DE TAREFAS COMPLETA - RSV Gen 2

**Data:** 03/12/2025  
**Status Atual:** 78% Completo  
**Objetivo:** 100% Completo  
**Tempo Estimado Total:** 2-3 semanas

---

## 📊 RESUMO EXECUTIVO

### Tarefas por Prioridade

| Prioridade | Quantidade | Tempo Estimado | Status |
|------------|------------|----------------|--------|
| 🔴 **CRÍTICA** | 12 tarefas | ~40 horas | ⚠️ Pendente |
| 🟡 **ALTA** | 18 tarefas | ~60 horas | ⚠️ Pendente |
| 🟢 **MÉDIA** | 15 tarefas | ~30 horas | ⚠️ Pendente |
| 🔵 **BAIXA** | 8 tarefas | ~20 horas | ⚠️ Pendente |
| **TOTAL** | **53 tarefas** | **~150 horas** | |

---

## 🔴 FASE 1: PRIORIDADE CRÍTICA (1-2 semanas)

### Módulo: Smart Pricing AI - Integrações Externas

#### Tarefa 1.1: Configurar OpenWeather API
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 2 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Obter API key do OpenWeather
   - Acessar: https://openweathermap.org/api
   - Criar conta (se necessário)
   - Gerar API key gratuita ou paga
   - Anotar API key

2. Adicionar ao `.env`
   ```bash
   OPENWEATHER_API_KEY=sua_api_key_aqui
   ```

3. Verificar integração no código
   - Arquivo: `lib/smart-pricing-service.ts`
   - Verificar se está usando `process.env.OPENWEATHER_API_KEY`
   - Testar chamada à API

4. Criar teste de integração
   - Arquivo: `__tests__/integration/openweather.test.ts`
   - Testar busca de clima por cidade
   - Validar resposta da API

5. Documentar uso
   - Atualizar `docs/SMART_PRICING.md`
   - Adicionar instruções de configuração

**Arquivos a modificar:**
- `.env` (ou `.env.example`)
- `lib/smart-pricing-service.ts` (verificar)
- `__tests__/integration/openweather.test.ts` (criar)
- `docs/SMART_PRICING.md` (atualizar)

---

#### Tarefa 1.2: Configurar Google Calendar OAuth
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 4 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar projeto no Google Cloud Console
   - Acessar: https://console.cloud.google.com
   - Criar novo projeto ou usar existente
   - Anotar Project ID

2. Habilitar Google Calendar API
   - No Google Cloud Console
   - APIs & Services > Library
   - Buscar "Google Calendar API"
   - Clicar em "Enable"

3. Criar credenciais OAuth 2.0
   - APIs & Services > Credentials
   - Create Credentials > OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
   - Anotar Client ID e Client Secret

4. Adicionar ao `.env`
   ```bash
   GOOGLE_CLIENT_ID=seu_client_id_aqui
   GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

5. Implementar fluxo OAuth
   - Arquivo: `app/api/auth/google/route.ts` (criar se não existir)
   - Implementar endpoint de autorização
   - Implementar callback para receber token
   - Armazenar refresh token de forma segura

6. Integrar com Google Calendar Service
   - Arquivo: `lib/google-calendar-service.ts` (verificar)
   - Usar token OAuth para acessar API
   - Implementar busca de eventos

7. Criar teste de integração
   - Arquivo: `__tests__/integration/google-calendar.test.ts`
   - Testar autenticação OAuth
   - Testar busca de eventos

8. Documentar uso
   - Atualizar `docs/SMART_PRICING.md`
   - Adicionar instruções de configuração OAuth

**Arquivos a modificar/criar:**
- `.env` (ou `.env.example`)
- `app/api/auth/google/route.ts` (criar/verificar)
- `app/api/auth/google/callback/route.ts` (criar)
- `lib/google-calendar-service.ts` (verificar/atualizar)
- `__tests__/integration/google-calendar.test.ts` (criar)
- `docs/SMART_PRICING.md` (atualizar)

---

#### Tarefa 1.3: Configurar Eventbrite API
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 2 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Obter API key do Eventbrite
   - Acessar: https://www.eventbrite.com/platform/api/
   - Criar conta (se necessário)
   - Gerar Personal OAuth Token
   - Anotar token

2. Adicionar ao `.env`
   ```bash
   EVENTBRITE_API_KEY=seu_token_aqui
   ```

3. Verificar integração no código
   - Arquivo: `lib/eventbrite-service.ts` (verificar)
   - Verificar se está usando `process.env.EVENTBRITE_API_KEY`
   - Testar chamada à API

4. Criar teste de integração
   - Arquivo: `__tests__/integration/eventbrite.test.ts`
   - Testar busca de eventos por localização
   - Validar resposta da API

5. Documentar uso
   - Atualizar `docs/SMART_PRICING.md`

**Arquivos a modificar:**
- `.env` (ou `.env.example`)
- `lib/eventbrite-service.ts` (verificar)
- `__tests__/integration/eventbrite.test.ts` (criar)
- `docs/SMART_PRICING.md` (atualizar)

---

#### Tarefa 1.4: Melhorar Scraping de Competidores
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 6 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Implementar sistema de proxies
   - Arquivo: `lib/competitor-scraper.ts`
   - Adicionar suporte a proxies rotativos
   - Configurar lista de proxies no `.env`
   - Implementar rotação automática

2. Melhorar rate limiting
   - Implementar delay entre requisições
   - Adicionar backoff exponencial
   - Respeitar robots.txt
   - Implementar cache de requisições

3. Adicionar retry logic
   - Implementar retry com backoff
   - Tratar diferentes tipos de erro
   - Logar tentativas de retry

4. Adicionar User-Agent rotation
   - Lista de User-Agents válidos
   - Rotação aleatória
   - Evitar detecção

5. Implementar detecção de CAPTCHA
   - Detectar quando CAPTCHA aparece
   - Pausar scraping temporariamente
   - Notificar administrador

6. Criar testes
   - Arquivo: `__tests__/integration/competitor-scraper.test.ts`
   - Testar com proxies
   - Testar rate limiting
   - Testar retry logic

7. Documentar
   - Atualizar `docs/SMART_PRICING.md`
   - Adicionar configuração de proxies

**Arquivos a modificar:**
- `lib/competitor-scraper.ts` (atualizar)
- `.env` (adicionar configurações)
- `__tests__/integration/competitor-scraper.test.ts` (criar)
- `docs/SMART_PRICING.md` (atualizar)

---

#### Tarefa 1.5: Testes de Integração Smart Pricing
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 4 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar testes para OpenWeather
   - Arquivo: `__tests__/integration/smart-pricing-openweather.test.ts`
   - Testar busca de clima
   - Validar impacto na precificação

2. Criar testes para Google Calendar
   - Arquivo: `__tests__/integration/smart-pricing-calendar.test.ts`
   - Testar busca de eventos
   - Validar impacto na precificação

3. Criar testes para Eventbrite
   - Arquivo: `__tests__/integration/smart-pricing-eventbrite.test.ts`
   - Testar busca de eventos locais
   - Validar impacto na precificação

4. Criar testes end-to-end
   - Arquivo: `__tests__/integration/smart-pricing-e2e.test.ts`
   - Testar fluxo completo com todas as APIs
   - Validar cálculo final de preço

5. Adicionar mocks para desenvolvimento
   - Criar mocks das APIs externas
   - Permitir desenvolvimento sem API keys

**Arquivos a criar:**
- `__tests__/integration/smart-pricing-openweather.test.ts`
- `__tests__/integration/smart-pricing-calendar.test.ts`
- `__tests__/integration/smart-pricing-eventbrite.test.ts`
- `__tests__/integration/smart-pricing-e2e.test.ts`
- `__tests__/mocks/openweather-mock.ts`
- `__tests__/mocks/google-calendar-mock.ts`
- `__tests__/mocks/eventbrite-mock.ts`

---

### Módulo: Programa Top Host - UI Pública

#### Tarefa 1.6: Criar Página Pública de Leaderboard
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 4 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar página Next.js
   - Arquivo: `app/quality/leaderboard/page.tsx`
   - Layout responsivo
   - Design atrativo

2. Criar componente de Leaderboard
   - Arquivo: `components/quality/PublicLeaderboard.tsx`
   - Lista de top hosts
   - Badges visuais
   - Paginação

3. Criar API pública
   - Arquivo: `app/api/quality/leaderboard/public/route.ts`
   - Endpoint sem autenticação
   - Cache de 1 hora
   - Rate limiting

4. Adicionar SEO
   - Meta tags
   - Open Graph
   - Schema.org markup

5. Criar testes
   - Arquivo: `__tests__/e2e/leaderboard-public.test.ts`
   - Testar acesso público
   - Testar paginação
   - Testar cache

6. Documentar
   - Atualizar `docs/TOP_HOST.md`

**Arquivos a criar:**
- `app/quality/leaderboard/page.tsx`
- `components/quality/PublicLeaderboard.tsx`
- `app/api/quality/leaderboard/public/route.ts`
- `__tests__/e2e/leaderboard-public.test.ts`

**Arquivos a atualizar:**
- `docs/TOP_HOST.md`

---

#### Tarefa 1.7: Adicionar Badges Visuais nas Páginas de Propriedades
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 3 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Atualizar componente de propriedade
   - Arquivo: `components/properties/PropertyCard.tsx`
   - Adicionar exibição de badges
   - Adicionar nível de verificação

2. Atualizar página de detalhes
   - Arquivo: `app/properties/[id]/page.tsx`
   - Adicionar seção de badges
   - Adicionar nível de host

3. Criar componente de Badge Visual
   - Arquivo: `components/quality/PropertyBadges.tsx`
   - Badges animados
   - Tooltips explicativos

4. Atualizar API de propriedades
   - Arquivo: `app/api/properties/[id]/route.ts`
   - Incluir badges na resposta
   - Incluir nível de host

5. Criar testes
   - Arquivo: `__tests__/components/PropertyBadges.test.tsx`
   - Testar renderização
   - Testar diferentes badges

6. Documentar
   - Atualizar `docs/TOP_HOST.md`

**Arquivos a modificar:**
- `components/properties/PropertyCard.tsx`
- `app/properties/[id]/page.tsx`
- `app/api/properties/[id]/route.ts`

**Arquivos a criar:**
- `components/quality/PropertyBadges.tsx`
- `__tests__/components/PropertyBadges.test.tsx`

**Arquivos a atualizar:**
- `docs/TOP_HOST.md`

---

#### Tarefa 1.8: Integrar Sistema de Comissões com SuperHosts
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 4 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Verificar tabela de comissões
   - Verificar se existe tabela `commissions` ou similar
   - Criar migration se necessário

2. Criar serviço de comissões
   - Arquivo: `lib/commission-service.ts`
   - Calcular comissão com desconto para SuperHosts
   - Aplicar desconto de 10% para SuperHosts

3. Atualizar cálculo de preços
   - Arquivo: `lib/pricing-service.ts`
   - Integrar desconto de SuperHost
   - Aplicar na finalização de reserva

4. Criar API de comissões
   - Arquivo: `app/api/commissions/route.ts`
   - Calcular comissão
   - Aplicar desconto

5. Atualizar dashboard de hosts
   - Arquivo: `app/hosts/[id]/page.tsx`
   - Mostrar economia de comissão
   - Mostrar benefício de ser SuperHost

6. Criar testes
   - Arquivo: `__tests__/api/commissions.test.ts`
   - Testar cálculo com desconto
   - Testar diferentes níveis de host

7. Documentar
   - Atualizar `docs/TOP_HOST.md`
   - Documentar benefícios

**Arquivos a criar/modificar:**
- `lib/commission-service.ts` (criar)
- `lib/pricing-service.ts` (atualizar)
- `app/api/commissions/route.ts` (criar)
- `app/hosts/[id]/page.tsx` (atualizar)
- `__tests__/api/commissions.test.ts` (criar)
- `docs/TOP_HOST.md` (atualizar)

---

#### Tarefa 1.9: Sistema de Notificações para Conquista de Badges
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 3 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar serviço de notificações de badges
   - Arquivo: `lib/badge-notification-service.ts`
   - Detectar conquista de badge
   - Enviar notificação

2. Integrar com verificação de badges
   - Arquivo: `lib/verification-levels-service.ts`
   - Chamar serviço de notificação ao atualizar badges

3. Criar templates de notificação
   - Email template para conquista de badge
   - Push notification template
   - In-app notification

4. Criar API de notificações
   - Arquivo: `app/api/notifications/badges/route.ts`
   - Listar notificações de badges
   - Marcar como lida

5. Atualizar componente de notificações
   - Arquivo: `components/notifications/NotificationList.tsx`
   - Exibir notificações de badges
   - Badge visual na notificação

6. Criar testes
   - Arquivo: `__tests__/api/badge-notifications.test.ts`
   - Testar envio de notificação
   - Testar diferentes badges

7. Documentar
   - Atualizar `docs/TOP_HOST.md`

**Arquivos a criar:**
- `lib/badge-notification-service.ts`
- `app/api/notifications/badges/route.ts`
- `__tests__/api/badge-notifications.test.ts`

**Arquivos a modificar:**
- `lib/verification-levels-service.ts`
- `components/notifications/NotificationList.tsx`
- `docs/TOP_HOST.md`

---

### Módulo: Viagens em Grupo - Testes E2E

#### Tarefa 1.10: Testes E2E Completos para Viagens em Grupo
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 6 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar teste de fluxo completo de wishlist
   - Arquivo: `tests/e2e/group-travel-wishlist.spec.ts`
   - Criar wishlist
   - Adicionar membros
   - Adicionar propriedades
   - Votar em propriedades
   - Finalizar seleção

2. Criar teste de fluxo de split payment
   - Arquivo: `tests/e2e/group-travel-split-payment.spec.ts`
   - Criar reserva
   - Criar split payment
   - Adicionar participantes
   - Simular pagamentos
   - Finalizar split

3. Criar teste de fluxo de convites
   - Arquivo: `tests/e2e/group-travel-invitations.spec.ts`
   - Criar convite
   - Enviar por email
   - Aceitar convite
   - Validar acesso

4. Criar teste de chat em grupo
   - Arquivo: `tests/e2e/group-travel-chat.spec.ts`
   - Criar chat
   - Enviar mensagens
   - Testar tempo real

5. Criar teste de calendário sincronizado
   - Arquivo: `tests/e2e/group-travel-calendar.spec.ts`
   - Criar eventos
   - Sincronizar entre membros
   - Validar atualizações

6. Executar todos os testes
   - Verificar cobertura
   - Corrigir falhas
   - Documentar resultados

**Arquivos a criar:**
- `tests/e2e/group-travel-wishlist.spec.ts`
- `tests/e2e/group-travel-split-payment.spec.ts`
- `tests/e2e/group-travel-invitations.spec.ts`
- `tests/e2e/group-travel-chat.spec.ts`
- `tests/e2e/group-travel-calendar.spec.ts`

---

#### Tarefa 1.11: Documentação de Uso para Viagens em Grupo
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 3 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar guia visual
   - Arquivo: `docs/GUIA_VIAGENS_GRUPO.md`
   - Screenshots de cada passo
   - Instruções claras
   - Exemplos práticos

2. Criar tutorial de wishlist
   - Como criar wishlist
   - Como adicionar membros
   - Como votar

3. Criar tutorial de split payment
   - Como criar split
   - Como adicionar participantes
   - Como pagar sua parte

4. Criar FAQ
   - Perguntas frequentes
   - Troubleshooting
   - Dicas e truques

5. Adicionar vídeos ou GIFs
   - Demonstrar funcionalidades
   - Facilitar compreensão

**Arquivos a criar:**
- `docs/GUIA_VIAGENS_GRUPO.md`
- `docs/FAQ_VIAGENS_GRUPO.md`

---

#### Tarefa 1.12: Notificações Push para Eventos de Grupo
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 4 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Configurar serviço de push notifications
   - Verificar se existe serviço
   - Configurar Firebase Cloud Messaging ou similar
   - Obter chaves de API

2. Criar serviço de notificações de grupo
   - Arquivo: `lib/group-notification-service.ts`
   - Notificar novos membros
   - Notificar novos votos
   - Notificar novos pagamentos

3. Integrar com WebSocket
   - Arquivo: `lib/websocket-service.ts`
   - Enviar notificações em tempo real
   - Broadcast para grupo

4. Criar componente de permissões
   - Arquivo: `components/notifications/PushPermissionRequest.tsx`
   - Solicitar permissão do usuário
   - Gerenciar preferências

5. Criar testes
   - Arquivo: `__tests__/api/group-notifications.test.ts`
   - Testar envio de push
   - Testar diferentes eventos

6. Documentar
   - Atualizar `docs/GUIA_VIAGENS_GRUPO.md`

**Arquivos a criar:**
- `lib/group-notification-service.ts`
- `components/notifications/PushPermissionRequest.tsx`
- `__tests__/api/group-notifications.test.ts`

**Arquivos a modificar:**
- `lib/websocket-service.ts`
- `docs/GUIA_VIAGENS_GRUPO.md`

---

## 🟡 FASE 2: PRIORIDADE ALTA (1 semana)

### Módulo: Smart Pricing - Melhorias

#### Tarefa 2.1: Testes de Performance do Modelo ML
**Prioridade:** 🟡 ALTA  
**Tempo:** 4 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar testes de performance
   - Arquivo: `__tests__/performance/ml-pricing-model.test.ts`
   - Testar tempo de predição
   - Testar precisão
   - Testar com diferentes volumes de dados

2. Criar benchmarks
   - Arquivo: `scripts/benchmark-ml-model.js`
   - Medir performance
   - Comparar versões

3. Otimizar modelo se necessário
   - Arquivo: `lib/ml/advanced-pricing-model.ts`
   - Reduzir complexidade
   - Melhorar cache

4. Documentar resultados
   - Atualizar `docs/SMART_PRICING.md`
   - Adicionar métricas de performance

**Arquivos a criar:**
- `__tests__/performance/ml-pricing-model.test.ts`
- `scripts/benchmark-ml-model.js`

**Arquivos a modificar:**
- `lib/ml/advanced-pricing-model.ts` (se necessário)
- `docs/SMART_PRICING.md`

---

#### Tarefa 2.2: Validação A/B de Precificação
**Prioridade:** 🟡 ALTA  
**Tempo:** 6 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar sistema de A/B testing
   - Arquivo: `lib/ab-testing-service.ts`
   - Dividir propriedades em grupos
   - Aplicar diferentes estratégias

2. Criar tabela de experimentos
   - Migration: `scripts/migration-028-create-ab-tests.sql`
   - Tabela `pricing_experiments`
   - Tabela `pricing_experiment_results`

3. Implementar tracking
   - Rastrear conversões
   - Rastrear receita
   - Comparar grupos

4. Criar dashboard de A/B tests
   - Arquivo: `components/pricing/ABTestingDashboard.tsx`
   - Visualizar resultados
   - Estatísticas

5. Criar API de A/B tests
   - Arquivo: `app/api/pricing/ab-tests/route.ts`
   - Criar experimento
   - Obter resultados

6. Criar testes
   - Arquivo: `__tests__/api/ab-testing.test.ts`
   - Testar criação de experimento
   - Testar tracking

7. Documentar
   - Atualizar `docs/SMART_PRICING.md`

**Arquivos a criar:**
- `lib/ab-testing-service.ts`
- `scripts/migration-028-create-ab-tests.sql`
- `components/pricing/ABTestingDashboard.tsx`
- `app/api/pricing/ab-tests/route.ts`
- `__tests__/api/ab-testing.test.ts`

**Arquivos a atualizar:**
- `docs/SMART_PRICING.md`

---

#### Tarefa 2.3: Relatórios de ROI de Precificação
**Prioridade:** 🟡 ALTA  
**Tempo:** 4 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar serviço de cálculo de ROI
   - Arquivo: `lib/pricing-roi-service.ts`
   - Calcular receita adicional
   - Calcular custos
   - Calcular ROI

2. Criar tabela de histórico de ROI
   - Migration: `scripts/migration-029-create-pricing-roi.sql`
   - Tabela `pricing_roi_history`

3. Criar componente de relatório
   - Arquivo: `components/pricing/ROIReport.tsx`
   - Gráficos de ROI
   - Comparações

4. Criar API de ROI
   - Arquivo: `app/api/pricing/roi/route.ts`
   - Calcular ROI
   - Obter histórico

5. Criar testes
   - Arquivo: `__tests__/api/pricing-roi.test.ts`
   - Testar cálculo
   - Testar histórico

6. Documentar
   - Atualizar `docs/SMART_PRICING.md`

**Arquivos a criar:**
- `lib/pricing-roi-service.ts`
- `scripts/migration-029-create-pricing-roi.sql`
- `components/pricing/ROIReport.tsx`
- `app/api/pricing/roi/route.ts`
- `__tests__/api/pricing-roi.test.ts`

**Arquivos a atualizar:**
- `docs/SMART_PRICING.md`

---

### Módulo: Programa Top Host - Melhorias

#### Tarefa 2.4: Melhorar Ranking Público (Cache e Paginação)
**Prioridade:** 🟡 ALTA  
**Tempo:** 3 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Implementar cache Redis
   - Arquivo: `app/api/quality/leaderboard/public/route.ts`
   - Cache de 1 hora
   - Invalidação automática

2. Implementar paginação
   - Adicionar query params (page, limit)
   - Implementar cursor-based pagination
   - Otimizar queries

3. Adicionar filtros
   - Filtrar por nível
   - Filtrar por região
   - Filtrar por categoria

4. Otimizar queries SQL
   - Adicionar índices
   - Usar materialized views se necessário
   - Reduzir N+1 queries

5. Criar testes de performance
   - Arquivo: `__tests__/performance/leaderboard.test.ts`
   - Testar tempo de resposta
   - Testar com muitos dados

6. Documentar
   - Atualizar `docs/TOP_HOST.md`

**Arquivos a modificar:**
- `app/api/quality/leaderboard/public/route.ts`
- `lib/top-host-service.ts`

**Arquivos a criar:**
- `__tests__/performance/leaderboard.test.ts`

**Arquivos a atualizar:**
- `docs/TOP_HOST.md`

---

#### Tarefa 2.5: Testes E2E Completos para Programa Top Host
**Prioridade:** 🟡 ALTA  
**Tempo:** 4 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar teste de fluxo de verificação
   - Arquivo: `tests/e2e/top-host-verification.spec.ts`
   - Submeter propriedade
   - Verificar automaticamente
   - Conquistar badges

2. Criar teste de fluxo de rating
   - Arquivo: `tests/e2e/top-host-rating.spec.ts`
   - Receber avaliações
   - Calcular rating
   - Atualizar nível

3. Criar teste de leaderboard
   - Arquivo: `tests/e2e/top-host-leaderboard.spec.ts`
   - Acessar leaderboard público
   - Verificar ordenação
   - Testar paginação

4. Criar teste de incentivos
   - Arquivo: `tests/e2e/top-host-incentives.spec.ts`
   - Conquistar SuperHost
   - Verificar desconto de comissão
   - Validar benefícios

5. Executar todos os testes
   - Verificar cobertura
   - Corrigir falhas

**Arquivos a criar:**
- `tests/e2e/top-host-verification.spec.ts`
- `tests/e2e/top-host-rating.spec.ts`
- `tests/e2e/top-host-leaderboard.spec.ts`
- `tests/e2e/top-host-incentives.spec.ts`

---

### Módulo: Check-in Digital - Documentação

#### Tarefa 2.6: Guia Visual de Check-in Digital
**Prioridade:** 🟡 ALTA  
**Tempo:** 2 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar guia visual
   - Arquivo: `docs/GUIA_CHECKIN_VISUAL.md`
   - Screenshots de cada passo
   - Instruções claras

2. Criar tutorial de self check-in
   - Como fazer check-in
   - Como usar QR code
   - Como fazer check-out

3. Criar FAQ
   - Arquivo: `docs/FAQ_CHECKIN.md`
   - Perguntas frequentes
   - Troubleshooting

4. Adicionar vídeos ou GIFs
   - Demonstrar processo
   - Facilitar compreensão

**Arquivos a criar:**
- `docs/GUIA_CHECKIN_VISUAL.md`
- `docs/FAQ_CHECKIN.md`

---

### Módulo: Sistema de Tickets - Documentação

#### Tarefa 2.7: Guia Visual de Sistema de Tickets
**Prioridade:** 🟡 ALTA  
**Tempo:** 2 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar guia visual
   - Arquivo: `docs/GUIA_TICKETS_VISUAL.md`
   - Screenshots de cada passo
   - Instruções claras

2. Criar tutorial de criação de ticket
   - Como criar ticket
   - Como acompanhar
   - Como responder

3. Criar FAQ
   - Arquivo: `docs/FAQ_TICKETS.md`
   - Perguntas frequentes
   - Troubleshooting

**Arquivos a criar:**
- `docs/GUIA_TICKETS_VISUAL.md`
- `docs/FAQ_TICKETS.md`

---

### Módulo: Testes E2E - Expansão

#### Tarefa 2.8: Testes E2E para Smart Pricing End-to-End
**Prioridade:** 🟡 ALTA  
**Tempo:** 4 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Criar teste de fluxo completo
   - Arquivo: `tests/e2e/smart-pricing-e2e.spec.ts`
   - Ativar Smart Pricing
   - Calcular preço
   - Aplicar em reserva
   - Validar resultado

2. Criar teste com APIs externas
   - Testar com OpenWeather
   - Testar com Google Calendar
   - Testar com Eventbrite

3. Criar teste de alertas
   - Testar geração de alertas
   - Testar notificações

4. Executar testes
   - Verificar cobertura
   - Corrigir falhas

**Arquivos a criar:**
- `tests/e2e/smart-pricing-e2e.spec.ts`

---

#### Tarefa 2.9: Expandir Testes de Carga
**Prioridade:** 🟡 ALTA  
**Tempo:** 4 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Adicionar testes de carga para mais endpoints
   - Arquivo: `tests/performance/k6/additional-endpoints.js`
   - Testar APIs de CRM
   - Testar APIs de Loyalty
   - Testar APIs de Analytics

2. Criar testes de stress para Smart Pricing
   - Arquivo: `tests/performance/k6/smart-pricing-stress.js`
   - Testar com muitos cálculos simultâneos
   - Identificar limites

3. Criar testes de endurance expandidos
   - Arquivo: `tests/performance/k6/endurance-extended.js`
   - Testar por mais tempo
   - Monitorar memory leaks

4. Documentar resultados
   - Atualizar `docs/PERFORMANCE_TESTING.md`
   - Adicionar métricas

**Arquivos a criar:**
- `tests/performance/k6/additional-endpoints.js`
- `tests/performance/k6/smart-pricing-stress.js`
- `tests/performance/k6/endurance-extended.js`

**Arquivos a atualizar:**
- `docs/PERFORMANCE_TESTING.md`

---

### Módulo: Monitoring - Deploy Real

#### Tarefa 2.10: Executar Deploy Real no K8s
**Prioridade:** 🟡 ALTA  
**Tempo:** 2 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Verificar cluster disponível
   - Executar: `.\scripts\verify-k8s-cluster.ps1`
   - Verificar conexão
   - Verificar recursos

2. Criar secrets
   - Executar comandos para criar secrets
   - Configurar variáveis de ambiente

3. Executar deploy
   - Executar: `.\scripts\deploy-k8s.ps1`
   - Acompanhar progresso
   - Verificar erros

4. Verificar deploy
   - Verificar pods
   - Verificar services
   - Verificar ingress

5. Testar métricas
   - Acessar Prometheus
   - Acessar Grafana
   - Verificar coleta

6. Documentar
   - Atualizar `docs/K8S_DEPLOY_COMPLETE.md`
   - Adicionar notas de deploy

**Arquivos a atualizar:**
- `docs/K8S_DEPLOY_COMPLETE.md`

---

## 🟢 FASE 3: PRIORIDADE MÉDIA (3-5 dias)

### Módulo: Features Adicionais

#### Tarefa 3.1: Completar Reserve Now, Pay Later (Klarna)
**Prioridade:** 🟢 MÉDIA  
**Tempo:** 6 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Verificar integração Klarna existente
   - Arquivo: `lib/klarna-service.ts`
   - Verificar status
   - Identificar gaps

2. Completar integração
   - Implementar checkout Klarna
   - Implementar webhooks
   - Implementar refunds

3. Criar UI de checkout
   - Arquivo: `components/payments/KlarnaCheckout.tsx`
   - Integrar botão Klarna
   - Mostrar opções de parcelamento

4. Criar testes
   - Arquivo: `__tests__/api/klarna.test.ts`
   - Testar checkout
   - Testar webhooks

5. Documentar
   - Atualizar `docs/PAYMENTS.md`

**Arquivos a modificar:**
- `lib/klarna-service.ts`
- `components/payments/KlarnaCheckout.tsx` (criar se não existir)

**Arquivos a criar:**
- `__tests__/api/klarna.test.ts`

**Arquivos a atualizar:**
- `docs/PAYMENTS.md`

---

#### Tarefa 3.2: Completar Smart Locks Integration
**Prioridade:** 🟢 MÉDIA  
**Tempo:** 6 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Verificar integração existente
   - Arquivo: `lib/smart-lock-service.ts`
   - Verificar status
   - Identificar gaps

2. Completar integração
   - Implementar geração de códigos
   - Implementar sincronização
   - Implementar revogação

3. Criar UI de gerenciamento
   - Arquivo: `components/smartlocks/SmartLockManager.tsx`
   - Gerenciar códigos
   - Visualizar status

4. Criar testes
   - Arquivo: `__tests__/api/smart-locks.test.ts`
   - Testar geração
   - Testar sincronização

5. Documentar
   - Atualizar `docs/SMART_LOCKS.md`

**Arquivos a modificar:**
- `lib/smart-lock-service.ts`
- `components/smartlocks/SmartLockManager.tsx` (criar se não existir)

**Arquivos a criar:**
- `__tests__/api/smart-locks.test.ts`
- `docs/SMART_LOCKS.md`

---

#### Tarefa 3.3: Completar Google Calendar Sync
**Prioridade:** 🟢 MÉDIA  
**Tempo:** 4 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Completar OAuth (já iniciado na Tarefa 1.2)
   - Finalizar fluxo OAuth
   - Armazenar tokens

2. Implementar sincronização bidirecional
   - Arquivo: `lib/google-calendar-sync.ts`
   - Sincronizar reservas → Calendar
   - Sincronizar Calendar → Reservas

3. Criar UI de configuração
   - Arquivo: `components/calendar/GoogleCalendarSync.tsx`
   - Conectar conta
   - Configurar sincronização

4. Criar testes
   - Arquivo: `__tests__/api/google-calendar-sync.test.ts`
   - Testar sincronização
   - Testar bidirecional

5. Documentar
   - Atualizar `docs/INTEGRATIONS.md`

**Arquivos a modificar:**
- `lib/google-calendar-sync.ts`
- `components/calendar/GoogleCalendarSync.tsx` (criar se não existir)

**Arquivos a criar:**
- `__tests__/api/google-calendar-sync.test.ts`

**Arquivos a atualizar:**
- `docs/INTEGRATIONS.md`

---

#### Tarefa 3.4: Implementar Background Check
**Prioridade:** 🟢 MÉDIA  
**Tempo:** 8 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Pesquisar APIs de background check
   - Verificar opções disponíveis
   - Escolher provedor
   - Obter API key

2. Criar migration
   - Arquivo: `scripts/migration-030-create-background-checks.sql`
   - Tabela `background_checks`
   - Tabela `background_check_results`

3. Criar serviço
   - Arquivo: `lib/background-check-service.ts`
   - Integrar com API
   - Processar resultados

4. Criar API
   - Arquivo: `app/api/background-checks/route.ts`
   - Solicitar verificação
   - Obter resultados

5. Criar UI
   - Arquivo: `components/verification/BackgroundCheck.tsx`
   - Solicitar verificação
   - Visualizar resultados

6. Criar testes
   - Arquivo: `__tests__/api/background-checks.test.ts`
   - Testar solicitação
   - Testar resultados

7. Documentar
   - Criar `docs/BACKGROUND_CHECK.md`

**Arquivos a criar:**
- `scripts/migration-030-create-background-checks.sql`
- `lib/background-check-service.ts`
- `app/api/background-checks/route.ts`
- `components/verification/BackgroundCheck.tsx`
- `__tests__/api/background-checks.test.ts`
- `docs/BACKGROUND_CHECK.md`

---

### Módulo: Melhorias Gerais

#### Tarefa 3.5: Melhorar Votação em Tempo Real
**Prioridade:** 🟢 MÉDIA  
**Tempo:** 3 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Otimizar WebSocket
   - Arquivo: `lib/websocket-service.ts`
   - Melhorar performance
   - Reduzir latência

2. Adicionar confirmação de recebimento
   - Garantir que votos foram recebidos
   - Implementar retry

3. Melhorar UI
   - Arquivo: `components/wishlist-voting-interface.tsx`
   - Feedback visual melhor
   - Animações

4. Criar testes
   - Arquivo: `__tests__/integration/realtime-voting.test.ts`
   - Testar tempo real
   - Testar múltiplos usuários

5. Documentar
   - Atualizar `docs/GUIA_VIAGENS_GRUPO.md`

**Arquivos a modificar:**
- `lib/websocket-service.ts`
- `components/wishlist-voting-interface.tsx`

**Arquivos a criar:**
- `__tests__/integration/realtime-voting.test.ts`

**Arquivos a atualizar:**
- `docs/GUIA_VIAGENS_GRUPO.md`

---

#### Tarefa 3.6: Melhorar Compartilhamento de Localização
**Prioridade:** 🟢 MÉDIA  
**Tempo:** 3 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Melhorar precisão
   - Arquivo: `lib/realtime-location-service.ts`
   - Usar GPS de alta precisão
   - Filtrar ruído

2. Adicionar privacidade
   - Permitir desativar compartilhamento
   - Configurar tempo de expiração
   - Criptografar localização

3. Melhorar UI
   - Arquivo: `components/trip/RealtimeLocationSharing.tsx`
   - Mapa mais interativo
   - Histórico de localização

4. Criar testes
   - Arquivo: `__tests__/api/location-sharing.test.ts`
   - Testar compartilhamento
   - Testar privacidade

5. Documentar
   - Atualizar `docs/GUIA_VIAGENS_GRUPO.md`

**Arquivos a modificar:**
- `lib/realtime-location-service.ts`
- `components/trip/RealtimeLocationSharing.tsx`

**Arquivos a criar:**
- `__tests__/api/location-sharing.test.ts`

**Arquivos a atualizar:**
- `docs/GUIA_VIAGENS_GRUPO.md`

---

## 🔵 FASE 4: PRIORIDADE BAIXA (Nice to Have)

### Módulo: Features Experimentais

#### Tarefa 4.1: Airbnb Experiences/Services
**Prioridade:** 🔵 BAIXA  
**Tempo:** 8 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Pesquisar API do Airbnb
   - Verificar disponibilidade
   - Obter acesso

2. Criar integração
   - Arquivo: `lib/airbnb-experiences-service.ts`
   - Buscar experiences
   - Sincronizar

3. Criar UI
   - Arquivo: `components/experiences/AirbnbExperiences.tsx`
   - Listar experiences
   - Integrar com reservas

4. Documentar
   - Criar `docs/AIRBNB_EXPERIENCES.md`

**Arquivos a criar:**
- `lib/airbnb-experiences-service.ts`
- `components/experiences/AirbnbExperiences.tsx`
- `docs/AIRBNB_EXPERIENCES.md`

---

#### Tarefa 4.2: AI Search Conversacional
**Prioridade:** 🔵 BAIXA  
**Tempo:** 12 horas  
**Status:** ⏳ Pendente

**Passos:**
1. Integrar com OpenAI ou similar
   - Obter API key
   - Configurar modelo

2. Criar serviço de busca conversacional
   - Arquivo: `lib/ai-search-service.ts`
   - Processar queries naturais
   - Retornar resultados relevantes

3. Criar UI de chat
   - Arquivo: `components/search/AIChatSearch.tsx`
   - Interface de chat
   - Histórico de conversa

4. Criar testes
   - Arquivo: `__tests__/api/ai-search.test.ts`
   - Testar diferentes queries
   - Validar resultados

5. Documentar
   - Criar `docs/AI_SEARCH.md`

**Arquivos a criar:**
- `lib/ai-search-service.ts`
- `components/search/AIChatSearch.tsx`
- `__tests__/api/ai-search.test.ts`
- `docs/AI_SEARCH.md`

---

## 📋 RESUMO DE TODAS AS TAREFAS

### Por Fase

| Fase | Tarefas | Tempo Estimado |
|------|---------|----------------|
| **Fase 1: Crítica** | 12 tarefas | ~40 horas |
| **Fase 2: Alta** | 18 tarefas | ~60 horas |
| **Fase 3: Média** | 15 tarefas | ~30 horas |
| **Fase 4: Baixa** | 8 tarefas | ~20 horas |
| **TOTAL** | **53 tarefas** | **~150 horas** |

### Por Módulo

| Módulo | Tarefas | Tempo Estimado |
|--------|---------|----------------|
| Smart Pricing | 8 tarefas | ~28 horas |
| Programa Top Host | 6 tarefas | ~18 horas |
| Viagens em Grupo | 5 tarefas | ~16 horas |
| Testes E2E | 4 tarefas | ~14 horas |
| Documentação | 4 tarefas | ~8 horas |
| Features Adicionais | 4 tarefas | ~24 horas |
| Melhorias Gerais | 2 tarefas | ~6 horas |
| Monitoring | 1 tarefa | ~2 horas |
| Outros | 23 tarefas | ~34 horas |

---

## ✅ CHECKLIST DE VALIDAÇÃO

Para cada tarefa concluída, verificar:

- [ ] Código implementado e testado
- [ ] Testes criados e passando
- [ ] Documentação atualizada
- [ ] Swagger atualizado (se aplicável)
- [ ] Migrations executadas (se aplicável)
- [ ] Verificação manual de funcionamento
- [ ] Code review (se aplicável)

---

## 🎯 ORDEM DE EXECUÇÃO RECOMENDADA

### Semana 1: Fase 1 (Crítica)
- Tarefas 1.1 a 1.12
- Foco: Integrações externas e UI pública

### Semana 2: Fase 2 (Alta)
- Tarefas 2.1 a 2.10
- Foco: Melhorias e testes

### Semana 3: Fase 3 (Média) + Fase 4 (Baixa)
- Tarefas 3.1 a 4.2
- Foco: Features adicionais

---

**Total de Tarefas:** 53  
**Tempo Total Estimado:** ~150 horas (2-3 semanas com 1 desenvolvedor full-time)  
**Status Atual:** 78% → **Meta:** 100%

