# 🏠 Guia de Integração para Hosts - RSV Gen 2

**Versão:** 2.0.0  
**Data:** 22/11/2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Cadastro de Propriedade](#cadastro-de-propriedade)
3. [Gerenciamento de Reservas](#gerenciamento-de-reservas)
4. [Smart Pricing](#smart-pricing)
5. [Programa Top Host](#programa-top-host)
6. [Integrações](#integrações)
7. [API para Hosts](#api-para-hosts)

---

## 🎯 Visão Geral

Este guia é para hosts que desejam usar o RSV Gen 2 para gerenciar suas propriedades e maximizar suas receitas.

### Benefícios para Hosts

- **Maior visibilidade:** Algoritmo de busca otimizado
- **Precificação inteligente:** Aumente receita automaticamente
- **Programa Top Host:** Benefícios exclusivos
- **Ferramentas completas:** Dashboard intuitivo
- **Suporte dedicado:** Atendimento prioritário

---

## 🏡 Cadastro de Propriedade

### Passo 1: Informações Básicas

```json
{
  "name": "Casa aconchegante no centro",
  "type": "house",
  "description": "Casa completa com 3 quartos...",
  "max_guests": 6,
  "bedrooms": 3,
  "bathrooms": 2
}
```

### Passo 2: Localização

- Endereço completo
- Cidade, estado, CEP
- Coordenadas (opcional, mas recomendado)
- Pontos de referência próximos

### Passo 3: Fotos

**Requisitos:**
- Mínimo 5 fotos
- Máximo 20 fotos
- Resolução mínima: 1200x800px
- Formato: JPG ou PNG
- Tamanho máximo: 5MB por foto

**Dicas:**
- Primeira foto é a mais importante (capa)
- Inclua todas as áreas principais
- Boa iluminação natural
- Evite fotos desfocadas ou escuras

### Passo 4: Comodidades

Selecione todas as comodidades disponíveis:
- WiFi
- Ar condicionado
- Aquecimento
- Piscina
- Estacionamento
- Cozinha equipada
- Máquina de lavar
- TV
- E muito mais...

### Passo 5: Preço e Disponibilidade

- **Preço base:** Preço por noite
- **Taxa de limpeza:** Valor fixo
- **Depósito de segurança:** Se aplicável
- **Descontos:** Para estadias longas
- **Calendário:** Defina disponibilidade

---

## 📅 Gerenciamento de Reservas

### Visualizar Reservas

Acesse o dashboard para ver:

- Reservas pendentes (aguardando confirmação)
- Reservas confirmadas
- Reservas canceladas
- Histórico completo

### Confirmar Reserva

1. Receba notificação de nova reserva
2. Revise detalhes do hóspede
3. Verifique disponibilidade
4. Clique em **"Confirmar"** ou **"Rejeitar"**

**Tempo de resposta:** Responda em até 24 horas para manter boa classificação.

### Cancelar Reserva

⚠️ **Atenção:** Cancelamentos afetam sua classificação.

- Cancelamentos frequentes reduzem visibilidade
- Taxa de cancelamento < 5% é ideal
- Evite cancelar a menos que absolutamente necessário

### Check-in/Check-out

- Envie instruções de check-in com antecedência
- Confirme horário de check-out
- Forneça informações de acesso (códigos, chaves, etc.)

---

## 💰 Smart Pricing

### Ativar Smart Pricing

1. Vá para **"Precificação"** no dashboard
2. Clique em **"Ativar Smart Pricing"**
3. Configure:
   - Preço base mínimo e máximo
   - Margem de ajuste permitida
   - Fatores a considerar

### Como Funciona

O Smart Pricing analisa:

- **Clima:** Previsão do tempo
- **Eventos:** Eventos locais e feriados
- **Concorrência:** Preços de propriedades similares
- **Demanda:** Histórico de reservas
- **Sazonalidade:** Época do ano

### Ajustar Preços

- **Automático:** Sistema ajusta automaticamente
- **Manual:** Você pode ajustar a qualquer momento
- **Recomendações:** Sistema sugere preços otimizados

### Exemplo

```
Preço base: R$ 200/noite
Evento local: +15% = R$ 230
Alta demanda: +10% = R$ 253
Total: R$ 253/noite (recomendado)
```

---

## ⭐ Programa Top Host

### Níveis

| Nível | Requisitos | Benefícios |
|-------|-----------|------------|
| **Bronze** | 10+ reservas, 4.0+ estrelas | Badge, suporte padrão |
| **Prata** | 25+ reservas, 4.3+ estrelas | Comissão -1%, destaque |
| **Ouro** | 50+ reservas, 4.5+ estrelas | Comissão -2%, suporte prioritário |
| **Diamante** | 100+ reservas, 4.7+ estrelas | Comissão -3%, destaque máximo |

### Critérios de Avaliação

1. **Avaliações:** Média de estrelas
2. **Reservas:** Número de reservas completadas
3. **Cancelamentos:** Taxa de cancelamento < 5%
4. **Resposta:** Tempo médio de resposta < 2 horas
5. **Verificação:** Propriedade verificada

### Melhorar Classificação

- ✅ Responda rápido às mensagens
- ✅ Mantenha avaliações altas
- ✅ Evite cancelamentos
- ✅ Tenha propriedades verificadas
- ✅ Use Smart Pricing
- ✅ Seja hospitaleiro e atencioso

---

## 🔗 Integrações

### Google Calendar

Sincronize reservas e disponibilidade:

1. Vá para **"Integrações"**
2. Clique em **"Conectar Google Calendar"**
3. Autorize o acesso
4. Selecione calendário
5. Pronto! Sincronização automática

**Benefícios:**
- Reservas aparecem no seu calendário
- Bloqueios de disponibilidade sincronizados
- Evita double-booking

### Smart Locks

Integre com fechaduras inteligentes:

- **Suportado:** Intelbras, Garen, Yale, August
- **Funcionalidades:**
  - Gerar códigos de acesso temporários
  - Revogar códigos após check-out
  - Histórico de acessos

### Channel Managers

Sincronize com múltiplas plataformas:

- Airbnb
- Booking.com
- Expedia
- E mais...

---

## 🔌 API para Hosts

### Autenticação

```bash
curl -X POST https://api.rsv.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "host@example.com",
    "password": "senha123"
  }'
```

### Listar Propriedades

```bash
curl -X GET https://api.rsv.com/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Criar Propriedade

```bash
curl -X POST https://api.rsv.com/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha Propriedade",
    "type": "house",
    "description": "...",
    "address": "...",
    "price_per_night": 200.00
  }'
```

### Atualizar Preço

```bash
curl -X PUT https://api.rsv.com/api/properties/123/pricing \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price_per_night": 250.00
  }'
```

### Listar Reservas

```bash
curl -X GET https://api.rsv.com/api/bookings?status=confirmed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Confirmar Reserva

```bash
curl -X POST https://api.rsv.com/api/bookings/456/confirm \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Dashboard e Relatórios

### Métricas Disponíveis

- **Receita:** Total e por período
- **Ocupação:** Taxa de ocupação
- **Avaliações:** Média e tendência
- **Reservas:** Número e status
- **Cancelamentos:** Taxa de cancelamento

### Relatórios

- Relatório mensal de receita
- Análise de demanda
- Comparação com concorrência
- Previsões de ocupação

---

## 💡 Dicas para Sucesso

1. **Fotos de qualidade:** Invista em fotos profissionais
2. **Descrição detalhada:** Seja específico sobre comodidades
3. **Resposta rápida:** Responda em até 2 horas
4. **Preço competitivo:** Use Smart Pricing
5. **Seja hospitaleiro:** Crie experiências memoráveis
6. **Mantenha atualizado:** Atualize disponibilidade regularmente
7. **Peça avaliações:** Avaliações positivas aumentam visibilidade

---

## 📞 Suporte

- **Email:** hosts@rsv.com
- **Telefone:** (11) 9999-9999
- **Chat:** Disponível no dashboard
- **Documentação API:** [API Documentation](./API_DOCUMENTATION.md)

---

**Última atualização:** 22/11/2025

