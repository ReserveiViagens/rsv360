# Matriz de riscos — pós-soak / pré-PLANO-MESTRE

**Data:** 2026-05-30  
**Status:** documentação (Soak Safe — sem ação em runtime)

| ID | Risco | Prob. | Impacto | Mitigação (issue) | Evidência |
|----|-------|-------|---------|-------------------|-----------|
| R1 | Rede Docker fragmentada (`network connect` manual) | Média | Alto | #250 | G1 rodada 2 GAP rede |
| R2 | Postgres duplo :5432 | Média | Alto | #251 | Sprint 0 §9 |
| R3 | HEALTHCHECK `${APP_PORT}` literal (guest/admin/turismo) | Alta | Médio | #252 | Trilha B-252 |
| R4 | Token demo `admin-token-123` em APIs | Alta | Alto | #255 | Trilha B-255 |
| R5 | Login 500 em falha DB | Média | Médio | #255 | `login/route.ts:152-160` |
| R6 | Lint baseline ruidoso (G2/CI) | Média | Baixo | #253 | PR #238/#239 |
| R7 | Observabilidade smoke-only (F5) | Média | Médio | #254 | SOAK-72H-PLAN F5 |
| R8 | Promoção G4 sem soak completo | Baixa | Crítico | #256 | C1–C16 checklist |
| R9 | Frontends guest/admin/turismo unhealthy (falso negativo) | Alta | Baixo | #252 | `docker inspect` 30/05 |
| R10 | Secrets históricos em git | Baixa | Crítico | #195 | Fora escopo soak; coordenar |

## Priorização pós-GO

1. **#256** (gate)  
2. **R1 + R2** → #250, #251  
3. **R3 + R9** → #252  
4. **R4 + R5** → #255  
5. **R6, R7** → #253, #254  

## Hard stops (permanecem)

- HS-8 Sprint 0: sem auth/multi-tenant/IA sem G0–G4 verdes.
- Soak Safe até `2026-06-02T09:03:09-03:00`.
