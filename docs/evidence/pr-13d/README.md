# PR-13d — Instrutor output filter + logging sem PII

**Branch:** `security/pr-13d-instrutor-output-filter`  
**Baseline:** `7765ae31d21149db058e444bbc3f13665969639b` (pós-13b / #226)

## Escopo

- `output-filter.ts`: detecta vazamento financeiro (R$, %, comissão) e role-spoof na **saída**; substitui por recusa canônica + `Onde clicar:`.
- Filtro aplicado em T1 após LLM **e** em hits de cache exact/semantic (defesa em profundidade).
- Input: `sanitizeLlmText` na rota + service + T1 (reuso PR-13b).
- Logging estruturado `logInstrutorEvent` — **nunca** pergunta/e-mail/resposta/prompt; só hash prefix + meta.

## OUT

- 13e gateway LLM unificado  
- Mudança de flags fail-safe / ligar Instrutor em prod  

## Test plan

```bash
cd backend && npx jest src/__tests__/unit/agentes-instrutor-output-filter.test.ts src/__tests__/unit/agentes-instrutor-triagem.test.ts src/__tests__/unit/agentes-instrutor-t1-failsafe.test.ts --forceExit
```

Resultado: **13 passed**.

## Risco

- Blast radius: módulo `agentes/instrutor` + rota perguntar.  
- Falso positivo raro em textos com `%`/`R$` educacionais → recusa segura (aceitável).  
- Cache antigo com leak é reescrito no hit.

## Rollback

Revert do squash merge desta PR.
