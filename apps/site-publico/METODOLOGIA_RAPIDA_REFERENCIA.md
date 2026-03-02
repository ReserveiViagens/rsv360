# ⚡ METODOLOGIA RÁPIDA - REFERÊNCIA EXECUTIVA

## 🎯 QUANDO USAR CADA TÉCNICA

| Técnica | Quando Usar | Prompt Chave |
|---------|-------------|--------------|
| **CoT** | Análise sequencial, fluxo lógico, trace de execução | "Use raciocínio passo a passo para analisar..." |
| **ToT** | Múltiplas soluções, decisões complexas, trade-offs | "Gere 5 hipóteses diferentes e avalie cada uma..." |
| **SoT** | Problemas complexos, refatorações, estruturação | "Crie esqueleto de 3-7 pontos principais primeiro..." |

---

## 📋 8 FASES RESUMIDAS

1. **PREPARAÇÃO** - Reproduzir erro, coletar logs, documentar contexto
2. **ANÁLISE CoT** - Raciocínio passo a passo, 5 Porquês
3. **EXPLORAÇÃO ToT** - Múltiplas hipóteses, matriz de decisão
4. **ESTRUTURAÇÃO SoT** - Esqueleto da solução, expansão paralela
5. **IMPLEMENTAÇÃO** - Root cause analysis, incremental, code review
6. **TESTES** - TDD, testes de integração, regressão
7. **VERIFICAÇÃO** - Validar correção, performance, documentação
8. **DEPLOY** - Rollout gradual, monitoramento, rollback

---

## 💡 PROMPTS ESSENCIAIS (COPIE E COLE)

### 1. ANÁLISE INICIAL (CoT)
```
Você é um desenvolvedor pleno especializado em debugging. 
Analise este problema usando Chain of Thought: [PROBLEMA]. 
Mostre todo seu raciocínio intermediário.
```

### 2. MÚLTIPLAS SOLUÇÕES (ToT)
```
Use Tree of Thoughts para gerar 5 hipóteses diferentes sobre 
a causa raiz de [PROBLEMA]. Para cada uma, avalie: 
probabilidade, complexidade, riscos e benefícios.
```

### 3. CAUSA RAIZ (5 Porquês)
```
Aplique técnica dos 5 Porquês ao erro [ERRO]. 
Pergunte 'Por que?' 5 vezes até chegar à causa raiz fundamental.
```

### 4. TDD
```
Aplique TDD:
1) Crie teste que reproduz o bug [BUG]
2) Implemente correção mínima
3) Refatore mantendo testes verdes
4) Adicione testes para edge cases
```

### 5. CODE REVIEW
```
Revise este código como senior developer: [CÓDIGO]. 
Analise: corretude, segurança, performance, edge cases, 
code smells e melhoria.
```

### 6. ESTRUTURAÇÃO (SoT)
```
Use Skeleton of Thoughts. Primeiro crie esqueleto de 3-7 pontos 
principais da solução para [PROBLEMA]. 
Depois expandiremos cada ponto.
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] Erro reproduzido consistentemente
- [ ] Logs e stack traces coletados
- [ ] Análise CoT executada (raciocínio passo a passo)
- [ ] 3-5 hipóteses geradas (ToT) se necessário
- [ ] Esqueleto da solução criado (SoT) se complexo
- [ ] Root cause identificada
- [ ] Implementação incremental com testes
- [ ] Code review solicitado
- [ ] Testes de regressão executados
- [ ] Documentação atualizada
- [ ] Deploy com monitoramento

---

## 🎓 PRINCÍPIOS FUNDAMENTAIS

1. **Compreensão antes de ação** - Entenda profundamente
2. **Pensamento sistemático** - Veja o sistema como um todo
3. **Documentação contínua** - Registre raciocínio e decisões
4. **Testes obrigatórios** - Toda correção deve ter testes
5. **Mudanças incrementais** - Pequenos passos testados
6. **Prevenção > Correção** - Aprenda com cada bug
7. **Colaboração** - Use pair debugging, aceite feedback
8. **Excelência técnica** - Qualidade, performance, segurança

---

## 🚀 USO POR COMPLEXIDADE

**Bug Simples (< 1h):** CoT básico → Fases 1, 2, 5, 6  
**Bug Médio (2-4h):** CoT + Review + TDD → Fases 1, 2, 5, 6, 7  
**Bug Complexo (1-3 dias):** CoT + ToT + SoT → Todas as 8 fases

---

## 📌 SEMPRE APLICAR

1. **Sempre comece pela Fase 1** - Preparação
2. **Use CoT para análise inicial** - Raciocínio passo a passo
3. **Use ToT se múltiplas soluções** - Avaliar alternativas
4. **Use SoT se problema complexo** - Estruturar solução
5. **TDD é obrigatório** - Teste antes de corrigir
6. **Code review sempre** - Antes de aplicar
7. **Documente tudo** - Raciocínio, decisões, aprendizados

---

**📖 Para detalhes completos, consulte: `Metodologia Avançada com Cursor AI.md`**

