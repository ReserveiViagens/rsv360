# 📋 Architecture Decision Records (ADRs)

Este diretório contém as decisões arquiteturais importantes tomadas durante o desenvolvimento do RSV Gen 2.

---

## 📚 Índice de ADRs

1. [ADR-001: Escolha do Banco de Dados](./ADR-001-database-choice.md)
2. [ADR-002: Autenticação JWT](./ADR-002-jwt-authentication.md)
3. [ADR-003: Rate Limiting Strategy](./ADR-003-rate-limiting.md)
4. [ADR-004: Cache Strategy](./ADR-004-cache-strategy.md)
5. [ADR-005: API Architecture](./ADR-005-api-architecture.md)
6. [ADR-006: Frontend Framework](./ADR-006-frontend-framework.md)
7. [ADR-007: Smart Pricing ML Model](./ADR-007-smart-pricing-ml.md)
8. [ADR-008: WebSocket Implementation](./ADR-008-websocket-implementation.md)

---

## 📖 O que são ADRs?

**Architecture Decision Records (ADRs)** são documentos que capturam decisões arquiteturais importantes, incluindo:

- **Contexto:** Situação que levou à decisão
- **Decisão:** O que foi decidido
- **Consequências:** Impactos positivos e negativos
- **Alternativas Consideradas:** Outras opções avaliadas

---

## 🎯 Por que ADRs?

- **Rastreabilidade:** Entender por que certas decisões foram tomadas
- **Onboarding:** Novos desenvolvedores entendem o contexto
- **Evolução:** Facilita revisão e mudança de decisões
- **Documentação:** Histórico de decisões arquiteturais

---

## 📝 Template de ADR

```markdown
# ADR-XXX: Título da Decisão

**Status:** Proposto | Aceito | Depreciado | Substituído  
**Data:** YYYY-MM-DD  
**Decisores:** Nome(s)

## Contexto

Descrever a situação que levou à decisão.

## Decisão

Descrever a decisão tomada.

## Consequências

### Positivas
- Benefício 1
- Benefício 2

### Negativas
- Desvantagem 1
- Desvantagem 2

## Alternativas Consideradas

### Alternativa 1
- Prós
- Contras
- Por que não foi escolhida

### Alternativa 2
- Prós
- Contras
- Por que não foi escolhida
```

---

**Última atualização:** 22/11/2025

