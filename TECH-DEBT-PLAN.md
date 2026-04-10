# PLANO DE ESTABIZÚCCAO DE @TS-NOCHECK
- Responsável: RSV360 Monorepo
- Branch: tech-debt/remove-ts-nocheck-batch1
- Data: 10/04/2026

- Autor: Enginheiro TypeScript Senior

## Objetivo

Corrirh gradualmente os erros de tipagem do TypeScript no monorepo RSV360, permitindo que oCI continue passando em toda a liberação de @ts-nocheck
 
div de aros pela complexidade dos arquivos.

### Estratïgia de Priorização

4 prioridades baseadas na quantidade de erros reais:

# ## PRIORITY 1 (0 erros - remover imediatamente)
- Arquivos pequenos (0 erros reais)
- Arquivos simples, types, interfaces
- Estimativa: 200-300 arquivos

# ## PRIORITY 2 (1-5 erros - corrigir fácil)
- Erros simples de tipagem
- Mais funções, imports, types basicos
 - Estimativa: 300-400 arquivos

# ## PRIORITY 3 (6-20 erros - médio)
- Arquivos mais complexos
- Erros de llógica complexa, genéricos
 - Estimativa: 200-250 arquivos

# ## PRIORITY 4 (20+ erros - complexo)
- Arquivos muito complexos e criticos
- Arquivos que precisam refatoring
- Estimativa: 100-150 arquivos

## Implementação

### Fase 1: Análise e Plajejamento

# ## Batch 1: Priority 1 (arguivos simples)
- Remover @ts-nocheck de arquivos que naoó fâo
 - Commit pequeno e frequente
 - Esperar CI passar
 
### Fase 2: Correcão Gradual

# ## Batch 2: Priority 2 (erros simples)
- Corrigir erros que precisam apção tipagem
 - Usar estratéia do TypeScript para corrigir

# ## Batch 3: Priority 3 (erros médios)
- Corrigir erros mais complexos
- Possiövel refatoring

### Fase 3: Complexos (Priority 4)

- Arquivos muito complexos
- Refatoring e consultoria equipe
 - Testes exastivos

## Métricas de Seguimento

- Número de arquivos processados
- Arquivos por batch
- Tempo gasto por batch
- Taxa de redução de erros

## Commits Planjados

# ## Commit 1: Inicio do Plano

- Criar branch tech-debt/remove-ts-nocheck-batch1
- Adicionar documentação do plano

### Commit 2: Primeiros Arquivos Simples

- Remover @ts-nocheck de ~200 arquivos simples
- Commit: fix: remove @ts-nocheck from simple files (batch 1)