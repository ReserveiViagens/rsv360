# 📖 CASOS DE USO - RSV 360

**Data:** 2025-12-13  
**Versão:** 2.0.0

---

## 📋 ÍNDICE

1. [Caso de Uso: Criar Reserva](#1-caso-de-uso-criar-reserva)
2. [Caso de Uso: Verificar Propriedade](#2-caso-de-uso-verificar-propriedade)
3. [Caso de Uso: Viagem em Grupo](#3-caso-de-uso-viagem-em-grupo)
4. [Caso de Uso: Smart Pricing](#4-caso-de-uso-smart-pricing)
5. [Caso de Uso: Criar Sinistro](#5-caso-de-uso-criar-sinistro)
6. [Caso de Uso: Conceder Incentivo](#6-caso-de-uso-conceder-incentivo)

---

## 1. CASO DE USO: CRIAR RESERVA

### 1.1 Informações Gerais

**ID:** UC-001  
**Nome:** Criar Reserva  
**Ator Principal:** Hóspede  
**Pré-condições:** 
- Hóspede autenticado
- Propriedade disponível
- Datas selecionadas

**Pós-condições:**
- Reserva criada
- Pagamento processado
- Confirmação enviada

### 1.2 Fluxo Principal

1. Hóspede acessa página da propriedade
2. Hóspede seleciona datas de check-in e check-out
3. Hóspede seleciona número de hóspedes
4. Sistema verifica disponibilidade
5. Sistema calcula preço (Smart Pricing)
6. Sistema exibe preço final e breakdown
7. Hóspede confirma reserva
8. Sistema processa pagamento
9. Sistema cria reserva no banco
10. Sistema envia confirmação por email
11. Sistema atualiza disponibilidade

### 1.3 Fluxos Alternativos

**1.3.1 Propriedade Indisponível**
- Sistema informa indisponibilidade
- Sistema sugere propriedades alternativas
- Caso de uso termina

**1.3.2 Pagamento Falha**
- Sistema informa erro de pagamento
- Sistema permite tentar novamente
- Sistema mantém disponibilidade reservada por 15 minutos

**1.3.3 Preço Mudou**
- Sistema recalcula preço
- Sistema informa mudança
- Hóspede confirma novo preço ou cancela

### 1.4 Regras de Negócio

- Reserva deve ser criada apenas se propriedade estiver disponível
- Preço deve ser calculado usando Smart Pricing
- Pagamento deve ser processado antes de confirmar reserva
- Confirmação deve ser enviada por email

**Status:** ✅ Implementado

---

## 2. CASO DE USO: VERIFICAR PROPRIEDADE

### 2.1 Informações Gerais

**ID:** UC-002  
**Nome:** Verificar Propriedade  
**Ator Principal:** Host  
**Pré-condições:**
- Host autenticado
- Propriedade criada

**Pós-condições:**
- Verificação submetida
- Status atualizado

### 2.2 Fluxo Principal

1. Host acessa página da propriedade
2. Host clica em "Solicitar Verificação"
3. Host faz upload de documentos (propriedade, licença, etc.)
4. Host faz upload de fotos da propriedade
5. Host preenche descrição
6. Host submete verificação
7. Sistema valida documentos
8. Sistema verifica endereço (Google Maps)
9. Sistema analisa fotos (Google Vision)
10. Sistema envia para revisão administrativa
11. Admin revisa verificação
12. Admin aprova/rejeita
13. Sistema atualiza status
14. Sistema notifica host

### 2.3 Fluxos Alternativos

**2.3.1 Documentos Inválidos**
- Sistema informa documentos inválidos
- Host pode fazer upload novamente
- Caso de uso continua

**2.3.2 Endereço Não Encontrado**
- Sistema informa endereço não encontrado
- Host pode corrigir endereço
- Caso de uso continua

**2.3.3 Rejeição**
- Admin rejeita verificação
- Sistema informa motivo
- Host pode corrigir e reenviar

### 2.4 Regras de Negócio

- Verificação requer pelo menos 3 fotos
- Verificação requer pelo menos 1 documento
- Endereço deve ser válido (Google Maps)
- Fotos devem passar análise (Google Vision)

**Status:** ✅ Implementado

---

## 3. CASO DE USO: VIAGEM EM GRUPO

### 3.1 Informações Gerais

**ID:** UC-003  
**Nome:** Viagem em Grupo  
**Ator Principal:** Organizador  
**Pré-condições:**
- Organizador autenticado
- Grupo criado

**Pós-condições:**
- Wishlist criada
- Itens selecionados
- Pagamento dividido
- Reserva confirmada

### 3.2 Fluxo Principal

1. Organizador cria wishlist compartilhada
2. Organizador adiciona itens (propriedades, atividades)
3. Organizador convida membros
4. Membros recebem convite
5. Membros votam em itens
6. Organizador visualiza resultados da votação
7. Organizador seleciona itens mais votados
8. Organizador cria divisão de pagamento
9. Sistema calcula valores por participante
10. Sistema envia convites de pagamento
11. Participantes pagam suas partes
12. Sistema confirma quando todos pagaram
13. Sistema cria reservas
14. Sistema envia confirmações

### 3.3 Fluxos Alternativos

**3.3.1 Participante Não Paga**
- Sistema envia lembretes
- Organizador pode remover participante
- Sistema recalcula valores

**3.3.2 Item Indisponível**
- Sistema informa indisponibilidade
- Organizador pode selecionar alternativa
- Caso de uso continua

### 3.4 Regras de Negócio

- Wishlist deve ter pelo menos 1 item
- Votação deve ter pelo menos 2 votos
- Pagamento deve ser confirmado por todos
- Reserva só é criada quando todos pagaram

**Status:** ✅ Implementado

---

## 4. CASO DE USO: SMART PRICING

### 4.1 Informações Gerais

**ID:** UC-004  
**Nome:** Smart Pricing  
**Ator Principal:** Sistema  
**Pré-condições:**
- Propriedade configurada
- Smart Pricing ativado

**Pós-condições:**
- Preço calculado
- Multiplicadores aplicados

### 4.2 Fluxo Principal

1. Sistema recebe solicitação de preço
2. Sistema busca preço base da propriedade
3. Sistema busca ocupação atual e histórica
4. Sistema busca eventos locais (Google Calendar)
5. Sistema busca eventos públicos (Eventbrite)
6. Sistema busca dados climáticos (OpenWeather)
7. Sistema busca preços de competidores
8. Sistema calcula multiplicadores
9. Sistema aplica regras customizadas
10. Sistema calcula preço final
11. Sistema retorna preço e breakdown

### 4.3 Fluxos Alternativos

**4.3.1 Dados Indisponíveis**
- Sistema usa valores padrão
- Sistema aplica fallback
- Caso de uso continua

**4.3.2 Preço Fora dos Limites**
- Sistema ajusta para mínimo/máximo
- Sistema informa ajuste
- Caso de uso continua

### 4.4 Regras de Negócio

- Preço final deve estar entre mínimo e máximo
- Multiplicadores devem ser aplicados sequencialmente
- Regras customizadas têm prioridade
- Cache deve ser usado para queries frequentes

**Status:** ✅ Implementado

---

## 5. CASO DE USO: CRIAR SINISTRO

### 5.1 Informações Gerais

**ID:** UC-005  
**Nome:** Criar Sinistro  
**Ator Principal:** Usuário  
**Pré-condições:**
- Usuário autenticado
- Apólice ativa
- Reserva existente

**Pós-condições:**
- Sinistro criado
- Notificação enviada
- Confirmação enviada

### 5.2 Fluxo Principal

1. Usuário acessa página de sinistros
2. Usuário seleciona apólice
3. Usuário seleciona tipo de sinistro
4. Usuário preenche dados do incidente
5. Usuário faz upload de documentos
6. Usuário submete sinistro
7. Sistema valida dados
8. Sistema cria sinistro no banco
9. Sistema gera número do sinistro
10. Sistema envia notificação para seguradora (webhook/email)
11. Sistema envia confirmação para usuário
12. Sistema atualiza status para "pending"

### 5.3 Fluxos Alternativos

**5.3.1 Apólice Inativa**
- Sistema informa apólice inativa
- Caso de uso termina

**5.3.2 Dados Inválidos**
- Sistema informa erros de validação
- Usuário pode corrigir
- Caso de uso continua

**5.3.3 Notificação Falha**
- Sistema registra erro
- Sistema tenta novamente
- Caso de uso continua

### 5.4 Regras de Negócio

- Sinistro requer apólice ativa
- Sinistro requer dados válidos
- Notificação deve ser enviada para seguradora
- Confirmação deve ser enviada para usuário

**Status:** ✅ Implementado (FASE 3)

---

## 6. CASO DE USO: CONCEDER INCENTIVO

### 6.1 Informações Gerais

**ID:** UC-006  
**Nome:** Conceder Incentivo  
**Ator Principal:** Sistema  
**Pré-condições:**
- Host existe
- Critérios atendidos

**Pós-condições:**
- Incentivo concedido
- Pontos adicionados (se aplicável)
- Notificação enviada

### 6.2 Fluxo Principal

1. Sistema detecta ação do host
2. Sistema verifica critérios
3. Sistema verifica se já concedeu incentivo
4. Sistema calcula expiração baseado no tipo
5. Sistema concede incentivo
6. Sistema adiciona pontos (se aplicável)
7. Sistema salva no banco
8. Sistema invalida cache
9. Sistema envia notificação

### 6.3 Fluxos Alternativos

**6.3.1 Critérios Não Atendidos**
- Sistema não concede incentivo
- Caso de uso termina

**6.3.2 Incentivo Já Concedido**
- Sistema não concede novamente
- Caso de uso termina

### 6.4 Regras de Negócio

- Incentivo deve ser concedido apenas uma vez por critério
- Expiração deve ser calculada automaticamente
- Pontos devem ser adicionados para incentivos do tipo "points"
- Notificação deve ser enviada

**Status:** ✅ Implementado (FASE 3)

---

**Última Atualização:** 2025-12-13  
**Status:** ✅ Casos de Uso Documentados

