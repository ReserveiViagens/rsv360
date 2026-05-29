# G2 Post-Merge Note (2026-05-29)

## Contexto
- PR #232 mergeada em `main` (T0b/G3 consolidado).
- Revalidação executada via `run-g2-capture.sh` com S1 + S2.

## Resultado consolidado
- PASS: 19
- FAIL: 2
- SKIP: 0

Falhas:
1. `s2_apps_site-publico_lint` (lint legado)
2. `s2_apps_admin_lint` (lint legado)

## Leitura operacional
- `build` e `type-check/check` passaram nos componentes ativos.
- `smoke` HTTP confirmado (`:3000` e `:3002/health` com 200).
- Gate estrito G2 (incluindo lint) permanece `NOGO`.
- Gate operacional pós-G3 (build + type-check + smoke) está `GO` com exceção formal de lint legado.

## Follow-up obrigatório
- Issue `#237` (lint baseline) para reduzir erros de lint até `0`.
