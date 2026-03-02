# 🧪 ESTRATÉGIA DE TESTES - RSV 360

**Data:** 2025-12-13  
**Versão:** 2.0.0

---

## 📋 ÍNDICE

1. [Visão Geral](#1-visão-geral)
2. [Tipos de Testes](#2-tipos-de-testes)
3. [Cobertura Atual](#3-cobertura-atual)
4. [Estratégia por Camada](#4-estratégia-por-camada)
5. [Ferramentas](#5-ferramentas)
6. [Padrões e Convenções](#6-padrões-e-convenções)
7. [CI/CD](#7-cicd)

---

## 1. VISÃO GERAL

### 1.1 Objetivos

- Garantir qualidade do código
- Prevenir regressões
- Facilitar refatoração
- Documentar comportamento esperado

### 1.2 Princípios

- **Testes devem ser rápidos:** Unitários < 1s, Integração < 5s
- **Testes devem ser isolados:** Não dependem de ordem de execução
- **Testes devem ser determinísticos:** Sempre produzem mesmo resultado
- **Testes devem ser mantíveis:** Fáceis de entender e modificar

---

## 2. TIPOS DE TESTES

### 2.1 Testes Unitários

**Objetivo:** Testar funções e métodos isoladamente

**Onde:** `__tests__/lib/`, `__tests__/utils/`

**Cobertura Atual:** 71.7% (86/120 passando)

**Exemplo:**
```typescript
describe('calculateHostScore', () => {
  it('should calculate score correctly', () => {
    const score = calculateHostScore(hostId);
    expect(score.overall_score).toBeGreaterThan(0);
    expect(score.overall_score).toBeLessThanOrEqual(100);
  });
});
```

---

### 2.2 Testes de Integração

**Objetivo:** Testar integração entre componentes

**Onde:** `__tests__/integration/`

**Cobertura Atual:** Parcial

**Exemplo:**
```typescript
describe('Smart Pricing Integration', () => {
  it('should integrate with OpenWeather', async () => {
    const price = await calculateSmartPrice(propertyId, date);
    expect(price.weatherFactor).toBeDefined();
  });
});
```

---

### 2.3 Testes E2E

**Objetivo:** Testar fluxos completos do usuário

**Onde:** `__tests__/e2e/`

**Cobertura Atual:** 16.7% (3/18 passando)

**Exemplo:**
```typescript
test('booking flow', async ({ page }) => {
  await page.goto('/properties/1');
  await page.click('button:has-text("Reservar")');
  await page.fill('input[name="checkIn"]', '2025-12-20');
  await page.click('button:has-text("Confirmar")');
  await expect(page.locator('.confirmation')).toBeVisible();
});
```

---

### 2.4 Testes de Performance

**Objetivo:** Testar performance e escalabilidade

**Onde:** `__tests__/performance/`

**Cobertura Atual:** Parcial

**Exemplo:**
```typescript
describe('Smart Pricing Performance', () => {
  it('should calculate price in less than 2 seconds', async () => {
    const start = Date.now();
    await calculateSmartPrice(propertyId, date);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});
```

---

## 3. COBERTURA ATUAL

### 3.1 Métricas

| Tipo | Passando | Total | Cobertura |
|------|----------|-------|-----------|
| Backend Unit | 86 | 120 | 71.7% |
| E2E Integration | 3 | 18 | 16.7% |
| **Total** | **89** | **138** | **64.5%** |

### 3.2 Meta

- **Curto Prazo:** 80%+ de cobertura
- **Longo Prazo:** 90%+ de cobertura

---

## 4. ESTRATÉGIA POR CAMADA

### 4.1 Services (lib/)

**Estratégia:**
- Testar todas as funções públicas
- Mockar dependências externas
- Testar edge cases
- Testar error handling

**Cobertura Alvo:** 90%+

---

### 4.2 APIs (app/api/)

**Estratégia:**
- Testar todos os endpoints
- Testar validação de inputs
- Testar autenticação/autorização
- Testar error responses

**Cobertura Alvo:** 85%+

---

### 4.3 Components (components/)

**Estratégia:**
- Testar renderização
- Testar interações
- Testar props
- Testar acessibilidade

**Cobertura Alvo:** 80%+

---

### 4.4 Hooks (hooks/)

**Estratégia:**
- Testar lógica de hooks
- Testar estados
- Testar side effects
- Testar error handling

**Cobertura Alvo:** 85%+

---

## 5. FERRAMENTAS

### 5.1 Jest

**Uso:** Testes unitários e integração

**Configuração:** `jest.config.js`

**Comandos:**
```bash
npm test              # Executar todos os testes
npm test -- --watch   # Modo watch
npm test -- --coverage # Com cobertura
```

---

### 5.2 Playwright

**Uso:** Testes E2E

**Configuração:** `playwright.config.ts`

**Comandos:**
```bash
npm run test:e2e      # Executar testes E2E
npx playwright test   # Executar diretamente
```

---

### 5.3 Artillery

**Uso:** Testes de carga

**Configuração:** `tests/performance/artillery/`

**Comandos:**
```bash
npm run test:artillery
```

---

## 6. PADRÕES E CONVENÇÕES

### 6.1 Estrutura de Testes

```typescript
describe('ServiceName', () => {
  describe('functionName', () => {
    it('should do something when condition', () => {
      // Arrange
      const input = { ... };
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### 6.2 Mocks

**Padrão:**
- Mockar dependências externas
- Mockar banco de dados
- Mockar APIs externas
- Usar factories para dados de teste

**Exemplo:**
```typescript
jest.mock('../db', () => ({
  queryDatabase: jest.fn(),
}));
```

### 6.3 Nomenclatura

- Arquivos: `*.test.ts` ou `*.spec.ts`
- Describes: Nome do módulo/função
- Tests: "should [ação] when [condição]"

---

## 7. CI/CD

### 7.1 Pipeline

**Fase 1: Lint**
- Executar ESLint
- Verificar formatação

**Fase 2: Testes Unitários**
- Executar testes unitários
- Verificar cobertura mínima (70%)

**Fase 3: Testes de Integração**
- Executar testes de integração
- Verificar integrações externas

**Fase 4: Testes E2E**
- Executar testes E2E
- Verificar fluxos críticos

**Fase 5: Build**
- Build de produção
- Verificar erros de build

### 7.2 Cobertura Mínima

- **Unitários:** 80%+
- **Integração:** 70%+
- **E2E:** 50%+

---

**Última Atualização:** 2025-12-13  
**Status:** ✅ Estratégia Documentada

