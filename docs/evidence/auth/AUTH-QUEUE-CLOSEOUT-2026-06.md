# Fila execução RSV360 — closeout

**Data:** 2026-06-22 (atualizado pós D2 + Docker #569)  
**Base final:** `main` pós-merges #555–#569

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
| #562 | Closeout matriz auth (T1.8/T1.9) |
| #563 | Fix auth v1 E2E rate-limit no route-smoke |
| #565 | D2.2 backend `POST /api/v1/auth/register` |
| #567 | D2.3 turismo register → v1 |
| #568 | D2.1 inventário + D1 register BFF + 2FA defer |
| #569 | fix Docker backend build (`--ignore-scripts`) |
| #572 | D2.4–D2.7 forgot/reset + 2FA v1 + closeout |

## Critérios de conclusão

| Critério | Status |
|----------|--------|
| Matriz + T1.8 + T1.9 documentados | ✅ |
| site-publico core auth via BFF proxy v1 | ✅ (#555) |
| site-publico register via BFF v1 | ✅ (#568) |
| site-publico forgot/reset BFF + UI | ✅ (#572) |
| Turismo register via v1 | ✅ (#565–#567) |
| Turismo 2FA + reset via v1 | ✅ (#572) |
| Backend forgot/reset + 2FA TOTP | ✅ (#572) |
| E2E auth-v1 (9 cenários) | ✅ local; CI route-smoke |
| D2.1 legacy smoke turismo | ✅ `test:e2e:turismo-legacy` |
| Docker backend build com register | ✅ (#569) |
| Security scan F-027/F-028 + locks | ✅ (#557–#558) |
| Guest sem redirect loop | ✅ (#559) |
| Dependabot #367 + defer majors | ✅ (#367 merge + #560) |

## Validação CI

- **route-smoke:** https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/actions/workflows/route-smoke.yml
- **security-scan:** https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/actions/workflows/security-scan.yml

## Gaps remanescentes (backlog)

- **D3:** guest namespace próprio (by design)
- **OAuth** site-publico (Google/Facebook) — local, fora do canônico v1
- **Admin** telas 2FA enforcement por role (spec backlog)
- **E-mail produção** reset (SES/SMTP) — adapter log em dev
