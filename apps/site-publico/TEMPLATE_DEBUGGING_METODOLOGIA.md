# 🎯 TEMPLATE DE DEBUGGING - Metodologia Completa

**Use este template para TODOS os problemas de debugging**

---

## 📋 FASE 1: PREPARAÇÃO E CONTEXTO

### 1.1 Reprodução do Erro
```bash
[COMANDO PARA REPRODUZIR]
```

### 1.2 Stack Trace Completo
```
[COLE O ERRO COMPLETO AQUI]
```

### 1.3 Contexto
- **Arquivos:** [lista]
- **Ambiente:** [descrição]
- **Quando ocorre:** [descrição]

### 1.4 Comportamento Esperado vs Atual
- **Esperado:** [descrição]
- **Atual:** [descrição]

---

## 🧠 FASE 2: ANÁLISE CoT (Chain of Thought)

### 2.1 Raciocínio Passo a Passo
1. **Passo 1:** [análise]
2. **Passo 2:** [análise]
3. **Passo 3:** [análise]

### 2.2 Fluxo de Execução
```typescript
// Linha X: [o que faz]
// Linha Y: [o que faz]
```

### 2.3 Conclusão CoT
[Conclusão baseada no raciocínio]

---

## 🌳 FASE 3: EXPLORAÇÃO ToT (Tree of Thoughts)

### 3.1 Hipóteses (mínimo 5)

**Hipótese 1: [nome]**
```
├─ Probabilidade: X/10
├─ Complexidade: [BAIXA/MÉDIA/ALTA]
├─ Riscos: [lista]
└─ Benefícios: [lista]
```

### 3.2 Matriz de Decisão
| Hipótese | Prob | Complex | Impacto | Prioridade |
|----------|------|---------|---------|------------|
| H1 | X/10 | ... | ... | ... |

### 3.3 Decisão
**Hipótese Principal:** [escolha]  
**Justificativa:** [razão]

---

## 🎯 FASE 4: ESTRUTURAÇÃO SoT (Skeleton of Thoughts)

### 4.1 Esqueleto (3-7 pontos)
```
SOLUÇÃO
│
├─ 1. [Ponto principal]
│   ├─ 1.1 [Sub-ponto]
│   └─ 1.2 [Sub-ponto]
│
└─ 2. [Ponto principal]
```

### 4.2 Expansão
**Ponto 1:** [detalhes da implementação]

---

## 🔧 FASE 5: IMPLEMENTAÇÃO SISTEMÁTICA

### 5.1 Root Cause Analysis (5 Porquês)
1. Por quê? [resposta]
2. Por quê? [resposta]
3. Por quê? [resposta]
4. Por quê? [resposta]
5. **CAUSA RAIZ:** [resposta final]

### 5.2 Implementação Incremental
**Commit 1:** [descrição]  
**Commit 2:** [descrição]

---

## ✅ FASE 6: TESTES E VALIDAÇÃO (TDD)

### 6.1 Teste que Reproduz Bug (RED)
```typescript
it('should [descrição]', () => {
  // Deve falhar
});
```

### 6.2 Correção Mínima (GREEN)
```typescript
// Correção mínima
```

### 6.3 Refatoração (REFACTOR)
[Descrição]

### 6.4 Edge Cases
1. [caso 1]
2. [caso 2]

---

## 🔍 FASE 7: VERIFICAÇÃO E REFINAMENTO

- [ ] Todos os testes passando
- [ ] Cobertura mantida
- [ ] Sem regressões
- [ ] Código documentado

---

## 🚀 FASE 8: DEPLOY E MONITORAMENTO

- **Métricas:** [lista]
- **Monitoramento:** [descrição]

---

**Última Atualização:** [data]

