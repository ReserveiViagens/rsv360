# Fila execução RSV360 — closeout

**Data:** 2026-06-22  
**Base final:** `main` pós-merges #555–#561

## PRs mergeados

| PR | Marco |
|----|-------|
| #554 | Matriz auth (docs) |
| #555 | T1.8 site-publico BFF → backend v1 |
| #556 | T1.9 E2E auth cenários #31 |
| #557 | F-024/F-025 lockfile hygiene |
| #558 | F-027/F-028 security closeout |
| #559 | F-029 guest redirect loop |
| #560 | Dependabot triage 2026-06 |
| #561 | PR auto-merge workflow (GitHub Free) |

## Critérios de conclusão

| Critério | Status |
|----------|--------|
| Matriz + T1.8 + T1.9 documentados | ✅ |
| site-publico core auth via BFF proxy v1 | ✅ (#555) |
| E2E #31 no route-smoke | ✅ implementado (#556); validar run CI |
| Security scan F-027/F-028 + locks | ✅ (#557–#558) |
| Guest sem redirect loop | ✅ (#559) |
| Dependabot #367 + defer majors | ✅ (#367 merge + #560) |

## Validação CI

- **route-smoke:** https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/actions/workflows/route-smoke.yml
- **security-scan:** https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/actions/workflows/security-scan.yml

## Gaps remanescentes (fora da fila)

- **D2** turismo 2FA/register legado
- **D3** guest namespace próprio (by design)
- site-publico: register/OAuth/forgot ainda locais até backend v1 existir
